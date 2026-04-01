import { Response } from 'express';
import User from '../models/User';
import Subscription from '../models/Subscription';
import Video from '../models/Video';
import Gallery from '../models/Gallery';
import { AuthRequest } from '../middleware/auth';

export const getAdminMetrics = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const totalUsers = await User.countDocuments();
    const totalSubscribers = await User.countDocuments({ role: 'subscriber' });
    const totalVideos = await Video.countDocuments();
    const totalGalleryItems = await Gallery.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });

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

export const getUsersWithRoles = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { page = 1, limit = 20, role, search } = req.query;
    const filter: any = {};

    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .populate('subscription')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.json({
      users,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { userId } = req.params;
    const { role } = req.body;

    const validRoles = ['admin', 'subscriber', 'free-user'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getSubscriptionMetrics = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const activeCount = await Subscription.countDocuments({ status: 'active' });
    const canceledCount = await Subscription.countDocuments({ status: 'canceled' });
    const pendingCount = await Subscription.countDocuments({ status: 'pending' });

    const subscriptions = await Subscription.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      metrics: {
        active: activeCount,
        canceled: canceledCount,
        pending: pendingCount,
      },
      recentSubscriptions: subscriptions,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
