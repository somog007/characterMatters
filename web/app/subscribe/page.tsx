'use client';

import { Suspense, startTransition, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchSubscription,
  startStripeCheckout,
  finalizeStripeCheckout,
  startPaystackCheckout,
  verifyPaystackCheckout,
  cancelSubscription,
  clearCheckoutState,
} from '@/store/subscriptionSlice';
import { getCurrentUser } from '@/store/authSlice';
import ProtectedRoute from '@/components/ProtectedRoute';
import AnimatedCard from '@/components/AnimatedCard';
import PageTransition from '@/components/PageTransition';
import type { RootState } from '@/store';

type ProviderOption = 'stripe' | 'paystack';

type BillingCycle = 'monthly' | 'yearly';

interface PlanConfig {
  id: string;
  title: string;
  description: string;
  priceLabel: string;
  paystackLabel: string;
  priceMonthly: number;
  paystackAmount: number;
  stripePriceId: string;
  features: string[];
  gradient: string;
  recommended?: boolean;
}

const PLANS: PlanConfig[] = [
  {
    id: 'basic',
    title: 'Basic Character Pack',
    description: 'Access selected character videos & 3 eBooks',
    priceLabel: '$5/mo',
  paystackLabel: 'NGN 5,000/mo',
    priceMonthly: 5,
    paystackAmount: 5000,
    stripePriceId: 'price_basic_monthly',
    features: ['Access to 10 videos', '3 eBooks', 'Basic progress tracking'],
  gradient: 'from-blue-100 to-cyan-100',
  },
  {
    id: 'premium',
    title: 'Premium Growth Pack',
    description: 'All videos, eBooks & subscriber badge',
    priceLabel: '$15/mo',
  paystackLabel: 'NGN 15,000/mo',
    priceMonthly: 15,
    paystackAmount: 15000,
    stripePriceId: 'price_premium_monthly',
    features: ['All videos', 'All eBooks', 'Subscriber badge', 'Priority support'],
  gradient: 'from-purple-100 to-pink-100',
    recommended: true,
  },
];

const DEFAULT_PLAN_ID = PLANS.find((plan) => plan.recommended)?.id ?? PLANS[0].id;
const DEFAULT_BILLING: BillingCycle = 'monthly';

function SubscribeContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramsHandled = useRef(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(DEFAULT_PLAN_ID);
  const [selectedProvider, setSelectedProvider] = useState<ProviderOption>('stripe');
  const [localNotice, setLocalNotice] = useState<string | null>(null);
  const [billingCycle] = useState<BillingCycle>(DEFAULT_BILLING);

  const { user } = useAppSelector((state: RootState) => state.auth);
  const subscriptionState = useAppSelector((state: RootState) => state.subscription);

  const selectedPlan = useMemo(
    () => PLANS.find((plan) => plan.id === selectedPlanId) ?? PLANS[0],
    [selectedPlanId]
  );

  useEffect(() => {
    const planFromState = subscriptionState.data?.plan;
    if (planFromState) {
      startTransition(() => {
        setSelectedPlanId(planFromState);
      });
    }
  }, [subscriptionState.data?.plan]);

  const isSubscriber =
    user?.role === 'subscriber' || subscriptionState.data?.status === 'active';

  const activePlanTitle = subscriptionState.data?.plan
    ? PLANS.find((plan) => plan.id === subscriptionState.data?.plan)?.title ||
      subscriptionState.data.plan
    : selectedPlan.title;

  useEffect(() => {
    dispatch(getCurrentUser());
    dispatch(fetchSubscription());
    dispatch(clearCheckoutState());
  }, [dispatch]);

  useEffect(() => {
    if (!subscriptionState.checkoutUrl) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    window.location.href = subscriptionState.checkoutUrl;
  }, [subscriptionState.checkoutUrl]);

  useEffect(() => {
    if (!searchParams || paramsHandled.current) {
      return;
    }

    const sessionId = searchParams.get('session_id');
    const reference = searchParams.get('reference');
    const cancelled = searchParams.get('cancelled');

    if (sessionId) {
      paramsHandled.current = true;
      dispatch(finalizeStripeCheckout({ sessionId })).finally(() => {
        router.replace('/subscribe');
      });
      return;
    }

    if (reference) {
      paramsHandled.current = true;
      dispatch(verifyPaystackCheckout({ reference })).finally(() => {
        router.replace('/subscribe');
      });
      return;
    }

    if (cancelled) {
      paramsHandled.current = true;
      startTransition(() => {
        setLocalNotice('Checkout cancelled. You can try again anytime.');
      });
      dispatch(clearCheckoutState());
      router.replace('/subscribe');
    }
  }, [dispatch, router, searchParams]);

  useEffect(() => {
    if (subscriptionState.successMessage) {
      startTransition(() => {
        setLocalNotice(subscriptionState.successMessage);
      });
    }
  }, [subscriptionState.successMessage]);

  const handleCheckout = (provider: ProviderOption, plan: PlanConfig) => {
    setSelectedPlanId(plan.id);
    setSelectedProvider(provider);
    setLocalNotice(null);

    if (provider === 'stripe') {
      dispatch(
        startStripeCheckout({
          planId: plan.id,
          priceId: plan.stripePriceId,
          billingCycle,
        })
      );
      return;
    }

    dispatch(
      startPaystackCheckout({
        planId: plan.id,
        amount: plan.paystackAmount,
        billingCycle,
      })
    );
  };

  const handleCancelSubscription = () => {
    dispatch(cancelSubscription());
  };

  const isStripeProcessing =
    subscriptionState.loading && subscriptionState.providerInFlight === 'stripe';
  const isPaystackProcessing =
    subscriptionState.loading && subscriptionState.providerInFlight === 'paystack';

  const renderPlanActions = (plan: PlanConfig) => {
    const stripeLabel =
      isStripeProcessing && selectedProvider === 'stripe' && selectedPlanId === plan.id
        ? 'Redirecting...'
        : 'Checkout with Stripe';
    const paystackLabel =
      isPaystackProcessing && selectedProvider === 'paystack' && selectedPlanId === plan.id
        ? 'Redirecting...'
        : 'Checkout with Paystack';

    return (
      <div className="mt-6 flex flex-col gap-3">
        <button
          onClick={() => handleCheckout('stripe', plan)}
          disabled={isStripeProcessing || subscriptionState.verifying || isSubscriber}
          className="w-full rounded-full bg-linear-to-r from-purple-500 to-pink-500 py-3 font-semibold text-white shadow transition hover:from-purple-600 hover:to-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {stripeLabel}
        </button>
        <button
          onClick={() => handleCheckout('paystack', plan)}
          disabled={isPaystackProcessing || subscriptionState.verifying || isSubscriber}
          className="w-full rounded-full bg-white/70 py-3 font-semibold text-purple-600 shadow transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {paystackLabel}
        </button>
        <p className="text-center text-xs text-gray-500">
          Stripe bills in USD ({plan.priceLabel}). Paystack bills in NGN ({plan.paystackLabel}).
        </p>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <PageTransition>
        <div className="container mx-auto px-4 py-12">
          <h1 className="mb-4 text-center text-5xl font-bold text-rainbow">Upgrade Your Experience 🌟</h1>
          <p className="mx-auto mb-10 max-w-3xl text-center text-lg text-gray-700">
            Choose the subscription that fits you best and pay using Stripe or Paystack. Once your checkout is
            complete we will unlock the full Character Matters library instantly.
          </p>

          {localNotice && (
            <div className="mx-auto mb-8 max-w-2xl rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
              {localNotice}
            </div>
          )}

          {subscriptionState.error && (
            <div className="mx-auto mb-8 max-w-2xl rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              {subscriptionState.error}
            </div>
          )}

          {subscriptionState.verifying && (
            <div className="mx-auto mb-8 max-w-2xl rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-700">
              We are confirming your payment. This only takes a few seconds...
            </div>
          )}

          {isSubscriber && subscriptionState.data ? (
            <AnimatedCard delay={0.05} className="mb-12 bg-linear-to-r from-green-100 to-emerald-100">
              <h2 className="mb-2 text-center text-3xl font-bold text-green-700">You are a Premium Subscriber ✅</h2>
              <p className="mb-4 text-center text-gray-700">
                Current period ends on{' '}
                {subscriptionState.data.currentPeriodEnd
                  ? new Date(subscriptionState.data.currentPeriodEnd).toLocaleDateString()
                  : 'N/A'}
              </p>
              <p className="mb-4 text-center text-sm text-gray-600">
                Billing via {subscriptionState.data.paymentProvider === 'paystack' ? 'Paystack' : 'Stripe'} · Plan:{' '}
                {activePlanTitle}
              </p>
              <div className="flex justify-center">
                <button
                  onClick={handleCancelSubscription}
                  disabled={subscriptionState.loading}
                  className="rounded-full bg-red-500 px-6 py-2 font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {subscriptionState.loading ? 'Processing...' : 'Cancel Subscription'}
                </button>
              </div>
            </AnimatedCard>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {PLANS.map((plan, idx) => {
                const isActive = selectedPlanId === plan.id;
                return (
                  <AnimatedCard
                    key={plan.id}
                    delay={0.1 + idx * 0.1}
                    className={`relative h-full bg-linear-to-br ${plan.gradient} ${
                      plan.recommended ? 'ring-4 ring-purple-300' : ''
                    } ${isActive ? 'shadow-xl' : ''}`}
                  >
                    {plan.recommended && (
                      <span className="absolute -top-3 right-4 rounded-full bg-purple-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow">
                        Recommended
                      </span>
                    )}
                    <h3 className="mb-2 text-2xl font-bold text-gray-800">{plan.title}</h3>
                    <p className="mb-4 text-gray-600">{plan.description}</p>
                    <div className="mb-4 text-4xl font-extrabold text-purple-600">
                      {plan.priceLabel}
                      <span className="ml-1 align-middle text-lg font-normal text-gray-600">/mo</span>
                    </div>
                    <ul className="mb-2 space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center text-gray-700">
                          <span className="mr-2 text-green-600">✔</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    {renderPlanActions(plan)}
                  </AnimatedCard>
                );
              })}
            </div>
          )}
        </div>
      </PageTransition>
    </ProtectedRoute>
  );
}

function SubscribeFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-600">
      Preparing your subscription options...
    </div>
  );
}

export default function SubscribePage() {
  return (
    <Suspense fallback={<SubscribeFallback />}>
      <SubscribeContent />
    </Suspense>
  );
}
