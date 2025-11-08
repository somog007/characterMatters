import express from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/authController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.get('/me', auth, getProfile); // Alias for frontend compatibility
router.put('/profile', auth, updateProfile);

export default router;