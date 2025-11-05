import express from 'express';
import { auth } from '../middleware/auth';
import { createPaymentIntent, handleWebhook } from '../utils/stripe';
import Order from '../models/Order';
import EBook from '../models/Ebook';

const router = express.Router();

// Create payment intent for eBook purchase
router.post('/create-payment-intent', auth, async (req: any, res) => {
  try {
    const { ebookId } = req.body;

    const ebook = await EBook.findById(ebookId);
    if (!ebook) {
      return res.status(404).json({ message: 'eBook not found' });
    }

    const paymentIntent = await createPaymentIntent(
      ebook.price * 100, // Convert to cents
      'usd',
      {
        ebookId: (ebook as any)._id.toString(),
        userId: (req.user as any)._id.toString(),
      }
    );

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: ebook.price,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    await handleWebhook(req, res);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Get user's payment history
router.get('/history', auth, async (req: any, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('ebook', 'title coverImage')
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
