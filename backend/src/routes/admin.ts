import express from 'express';
import { auth } from '../middleware/auth';
import { requireRole } from '../middleware/authorization';
import { getAdminMetrics, getUsersWithRoles, updateUserRole, getSubscriptionMetrics } from '../controllers/adminController';

const router = express.Router();

router.get('/metrics', auth, requireRole('admin'), getAdminMetrics);
router.get('/users', auth, requireRole('admin'), getUsersWithRoles);
router.put('/users/:userId/role', auth, requireRole('admin'), updateUserRole);
router.get('/subscriptions', auth, requireRole('admin'), getSubscriptionMetrics);

export default router;
