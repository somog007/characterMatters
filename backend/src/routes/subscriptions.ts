import express from 'express';
import {
	cancelSubscription,
	getSubscription,
	startPaystackCheckout,
	verifyPaystackCheckout,
} from '../controllers/subscriptionController';
import { auth } from '../middleware/auth';
import { validateBody } from '../middleware/validators';
import { PaystackCheckoutSchema } from '../middleware/validation';

const router = express.Router();

router.get('/', auth, getSubscription);
router.post('/checkout/paystack', auth, validateBody(PaystackCheckoutSchema), startPaystackCheckout);
router.get('/checkout/paystack/verify', auth, verifyPaystackCheckout);
router.delete('/', auth, cancelSubscription);

export default router;