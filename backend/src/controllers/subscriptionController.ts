import { Request, Response } from 'express';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';
import {
  PaystackRequestError,
  paystackKeyDiagnostics,
  initializePaystackTransaction,
  verifyPaystackTransaction,
  type PaystackVerification,
} from '../utils/paystack';
import { Prisma } from '../generated/prisma/client';
import { logger } from '../middleware/logger';
import { handleControllerError } from '../utils/handleControllerError';
import { env, isProduction } from '../config/env';
import { PACKAGE_PRICES_NGN, isPlanId, subscriberResources } from '../config/plans';

const BILLING_CYCLE = 'ACADEMIC_SESSION' as const;
const PAYMENT_REFERENCE = /^[A-Za-z0-9_.=-]{1,100}$/;

/** Paystack failures get a clear message instead of a generic 500. */
const paystackErrorResponse = (res: Response, context: string, error: unknown) => {
  const message = error instanceof Error ? error.message : '';
  if (message === 'PAYSTACK_SECRET_KEY is not configured') {
    logger.error({ message: `${context}: PAYSTACK_SECRET_KEY is not set in the environment` });
    return res.status(503).json({
      message: 'Online payment is not available yet. Please contact us to subscribe.',
    });
  }
  if (error instanceof PaystackRequestError) {
    // Paystack's own reason (e.g. "Invalid key") is logged for the site owner, not shown to visitors.
    logger.error({
      message: context,
      paystackStatus: error.status,
      paystackMessage: error.message,
      ...paystackKeyDiagnostics(),
    });
    return res.status(502).json({
      message: 'The payment provider could not process this request. Please try again later or contact us.',
    });
  }
  return handleControllerError(res, context, error);
};

/** True only when Paystack confirms a successful NGN payment of the exact amount, for this user and plan. */
const isPaymentFor = (
  verification: PaystackVerification,
  reference: string,
  userId: string,
  plan: string,
  expectedAmountKobo: number
) =>
  verification.status === 'success' &&
  verification.reference === reference &&
  verification.currency === 'NGN' &&
  verification.amount === expectedAmountKobo &&
  verification.metadata?.userId === userId &&
  verification.metadata?.planId === plan;

const activatePaidSubscription = (
  userId: string,
  reference: string,
  plan: string,
  payment: Pick<PaystackVerification, 'amount' | 'channel' | 'paid_at' | 'customer'>,
  rawWebhookData?: Prisma.InputJsonValue
) => {
  const startDate = payment.paid_at ? new Date(payment.paid_at) : new Date();
  // Academic session: roughly 9 months.
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 9);

  return prisma.$transaction(async (transaction) => {
    await transaction.paystackTransaction.upsert({
      where: { reference },
      update: {},
      create: {
        userId,
        reference,
        amountNgn: new Prisma.Decimal(payment.amount / 100),
        status: 'success',
        planId: plan,
        channel: payment.channel || null,
        paidAt: startDate,
        ...(rawWebhookData ? { rawWebhookData } : {}),
      },
    });

    const updated = await transaction.subscription.update({
      where: { userId },
      data: {
        status: 'ACTIVE',
        startDate,
        currentPeriodStart: startDate,
        currentPeriodEnd: endDate,
        endDate,
        canceledAt: null,
        paystackCustomerCode: payment.customer?.customer_code || null,
      },
    });

    if (payment.customer?.customer_code) {
      await transaction.user.update({
        where: { id: userId },
        data: { paystackCustomerCode: payment.customer.customer_code },
      });
    }
    return updated;
  });
};

/** Paid-content links are attached only for ACTIVE subscriptions. */
const withResources = <T extends { status: string }>(subscription: T) => ({
  ...subscription,
  resources: subscription.status === 'ACTIVE' ? subscriberResources() : [],
});

const isCurrent = (end: Date | null) => !end || end > new Date();

export const startPaystackCheckout = async (req: AuthRequest, res: Response) => {
  try {
    const { planId } = req.body as { planId: string };

    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    if (!isPlanId(planId)) {
      return res.status(400).json({ message: 'Unknown subscription plan' });
    }
    const amount = PACKAGE_PRICES_NGN[planId];

    const existing = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });
    if (existing?.status === 'ACTIVE' && isCurrent(existing.currentPeriodEnd)) {
      return res.status(409).json({ message: 'You already have an active subscription' });
    }

    // An earlier checkout that was never completed must not block a new attempt.
    // If that earlier payment did go through, activate it instead of charging again.
    if (existing?.status === 'PENDING' && existing.providerReference) {
      try {
        const previous = await verifyPaystackTransaction(existing.providerReference);
        const expectedKobo = Math.round(Number(existing.priceAmountNgn) * 100);
        if (isPaymentFor(previous, existing.providerReference, user.id, existing.plan, expectedKobo)) {
          const subscription = await activatePaidSubscription(
            user.id,
            existing.providerReference,
            existing.plan,
            previous
          );
          return res.status(409).json({
            message: 'Your earlier payment was confirmed and your subscription is now active.',
            subscription: withResources(subscription),
          });
        }
      } catch (error) {
        // An abandoned or unknown reference: carry on with a fresh checkout.
        if (!(error instanceof PaystackRequestError)) throw error;
      }
    }

    const reference = `ps_${crypto.randomUUID()}`;
    const callbackBase = env.PAYSTACK_CALLBACK_URL ||
      `${env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')}/subscribe`;
    const callback = new URL(callbackBase);
    if (isProduction() && callback.protocol !== 'https:') {
      logger.error({ message: 'PAYSTACK_CALLBACK_URL must use HTTPS in production' });
      return res.status(503).json({
        message: 'Online payment is not available yet. Please contact us to subscribe.',
      });
    }

    const transaction = await initializePaystackTransaction({
      amount,
      email: user.email,
      reference,
      callbackUrl: callback.toString(),
      metadata: { planId, userId: user.id, billingCycle: BILLING_CYCLE },
    });

    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        plan: planId,
        status: 'PENDING',
        billingCycle: BILLING_CYCLE,
        priceAmountNgn: new Prisma.Decimal(amount),
        paymentProvider: 'PAYSTACK',
        providerReference: transaction.reference,
        startDate: new Date(),
      },
      create: {
        userId: user.id,
        plan: planId,
        status: 'PENDING',
        billingCycle: BILLING_CYCLE,
        priceAmountNgn: new Prisma.Decimal(amount),
        paymentProvider: 'PAYSTACK',
        providerReference: transaction.reference,
        startDate: new Date(),
      },
    });

    res.json({ authorizationUrl: transaction.authorization_url, reference: transaction.reference });
  } catch (error) {
    paystackErrorResponse(res, 'Paystack checkout initialization failed', error);
  }
};

