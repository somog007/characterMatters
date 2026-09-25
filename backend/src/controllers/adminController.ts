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

export const assignUserSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { email, planId = 'package_6', billingCycle = 'ACADEMIC_SESSION' } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'email is required' });
    }

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found with specified email' });
    }

    const now = new Date();
    const nextYear = new Date(now);
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    const subscription = await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        plan: planId,
        status: 'ACTIVE',
        billingCycle: billingCycle as any,
        priceAmountNgn: 150000,
        startDate: now,
        currentPeriodStart: now,
        currentPeriodEnd: nextYear,
        endDate: nextYear,
        paymentProvider: 'PAYSTACK',
      },
      create: {
        userId: user.id,
        plan: planId,
        status: 'ACTIVE',
        billingCycle: billingCycle as any,
        priceAmountNgn: 150000,
        startDate: now,
        currentPeriodStart: now,
        currentPeriodEnd: nextYear,
        endDate: nextYear,
        paymentProvider: 'PAYSTACK',
      },
    });

    res.json({ message: `Subscription assigned successfully to ${email}`, subscription });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

