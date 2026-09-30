import type { Response } from 'express';
import { logger } from '../middleware/logger';

export const handleControllerError = (
  res: Response,
  context: string,
  error: unknown
) => {
  logger.error({
    message: context,
    errorType: error instanceof Error ? error.name : 'UnknownError',
  });
  return res.status(500).json({ message: 'Internal server error' });
};