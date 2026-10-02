import { Request, Response } from 'express';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';
import { initializePaystackTransaction, verifyPaystackTransaction } from '../utils/paystack';
import { Prisma } from '../generated/prisma/client';
import { logger } from '../middleware/logger';
import { handleControllerError } from '../utils/handleControllerError';
import { env, isProduction } from '../config/env';

const PACKAGE_PRICES_NGN: Record<string, number> = {
  package_1: 1_200_000,
  package_2: 900_000,
  package_3: 750_000,
  package_4: 450_000,
  package_5: 300_000,
  package_6: 150_000,
};

const BILLING_CYCLE = 'ACADEMIC_SESSION' as const;

export const startPaystackCheckout = async (req: AuthRequest, res: Response) => {
  try {
    const { planId } = req.body as { planId: string };

    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const amount = PACKAGE_PRICES_NGN[planId];
    if (!amount) {
      return res.status(400).json({ message: 'Unknown subscription plan' });
    }

    // Check for existing active subscription
    const existing = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });
    if (existing && (existing.status === 'ACTIVE' || existing.status === 'PENDING')) {
      return res.status(400).json({ message: 'User already has an active subscription' });
    }

    const reference = `ps_${crypto.randomUUID()}`;
    const callbackBase = env.PAYSTACK_CALLBACK_URL ||
      `${env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')}/subscribe`;
    const callback = new URL(callbackBase);
    if (isProduction() && callback.protocol !== 'https:') {
      return res.status(500).json({ message: 'Payment callback must use HTTPS in production' });
    }
    const resolvedCallback = callback.toString();

    const transaction = await initializePaystackTransaction({
      amount,
      email: user.email,
      reference,
      callbackUrl: resolvedCallback,
      metadata: { planId, userId: user.id, billingCycle: BILLING_CYCLE },
    });

    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        plan: planId,
        status: 'PENDING',
        billingCycle: BILLING_CYCLE,
        priceAmountNgn: new Prisma.Decimal(amount),
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
    handleControllerError(res, 'Paystack checkout initialization failed', error);
  }
};

export const verifyPaystackCheckout = async (req: AuthRequest, res: Response) => {
  try {
    const { reference } = req.query as { reference?: string };
    const user = req.user;

    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if (!reference) return res.status(400).json({ message: 'reference query param is required' });

    const pending = await prisma.subscription.findUnique({ where: { userId: user.id } });
    if (!pending || pending.status !== 'PENDING' || pending.providerReference !== reference) {
      return res.status(404).json({ message: 'No matching pending payment found' });
    }

    const verification = await verifyPaystackTransaction(reference);

    const expectedAmountKobo = Math.round(Number(pending.priceAmountNgn) * 100);
    if (
      verification.status !== 'success' ||
      verification.reference !== reference ||
      verification.currency !== 'NGN' ||
      verification.amount !== expectedAmountKobo ||
      verification.metadata?.userId !== user.id ||
      verification.metadata?.planId !== pending.plan
    ) {
      return res.status(400).json({ message: 'Payment not successful yet' });
    }

    const startDate = verification.paid_at ? new Date(verification.paid_at) : new Date();
    const billingCycle = pending.billingCycle;

    // Calculate end date based on billing cycle
    const endDate = new Date(startDate);
    if (billingCycle === 'YEARLY') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else if (billingCycle === 'MONTHLY') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      // Academic session — roughly 9 months
      endDate.setMonth(endDate.getMonth() + 9);
    }

    const subscription = await prisma.$transaction(async (transaction) => {
      await transaction.paystackTransaction.upsert({
        where: { reference },
        update: {},
        create: {
          userId: user.id,
          reference,
          amountNgn: new Prisma.Decimal(verification.amount / 100),
          status: 'success',
          planId: pending.plan,
          channel: verification.channel || null,
          paidAt: verification.paid_at ? new Date(verification.paid_at) : null,
        },
      });

      const updated = await transaction.subscription.update({
        where: { userId: user.id },
        data: {
          status: 'ACTIVE',
          startDate,
          currentPeriodStart: startDate,
          currentPeriodEnd: endDate,
          endDate,
          paystackCustomerCode: verification.customer?.customer_code || null,
        },
      });

      if (verification.customer?.customer_code) {
        await transaction.user.update({
          where: { id: user.id },
          data: { paystackCustomerCode: verification.customer.customer_code },
        });
      }
      return updated;
    });

    res.json({ message: 'Subscription activated', subscription });
  } catch (error) {
    handleControllerError(res, 'Paystack transaction verification failed', error);
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

    res.json({ message: 'Subscription canceled successfully', subscription: updated });
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

    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    res.json(subscription);
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
    const pending = typeof userId === 'string'
      ? await prisma.subscription.findUnique({ where: { userId } })
      : null;

    if (!reference || !pending || pending.providerReference !== reference || pending.plan !== planId) {
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

    const existingTransaction = await prisma.paystackTransaction.findUnique({ where: { reference } });
    if (existingTransaction) {
      if (existingTransaction.userId !== userId || existingTransaction.status !== 'success') {
        return res.status(409).send('Payment reference has already been processed');
      }
      return res.status(200).send('Webhook received');
    }

    const startDate = data.paid_at ? new Date(data.paid_at) : new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 9);

    await prisma.$transaction(async (transaction) => {
      await transaction.paystackTransaction.create({
        data: {
          userId,
          reference,
          amountNgn: new Prisma.Decimal(data.amount / 100),
          status: 'success',
          planId,
          channel: data.channel || null,
          paidAt: startDate,
          rawWebhookData: data,
        },
      });

      await transaction.subscription.update({
        where: { userId },
        data: {
          status: 'ACTIVE',
          startDate,
          currentPeriodStart: startDate,
          currentPeriodEnd: endDate,
          endDate,
          paystackCustomerCode: data.customer?.customer_code || null,
        },
      });

      if (data.customer?.customer_code) {
        await transaction.user.update({
          where: { id: userId },
          data: { paystackCustomerCode: data.customer.customer_code },
        });
      }
    });

    return res.status(200).send('Webhook received');
  } catch (error) {
    logger.error({
      message: 'Paystack webhook processing error',
      errorType: error instanceof Error ? error.name : 'UnknownError',
    });
    if (!res.headersSent) return res.status(500).send('Webhook processing failed');
  }
};