export const verifyPaystackCheckout = async (req: AuthRequest, res: Response) => {
  try {
    const { reference } = req.query as { reference?: unknown };
    const user = req.user;

    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if (typeof reference !== 'string' || !PAYMENT_REFERENCE.test(reference)) {
      return res.status(400).json({ message: 'A valid payment reference is required' });
    }

    const pending = await prisma.subscription.findUnique({ where: { userId: user.id } });
    if (pending?.status === 'ACTIVE' && pending.providerReference === reference) {
      // Already activated (for example by the webhook): report success again.
      return res.json({ message: 'Subscription activated', subscription: withResources(pending) });
    }
    if (!pending || pending.status !== 'PENDING' || pending.providerReference !== reference) {
      return res.status(404).json({ message: 'No matching pending payment found' });
    }

    const verification = await verifyPaystackTransaction(reference);
    const expectedAmountKobo = Math.round(Number(pending.priceAmountNgn) * 100);
    if (!isPaymentFor(verification, reference, user.id, pending.plan, expectedAmountKobo)) {
      return res.status(400).json({ message: 'Payment not successful yet' });
    }

    const subscription = await activatePaidSubscription(user.id, reference, pending.plan, verification);
    res.json({ message: 'Subscription activated', subscription: withResources(subscription) });
  } catch (error) {
    paystackErrorResponse(res, 'Paystack transaction verification failed', error);
  }
};

export const cancelSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    if (!subscription || (subscription.status !== 'ACTIVE' && subscription.status !== 'PENDING')) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    const updated = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELED',
        canceledAt: new Date(),
        currentPeriodEnd: new Date(),
      },
    });

    res.json({ message: 'Subscription canceled successfully', subscription: withResources(updated) });
  } catch (error) {
    handleControllerError(res, 'Subscription cancellation failed', error);
  }
};

export const getSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    // Having no subscription yet is a normal state, not an error.
    res.json(subscription ? withResources(subscription) : null);
  } catch (error) {
    handleControllerError(res, 'Subscription retrieval failed', error);
  }
};

export const handlePaystackWebhook = async (req: Request, res: Response) => {
  try {
    const secret = env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      logger.error({ message: 'PAYSTACK_SECRET_KEY is missing during webhook verification' });
      return res.status(500).send('Webhook configuration error');
    }

    const signature = req.headers['x-paystack-signature'];
    const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
    if (typeof signature !== 'string' || !rawBody || !/^[a-f\d]{128}$/i.test(signature)) {
      return res.status(401).send('Missing Paystack signature');
    }

    const hash = crypto
      .createHmac('sha512', secret)
      .update(rawBody)
      .digest();
    const suppliedSignature = Buffer.from(signature, 'hex');

    if (hash.length !== suppliedSignature.length || !crypto.timingSafeEqual(hash, suppliedSignature)) {
      return res.status(401).send('Invalid Paystack signature');
    }

    const { event, data } = req.body;
    if (event !== 'charge.success') {
      return res.status(200).send('Webhook received');
    }

    const reference = data?.reference;
    const metadata = data?.metadata || {};
    const userId = metadata.userId;
    const planId = metadata.planId;
    if (typeof reference !== 'string' || typeof userId !== 'string' || typeof planId !== 'string') {
      return res.status(400).send('No matching pending payment');
    }

    const existingTransaction = await prisma.paystackTransaction.findUnique({ where: { reference } });
    if (existingTransaction) {
      if (existingTransaction.userId !== userId || existingTransaction.status !== 'success') {
        return res.status(409).send('Payment reference has already been processed');
      }
      return res.status(200).send('Webhook received');
    }

    const pending = await prisma.subscription.findUnique({ where: { userId } });
    if (!pending || pending.providerReference !== reference || pending.plan !== planId) {
      logger.warn({ message: 'Paystack webhook does not match a pending subscription', reference });
      return res.status(400).send('No matching pending payment');
    }

    if (data.status !== 'success' || data.currency !== 'NGN') {
      return res.status(400).send('Payment status or currency is invalid');
    }

    const expectedAmountKobo = Math.round(Number(pending.priceAmountNgn) * 100);
    if (data.amount !== expectedAmountKobo) {
      logger.warn({ message: 'Paystack webhook amount mismatch', reference, userId });
      return res.status(400).send('Payment amount does not match subscription');
    }

    await activatePaidSubscription(userId, reference, planId, data, data);

    return res.status(200).send('Webhook received');
  } catch (error) {
    logger.error({
      message: 'Paystack webhook processing error',
      errorType: error instanceof Error ? error.name : 'UnknownError',
    });
    if (!res.headersSent) return res.status(500).send('Webhook processing failed');
  }
};
