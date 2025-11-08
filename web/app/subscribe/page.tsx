'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createSubscription, fetchSubscription, cancelSubscription } from '@/store/subscriptionSlice';
import { getCurrentUser } from '@/store/authSlice';
import ProtectedRoute from '@/components/ProtectedRoute';
import AnimatedCard from '@/components/AnimatedCard';
import PageTransition from '@/components/PageTransition';
import type { RootState } from '@/store';

const PLANS = [
  {
    id: 'basic',
    priceId: 'price_basic_placeholder',
    title: 'Basic Character Pack',
    description: 'Access selected character videos & 3 eBooks',
    priceMonthly: 5,
    features: ['Access to 10 videos', '3 eBooks', 'Basic progress tracking'],
    color: 'from-blue-100 to-cyan-100',
  },
  {
    id: 'premium',
    priceId: 'price_premium_placeholder',
    title: 'Premium Growth Pack',
    description: 'All videos, eBooks & subscriber badge',
    priceMonthly: 15,
    features: ['All videos', 'All eBooks', 'Subscriber badge', 'Priority support'],
    color: 'from-purple-100 to-pink-100',
    recommended: true,
  },
];

export default function SubscribePage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s: RootState) => s.auth);
  const subscriptionState = useAppSelector((s: RootState) => s.subscription);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getCurrentUser());
    dispatch(fetchSubscription());
  }, [dispatch]);

  const handleSubscribe = (planId: string, priceId: string) => {
    setSelectedPlan(planId);
    dispatch(createSubscription({ planId, priceId }));
  };

  const handleCancel = () => {
    dispatch(cancelSubscription());
  };

  const isSubscriber = user?.role === 'subscriber' || subscriptionState.data?.status === 'active';

  return (
    <ProtectedRoute>
      <PageTransition>
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-5xl font-bold text-center mb-4 text-rainbow">Upgrade Your Experience 🌟</h1>
          <p className="text-xl text-center text-gray-700 mb-12 max-w-3xl mx-auto">
            Choose a subscription plan to unlock full access to Character Matters educational videos, eBooks, and premium features.
          </p>

          {subscriptionState.error && (
            <div className="max-w-2xl mx-auto mb-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {subscriptionState.error}
            </div>
          )}

          {isSubscriber && subscriptionState.data && (
            <AnimatedCard delay={0.05} className="bg-gradient-to-r from-green-100 to-emerald-100 mb-12">
              <h2 className="text-3xl font-bold text-green-700 mb-2 text-center">You are a Premium Subscriber ✅</h2>
              <p className="text-center text-gray-700 mb-4">
                Current Period Ends: {new Date(subscriptionState.data.currentPeriodEnd || '').toLocaleDateString()}
              </p>
              <div className="flex justify-center">
                <button
                  onClick={handleCancel}
                  disabled={subscriptionState.loading}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full transition-colors disabled:opacity-50"
                >
                  {subscriptionState.loading ? 'Processing...' : 'Cancel Subscription'}
                </button>
              </div>
            </AnimatedCard>
          )}

          {!isSubscriber && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {PLANS.map((plan, idx) => (
                <AnimatedCard
                  key={plan.id}
                  delay={0.1 + idx * 0.1}
                  className={`bg-gradient-to-br ${plan.color} relative ${plan.recommended ? 'ring-4 ring-purple-400' : ''}`}
                >
                  {plan.recommended && (
                    <span className="absolute -top-3 right-4 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                      Recommended
                    </span>
                  )}
                  <h3 className="text-2xl font-bold mb-2 text-gray-800">{plan.title}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="text-4xl font-extrabold mb-4 text-purple-600">${plan.priceMonthly}<span className="text-lg font-normal text-gray-600">/mo</span></div>
                  <ul className="mb-6 space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center text-gray-700">
                        <span className="text-green-600 mr-2">✔</span> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleSubscribe(plan.id, plan.priceId)}
                    disabled={subscriptionState.loading && selectedPlan === plan.id}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {subscriptionState.loading && selectedPlan === plan.id ? 'Processing...' : 'Subscribe'}
                  </button>
                </AnimatedCard>
              ))}
            </div>
          )}
        </div>
      </PageTransition>
    </ProtectedRoute>
  );
}
