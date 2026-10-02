'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { login, changePassword, clearError } from '@/store/authSlice';
import AnimatedCard from '@/components/AnimatedCard';
import PageTransition from '@/components/PageTransition';
import Link from 'next/link';
import { resendVerificationEmail } from '@/lib/api';

export default function Login() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    isAuthenticated,
    mustChangePassword,
    loading,
    error,
    emailVerificationRequired,
  } = useAppSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [resendingVerification, setResendingVerification] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated && !mustChangePassword) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, mustChangePassword, router]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  const handleResendVerification = async () => {
    setResendingVerification(true);
    setVerificationMessage('');
    try {
      const result = await resendVerificationEmail(formData.email);
      setVerificationMessage(result.message);
    } catch {
      setVerificationMessage('Unable to request a verification email right now. Please try again.');
    } finally {
      setResendingVerification(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return;
    }
    const result = await dispatch(changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    }));
    if (changePassword.fulfilled.match(result)) {
      router.replace('/dashboard');
    }
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <AnimatedCard delay={0.1} className="w-full max-w-md bg-gradient-to-br from-purple-50 to-pink-50">
          <h1 className="text-4xl font-bold text-center mb-6 text-rainbow">
            {mustChangePassword ? 'Set a New Password' : 'Welcome Back! 🎉'}
          </h1>
          <p className="text-center text-gray-600 mb-8">
            {mustChangePassword ? 'Choose a new password before continuing.' : 'Log in to access Character Matters content'}
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              <p className="text-center">{error}</p>
            </div>
          )}
          {emailVerificationRequired && (
            <div className="mb-6 text-center">
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendingVerification || !formData.email}
                className="text-purple-700 font-bold disabled:opacity-50"
              >
                {resendingVerification ? 'Sending...' : 'Resend verification email'}
              </button>
            </div>
          )}
          {verificationMessage && (
            <p className="mb-6 text-center text-green-800" role="status">{verificationMessage}</p>
          )}

          {mustChangePassword ? (
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-gray-700 font-bold mb-2">Current temporary password</label>
                <input id="currentPassword" type="password" autoComplete="current-password" required minLength={6} maxLength={128} value={passwordData.currentPassword} onChange={(event) => setPasswordData({ ...passwordData, currentPassword: event.target.value })} className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none" />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-gray-700 font-bold mb-2">New password</label>
                <input id="newPassword" type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={passwordData.newPassword} onChange={(event) => setPasswordData({ ...passwordData, newPassword: event.target.value })} className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none" />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-gray-700 font-bold mb-2">Confirm new password</label>
                <input id="confirmPassword" type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={passwordData.confirmPassword} onChange={(event) => setPasswordData({ ...passwordData, confirmPassword: event.target.value })} className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none" />
              </div>
              {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                <p className="text-sm text-red-700">Passwords do not match.</p>
              )}
              <button type="submit" disabled={loading || passwordData.newPassword !== passwordData.confirmPassword} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Updating password...' : 'Change Password'}
              </button>
            </form>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
                Email Address 📧
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-700 font-bold mb-2">
                Password 🔒
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Log In 🚀'}
            </button>
          </form>
          )}

          {!mustChangePassword && <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-purple-600 hover:text-purple-800 font-bold">
                Register here
              </Link>
            </p>
          </div>}
        </AnimatedCard>
      </div>
    </PageTransition>
  );
}
