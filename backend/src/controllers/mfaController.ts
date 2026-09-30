import { Response } from 'express';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth';
import { handleControllerError } from '../utils/handleControllerError';

const mfaStore = new Map<string, { code: string; expiresAt: number }>();

export const requestMfaCode = async (req: AuthRequest, res: Response) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(503).json({ message: 'MFA is not available' });
    }
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.user.id;
    const code = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    mfaStore.set(userId, { code, expiresAt });

    // In production this should be sent via email/SMS; returning for development only.
    res.json({ message: 'MFA code generated', code, expiresAt });
  } catch (error) {
    handleControllerError(res, 'MFA code request failed', error);
  }
};

export const verifyMfaCode = async (req: AuthRequest, res: Response) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(503).json({ message: 'MFA is not available' });
    }
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { code } = req.body as { code: string };
    const userId = req.user.id;
    const record = mfaStore.get(userId);

    if (!record || Date.now() > record.expiresAt) {
      mfaStore.delete(userId);
      return res.status(400).json({ message: 'MFA code expired or missing' });
    }

    if (record.code !== code) {
      return res.status(400).json({ message: 'Invalid MFA code' });
    }

    mfaStore.delete(userId);
    res.json({ message: 'MFA verified' });
  } catch (error) {
    handleControllerError(res, 'MFA code verification failed', error);
  }
};
