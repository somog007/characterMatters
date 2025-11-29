import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import FloatingStars from '../components/FloatingStars';
import AnimatedCard from '../components/AnimatedCard';
import BouncyButton from '../components/BouncyButton';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingStars count={20} />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="text-8xl mb-6"
            animate={{ 
              rotate: [0, 10, -10, 10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          >
            🌟
          </motion.div>
          
          <motion.h1 
            className="text-6xl md:text-7xl font-bold mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Character Matters Concept
            </span>
          </motion.h1>
          
          <motion.p
            className="text-3xl md:text-4xl font-bold text-purple-600 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            ...raising impeccable leaders of sound Character. ✨
          </motion.p>

          <motion.p
            className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Building strong character and moral values in children and young adolescents across Nigeria since <strong className="text-pink-600">2012</strong> 🇳🇬
          </motion.p>

          <motion.div
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Link to="/register">
              <BouncyButton variant="primary" className="text-xl px-8 py-4">
                ✨ Get Started
              </BouncyButton>
            </Link>
            <Link to="/login">
              <BouncyButton variant="secondary" className="text-xl px-8 py-4">
                🔑 Login
              </BouncyButton>
            </Link>
            <Link to="/about">
              <BouncyButton variant="success" className="text-xl px-8 py-4">
                📖 Learn More
              </BouncyButton>
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <AnimatedCard>
            <div className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl text-center border-4 border-purple-300">
              <div className="text-6xl mb-4">🎓</div>
              <h3 className="text-4xl font-bold text-purple-600 mb-2">40,000+</h3>
              <p className="text-xl text-gray-700">Students Trained</p>
            </div>
          </AnimatedCard>

          <AnimatedCard>
            <div className="p-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl text-center border-4 border-blue-300">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-4xl font-bold text-blue-600 mb-2">50,000+</h3>
              <p className="text-xl text-gray-700">Books Sold</p>
            </div>
          </AnimatedCard>

          <AnimatedCard>
            <div className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl text-center border-4 border-green-300">
              <div className="text-6xl mb-4">🏫</div>
              <h3 className="text-4xl font-bold text-green-600 mb-2">10 States</h3>
              <p className="text-xl text-gray-700">Across Nigeria</p>
            </div>
          </AnimatedCard>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
        >
          <h2 className="text-4xl font-bold text-center text-purple-600 mb-12">
            What We Offer 🎯
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatedCard>
              <div className="p-6 bg-white rounded-3xl border-4 border-purple-200 h-full">
                <div className="text-5xl mb-4">🎓</div>
                <h3 className="text-2xl font-bold text-purple-600 mb-3">Trainings</h3>
                <p className="text-gray-700">
                  Character building sessions on Trustworthiness, Compassion, Respect, and Leadership
                </p>
              </div>
            </AnimatedCard>

            <AnimatedCard>
              <div className="p-6 bg-white rounded-3xl border-4 border-blue-200 h-full">
                <div className="text-5xl mb-4">📺</div>
                <h3 className="text-2xl font-bold text-blue-600 mb-3">TV Shows</h3>
                <p className="text-gray-700">
                  Broadcasting on WAP TV, RAVE TV, R2TV helping students develop communication skills
                </p>
              </div>
            </AnimatedCard>

            <AnimatedCard>
              <div className="p-6 bg-white rounded-3xl border-4 border-green-200 h-full">
                <div className="text-5xl mb-4">📚</div>
                <h3 className="text-2xl font-bold text-green-600 mb-3">Books</h3>
                <p className="text-gray-700">
                  Approved by Lagos State Ministry of Education with 14 character-building titles
                </p>
              </div>
            </AnimatedCard>

            <AnimatedCard>
              <div className="p-6 bg-white rounded-3xl border-4 border-pink-200 h-full">
                <div className="text-5xl mb-4">🎬</div>
                <h3 className="text-2xl font-bold text-pink-600 mb-3">Videos</h3>
                <p className="text-gray-700">
                  Educational video content to inspire and teach character values
                </p>
              </div>
            </AnimatedCard>

            <AnimatedCard>
              <div className="p-6 bg-white rounded-3xl border-4 border-orange-200 h-full">
                <div className="text-5xl mb-4">📖</div>
                <h3 className="text-2xl font-bold text-orange-600 mb-3">eBooks</h3>
                <p className="text-gray-700">
                  Digital learning materials accessible anytime, anywhere
                </p>
              </div>
            </AnimatedCard>

            <AnimatedCard>
              <div className="p-6 bg-white rounded-3xl border-4 border-cyan-200 h-full">
                <div className="text-5xl mb-4">👥</div>
                <h3 className="text-2xl font-bold text-cyan-600 mb-3">Conferences</h3>
                <p className="text-gray-700">
                  Large-scale events bringing together students for character discussions
                </p>
              </div>
            </AnimatedCard>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5 }}
        >
          <AnimatedCard>
            <div className="p-12 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 rounded-3xl border-4 border-purple-300">
              <motion.div
                className="text-7xl mb-6"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                🌟
              </motion.div>
              <h2 className="text-4xl font-bold text-purple-600 mb-4">
                Ready to Build Character?
              </h2>
              <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                Join thousands of students and schools building strong moral foundations and developing impeccable character!
              </p>
              <Link to="/register">
                <BouncyButton variant="primary" className="text-2xl px-10 py-5">
                  🚀 Start Your Journey
                </BouncyButton>
              </Link>
            </div>
          </AnimatedCard>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
