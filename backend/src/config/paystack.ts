// Paystack Payment Gateway Integration Helper
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

export const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
export const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY || '';
export const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export interface PaystackInitializeOptions {
  email: string;
  amountNgn: number; // e.g. 1200000 for Platinum
  planId: string;    // 'platinum' | 'diamond' | 'sapphire' | 'gold' | 'silver' | 'bronze'
  callbackUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * Helper to initialize a Paystack transaction for an Academic Session Pack
 */
export const initializePaystackTransaction = async (options: PaystackInitializeOptions) => {
  const amountKobo = Math.round(options.amountNgn * 100); // Paystack expects amount in Kobo (NGN * 100)

  const payload = {
    email: options.email,
    amount: amountKobo,
    currency: 'NGN',
    callback_url: options.callbackUrl || process.env.PAYSTACK_CALLBACK_URL || 'http://localhost:3000/subscribe?status=success',
    metadata: {
      planId: options.planId,
      billingCycle: 'academic_session',
      ...options.metadata,
    },
  };

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as any;
  if (!data.status) {
    throw new Error(`Paystack Initialization Error: ${data.message || 'Unknown error'}`);
  }

  return data.data as {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

/**
 * Verify a Paystack transaction by reference
 */
export const verifyPaystackTransaction = async (reference: string) => {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    },
  });

  const data = (await response.json()) as any;
  if (!data.status) {
    throw new Error(`Paystack Verification Error: ${data.message || 'Unknown error'}`);
  }

  return data.data;
};

/**
 * Verify Paystack Webhook Signature (HMAC SHA512)
 */
export const verifyPaystackWebhookSignature = (requestBody: string, signature: string): boolean => {
  if (!PAYSTACK_SECRET_KEY || !signature) return false;
  const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(requestBody).digest('hex');
  return hash === signature;
};
