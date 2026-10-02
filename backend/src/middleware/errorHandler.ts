import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';
import { env } from '../config/env';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const errorMessage = err.message
    .replace(/postgres(?:ql)?:\/\/[^\s"'<>]+/gi, '[REDACTED_DATABASE_URL]')
    .replace(/\bSG\.[A-Za-z0-9_-]+\b/g, '[REDACTED_SENDGRID_API_KEY]')
    .replace(/\bBearer\s+[A-Za-z0-9._~-]+\b/gi, 'Bearer [REDACTED_TOKEN]');
  const stack = err.stack
    ?.replace(err.message, errorMessage)
    .replace(/\bSG\.[A-Za-z0-9_-]+\b/g, '[REDACTED_SENDGRID_API_KEY]')
    .replace(/\bBearer\s+[A-Za-z0-9._~-]+\b/gi, 'Bearer [REDACTED_TOKEN]');
  logger.error({
    message: 'Unhandled request error',
    errorType: err.name,
    errorMessage,
    ...(stack ? { stack } : {}),
    method: req.method,
    path: req.path,
  });
  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500
      ? 'Something went wrong, please try again'
      : err.message || 'Request failed',
  });
};