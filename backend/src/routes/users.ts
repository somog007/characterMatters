import express from 'express';
import { auth } from '../middleware/auth';
import { requireRole, canManageUser } from '../middleware/authorization';
import prisma from '../config/prisma';

const router = express.Router();

// Get all users (admin only)
router.get('/', auth, requireRole('ADMIN'), async (req: any, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get user by ID
router.get('/:id', auth, canManageUser, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        avatar: true,
        subscription: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update user
router.put('/:id', auth, canManageUser, async (req: any, res) => {
  try {
    const { name, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { fullName: name, avatar },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, requireRole('ADMIN'), async (req: any, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
