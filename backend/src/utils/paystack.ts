const PAYSTACK_BASE_URL = 'https://api.paystack.co';

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

const getSecret = () => {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured');
  }
  return secret;
};

export const initializePaystackTransaction = async ({
  amount,
  email,
  reference,
  callbackUrl,
  metadata,
  currency = 'NGN',
}: InitializeTransactionOptions) => {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getSecret()}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      email,
      amount: Math.round(amount * 100),
      reference,
      callback_url: callbackUrl,
      metadata,
      currency,
    }),
  });

  const payload = (await response.json()) as PaystackResponse<{
    authorization_url: string;
    access_code: string;
    reference: string;
  }>;

  if (!response.ok || !payload.status) {
    throw new Error(payload?.message || 'Unable to initialize Paystack transaction');
  }

  return payload.data;
};

export const verifyPaystackTransaction = async (reference: string) => {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${getSecret()}`,
      Accept: 'application/json',
    },
  });

  const payload = (await response.json()) as PaystackResponse<{
    status: string;
    reference: string;
    amount: number;
    currency: string;
    paid_at: string;
    metadata?: Record<string, any>;
    customer?: {
      email?: string;
      customer_code?: string;
    };
  }>;

  if (!response.ok || !payload.status) {
    throw new Error(payload?.message || 'Unable to verify Paystack transaction');
  }

  return payload.data;
};
