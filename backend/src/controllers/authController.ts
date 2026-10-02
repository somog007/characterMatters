import { Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest, getJwtSecret } from '../middleware/auth';
import prisma from '../config/prisma';
import { env } from '../config/env';
import { logger } from '../middleware/logger';
import { enqueueVerificationEmail } from '../utils/email';
import { handleControllerError } from '../utils/handleControllerError';
import { clearSessionCookies, issueCsrfCookie, issueSessionCookies } from '../utils/sessionCookies';

const tokenLifetimeMs: Record<typeof env.JWT_EXPIRES_IN, number> = {
  '15m': 15 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '12h': 12 * 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
};

const hashVerificationToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');

const issueVerification = async (userId: string) => {
  const token = crypto.randomBytes(32).toString('base64url');
  const tokenHash = hashVerificationToken(token);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.$transaction(async (transaction) => {
    await transaction.emailVerificationToken.deleteMany({ where: { userId } });
    await transaction.emailVerificationToken.create({
      data: { userId, tokenHash, expiresAt },
    });
  });

  return token;
};

const logAuthenticationFailure = (action: string, step: string, error: unknown) => {
  const rawMessage = error instanceof Error ? error.message : String(error);
  const rawStack = error instanceof Error ? error.stack : undefined;
  const redact = (value: string) => value
    .replace(/postgres(?:ql)?:\/\/[^\s"'<>]+/gi, '[REDACTED_DATABASE_URL]')
    .replace(/\bSG\.[A-Za-z0-9_-]+\b/g, '[REDACTED_SENDGRID_API_KEY]')
    .replace(/\bBearer\s+[A-Za-z0-9._~-]+\b/gi, 'Bearer [REDACTED_TOKEN]');
  const errorCode = typeof error === 'object' && error !== null && 'code' in error
    ? error.code
    : undefined;

  logger.error({
    message: 'Authentication flow failed',
    action,
    step,
    errorType: error instanceof Error ? error.name : 'UnknownError',
    errorMessage: redact(rawMessage),
    ...(typeof errorCode === 'string' ? { errorCode } : {}),
    ...(rawStack ? { stack: redact(rawStack) } : {}),
  });
};

const dispatchVerificationEmail = async (email: string, name: string, token: string) => {
  const link = new URL('/verify-email', env.NEXT_PUBLIC_SITE_URL);
  link.hash = `token=${encodeURIComponent(token)}`;
  try {
    await enqueueVerificationEmail(email, name, link.toString());
    return true;
  } catch (error) {
    logAuthenticationFailure('verification_email', 'enqueue_sendgrid_delivery', error);
    return false;
  }
};

export const register = async (req: AuthRequest, res: Response) => {
  let step = 'validate_jwt_configuration';
  try {
    getJwtSecret();
    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };

    step = 'check_existing_account';
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    step = 'hash_password';
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    step = 'create_user_and_verification_token_transaction';
    const { user, verificationToken } = await prisma.$transaction(async (transaction) => {
      const createdUser = await transaction.user.create({
        data: {
          fullName: name,
          email,
          passwordHash,
          emailVerified: false,
        },
      });
      const token = crypto.randomBytes(32).toString('base64url');
      await transaction.emailVerificationToken.create({
        data: {
          userId: createdUser.id,
          tokenHash: hashVerificationToken(token),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
      return { user: createdUser, verificationToken: token };
    });

    logger.info({
      message: 'Authentication step succeeded',
      action: 'signup',
      step: 'create_user_and_verification_token_transaction',
    });

    step = 'enqueue_verification_email';
    const verificationEmailQueued = await dispatchVerificationEmail(
      user.email,
      user.fullName,
      verificationToken
    );
    return res.status(201).json({
      message: 'Your account was created. Check your email for a verification link.',
      emailVerificationRequired: true,
      verificationEmailQueued,
    });
  } catch (error) {
    logAuthenticationFailure('signup', step, error);
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }
    return res.status(500).json({ message: 'Something went wrong, please try again' });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  let step = 'validate_jwt_configuration';
  try {
    const jwtSecret = getJwtSecret();
    const { email, password } = req.body as { email: string; password: string };

    step = 'load_account';
    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    step = 'verify_password';
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        message: 'Verify your email address before logging in',
        code: 'EMAIL_VERIFICATION_REQUIRED',
      });
    }

    if (user.status !== 'active' && user.status !== 'must_change_password') {
      return res.status(403).json({ message: 'Account is suspended or blocked' });
    }

    const mustChangePassword = user.status === 'must_change_password';
    step = 'sign_access_token';
    const token = jwt.sign(
      { userId: user.id, ...(mustChangePassword ? { passwordChangeOnly: true } : {}) },
      jwtSecret,
      { expiresIn: mustChangePassword ? '15m' : env.JWT_EXPIRES_IN }
    );
    step = 'set_session_cookies';
    const csrfToken = issueSessionCookies(
      res,
      token,
      mustChangePassword ? 15 * 60 * 1000 : tokenLifetimeMs[env.JWT_EXPIRES_IN]
    );

    logger.info({ message: 'Authentication step succeeded', action: 'login', step });
    res.json({
      csrfToken,
      mustChangePassword,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logAuthenticationFailure('login', step, error);
    return res.status(500).json({ message: 'Something went wrong, please try again' });
  }
};

export const verifyEmail = async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.body as { token: string };
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash: hashVerificationToken(token) },
    });
    if (!verificationToken || verificationToken.expiresAt <= new Date()) {
      return res.status(400).json({ message: 'This verification link is invalid or has expired' });
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerified: true },
      });
      await transaction.emailVerificationToken.deleteMany({
        where: { userId: verificationToken.userId },
      });
    });

    return res.json({ message: 'Email verified. You can now log in.' });
  } catch (error) {
    logAuthenticationFailure('verify_email', 'verify_and_activate_account', error);
    return res.status(500).json({ message: 'Something went wrong, please try again' });
  }
};

