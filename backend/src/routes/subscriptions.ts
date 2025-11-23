import express from 'express';
import {
	createSubscription,
	cancelSubscription,
	getSubscription,
	startStripeCheckout,
	finalizeStripeCheckout,
	startPaystackCheckout,
	verifyPaystackCheckout,
} from '../controllers/subscriptionController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.get('/', auth, getSubscription);
router.post('/', auth, createSubscription);
router.post('/checkout/stripe', auth, startStripeCheckout);
router.post('/checkout/stripe/complete', auth, finalizeStripeCheckout);
router.post('/checkout/paystack', auth, startPaystackCheckout);
router.get('/checkout/paystack/verify', auth, verifyPaystackCheckout);
router.delete('/', auth, cancelSubscription);

export default router;