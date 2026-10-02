'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import AnimatedCard from '@/components/AnimatedCard';
import PageTransition from '@/components/PageTransition';

export default function VerifyEmail() {
  const [message, setMessage] = useState('Verifying your email address...');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verify = async () => {
      await Promise.resolve();
      const token = new URLSearchParams(window.location.hash.slice(1)).get('token');
      window.history.replaceState(null, '', window.location.pathname);

      if (!token) {
        setMessage('This verification link is missing its token.');
        return;
      }

      try {
        const { data } = await api.post('/auth/verify-email', { token });
        setMessage(data.message);
        setVerified(true);
      } catch (error: unknown) {
        const response = error as { response?: { data?: { message?: string } } };
        setMessage(
          response.response?.data?.message
          || 'Unable to verify your email right now. Request a new verification link and try again.'
        );
      }
    };
    void verify();
  }, []);

  return (
    <PageTransition>
      <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
        <AnimatedCard delay={0.1} className="w-full max-w-md bg-gradient-to-br from-blue-50 to-cyan-50 text-center">
          <h1 className="mb-6 text-3xl font-bold text-rainbow">Email verification</h1>
          <p className="mb-6 text-gray-700" role="status">{message}</p>
          {verified && (
            <Link href="/login" className="font-bold text-blue-700 hover:text-blue-900">
              Continue to login
            </Link>
          )}
          {!verified && (
            <Link href="/login" className="font-bold text-blue-700 hover:text-blue-900">
              Return to login to request another link
            </Link>
          )}
        </AnimatedCard>
      </div>
    </PageTransition>
  );
}
