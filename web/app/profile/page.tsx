'use client';

import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { getCurrentUser } from '@/store/authSlice';
import ProtectedRoute from '@/components/ProtectedRoute';
import AnimatedCard from '@/components/AnimatedCard';
import PageTransition from '@/components/PageTransition';
import api from '@/lib/api';
import Image from 'next/image';
import type { RootState } from '@/store';

export default function Profile() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.put('/auth/profile', {
        name: formData.name,
        avatar: formData.avatar,
      });
      
      setMessage({ type: 'success', text: 'Profile updated successfully! 🎉' });
      setIsEditing(false);
      dispatch(getCurrentUser());
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplay = (role?: string) => {
    switch (role) {
      case 'admin':
        return { text: 'Admin', emoji: '👑', color: 'text-red-600' };
      case 'subscriber':
        return { text: 'Subscriber', emoji: '⭐', color: 'text-purple-600' };
      default:
        return { text: 'Free User', emoji: '🌟', color: 'text-blue-600' };
    }
  };

  const roleInfo = getRoleDisplay(user?.role);

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
              <div className={`mb-6 p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-100 border border-green-400 text-green-700' 
                  : 'bg-red-100 border border-red-400 text-red-700'
              }`}>
                <p className="text-center font-semibold">{message.text}</p>
              </div>
            )}

            <AnimatedCard delay={0.1} className="bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="flex items-center justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-4xl text-white overflow-hidden">
                  {formData.avatar ? (
                    <Image 
                      src={formData.avatar} 
                      alt="Profile" 
                      width={96}
                      height={96}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    '👤'
                  )}
                </div>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">
                  {user?.name || 'User'}
                </h2>
                <p className={`text-xl font-semibold ${roleInfo.color} mt-2`}>
                  {roleInfo.emoji} {roleInfo.text}
                </p>
              </div>

              {!isEditing ? (
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                    <label className="block text-sm font-bold text-gray-600 mb-1">
                      Email Address
                    </label>
                    <p className="text-lg text-gray-800">{formData.email}</p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                    <label className="block text-sm font-bold text-gray-600 mb-1">
                      Full Name
                    </label>
                    <p className="text-lg text-gray-800">{formData.name}</p>
                  </div>

                  {formData.avatar && (
                    <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                      <label className="block text-sm font-bold text-gray-600 mb-1">
                        Avatar URL
                      </label>
                      <p className="text-sm text-gray-600 break-all">{formData.avatar}</p>
                    </div>
                  )}

                  {user?.role !== 'subscriber' && (
                    <a
                      href="/subscribe"
                      className="w-full block text-center bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                      Upgrade to Premium ⭐
                    </a>
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
                      name="email"
                      value={formData.email}
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
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="avatar" className="block text-gray-700 font-bold mb-2">
                      Avatar URL 🖼️ (Optional)
                    </label>
                    <input
                      type="url"
                      id="avatar"
                      name="avatar"
                      value={formData.avatar}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                      placeholder="https://example.com/avatar.jpg"
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
                        if (user) {
                          setFormData({
                            name: user.name || '',
                            email: user.email || '',
                            avatar: user.avatar || '',
                          });
                        }
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

            {user?.role === 'subscriber' && (
              <AnimatedCard delay={0.2} className="bg-gradient-to-br from-yellow-50 to-orange-50 mt-8">
                <h3 className="text-2xl font-bold text-orange-600 mb-4 text-center">
                  ⭐ Subscription Status
                </h3>
                <p className="text-center text-gray-700">
                  You are currently a <span className="font-bold text-purple-600">Premium Subscriber</span>!
                  <br />
                  Enjoy unlimited access to all Character Matters content.
                </p>
              </AnimatedCard>
            )}
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  );
}
