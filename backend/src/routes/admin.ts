import express from 'express';
import { auth } from '../middleware/auth';
import { requireRole } from '../middleware/authorization';
import { getAdminMetrics, getAdminUsers, updateUserRole, getAdminSubscriptions } from '../controllers/adminController';

const router = express.Router();

router.get('/metrics', auth, requireRole('ADMIN'), getAdminMetrics);
router.get('/users', auth, requireRole('ADMIN'), getAdminUsers);
router.put('/users/:userId/role', auth, requireRole('ADMIN'), updateUserRole);
router.get('/subscriptions', auth, requireRole('ADMIN'), getAdminSubscriptions);

export default router;
