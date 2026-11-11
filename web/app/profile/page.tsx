'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { getCurrentUser } from '@/store/authSlice';
import ProtectedRoute from '@/components/ProtectedRoute';
import AnimatedCard from '@/components/AnimatedCard';
import PageTransition from '@/components/PageTransition';
import api from '@/lib/api';
import { AVATAR_ACCEPT, prepareAvatar } from '@/lib/avatar';
import type { RootState } from '@/store';

type Message = { type: '' | 'success' | 'error'; text: string };

const getApiError = (error: unknown, fallback: string) => {
  const err = error as { response?: { data?: { message?: string; errors?: { message?: string }[] } } };
  return err.response?.data?.errors?.[0]?.message || err.response?.data?.message || fallback;
};

const getRoleDisplay = (role?: string) => {
  switch (role) {
    case 'ADMIN':
      return { text: 'Administrator', emoji: '👑', color: 'text-red-600' };
    case 'SCHOOL_ADMIN':
      return { text: 'School Account', emoji: '🏫', color: 'text-blue-600' };
    case 'TEACHER':
      return { text: 'Teacher', emoji: '🍎', color: 'text-green-600' };
    case 'PARENT':
      return { text: 'Parent Account', emoji: '👨‍👩‍👧', color: 'text-purple-600' };
    default:
      return { text: 'Member', emoji: '🌟', color: 'text-blue-600' };
  }
};

export default function Profile() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const fileInput = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState<Message>({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    if (user) setName(user.name || '');
  }, [user]);

  const isSubscriber = user?.subscription?.status === 'ACTIVE';
  const roleInfo = getRoleDisplay(user?.role);

  const saveAvatar = async (avatar: string | null, successText: string) => {
    setPhotoBusy(true);
    setMessage({ type: '', text: '' });
    try {
      await api.put('/auth/profile', { avatar });
      await dispatch(getCurrentUser());
      setMessage({ type: 'success', text: successText });
    } catch (error: unknown) {
      setMessage({ type: 'error', text: getApiError(error, 'Could not update your profile picture') });
    } finally {
      setPhotoBusy(false);
    }
  };

  const handlePhotoPicked = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const avatar = await prepareAvatar(file);
      await saveAvatar(avatar, 'Profile picture updated! 📸');
    } catch (error: unknown) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Could not use that image' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.put('/auth/profile', { name });
      setMessage({ type: 'success', text: 'Profile updated successfully! 🎉' });
      setIsEditing(false);
      dispatch(getCurrentUser());
    } catch (error: unknown) {
      setMessage({ type: 'error', text: getApiError(error, 'Failed to update profile') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <PageTransition>
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-5xl font-bold text-center mb-4 text-rainbow">
            Your Profile 👤
          </h1>
          <p className="text-xl text-center text-gray-700 mb-12">
            Manage your account information and preferences
          </p>

          <div className="max-w-3xl mx-auto">
            {message.text && (
              <div
                role={message.type === 'error' ? 'alert' : 'status'}
                className={`mb-6 p-4 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-100 border border-green-400 text-green-700'
                    : 'bg-red-100 border border-red-400 text-red-700'
                }`}
              >
                <p className="text-center font-semibold">{message.text}</p>
              </div>
            )}

            <AnimatedCard delay={0.1} className="bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="flex flex-col items-center mb-6">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-5xl text-white overflow-hidden ring-4 ring-white shadow-lg">
                  {user?.avatar ? (
                    // Avatars are small data URLs, so a plain <img> is the right tool here.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar} alt="Your profile picture" className="w-full h-full object-cover" />
                  ) : (
                    <span aria-hidden="true">👤</span>
                  )}
                </div>

                <input
                  ref={fileInput}
                  type="file"
                  accept={AVATAR_ACCEPT}
                  onChange={handlePhotoPicked}
                  className="sr-only"
                  id="avatar-file"
                />
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    disabled={photoBusy}
                    className="rounded-full bg-purple-500 hover:bg-purple-600 text-white text-sm font-bold py-2 px-5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {photoBusy ? 'Saving…' : user?.avatar ? 'Change photo 📷' : 'Upload photo 📷'}
                  </button>
                  {user?.avatar && (
                    <button
                      type="button"
                      onClick={() => saveAvatar(null, 'Profile picture removed.')}
                      disabled={photoBusy}
                      className="rounded-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 text-sm font-bold py-2 px-5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Remove photo
                    </button>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500">PNG, JPEG or WebP, up to 10 MB. It is cropped to a square.</p>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">
                  {user?.name || 'User'}
                </h2>
                <p className={`text-xl font-semibold ${roleInfo.color} mt-2`}>
                  {roleInfo.emoji} {roleInfo.text}
                </p>
                {user?.schoolName && (
                  <p className="text-gray-600 mt-1">{user.schoolName}</p>
                )}
              </div>

              {!isEditing ? (
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                    <p className="block text-sm font-bold text-gray-600 mb-1">Email Address</p>
                    <p className="text-lg text-gray-800">{user?.email}</p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                    <p className="block text-sm font-bold text-gray-600 mb-1">Full Name</p>
                    <p className="text-lg text-gray-800">{user?.name}</p>
                  </div>

                  {!isSubscriber && (
                    <Link
                      href="/subscribe"
                      className="w-full block text-center bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                      Upgrade to Premium ⭐
                    </Link>
                  )}

                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    Edit Profile ✏️
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
                      Email Address 📧 (Cannot be changed)
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-gray-700 font-bold mb-2">
                      Full Name 👤
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      minLength={2}
                      maxLength={120}
                      className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                      placeholder="Your full name"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Saving...' : 'Save Changes 💾'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setName(user?.name || '');
                        setMessage({ type: '', text: '' });
                      }}
                      disabled={loading}
                      className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel ❌
                    </button>
                  </div>
                </form>
              )}
            </AnimatedCard>

            {isSubscriber && (
              <AnimatedCard delay={0.2} className="bg-gradient-to-br from-yellow-50 to-orange-50 mt-8">
                <h3 className="text-2xl font-bold text-orange-600 mb-4 text-center">
                  ⭐ Subscription Status
                </h3>
                <p className="text-center text-gray-700">
                  You are currently a <span className="font-bold text-purple-600">Premium Subscriber</span>!
                  <br />
                  Enjoy access to your Character Matters package.
                </p>
              </AnimatedCard>
            )}
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  );
}
