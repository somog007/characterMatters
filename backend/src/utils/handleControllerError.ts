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
  logger.error({
    message: context,
    errorType: error instanceof Error ? error.name : 'UnknownError',
    ...(typeof errorCode === 'string' ? { errorCode } : {}),
    ...(errorMessage ? { errorMessage } : {}),
  });
  return res.status(500).json({ message: 'Internal server error' });
};