import express from 'express';
import { auth } from '../middleware/auth';
import User from '../models/User';

const router = express.Router();

// Get all users (admin only)
router.get('/', auth, async (req: any, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const users = await User.find().select('-password');
    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get user by ID
router.get('/:id', auth, async (req: any, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update user
router.put('/:id', auth, async (req: any, res) => {
  try {
    const { name, avatar } = req.body;
    
    // Users can only update their own profile unless they're admin
    if (req.params.id !== req.user._id.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, avatar },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, async (req: any, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
