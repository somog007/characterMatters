import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import * as Sentry from '@sentry/node';
import { errorHandler } from './middleware/errorHandler';
import { csrfProtection } from './middleware/auth';
import { requestLogger, logger } from './middleware/logger';
import prisma from './config/prisma';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import videoRoutes from './routes/videos';
import ebookRoutes from './routes/ebooks';
import subscriptionRoutes from './routes/subscriptions';
import galleryRoutes from './routes/gallery';
import adminRoutes from './routes/admin';
import playbackRoutes from './routes/playbackRoutes';
import { env, isProduction } from './config/env';

// Initialize Sentry
Sentry.init({
  dsn: env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

const app = express();
if (isProduction()) {
  app.set('trust proxy', 1);
}

const productionSiteOrigin = new URL(env.SITE_URL);
const alternateSiteOrigin = new URL(env.SITE_URL);
alternateSiteOrigin.hostname = alternateSiteOrigin.hostname.startsWith('www.')
  ? alternateSiteOrigin.hostname.slice(4)
  : `www.${alternateSiteOrigin.hostname}`;
const productionAllowedOrigins = [productionSiteOrigin.origin, alternateSiteOrigin.origin];

// Handle Netlify function path prefix rewrite if invoked via /.netlify/functions/api
app.use((req, _res, next) => {
  if (req.url.startsWith('/.netlify/functions/api')) {
    const path = req.url.replace('/.netlify/functions/api', '') || '/';
    if (path !== '/' && !/^\/api(?:\/|\?|$)/.test(path)) {
      req.url = `/api${path}`;
    } else {
      req.url = path;
    }
  }
  next();
});

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Try again later.' },
});
const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many signup attempts. Try again later.' },
});
const verificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many verification requests. Try again later.' },
});

// Body parsing middleware
app.use(express.json({
  limit: '1mb',
  verify: (req, _res, buffer) => {
    (req as express.Request & { rawBody?: Buffer }).rawBody = Buffer.from(buffer);
  },
}));
app.use(express.urlencoded({ extended: true, limit: '1mb', parameterLimit: 100 }));

// Compression
app.use(compression());

// CORS
const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      const allowedOrigins = isProduction()
        ? productionAllowedOrigins
        : [
            new URL(env.SITE_URL).origin,
            'http://localhost:3000',
            'http://localhost:3001',
          ];
      // Allow requests with no origin like curl/postman or same-origin
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
};

app.use((req, res, next) => {
  const origin = req.get('origin');
  const host = req.get('host');

  if (origin && host) {
    try {
      const requestOrigin = new URL(`${req.protocol}://${host}`).origin;
      if (new URL(origin).origin === requestOrigin) return next();
    } catch {
      // Invalid Origin headers continue through the configured allowlist.
    }
  }

  return cors(corsOptions)(req, res, next);
});

app.use(cookieParser());
app.use(csrfProtection);

// Logging
app.use(requestLogger);

// Health & root routes
app.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok', name: 'Character Matters API', version: '1.0.0' });
});
app.get('/api/health', async (_req, res) => {
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (error) {
    const errorCode = typeof error === 'object' && error !== null && 'code' in error
      ? error.code
      : undefined;
    logger.error({
      message: 'Database health check failed',
      errorType: error instanceof Error ? error.name : 'UnknownError',
      ...(typeof errorCode === 'string' ? { errorCode } : {}),
    });
    dbStatus = 'error';
  }
  const healthy = dbStatus === 'connected';
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'error',
    uptime: process.uptime(),
    database: dbStatus,
    configuration: 'valid',
    localhostUrls: false,
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', signupLimiter);
app.use('/api/auth/resend-verification', verificationLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/ebooks', ebookRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/playback', playbackRoutes);

// Error handling
app.use(errorHandler);

export default app;

// Database connection & server start
const startServer = async () => {
  try {
    await prisma.$connect();
    logger.info({ message: 'Connected to PostgreSQL via Prisma' });
  } catch (error) {
    logger.error({ message: 'PostgreSQL connection error', error });
    await prisma.$disconnect();
    process.exitCode = 1;
    return;
  }

  const PORT = env.PORT || 5000;
  const server = app.listen(PORT, () => {
    logger.info({ message: 'Server running', port: PORT });
  });

  // Graceful shutdown handlers
  const shutdown = (signal: string) => {
    logger.warn({ message: 'Received shutdown signal', signal });
    server.close(() => {
      logger.info({ message: 'HTTP server closed' });
      prisma.$disconnect().then(() => {
        logger.info({ message: 'Database connection closed' });
        process.exit(0);
      });
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Process-level error handlers
  process.on('unhandledRejection', (reason: any) => {
    logger.error({ message: 'Unhandled Promise Rejection', reason });
  });
  process.on('uncaughtException', (err: Error) => {
    logger.error({ message: 'Uncaught Exception', error: err.message, stack: err.stack });
  });
  process.on('exit', (code) => {
    logger.info({ message: 'Process exiting', code });
  });
};

const isServerless = Boolean(
  env.NETLIFY ||
  env.AWS_LAMBDA_FUNCTION_NAME ||
  env.SERVERLESS ||
  env.VERCEL
);

if (env.NODE_ENV !== 'test' && !isServerless) {
  startServer();
}