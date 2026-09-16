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
  subtitle: string;
  totalEpisodes: number;
  description: string;
  priceLabel: string;
  paystackLabel: string;
  priceMonthly: number;
  paystackAmount: number;
  stripePriceId: string;
  badge?: string;
  recommended?: boolean;
  gradient: string;
  ageBreakdown: {
    toddler: string;   // Ages 2 & 3
    preK: string;      // Ages 4 & 5
    schoolAge: string; // Ages 6 - 10
  };
  features: string[];
}

const PLANS: PlanConfig[] = [
  {
    id: 'package_1',
    title: '1st Package',
    subtitle: '20 Episodes Master Pack',
    totalEpisodes: 20,
    description: 'Complete 20-episode collection across all age categories',
    priceLabel: '$25',
    paystackLabel: 'NGN 25,000',
    priceMonthly: 25,
    paystackAmount: 25000,
    stripePriceId: 'price_package_1_monthly',
    badge: 'Best Value (20 Episodes)',
    recommended: true,
    gradient: 'from-purple-100 via-pink-100 to-amber-100',
    ageBreakdown: {
      toddler: '8 episodes',
      preK: '8 episodes',
      schoolAge: '4 episodes',
    },
    features: [
      '20 High-Quality Animated Episodes',
      'Full Worksheets & Educator Guides',
      'Interactive Read-Along eBooks',
      'Multi-Child Progress Dashboard',
    ],
  },
  {
    id: 'package_2',
    title: '2nd Package',
    subtitle: '16 Episodes Gold Pack',
    totalEpisodes: 16,
    description: 'Comprehensive 16-episode package for growing families',
    priceLabel: '$20',
    paystackLabel: 'NGN 20,000',
    priceMonthly: 20,
    paystackAmount: 20000,
    stripePriceId: 'price_package_2_monthly',
    badge: 'Most Popular (16 Episodes)',
    gradient: 'from-blue-100 via-indigo-100 to-purple-100',
    ageBreakdown: {
      toddler: '6 episodes',
      preK: '6 episodes',
      schoolAge: '4 episodes',
    },
    features: [
      '16 High-Quality Animated Episodes',
      'Printable Educator Worksheets',
      'Interactive Read-Along eBooks',
      'Child Progress Tracking',
    ],
  },
  {
    id: 'package_3',
    title: '3rd Package',
    subtitle: '13 Episodes Silver Pack',
    totalEpisodes: 13,
    description: 'Balanced 13-episode set tailored for all learning stages',
    priceLabel: '$16',
    paystackLabel: 'NGN 16,000',
    priceMonthly: 16,
    paystackAmount: 16000,
    stripePriceId: 'price_package_3_monthly',
    gradient: 'from-emerald-100 via-teal-100 to-cyan-100',
    ageBreakdown: {
      toddler: '5 episodes',
      preK: '5 episodes',
      schoolAge: '3 episodes',
    },
    features: [
      '13 High-Quality Animated Episodes',
      'Character Worksheets',
      'Read-Along eBooks',
      'Character Badges & Certificates',
    ],
  },
  {
    id: 'package_4',
    title: '4th Package',
    subtitle: '8 Episodes Bronze Pack',
    totalEpisodes: 8,
    description: 'Essential 8-episode package for core character values',
    priceLabel: '$10',
    paystackLabel: 'NGN 10,000',
    priceMonthly: 10,
    paystackAmount: 10000,
    stripePriceId: 'price_package_4_monthly',
    gradient: 'from-amber-100 via-orange-100 to-yellow-100',
    ageBreakdown: {
      toddler: '3 episodes',
      preK: '3 episodes',
      schoolAge: '2 episodes',
    },
    features: [
      '8 High-Quality Animated Episodes',
      'Selected Printable Worksheets',
      'Basic Character Badges',
      '1 Child Profile',
    ],
  },
  {
    id: 'package_5',
    title: '5th Package',
    subtitle: '5 Episodes Starter Pack',
    totalEpisodes: 5,
    description: 'Compact 5-episode collection introducing key values',
    priceLabel: '$7',
    paystackLabel: 'NGN 7,000',
    priceMonthly: 7,
    paystackAmount: 7000,
    stripePriceId: 'price_package_5_monthly',
    gradient: 'from-rose-100 via-pink-100 to-purple-100',
    ageBreakdown: {
      toddler: '2 episodes',
      preK: '2 episodes',
      schoolAge: '1 episode',
    },
    features: [
      '5 High-Quality Animated Episodes',
      'Introductory Worksheets',
      'Read-Along eBooks',
      'Standard Support',
    ],
  },
  {
    id: 'package_6',
    title: '6th Package',
    subtitle: '3 Episodes Mini Sampler',
    totalEpisodes: 3,
    description: 'Quick 3-episode trial with 1 episode per age group',
    priceLabel: '$5',
    paystackLabel: 'NGN 5,000',
    priceMonthly: 5,
    paystackAmount: 5000,
    stripePriceId: 'price_package_6_monthly',
    gradient: 'from-cyan-100 via-sky-100 to-blue-100',
    ageBreakdown: {
      toddler: '1 episode',
      preK: '1 episode',
      schoolAge: '1 episode',
    },
    features: [
      '3 High-Quality Animated Episodes',
      '1 Episode for Each Age Group',
      'Sample Activity Worksheets',
      'Standard Support',
    ],
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
    const planFromUrl = searchParams?.get('plan');
    if (planFromUrl && PLANS.some((p) => p.id === planFromUrl)) {
      setSelectedPlanId(planFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    const planFromState = subscriptionState.data?.plan;
    if (planFromState && PLANS.some((p) => p.id === planFromState)) {
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
          className="w-full rounded-full bg-white/80 py-3 font-semibold text-purple-600 shadow transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {paystackLabel}
        </button>
        <p className="text-center text-xs text-gray-500">
          Stripe bills in USD ({plan.priceLabel}/mo). Paystack bills in NGN ({plan.paystackLabel}/mo).
        </p>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <PageTransition>
        <div className="container mx-auto px-4 py-12">
          <h1 className="mb-4 text-center text-5xl font-bold text-rainbow">Episode Packages & Pricing 🌟</h1>
          <p className="mx-auto mb-10 max-w-3xl text-center text-lg text-gray-700">
            Choose the episode package that fits your family best. Each package includes animated episodes tailored across three key age groups. Pay easily via Stripe or Paystack.
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
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {PLANS.map((plan, idx) => {
                const isActive = selectedPlanId === plan.id;
                return (
                  <AnimatedCard
                    key={plan.id}
                    delay={0.1 + idx * 0.08}
                    className={`relative flex flex-col justify-between h-full bg-linear-to-br ${plan.gradient} p-6 rounded-2xl border border-gray-200 ${
                      plan.recommended ? 'ring-4 ring-purple-400' : ''
                    } ${isActive ? 'shadow-2xl scale-[1.02]' : 'shadow-md'}`}
                  >
                    {plan.badge && (
                      <span className="absolute -top-3 right-4 rounded-full bg-purple-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow">
                        {plan.badge}
                      </span>
                    )}
                    <div>
                      <h3 className="mb-1 text-2xl font-extrabold text-gray-900">{plan.title}</h3>
                      <p className="mb-3 text-sm font-medium text-purple-700">{plan.subtitle}</p>
                      <p className="mb-4 text-xs text-gray-600">{plan.description}</p>
                      <div className="mb-4 text-4xl font-extrabold text-purple-600">
                        {plan.priceLabel}
                        <span className="ml-1 text-base font-normal text-gray-600">/mo</span>
                      </div>

                      {/* Episode Age Distribution Box */}
                      <div className="mb-5 rounded-xl border border-purple-200 bg-white/90 p-4 shadow-xs">
                        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-purple-800 flex items-center gap-1">
                          <span>🎬</span> Episode Age Distribution
                        </h4>
                        <div className="space-y-2 text-xs font-semibold">
                          <div className="flex items-center justify-between text-gray-800">
                            <span>Ages 2 & 3</span>
                            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-green-800 font-bold">
                              {plan.ageBreakdown.toddler}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-gray-800">
                            <span>Ages 4 & 5</span>
                            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-blue-800 font-bold">
                              {plan.ageBreakdown.preK}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-gray-800">
                            <span>Ages 6 - 10</span>
                            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-purple-800 font-bold">
                              {plan.ageBreakdown.schoolAge}
                            </span>
                          </div>
                        </div>
                      </div>

                      <ul className="mb-4 space-y-2 text-xs">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-center text-gray-700 font-medium">
                            <span className="mr-2 text-green-600">✔</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
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
