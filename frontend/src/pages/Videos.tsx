import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RootState, AppDispatch } from '../store';
import { fetchVideos } from '../store/videoSlice';
import AnimatedCard from '../components/AnimatedCard';
import LoadingSpinner from '../components/LoadingSpinner';
import FloatingStars from '../components/FloatingStars';

const Videos: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { videos, loading, error } = useSelector((state: RootState) => state.videos);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchVideos({}));
  }, [dispatch]);

  const filteredVideos = videos.filter((video) => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || video.accessLevel === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          className="bg-red-100 border-4 border-red-400 text-red-800 px-6 py-4 rounded-2xl text-center text-xl font-bold"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' }}
        >
          😢 Oops! {error}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <FloatingStars count={10} />
      
      <motion.h1 
        className="text-5xl font-bold mb-8 text-center text-rainbow animate-float"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        🎬 Awesome Videos! 🍿
      </motion.h1>

      {/* Search and Filter */}
      <motion.div 
        className="mb-8 flex flex-col md:flex-row gap-4 max-w-4xl mx-auto"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <input
          type="text"
          placeholder="🔍 Search for fun videos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-6 py-4 border-4 border-purple-300 rounded-2xl text-lg font-bold focus:border-pink-400 focus:outline-none shadow-lg transform hover:scale-105 transition-transform"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-6 py-4 border-4 border-blue-300 rounded-2xl text-lg font-bold focus:border-purple-400 focus:outline-none shadow-lg transform hover:scale-105 transition-transform"
        >
          <option value="all">🌟 All Videos</option>
          <option value="free">🆓 Free</option>
          <option value="premium">👑 Premium</option>
        </select>
      </motion.div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredVideos.map((video, index) => (
          <motion.div
            key={video._id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <AnimatedCard>
              <Link to={`/videos/${video._id}`} className="block">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-48 object-cover rounded-t-2xl"
                />
                <div className="p-6 bg-white rounded-b-2xl">
                  <h3 className="font-bold text-2xl mb-2 text-purple-600">{video.title}</h3>
                  <p className="text-gray-700 text-base mb-4">
                    {video.description.substring(0, 100)}...
                  </p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-base font-bold text-blue-500">
                      ⏱️ {Math.floor(video.duration / 60)}min
                    </span>
                    <span className={`px-4 py-2 text-base font-bold rounded-full ${
                      video.accessLevel === 'premium'
                        ? 'bg-gradient-to-r from-yellow-300 to-yellow-500 text-yellow-900'
                        : 'bg-gradient-to-r from-green-300 to-green-500 text-green-900'
                    }`}>
                      {video.accessLevel === 'premium' ? '👑 Premium' : '🆓 Free'}
                    </span>
                  </div>
                  <div className="flex items-center text-base text-gray-600 font-semibold">
                    <span>👀 {video.views} views</span>
                    <span className="mx-2">•</span>
                    <span>❤️ {video.likes} likes</span>
                  </div>
                </div>
              </Link>
            </AnimatedCard>
          </motion.div>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <motion.div 
          className="text-center py-12"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' }}
        >
          <p className="text-3xl font-bold text-purple-400">
            😢 No videos found. Try searching for something else! 🔍
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Videos;
