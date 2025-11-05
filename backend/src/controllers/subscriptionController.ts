import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Subscription from '../models/Subscription';
import User from '../models/User';
import { createStripeCustomer, createSubscription as createStripeSubscription, cancelSubscription as cancelStripeSubscription } from '../utils/stripe';

export const createSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { planId, priceId } = req.body;
    const userId = (req.user as any)?._id;

    // Check if user already has an active subscription
    const existingSubscription = await Subscription.findOne({
      user: userId,
      status: 'active',
    });

    if (existingSubscription) {
      return res.status(400).json({ message: 'User already has an active subscription' });
    }

    // Create Stripe customer if not exists
    let stripeCustomerId = (req.user as any)?.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await createStripeCustomer((req.user as any)?.email, (req.user as any)?.name);
      stripeCustomerId = customer.id;
      await User.findByIdAndUpdate(userId, { stripeCustomerId });
    }

    // Create Stripe subscription
    const stripeSubscription = await createStripeSubscription(stripeCustomerId, priceId);

    // Create subscription in database
    const subscription = new Subscription({
      user: userId,
      plan: planId,
      stripeSubscriptionId: stripeSubscription.id,
      status: 'active',
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
    });

    await subscription.save();

    // Update user role
    await User.findByIdAndUpdate(userId, {
      role: 'subscriber',
      subscription: subscription._id,
    });

    res.status(201).json({
      message: 'Subscription created successfully',
      subscription,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const cancelSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req.user as any)?._id;

    const subscription = await Subscription.findOne({
      user: userId,
      status: 'active',
    });

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    // Cancel Stripe subscription
    if (subscription.stripeSubscriptionId) {
      await cancelStripeSubscription(subscription.stripeSubscriptionId);
    }

    // Update subscription status
    subscription.status = 'canceled';
    subscription.canceledAt = new Date();
    await subscription.save();

    // Update user role
    await User.findByIdAndUpdate(userId, { role: 'free-user' });

    res.json({
      message: 'Subscription canceled successfully',
      subscription,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req.user as any)?._id;

    const subscription = await Subscription.findOne({
      user: userId,
      status: 'active',
    }).populate('plan');

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    res.json(subscription);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
