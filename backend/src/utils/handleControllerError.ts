import type { Response } from 'express';
import { logger } from '../middleware/logger';

export const handleControllerError = (
  res: Response,
  context: string,
  error: unknown
) => {
  const errorCode = typeof error === 'object' && error !== null && 'code' in error
    ? error.code
    : undefined;
  const errorMessage = error instanceof Error
    ? error.message.replace(/\bpostgres(?:ql)?:\/\/[^\s"'<>]+/gi, '[REDACTED_DATABASE_URL]')
    : undefined;
  const stack = error instanceof Error
    ? error.stack
      ?.replace(error.message, errorMessage ?? '[REDACTED_ERROR]')
      .replace(/\bSG\.[A-Za-z0-9_-]+\b/g, '[REDACTED_SENDGRID_API_KEY]')
      .replace(/\bBearer\s+[A-Za-z0-9._~-]+\b/gi, 'Bearer [REDACTED_TOKEN]')
    : undefined;
  logger.error({
    message: context,
    errorType: error instanceof Error ? error.name : 'UnknownError',
    ...(typeof errorCode === 'string' ? { errorCode } : {}),
    ...(errorMessage ? { errorMessage } : {}),
    ...(stack ? { stack } : {}),
  });
  return res.status(500).json({ message: 'Something went wrong, please try again' });
};