import { Request, Response } from 'express';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';
import { initializePaystackTransaction, verifyPaystackTransaction } from '../utils/paystack';
import { Prisma } from '@prisma/client';
import { logger } from '../middleware/logger';

export const startPaystackCheckout = async (req: AuthRequest, res: Response) => {
  try {
    const { planId, amount, billingCycle = 'ACADEMIC_SESSION', callbackUrl } = req.body as {
      planId: string;
      amount: number;
      billingCycle?: 'MONTHLY' | 'YEARLY' | 'ACADEMIC_SESSION';
      callbackUrl?: string;
    };

    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    if (!planId || !amount) {
      return res.status(400).json({ message: 'planId and amount are required' });
    }

    // Check for existing active subscription
    const existing = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });
    if (existing && (existing.status === 'ACTIVE' || existing.status === 'PENDING')) {
      return res.status(400).json({ message: 'User already has an active subscription' });
    }

    const reference = `ps_${user.id}_${Date.now()}`;
    const resolvedCallback =
      callbackUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscribe?reference=${reference}`;

    const transaction = await initializePaystackTransaction({
      amount,
      email: user.email,
      reference,
      callbackUrl: resolvedCallback,
      metadata: { planId, userId: user.id, billingCycle },
    });

    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        plan: planId,
        status: 'PENDING',
        billingCycle: billingCycle as any,
        priceAmountNgn: new Prisma.Decimal(amount),
        providerReference: transaction.reference,
        startDate: new Date(),
      },
      create: {
        userId: user.id,
        plan: planId,
        status: 'PENDING',
        billingCycle: billingCycle as any,
        priceAmountNgn: new Prisma.Decimal(amount),
        paymentProvider: 'PAYSTACK',
        providerReference: transaction.reference,
        startDate: new Date(),
      },
    });

    res.json({ authorizationUrl: transaction.authorization_url, reference: transaction.reference });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const verifyPaystackCheckout = async (req: AuthRequest, res: Response) => {
  try {
    const { reference } = req.query as { reference?: string };
    const user = req.user;

    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if (!reference) return res.status(400).json({ message: 'reference query param is required' });

    const verification = await verifyPaystackTransaction(reference);

    if (verification.status !== 'success') {
      return res.status(400).json({ message: 'Payment not successful yet' });
    }

    const startDate = verification.paid_at ? new Date(verification.paid_at) : new Date();
    const billingCycle = (verification.metadata?.billingCycle as string) || 'ACADEMIC_SESSION';

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

    const subscription = await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        plan: (verification.metadata?.planId as string) || 'default',
        status: 'ACTIVE',
        billingCycle: billingCycle as any,
        priceAmountNgn: new Prisma.Decimal((verification.amount || 0) / 100),
        startDate,
        currentPeriodStart: startDate,
        currentPeriodEnd: endDate,
        endDate,
        paymentProvider: 'PAYSTACK',
        providerReference: verification.reference,
        paystackCustomerCode: verification.customer?.customer_code || null,
      },
      create: {
        userId: user.id,
        plan: (verification.metadata?.planId as string) || 'default',
        status: 'ACTIVE',
        billingCycle: billingCycle as any,
        priceAmountNgn: new Prisma.Decimal((verification.amount || 0) / 100),
        startDate,
        currentPeriodStart: startDate,
        currentPeriodEnd: endDate,
        endDate,
        paymentProvider: 'PAYSTACK',
        providerReference: verification.reference,
        paystackCustomerCode: verification.customer?.customer_code || null,
      },
    });

    // Update user's paystack customer code
    if (verification.customer?.customer_code) {
      await prisma.user.update({
        where: { id: user.id },
        data: { paystackCustomerCode: verification.customer.customer_code },
      });
    }

    // Record the transaction
    await prisma.paystackTransaction.create({
      data: {
        userId: user.id,
        reference: verification.reference,
        amountNgn: new Prisma.Decimal((verification.amount || 0) / 100),
        status: 'success',
        planId: (verification.metadata?.planId as string) || 'default',
        channel: verification.channel || null,
        paidAt: verification.paid_at ? new Date(verification.paid_at) : null,
      },
    });

    res.json({ message: 'Subscription activated', subscription });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
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
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
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
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const handlePaystackWebhook = async (req: Request, res: Response) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      logger.error({ message: 'PAYSTACK_SECRET_KEY is missing during webhook verification' });
      return res.status(500).send('Webhook configuration error');
    }

    const signature = req.headers['x-paystack-signature'];
    if (!signature) {
      return res.status(401).send('Missing Paystack signature');
    }

    const hash = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== signature) {
      return res.status(401).send('Invalid Paystack signature');
    }

    // Acknowledge receipt to Paystack immediately
    res.status(200).send('Webhook received');

    const { event, data } = req.body;

    if (event === 'charge.success') {
      const reference = data.reference;
      const metadata = data.metadata || {};
      let userId = metadata.userId;

      if (!userId && data.customer?.email) {
        const user = await prisma.user.findUnique({
          where: { email: data.customer.email },
        });
        if (user) userId = user.id;
      }

      if (!userId) {
        logger.warn({ message: 'Paystack webhook charge.success received but user not found', reference, email: data.customer?.email });
        return;
      }

      const planId = (metadata.planId as string) || 'default';
      const billingCycle = (metadata.billingCycle as string) || 'ACADEMIC_SESSION';
      const startDate = data.paid_at ? new Date(data.paid_at) : new Date();

      const endDate = new Date(startDate);
      if (billingCycle === 'YEARLY') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else if (billingCycle === 'MONTHLY') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 9);
      }

      const existingTx = await prisma.paystackTransaction.findUnique({
        where: { reference },
      });

      if (!existingTx) {
        await prisma.paystackTransaction.create({
          data: {
            userId,
            reference,
            amountNgn: new Prisma.Decimal((data.amount || 0) / 100),
            status: 'success',
            planId,
            channel: data.channel || null,
            paidAt: startDate,
            rawWebhookData: data,
          },
        });
      }

      await prisma.subscription.upsert({
        where: { userId },
        update: {
          plan: planId,
          status: 'ACTIVE',
          billingCycle: billingCycle as any,
          priceAmountNgn: new Prisma.Decimal((data.amount || 0) / 100),
          startDate,
          currentPeriodStart: startDate,
          currentPeriodEnd: endDate,
          endDate,
          paymentProvider: 'PAYSTACK',
          providerReference: reference,
          paystackCustomerCode: data.customer?.customer_code || null,
        },
        create: {
          userId,
          plan: planId,
          status: 'ACTIVE',
          billingCycle: billingCycle as any,
          priceAmountNgn: new Prisma.Decimal((data.amount || 0) / 100),
          startDate,
          currentPeriodStart: startDate,
          currentPeriodEnd: endDate,
          endDate,
          paymentProvider: 'PAYSTACK',
          providerReference: reference,
          paystackCustomerCode: data.customer?.customer_code || null,
        },
      });

      if (data.customer?.customer_code) {
        await prisma.user.update({
          where: { id: userId },
          data: { paystackCustomerCode: data.customer.customer_code },
        });
      }
    }
  } catch (error: any) {
    logger.error({ message: 'Paystack webhook processing error', error: error.message });
  }
};

