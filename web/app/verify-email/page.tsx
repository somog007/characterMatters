'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import AnimatedCard from '@/components/AnimatedCard';
import PageTransition from '@/components/PageTransition';

type State = 'verifying' | 'verified' | 'invalid' | 'failed' | 'missing';

const MAX_ATTEMPTS = 3;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function VerifyEmail() {
  const [state, setState] = useState<State>('verifying');
  const [message, setMessage] = useState('Verifying your email address...');
  const token = useRef<string | null>(null);

  const verify = useCallback(async () => {
    if (!token.current) return;
    setState('verifying');
    setMessage('Verifying your email address...');

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        const { data } = await api.post('/auth/verify-email', { token: token.current }, { timeout: 30_000 });
        setMessage(data.message);
        setState('verified');
        return;
      } catch (error: unknown) {
        const err = error as { response?: { status?: number; data?: { message?: string } } };
        const status = err.response?.status;
        // 400 means the server checked the link and refused it: retrying will not help.
        if (status === 400) {
          setMessage(err.response?.data?.message || 'This verification link is invalid or has expired.');
          setState('invalid');
          return;
        }
        // No answer, a timeout or a server error is usually temporary (for example the
        // server waking up): wait a moment and try again with the same link.
        if (attempt < MAX_ATTEMPTS) {
          setMessage('The server is taking longer than usual. Still trying…');
          await wait(2_000 * attempt);
        }
      }
    }

    setMessage('We could not reach the server to verify your email.');
    setState('failed');
  }, []);

  useEffect(() => {
    const start = async () => {
      await Promise.resolve();
      token.current = new URLSearchParams(window.location.hash.slice(1)).get('token');
      // Remove the token from the address bar and browser history.
      window.history.replaceState(null, '', window.location.pathname);

      if (!token.current) {
        setMessage('This verification link is missing its token. Open the link from your email again.');
        setState('missing');
        return;
      }
      await verify();
    };
    void start();
  }, [verify]);

  return (
    <PageTransition>
      <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
        <AnimatedCard delay={0.1} className="w-full max-w-md bg-gradient-to-br from-blue-50 to-cyan-50 text-center">
          <h1 className="mb-6 text-3xl font-bold text-rainbow">Email verification</h1>
          <p className="mb-4 text-gray-700" role="status">{message}</p>

          {state === 'verified' && (
            <Link href="/login" className="font-bold text-blue-700 hover:text-blue-900">
              Continue to login
            </Link>
          )}

          {state === 'failed' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => void verify()}
                className="rounded-full bg-blue-600 px-6 py-2 font-bold text-white hover:bg-blue-700"
              >
                Try again
              </button>
              <p className="text-sm text-gray-600">
                Your link is still valid for 24 hours. You can also{' '}
                <Link href="/login" className="font-semibold text-blue-700 hover:text-blue-900">try logging in</Link>
                {' '}in case it already worked.
              </p>
            </div>
          )}

          {(state === 'invalid' || state === 'missing') && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                If you already opened this link once, your email is probably verified: just log in.
                Otherwise, log in and ask for a new verification email.
              </p>
              <Link href="/login" className="font-bold text-blue-700 hover:text-blue-900">
                Go to login
              </Link>
            </div>
          )}
        </AnimatedCard>
      </div>
    </PageTransition>
  );
}
