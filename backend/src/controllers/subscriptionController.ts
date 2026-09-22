import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';
import { initializePaystackTransaction, verifyPaystackTransaction } from '../utils/paystack';
import { Decimal } from '@prisma/client/runtime/library';

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
        priceAmountNgn: new Decimal(amount),
        providerReference: transaction.reference,
        startDate: new Date(),
      },
      create: {
        userId: user.id,
        plan: planId,
        status: 'PENDING',
        billingCycle: billingCycle as any,
        priceAmountNgn: new Decimal(amount),
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
        priceAmountNgn: new Decimal((verification.amount || 0) / 100),
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
        priceAmountNgn: new Decimal((verification.amount || 0) / 100),
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
        amountNgn: new Decimal((verification.amount || 0) / 100),
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
