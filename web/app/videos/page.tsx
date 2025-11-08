'use client';

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import Image from 'next/image';
import { fetchVideos } from '@/store/videoSlice';
import ProtectedRoute from '@/components/ProtectedRoute';
import AnimatedCard from '@/components/AnimatedCard';
import PageTransition from '@/components/PageTransition';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Videos() {
  const dispatch = useAppDispatch();
  const { videos, loading, error } = useAppSelector((state) => state.videos);

  useEffect(() => {
    dispatch(fetchVideos());
  }, [dispatch]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ProtectedRoute>
      <PageTransition>
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-5xl font-bold text-center mb-8 text-rainbow">
            Character Matters Videos 📺
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8 max-w-2xl mx-auto">
              <p className="text-center">{error}</p>
            </div>
          )}

          {videos.length === 0 && !loading && !error && (
            <div className="text-center py-12">
              <p className="text-2xl text-gray-600 mb-4">No videos available yet.</p>
              <p className="text-lg text-gray-500">Check back soon for new content!</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {videos.map((video, index) => (
              <AnimatedCard 
                key={video._id} 
                delay={index * 0.05}
                className="bg-gradient-to-br from-purple-50 to-pink-50"
              >
                <div className="aspect-video bg-gray-200 rounded-lg mb-4 overflow-hidden">
                  {video.thumbnail ? (
                    <Image 
                      src={video.thumbnail}
                      alt={video.title}
                      width={640}
                      height={360}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">🎬</div>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">
                  {video.title}
                </h3>
                <p className="text-gray-600 mb-3 line-clamp-2">
                  {video.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')} min
                  </span>
                  <button className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-full transition-colors text-sm">
                    Watch Now
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
