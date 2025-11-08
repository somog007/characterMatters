'use client';

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { getCurrentUser } from '@/store/authSlice';
import ProtectedRoute from '@/components/ProtectedRoute';
import AnimatedCard from '@/components/AnimatedCard';
import PageTransition from '@/components/PageTransition';
import Link from 'next/link';

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  return (
    <ProtectedRoute>
      <PageTransition>
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-5xl font-bold text-center mb-4 text-rainbow">
            Welcome to Your Dashboard! 🎉
          </h1>
          <p className="text-2xl text-center text-gray-700 mb-12">
            Hello, <span className="font-bold text-purple-600">{user?.name || 'Friend'}</span>! 
            Ready to explore Character Matters content?
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <AnimatedCard delay={0.1} className="bg-gradient-to-br from-purple-100 to-pink-100">
              <div className="text-center">
                <div className="text-6xl mb-4">📺</div>
                <h3 className="text-2xl font-bold mb-3 text-purple-600">Watch Videos</h3>
                <p className="text-gray-700 mb-4">
                  Explore our collection of character-building videos and TV shows.
                </p>
                <Link 
                  href="/videos"
                  className="inline-block bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-6 rounded-full transition-colors"
                >
                  Browse Videos
                </Link>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.2} className="bg-gradient-to-br from-blue-100 to-cyan-100">
              <div className="text-center">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-2xl font-bold mb-3 text-blue-600">Read eBooks</h3>
                <p className="text-gray-700 mb-4">
                  Access our digital library of character education books.
                </p>
                <Link 
                  href="/ebooks"
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full transition-colors"
                >
                  Browse eBooks
                </Link>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.3} className="bg-gradient-to-br from-green-100 to-emerald-100">
              <div className="text-center">
                <div className="text-6xl mb-4">👤</div>
                <h3 className="text-2xl font-bold mb-3 text-green-600">Your Profile</h3>
                <p className="text-gray-700 mb-4">
                  Manage your account settings and preferences.
                </p>
                <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full transition-colors">
                  View Profile
                </button>
              </div>
            </AnimatedCard>
          </div>

          <div className="mt-12 max-w-4xl mx-auto">
            <AnimatedCard delay={0.4} className="bg-gradient-to-r from-yellow-100 to-orange-100">
              <h2 className="text-3xl font-bold text-center mb-4 text-orange-600">
                Character Matters Concept ⭐
              </h2>
              <p className="text-xl text-center text-gray-700">
                ...raising impeccable leaders of sound Character
              </p>
            </AnimatedCard>
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  );
}
