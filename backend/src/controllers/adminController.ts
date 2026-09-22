import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';

export const getAdminMetrics = async (req: AuthRequest, res: Response) => {
  try {
    const [totalUsers, totalVideos, totalGalleryItems, activeSubscriptions] = await Promise.all([
      prisma.user.count(),
      prisma.lesson.count(),
      prisma.galleryItem.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    ]);

    const totalSubscribers = await prisma.subscription.count({
      where: { status: { in: ['ACTIVE', 'PENDING'] } },
    });

    res.json({
      metrics: {
        totalUsers,
        totalSubscribers,
        totalVideos,
        totalGalleryItems,
        activeSubscriptions,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAdminUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: { subscription: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAdminSubscriptions = async (req: AuthRequest, res: Response) => {
  try {
    const recentSubscriptions = await prisma.subscription.findMany({
      include: { user: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ recentSubscriptions });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    res.json({ message: 'User role updated', user: updated });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
