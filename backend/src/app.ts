import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import * as Sentry from '@sentry/node';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger, logger } from './middleware/logger';
import prisma from './config/prisma';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import videoRoutes from './routes/videos';
import ebookRoutes from './routes/ebooks';
import subscriptionRoutes from './routes/subscriptions';
import galleryRoutes from './routes/gallery';
import adminRoutes from './routes/admin';
import mfaRoutes from './routes/mfa';
import playbackRoutes from './routes/playbackRoutes';

dotenv.config();

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

// Validate required environment variables early (non-fatal warnings so dev can start)
const requiredEnv = ['JWT_SECRET', 'DATABASE_URL'];
requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    logger.warn({ message: `Missing expected env var ${key}`, key });
  }
});

const app = express();

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

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static media uploads (local disk fallback when Cloudinary is not configured)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Compression
app.use(compression());

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        'http://localhost:3000',
        'http://localhost:3001',
        process.env.FRONTEND_URL,
      ].filter(Boolean) as string[];
      // Allow requests with no origin like curl/postman or same-origin
      if (!origin || allowed.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

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
  } catch {
    dbStatus = 'error';
  }
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/ebooks', ebookRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/mfa', mfaRoutes);
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
  }

  const PORT = process.env.PORT || 5000;
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

if (process.env.NODE_ENV !== 'test') {
  startServer();
}