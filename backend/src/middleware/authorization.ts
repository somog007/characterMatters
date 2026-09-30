import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import prisma from '../config/prisma';
import { handleControllerError } from '../utils/handleControllerError';

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }

    next();
  };
};

export const canManageVideo = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.user.role === 'ADMIN') {
      return next();
    }

    const video = await prisma.lesson.findUnique({ where: { id: req.params.id } });
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Only admins can manage videos for now
    return res.status(403).json({ message: 'Forbidden: cannot manage this video' });
  } catch (error) {
    handleControllerError(res, 'Video authorization failed', error);
  }
};

export const canManageGallery = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.user.role === 'ADMIN') {
      return next();
    }

    const item = await prisma.galleryItem.findUnique({ where: { id: req.params.id } });
    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    return res.status(403).json({ message: 'Forbidden: cannot manage this gallery item' });
  } catch (error) {
    handleControllerError(res, 'Gallery authorization failed', error);
  }
};

export const canManageUser = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.user.role === 'ADMIN' || req.user.id === req.params.id) {
    return next();
  }

  return res.status(403).json({ message: 'Forbidden: cannot manage this user' });
};
