import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RootState, AppDispatch } from '../store';
import { fetchVideos } from '../store/videoSlice';
import { fetchEBooks } from '../store/ebookSlice';
import AnimatedCard from '../components/AnimatedCard';
import FloatingStars from '../components/FloatingStars';
import PageTransition from '../components/PageTransition';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { videos } = useSelector((state: RootState) => state.videos);
  const { ebooks } = useSelector((state: RootState) => state.ebooks);

  useEffect(() => {
    dispatch(fetchVideos({ limit: 6 }));
    dispatch(fetchEBooks({ limit: 6 }));
  }, [dispatch]);

  return (
    <PageTransition>
      <FloatingStars />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <motion.h1 
            className="text-6xl font-bold mb-4"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Character Matters Concept 🌟
            </span>
          </motion.h1>
          <motion.p
            className="text-3xl font-bold text-purple-600"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ...raising impeccable leaders of sound Character. ✨
          </motion.p>
          <motion.p
            className="text-2xl font-semibold text-pink-600 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            🎉 Welcome back, {user?.name}! 
          </motion.p>
        </motion.div>

        {/* Recent Videos */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <motion.h2 
              className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎬 Recent Videos
            </motion.h2>
          <Link
            to="/videos"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.slice(0, 3).map((video, index) => (
            <AnimatedCard key={video._id} delay={index * 0.1} className="bg-white rounded-2xl shadow-xl overflow-hidden border-4 border-purple-200">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-48 object-cover transform transition-transform hover:scale-110"
              />
              <div className="p-4 bg-gradient-to-b from-white to-purple-50">
                <h3 className="font-bold text-xl mb-2 text-purple-800">{video.title}</h3>
                <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                  {video.description.substring(0, 100)}...
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-purple-600 flex items-center">
                    ⏱️ {Math.floor(video.duration / 60)} min
                  </span>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    video.accessLevel === 'premium' 
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' 
                      : 'bg-gradient-to-r from-green-400 to-emerald-400 text-white'
                  }`}>
                    {video.accessLevel === 'premium' ? '⭐ Premium' : '🆓 Free'}
                  </span>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </section>

      {/* Recent eBooks */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <motion.h2 
            className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            📚 Recent eBooks
          </motion.h2>
          <Link
            to="/ebooks"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ebooks.slice(0, 3).map((ebook, index) => (
            <AnimatedCard key={ebook._id} delay={index * 0.1} className="bg-white rounded-2xl shadow-xl overflow-hidden border-4 border-pink-200">
              <img
                src={ebook.coverImage}
                alt={ebook.title}
                className="w-full h-48 object-cover transform transition-transform hover:scale-110"
              />
              <div className="p-4 bg-gradient-to-b from-white to-pink-50">
                <h3 className="font-bold text-xl mb-2 text-pink-800">{ebook.title}</h3>
                <p className="text-purple-600 text-sm mb-2 font-semibold">✍️ by {ebook.author}</p>
                <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                  {ebook.description.substring(0, 100)}...
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    💰 ${ebook.price}
                  </span>
                  <span className="text-sm font-semibold text-purple-600">
                    📄 {ebook.pages} pages
                  </span>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </section>
    </div>
    </PageTransition>
  );
};

export default Dashboard;