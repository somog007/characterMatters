import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const createStripeCustomer = async (email: string, name: string) => {
  return await stripe.customers.create({
    email,
    name,
  });
};

export const createSubscription = async (customerId: string, priceId: string) => {
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });
};

export const cancelSubscription = async (subscriptionId: string) => {
  return await stripe.subscriptions.cancel(subscriptionId);
};

export const createPaymentIntent = async (
  amount: number,
  currency: string,
  metadata?: any
) => {
  return await stripe.paymentIntents.create({
    amount,
    currency,
    metadata,
  });
};

interface CheckoutSessionOptions {
  customerId?: string;
  customerEmail: string;
  priceId: string;
  mode: 'subscription' | 'payment';
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export const createCheckoutSession = async ({
  customerId,
  customerEmail,
  priceId,
  mode,
  successUrl,
  cancelUrl,
  metadata,
}: CheckoutSessionOptions) => {
  const params: Stripe.Checkout.SessionCreateParams = {
    mode,
    success_url: successUrl,
    cancel_url: cancelUrl,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata,
    allow_promotion_codes: true,
  };

  if (customerId) {
    params.customer = customerId;
  } else {
    params.customer_email = customerEmail;
  }

  return stripe.checkout.sessions.create(params);
};

export const retrieveCheckoutSession = async (sessionId: string) => {
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['subscription', 'customer']
  });
};

export const retrieveSubscription = async (subscriptionId: string) => {
  return stripe.subscriptions.retrieve(subscriptionId);
};

export const handleWebhook = async (req: any, res: any) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret!);
    
    // Handle the event based on its type
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Handle successful payment
        break;
      case 'payment_intent.payment_failed':
        // Handle failed payment
        break;
      // Add more event types as needed
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (err: any) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};