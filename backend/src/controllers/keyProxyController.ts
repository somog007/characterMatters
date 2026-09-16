import { Response } from 'express';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth';
import PlaybackSession from '../models/PlaybackSession';

export const getHLSKey = async (req: AuthRequest, res: Response) => {
  try {
    const sessionToken = (req.query.sessionToken as string) || (req.query.sid as string);
    if (!sessionToken) {
      return res.status(400).json({ message: 'Session token required' });
    }

    // Validate Playback Session
    const session = await PlaybackSession.findOne({ 
      sessionToken,
      status: 'active',
      expiresAt: { $gt: new Date() }
    });

    if (!session) {
      return res.status(403).json({ message: 'Invalid or revoked playback session key request' });
    }

    const currentIp = req.ip || req.socket.remoteAddress || '0.0.0.0';
    // IP verification to prevent session sharing
    if (session.ipAddress !== currentIp && session.ipAddress !== '0.0.0.0') {
      session.status = 'revoked';
      await session.save();
      return res.status(403).json({ message: 'IP address mismatch. Playback session revoked.' });
    }

    // Retrieve master AES-128 key securely from environment KMS or secret
    const masterKeyHex = process.env.HLS_AES_128_MASTER_KEY || '0123456789abcdef0123456789abcdef';
    const rawEncryptionKey = Buffer.from(masterKeyHex, 'hex');

    // Set binary response headers
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    return res.status(200).send(rawEncryptionKey);

  } catch (error) {
    return res.status(500).json({ message: 'Key retrieval failed' });
  }
};