export const resendVerification = async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body as { email: string };
    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });
    if (user && !user.emailVerified) {
      const token = await issueVerification(user.id);
      await dispatchVerificationEmail(user.email, user.fullName, token);
    }
    return res.json({
      message: 'If an unverified account exists for that email, a verification link will be sent.',
    });
  } catch (error) {
    logAuthenticationFailure('resend_verification', 'issue_and_enqueue_token', error);
    return res.status(500).json({ message: 'Something went wrong, please try again' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const { currentPassword, newPassword } = req.body as {
      currentPassword: string;
      newPassword: string;
    };
    const matches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matches) return res.status(400).json({ message: 'Current password is incorrect' });
    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'Choose a password different from your current password' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, status: 'active' },
    });
    const token = jwt.sign({ userId: updatedUser.id }, getJwtSecret(), {
      expiresIn: env.JWT_EXPIRES_IN,
    });
    const csrfToken = issueSessionCookies(res, token, tokenLifetimeMs[env.JWT_EXPIRES_IN]);

    return res.json({
      csrfToken,
      mustChangePassword: false,
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    logAuthenticationFailure('change_password', 'update_password', error);
    return res.status(500).json({ message: 'Something went wrong, please try again' });
  }
};

export const getCsrfToken = (_req: AuthRequest, res: Response) => {
  return res.json({ csrfToken: issueCsrfCookie(res) });
};

export const logout = (_req: AuthRequest, res: Response) => {
  clearSessionCookies(res);
  return res.status(204).end();
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { subscription: true },
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      subscription: user.subscription,
      createdAt: user.createdAt,
    });
  } catch (error) {
    handleControllerError(res, 'Profile retrieval failed', error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { name, avatar } = req.body;
    const data: any = {};
    if (name) data.fullName = name;
    if (avatar) data.avatar = avatar;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
    });

    res.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    });
  } catch (error) {
    handleControllerError(res, 'Profile update failed', error);
  }
};