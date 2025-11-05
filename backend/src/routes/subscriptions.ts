import express from 'express';
import { createSubscription, cancelSubscription, getSubscription } from '../controllers/subscriptionController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.get('/', auth, getSubscription);
router.post('/', auth, createSubscription);
router.delete('/', auth, cancelSubscription);

export default router;