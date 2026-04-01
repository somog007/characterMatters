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
import { validateBody } from '../middleware/validators';
import {
	SubscriptionCreateSchema,
	StripeCheckoutSchema,
	StripeFinalizeSchema,
	PaystackCheckoutSchema,
} from '../middleware/validation';

const router = express.Router();

router.get('/', auth, getSubscription);
router.post('/', auth, validateBody(SubscriptionCreateSchema), createSubscription);
router.post('/checkout/stripe', auth, validateBody(StripeCheckoutSchema), startStripeCheckout);
router.post('/checkout/stripe/complete', auth, validateBody(StripeFinalizeSchema), finalizeStripeCheckout);
router.post('/checkout/paystack', auth, validateBody(PaystackCheckoutSchema), startPaystackCheckout);
router.get('/checkout/paystack/verify', auth, verifyPaystackCheckout);
router.delete('/', auth, cancelSubscription);

export default router;