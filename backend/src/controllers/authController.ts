import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest, getJwtSecret } from '../middleware/auth';
import prisma from '../config/prisma';
import type prisma8Client from '../config/prisma8.js';
import { handleControllerError } from '../utils/handleControllerError';
import { clearSessionCookies, issueCsrfCookie, issueSessionCookies } from '../utils/sessionCookies';

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        fullName: name,
        email,
        passwordHash,
      },
    });

    const token = jwt.sign({ userId: user.id }, getJwtSecret(), { expiresIn: '7d' });
    const csrfToken = issueSessionCookies(res, token, 7 * 24 * 60 * 60 * 1000);

    res.status(201).json({
      csrfToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    handleControllerError(res, 'Registration failed', error);
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { default: loadedPrisma8 } = await import('../config/prisma8.js');
    const prisma8 = loadedPrisma8 as unknown as typeof prisma8Client;
    const { email, password } = req.body;

    const user = await prisma8.orm.public.User.where({ email }).first();
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.status !== 'active' && user.status !== 'must_change_password') {
      return res.status(403).json({ message: 'Account is suspended or blocked' });
    }

    const mustChangePassword = user.status === 'must_change_password';
    const token = jwt.sign(
      { userId: user.id, ...(mustChangePassword ? { passwordChangeOnly: true } : {}) },
      getJwtSecret(),
      { expiresIn: mustChangePassword ? '15m' : '7d' }
    );
    const csrfToken = issueSessionCookies(
      res,
      token,
      mustChangePassword ? 15 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000
    );

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
    handleControllerError(res, 'Login failed', error);
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
    const token = jwt.sign({ userId: updatedUser.id }, getJwtSecret(), { expiresIn: '7d' });
    const csrfToken = issueSessionCookies(res, token, 7 * 24 * 60 * 60 * 1000);

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
  } catch (error: any) {
    return res.status(500).json({ message: 'Unable to change password' });
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