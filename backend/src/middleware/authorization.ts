import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import Video from '../models/Video';
import Gallery from '../models/Gallery';

export const requireRole = (...roles: Array<'admin' | 'subscriber' | 'free-user'>) => {
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

    if (req.user.role === 'admin') {
      return next();
    }

    const video = await Video.findById(req.params.id).select('createdBy');
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    if (video.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: cannot manage this video' });
    }

    next();
  } catch (error: any) {
    res.status(500).json({ message: 'Authorization error', error: error.message });
  }
};

export const canManageGallery = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.user.role === 'admin') {
      return next();
    }

    const item = await Gallery.findById(req.params.id).select('createdBy');
    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    if (item.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: cannot manage this gallery item' });
    }

    next();
  } catch (error: any) {
    res.status(500).json({ message: 'Authorization error', error: error.message });
  }
};

export const canManageUser = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.user.role === 'admin' || req.user._id.toString() === req.params.id) {
    return next();
  }

  return res.status(403).json({ message: 'Forbidden: cannot manage this user' });
};
