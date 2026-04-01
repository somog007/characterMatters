import express from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/authController';
import { auth } from '../middleware/auth';
import { validateBody } from '../middleware/validators';
import { AuthRegisterSchema, AuthLoginSchema, AuthUpdateProfileSchema } from '../middleware/validation';

const router = express.Router();

router.post('/register', validateBody(AuthRegisterSchema), register);
router.post('/login', validateBody(AuthLoginSchema), login);
router.get('/profile', auth, getProfile);
router.get('/me', auth, getProfile); // Alias for frontend compatibility
router.put('/profile', auth, validateBody(AuthUpdateProfileSchema), updateProfile);

export default router;