import crypto from 'crypto';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';

const mfaStore = new Map<string, { code: string; expiresAt: number }>();

export const requestMfaCode = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.user._id.toString();
    const code = (Math.floor(100000 + Math.random() * 900000)).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    mfaStore.set(userId, { code, expiresAt });

    // In production this should be sent via email/SMS; returning for development only.
    res.json({ message: 'MFA code generated', code, expiresAt });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const verifyMfaCode = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { code } = req.body as { code: string };
    const userId = req.user._id.toString();
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
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
