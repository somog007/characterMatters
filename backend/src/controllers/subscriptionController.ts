import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Subscription from '../models/Subscription';
import { IUser } from '../models/User';
import {
  createStripeCustomer,
  createSubscription as createStripeSubscription,
  cancelSubscription as cancelStripeSubscription,
  createCheckoutSession,
  retrieveCheckoutSession,
  retrieveSubscription,
} from '../utils/stripe';
import { initializePaystackTransaction, verifyPaystackTransaction } from '../utils/paystack';

type PersistedUser = IUser & { save: () => Promise<IUser> };

const hasBlockingSubscription = async (userId: string) =>
  Subscription.findOne({ user: userId, status: { $in: ['active', 'pending'] } });

const addBillingCycle = (startDate: Date, billingCycle: 'monthly' | 'yearly') => {
  const date = new Date(startDate);
  if (billingCycle === 'yearly') {
    date.setFullYear(date.getFullYear() + 1);
  } else {
    date.setMonth(date.getMonth() + 1);
  }
  return date;
};

export const createSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { planId, priceId, billingCycle = 'monthly' } = req.body as {
      planId: string;
      priceId: string;
      billingCycle?: 'monthly' | 'yearly';
    };

    const user = req.user as PersistedUser | undefined;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!planId || !priceId) {
      return res.status(400).json({ message: 'planId and priceId are required' });
    }

    const existingSubscription = await hasBlockingSubscription(user._id.toString());
    if (existingSubscription) {
      return res.status(400).json({ message: 'User already has an active subscription' });
    }

    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await createStripeCustomer(user.email, user.name);
      stripeCustomerId = customer.id;
      user.stripeCustomerId = customer.id;
      await user.save();
    }

    const stripeSubscription = await createStripeSubscription(stripeCustomerId, priceId);

    const subscription = await Subscription.findOneAndUpdate(
      { user: user._id },
      {
        user: user._id,
        plan: planId,
        status: 'active',
        billingCycle,
        price: (stripeSubscription.items?.data?.[0]?.plan?.amount || 0) / 100,
        startDate: new Date(stripeSubscription.start_date * 1000),
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        stripeSubscriptionId: stripeSubscription.id,
        paymentProvider: 'stripe',
        providerReference: stripeSubscription.id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    user.role = 'subscriber';
    user.subscription = subscription._id;
    await user.save();

    res.status(201).json({
      message: 'Subscription created successfully',
      subscription,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const startStripeCheckout = async (req: AuthRequest, res: Response) => {
  try {
    const { planId, priceId, billingCycle = 'monthly', successUrl, cancelUrl } = req.body as {
      planId: string;
      priceId: string;
      billingCycle?: 'monthly' | 'yearly';
      successUrl?: string;
      cancelUrl?: string;
    };

    const user = req.user as PersistedUser | undefined;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!planId || !priceId) {
      return res.status(400).json({ message: 'planId and priceId are required' });
    }

    const existingSubscription = await hasBlockingSubscription(user._id.toString());
    if (existingSubscription) {
      return res.status(400).json({ message: 'User already has an active subscription' });
    }

    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await createStripeCustomer(user.email, user.name);
      stripeCustomerId = customer.id;
      user.stripeCustomerId = customer.id;
      await user.save();
    }

    const resolvedSuccessUrl =
      successUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscribe?session_id={CHECKOUT_SESSION_ID}`;
    const resolvedCancelUrl =
      cancelUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscribe?cancelled=true`;

    const session = await createCheckoutSession({
      customerId: stripeCustomerId,
      customerEmail: user.email,
      priceId,
      mode: 'subscription',
      successUrl: resolvedSuccessUrl,
      cancelUrl: resolvedCancelUrl,
      metadata: {
        planId,
        billingCycle,
        userId: user._id.toString(),
      },
    });

    await Subscription.findOneAndUpdate(
      { user: user._id },
      {
        user: user._id,
        plan: planId,
        status: 'pending',
        billingCycle,
        paymentProvider: 'stripe',
        providerReference: session.id,
        startDate: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ checkoutUrl: session.url, sessionId: session.id });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const finalizeStripeCheckout = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.body as { sessionId: string };
    const user = req.user as PersistedUser | undefined;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!sessionId) {
      return res.status(400).json({ message: 'sessionId is required' });
    }

    const session = await retrieveCheckoutSession(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment not completed yet' });
    }

    const stripeSubscriptionId =
      typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;

    if (!stripeSubscriptionId) {
      return res.status(400).json({ message: 'No subscription found on session' });
    }

    const stripeSubscription = await retrieveSubscription(stripeSubscriptionId);

    const billingCycle =
      stripeSubscription.items?.data?.[0]?.plan?.interval === 'year' ? 'yearly' : 'monthly';

    const subscription = await Subscription.findOneAndUpdate(
      { user: user._id },
      {
        user: user._id,
        plan: session.metadata?.planId || 'default',
        status: 'active',
        billingCycle,
        price: (stripeSubscription.items?.data?.[0]?.plan?.amount || 0) / 100,
        startDate: new Date(stripeSubscription.start_date * 1000),
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        stripeSubscriptionId: stripeSubscription.id,
        paymentProvider: 'stripe',
        providerReference: sessionId,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    user.role = 'subscriber';
    user.subscription = subscription._id;
    if (typeof stripeSubscription.customer === 'string') {
      user.stripeCustomerId = stripeSubscription.customer;
    }
    await user.save();

    res.json({ message: 'Subscription activated', subscription });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const startPaystackCheckout = async (req: AuthRequest, res: Response) => {
  try {
    const { planId, amount, billingCycle = 'monthly', callbackUrl } = req.body as {
      planId: string;
      amount: number;
      billingCycle?: 'monthly' | 'yearly';
      callbackUrl?: string;
    };

    const user = req.user as PersistedUser | undefined;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!planId || !amount) {
      return res.status(400).json({ message: 'planId and amount are required' });
    }

    const existingSubscription = await hasBlockingSubscription(user._id.toString());
    if (existingSubscription) {
      return res.status(400).json({ message: 'User already has an active subscription' });
    }

    const reference = `ps_${user._id}_${Date.now()}`;

    const resolvedCallback =
      callbackUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscribe?reference=${reference}`;

    const transaction = await initializePaystackTransaction({
      amount,
      email: user.email,
      reference,
      callbackUrl: resolvedCallback,
      metadata: {
        planId,
        userId: user._id.toString(),
        billingCycle,
      },
    });

    await Subscription.findOneAndUpdate(
      { user: user._id },
      {
        user: user._id,
        plan: planId,
        status: 'pending',
        billingCycle,
        price: amount,
        paymentProvider: 'paystack',
        providerReference: transaction.reference,
        startDate: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ authorizationUrl: transaction.authorization_url, reference: transaction.reference });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const verifyPaystackCheckout = async (req: AuthRequest, res: Response) => {
  try {
    const { reference } = req.query as { reference?: string };
    const user = req.user as PersistedUser | undefined;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!reference) {
      return res.status(400).json({ message: 'reference query param is required' });
    }

    const verification = await verifyPaystackTransaction(reference);

    if (verification.status !== 'success') {
      return res.status(400).json({ message: 'Payment not successful yet' });
    }

    const billingCycle = (verification.metadata?.billingCycle as 'monthly' | 'yearly') || 'monthly';
    const startDate = verification.paid_at ? new Date(verification.paid_at) : new Date();

    const subscription = await Subscription.findOneAndUpdate(
      { user: user._id },
      {
        user: user._id,
        plan: (verification.metadata?.planId as string) || 'default',
        status: 'active',
        billingCycle,
        price: (verification.amount || 0) / 100,
        startDate,
        currentPeriodStart: startDate,
        currentPeriodEnd: addBillingCycle(startDate, billingCycle),
        paymentProvider: 'paystack',
        providerReference: verification.reference,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (verification.customer?.customer_code) {
      user.paystackCustomerCode = verification.customer.customer_code;
    }

    user.role = 'subscriber';
    user.subscription = subscription._id;
    await user.save();

    res.json({ message: 'Subscription activated', subscription });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const cancelSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user as PersistedUser | undefined;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const subscription = await Subscription.findOne({
      user: user._id,
      status: { $in: ['active', 'pending'] },
    });

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    if (subscription.paymentProvider === 'stripe' && subscription.stripeSubscriptionId) {
      await cancelStripeSubscription(subscription.stripeSubscriptionId);
    }

    subscription.status = 'canceled';
    subscription.canceledAt = new Date();
    subscription.currentPeriodEnd = new Date();
    await subscription.save();

    user.role = 'free-user';
    await user.save();

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
    const user = req.user as PersistedUser | undefined;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const subscription = await Subscription.findOne({
      user: user._id,
      status: { $in: ['active', 'pending'] },
    });

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    res.json(subscription);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
