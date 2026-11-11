import { env } from '../config/env';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const REQUEST_TIMEOUT_MS = 10_000;

interface InitializeTransactionOptions {
  amount: number;
  email: string;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
  currency?: 'NGN' | 'USD';
}

interface PaystackResponse<T> {
  status: boolean;
  message?: string;
  data: T;
}

export interface PaystackVerification {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  channel?: string;
  paid_at: string;
  metadata?: Record<string, any>;
  customer?: {
    email?: string;
    customer_code?: string;
  };
}

/** Paystack answered, but refused the request (bad key, unknown reference, amount limit, ...). */
export class PaystackRequestError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'PaystackRequestError';
  }
}

const getSecret = () => {
  const secret = env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured');
  }
  return secret;
};

const paystackRequest = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getSecret()}`,
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  let payload: PaystackResponse<T> | undefined;
  try {
    payload = (await response.json()) as PaystackResponse<T>;
  } catch {
    payload = undefined;
  }

  if (!response.ok || !payload?.status) {
    throw new PaystackRequestError(payload?.message || `Paystack request failed (${response.status})`, response.status);
  }
  return payload.data;
};

export const initializePaystackTransaction = ({
  amount,
  email,
  reference,
  callbackUrl,
  metadata,
  currency = 'NGN',
}: InitializeTransactionOptions) =>
  paystackRequest<{ authorization_url: string; access_code: string; reference: string }>(
    '/transaction/initialize',
    {
      method: 'POST',
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100),
        reference,
        callback_url: callbackUrl,
        metadata,
        currency,
      }),
    }
  );

export const verifyPaystackTransaction = (reference: string) =>
  paystackRequest<PaystackVerification>(`/transaction/verify/${encodeURIComponent(reference)}`);
