'use client';

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import Image from 'next/image';
import { fetchEbooks } from '@/store/ebookSlice';
import ProtectedRoute from '@/components/ProtectedRoute';
import AnimatedCard from '@/components/AnimatedCard';
import PageTransition from '@/components/PageTransition';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function EBooks() {
  const dispatch = useAppDispatch();
  const { ebooks, loading, error } = useAppSelector((state) => state.ebooks);

  useEffect(() => {
    dispatch(fetchEbooks());
  }, [dispatch]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ProtectedRoute>
      <PageTransition>
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-5xl font-bold text-center mb-8 text-rainbow">
            Character Matters eBooks 📚
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8 max-w-2xl mx-auto">
              <p className="text-center">{error}</p>
            </div>
          )}

          {ebooks.length === 0 && !loading && !error && (
            <div className="text-center py-12">
              <p className="text-2xl text-gray-600 mb-4">No eBooks available yet.</p>
              <p className="text-lg text-gray-500">Check back soon for digital editions of our books!</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {ebooks.map((ebook, index) => (
              <AnimatedCard 
                key={ebook._id} 
                delay={index * 0.05}
                className="bg-gradient-to-br from-blue-50 to-indigo-50"
              >
                <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-4 overflow-hidden">
                  {ebook.coverImage ? (
                    <Image 
                      src={ebook.coverImage} 
                      alt={ebook.title}
                      width={600}
                      height={800}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">📖</div>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">
                  {ebook.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  by {ebook.author}
                </p>
                <p className="text-gray-600 mb-3 line-clamp-2">
                  {ebook.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-green-600">
                    ₦{ebook.price.toLocaleString()}
                  </span>
                  <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition-colors text-sm">
                    Read Now
                  </button>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  );
}
