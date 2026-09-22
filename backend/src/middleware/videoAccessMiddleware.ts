import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import prisma from '../config/prisma';

// Access tier hierarchy — higher tiers include all lower tiers
const TIER_HIERARCHY: Record<string, number> = {
  BRONZE: 1,
  SILVER: 2,
  GOLD: 3,
  SAPPHIRE: 4,
  DIAMOND: 5,
  PLATINUM: 6,
};

export const authorizeVideoCategoryAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const videoId = req.params.videoId || req.body.videoId;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Admins bypass authorization checks
    if (user.role === 'ADMIN') {
      return next();
    }

    if (user.status && user.status !== 'active') {
      return res.status(403).json({ message: 'Account is inactive or suspended' });
    }

    const video = await prisma.lesson.findUnique({
      where: { id: videoId },
      include: { category: true },
    });

    if (!video || !video.isPublished) {
      return res.status(404).json({ message: 'Video not found or unavailable' });
    }

    // 1. Free-tier videos are accessible to everyone
    if (video.accessTier === 'BRONZE') {
      return next();
    }

    // 2. Check active subscription tier
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    if (subscription && subscription.status === 'ACTIVE') {
      const isCurrent = !subscription.currentPeriodEnd || new Date(subscription.currentPeriodEnd) > new Date();
      if (isCurrent) {
        const userTierLevel = TIER_HIERARCHY[subscription.plan.toUpperCase()] || 0;
        const videoTierLevel = TIER_HIERARCHY[video.accessTier] || 0;

        if (userTierLevel >= videoTierLevel) {
          return next();
        }
      }
    }

    // Log Unauthorized Access Attempt
    await prisma.securityLog.create({
      data: {
        userId: user.id,
        eventType: 'UNAUTHORIZED_VIDEO_ACCESS',
        severity: 'high',
        ipAddress: req.ip || '0.0.0.0',
        userAgent: req.headers['user-agent'] || 'Unknown',
        metadata: { videoId, accessTier: video.accessTier },
      },
    });

    return res.status(403).json({
      message: 'Access Denied: Your current subscription package does not include access to this video category.',
    });

  } catch (error) {
    return res.status(500).json({ message: 'Server error authorizing video access', error });
  }
};
