import express from 'express';
import { auth } from '../middleware/auth';
import { requireRole } from '../middleware/authorization';
import { validateBody } from '../middleware/validators';
import { AdminAssignSubscriptionSchema, AdminRoleUpdateSchema, UploadSignSchema } from '../middleware/validation';
import { signUpload } from '../controllers/uploadController';
import { getAdminMetrics, getAdminUsers, updateUserRole, getAdminSubscriptions, assignUserSubscription } from '../controllers/adminController';

const router = express.Router();

router.get('/metrics', auth, requireRole('ADMIN'), getAdminMetrics);
router.get('/users', auth, requireRole('ADMIN'), getAdminUsers);
router.put('/users/:userId/role', auth, requireRole('ADMIN'), validateBody(AdminRoleUpdateSchema), updateUserRole);
router.get('/subscriptions', auth, requireRole('ADMIN'), getAdminSubscriptions);
router.post('/subscriptions/assign', auth, requireRole('ADMIN'), validateBody(AdminAssignSubscriptionSchema), assignUserSubscription);
router.post('/uploads/sign', auth, requireRole('ADMIN'), validateBody(UploadSignSchema), signUpload);

export default router;
