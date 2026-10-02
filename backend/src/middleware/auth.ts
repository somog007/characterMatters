import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/prisma';
import { env } from '../config/env';
import { logger } from './logger';
import type { User } from '../generated/prisma/client';
import { ACCESS_COOKIE, CSRF_COOKIE } from '../utils/sessionCookies';

export interface AuthRequest extends Request {
  user?: User;
  authToken?: { userId: string; passwordChangeOnly?: boolean };
  body: any;
  params: any;
  query: any;
}

export const getJwtSecret = (): string => {
  const secret = env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters');
  }
  return secret;
};

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authorization = req.header('Authorization');
  const token = req.cookies?.[ACCESS_COOKIE] || authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  let decoded: { userId: string; passwordChangeOnly?: boolean };
  try {
    const verified = jwt.verify(token, getJwtSecret());
    if (typeof verified === 'string' || typeof verified.userId !== 'string') {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    decoded = verified as { userId: string; passwordChangeOnly?: boolean };
  } catch {
    return res.status(401).json({ message: 'Token is not valid' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        message: 'Verify your email address before continuing',
        code: 'EMAIL_VERIFICATION_REQUIRED',
      });
    }

    const passwordChangeOnly = decoded.passwordChangeOnly === true;
    if (user.status === 'must_change_password' || passwordChangeOnly) {
      if (req.method !== 'PUT' || req.path !== '/password') {
        return res.status(403).json({ message: 'Change your password before continuing', code: 'PASSWORD_CHANGE_REQUIRED' });
      }
    } else if (user.status !== 'active') {
      return res.status(403).json({ message: 'Account is suspended or blocked' });
    }

    req.user = user;
    req.authToken = decoded;
    return next();
  } catch (error) {
    logger.error({
      message: 'Authentication user lookup failed',
      errorType: error instanceof Error ? error.name : 'UnknownError',
      ...(error instanceof Error ? { errorMessage: error.message, stack: error.stack } : {}),
    });
    return next(error);
  }
};

export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  if (!req.cookies?.[ACCESS_COOKIE] && !req.cookies?.[CSRF_COOKIE]) return next();

  const cookieToken = req.cookies[CSRF_COOKIE];
  const headerToken = req.header('X-CSRF-Token');
  if (!cookieToken || !headerToken) {
    return res.status(403).json({ message: 'CSRF token is required' });
  }

  const cookieBuffer = Buffer.from(cookieToken);
  const headerBuffer = Buffer.from(headerToken);
  if (cookieBuffer.length !== headerBuffer.length || !crypto.timingSafeEqual(cookieBuffer, headerBuffer)) {
    return res.status(403).json({ message: 'CSRF token is invalid' });
  }

  next();
};

export const adminAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied. Admin rights required.' });
  }
  next();
};