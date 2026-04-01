import express from 'express';
import { auth } from '../middleware/auth';
import { requestMfaCode, verifyMfaCode } from '../controllers/mfaController';

const router = express.Router();

router.post('/request', auth, requestMfaCode);
router.post('/verify', auth, verifyMfaCode);

export default router;
