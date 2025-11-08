import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import dotenv from 'dotenv';
import { errorHandler, AppError } from './middleware/errorHandler';
import { requestLogger, logger } from './middleware/logger';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import videoRoutes from './routes/videos';
import ebookRoutes from './routes/ebooks';
import subscriptionRoutes from './routes/subscriptions';
import paymentRoutes from './routes/payments';

dotenv.config();

// Validate required environment variables early (non-fatal warnings so dev can start)
const requiredEnv = ['JWT_SECRET', 'MONGODB_URI'];
requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    logger.warn({ message: `Missing expected env var ${key}`, key });
  }
});

const app = express();

// Security middleware
app.use(helmet());
app.use(mongoSanitize());

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
app.get('/api/health', (_req, res) => {
  const dbState = mongoose.connection.readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    dbState,
    dbStateText: ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState] || 'unknown',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/ebooks', ebookRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);

// Error handling
app.use(errorHandler);

// MongoDB connection & server start
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/video-ebook-platform';

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info({ message: 'Connected to MongoDB', host: mongoose.connection.host });
  } catch (error) {
    logger.error({ message: 'MongoDB connection error', error });
    // Do not exit immediately; allow health endpoint to reflect failure
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
      mongoose.connection.close(false).then(() => {
        logger.info({ message: 'MongoDB connection closed' });
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

startServer();

export default app;