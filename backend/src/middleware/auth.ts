import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/prisma';
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
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters');
  }
  return secret;
};

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authorization = req.header('Authorization');
    const token = req.cookies?.[ACCESS_COOKIE] || authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, getJwtSecret()) as { userId: string; passwordChangeOnly?: boolean };
    if (!decoded.userId) {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
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
    next();
  } catch {
    res.status(401).json({ message: 'Token is not valid' });
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