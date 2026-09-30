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
  logger.error({
    message: context,
    errorType: error instanceof Error ? error.name : 'UnknownError',
    ...(typeof errorCode === 'string' ? { errorCode } : {}),
  });
  return res.status(500).json({ message: 'Internal server error' });
};