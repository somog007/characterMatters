import express from 'express';
import { register, login, getProfile, updateProfile, changePassword, getCsrfToken, logout } from '../controllers/authController';
import { auth } from '../middleware/auth';
import { validateBody } from '../middleware/validators';
import { AuthRegisterSchema, AuthLoginSchema, AuthUpdateProfileSchema, AuthChangePasswordSchema } from '../middleware/validation';

const router = express.Router();

router.get('/csrf', getCsrfToken);
router.post('/register', validateBody(AuthRegisterSchema), register);
router.post('/login', validateBody(AuthLoginSchema), login);
router.post('/logout', auth, logout);
router.put('/password', auth, validateBody(AuthChangePasswordSchema), changePassword);
router.get('/profile', auth, getProfile);
router.get('/me', auth, getProfile); // Alias for frontend compatibility
router.put('/profile', auth, validateBody(AuthUpdateProfileSchema), updateProfile);

export default router;