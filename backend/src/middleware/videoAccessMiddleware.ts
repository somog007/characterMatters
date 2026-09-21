import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import Video from '../models/Video';
import Category from '../models/Category';
import Subscription from '../models/Subscription';
import SecurityLog from '../models/SecurityLog';

export const authorizeVideoCategoryAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const videoId = req.params.videoId || req.body.videoId;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Admins bypass category authorization checks
    if (user.role === 'admin') {
      return next();
    }

    if (user.status && user.status !== 'active') {
      return res.status(403).json({ message: 'Account is inactive or suspended' });
    }

    const video = await Video.findById(videoId).populate('category');
    if (!video || !video.isPublished) {
      return res.status(404).json({ message: 'Video not found or unavailable' });
    }

    // 1. Free Videos
    if (video.accessLevel === 'free') {
      return next();
    }

    const videoIdStr = (video as any)._id ? (video as any)._id.toString() : String(video._id);

    // 2. Direct Video Permission Override
    if (user.customVideoPermissions && user.customVideoPermissions.some((id) => id.toString() === videoIdStr)) {
      return next();
    }

    const categoryObj = video.category as any;
    const categoryId = categoryObj ? (categoryObj._id ? categoryObj._id.toString() : categoryObj.toString()) : null;

    // 3. Direct Category Permission Override
    if (categoryId && user.customCategoryPermissions && user.customCategoryPermissions.some((id) => id.toString() === categoryId)) {
      return next();
    }

    // 4. Subscription Category & Plan Tier Check
    if (user.subscription) {
      const sub = await Subscription.findById(user.subscription);
      if (sub && sub.status === 'active') {
        const isCurrent = !sub.currentPeriodEnd || new Date(sub.currentPeriodEnd) > new Date();
        if (isCurrent) {
          if (!categoryId) return next();

          const categoryObj = await Category.findById(categoryId);
          if (categoryObj) {
            const planTiers: Record<string, string[]> = {
              package_6: ['free'],
              bronze: ['free'],
              package_5: ['free', 'basic'],
              silver: ['free', 'basic'],
              package_4: ['free', 'basic'],
              gold: ['free', 'basic'],
              package_3: ['free', 'basic', 'premium'],
              sapphire: ['free', 'basic', 'premium'],
              package_2: ['free', 'basic', 'premium'],
              diamond: ['free', 'basic', 'premium'],
              package_1: ['free', 'basic', 'premium', 'enterprise'],
              platinum: ['free', 'basic', 'premium', 'enterprise'],
              basic: ['free', 'basic'],
              premium: ['free', 'basic', 'premium'],
              enterprise: ['free', 'basic', 'premium', 'enterprise']
            };

            const allowedTiers = planTiers[sub.plan] || ['free', 'basic', 'premium', 'enterprise'];
            if (allowedTiers.includes(categoryObj.accessTier || 'basic')) {
              return next();
            }
          }
        }
      }
    }

    // Log Unauthorized Access Attempt
    await SecurityLog.create({
      user: user._id,
      eventType: 'UNAUTHORIZED_VIDEO_ACCESS',
      severity: 'high',
      ipAddress: req.ip || '0.0.0.0',
      userAgent: req.headers['user-agent'] || 'Unknown',
      metadata: { videoId, categoryId }
    });

    return res.status(403).json({ 
      message: 'Access Denied: Your current subscription package does not include access to this video category.' 
    });

  } catch (error) {
    return res.status(500).json({ message: 'Server error authorizing video access', error });
  }
};
