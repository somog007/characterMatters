import React from 'react';
import { motion } from 'framer-motion';
import FloatingStars from '../components/FloatingStars';
import AnimatedCard from '../components/AnimatedCard';

const About: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 relative">
      <FloatingStars count={15} />
      
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <motion.h1 
          className="text-5xl font-bold mb-8 text-center text-rainbow animate-float"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          📖 About Us 🌟
        </motion.h1>

        <AnimatedCard>
          <div className="p-8 bg-white rounded-3xl">
            <motion.div
              className="text-center mb-8"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-8xl">🎯</span>
            </motion.div>
            
            <h2 className="text-3xl font-bold text-purple-600 mb-4 text-center">
              Who We Are
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed mb-8">
              <strong className="text-pink-600">Character Matters Concept</strong> is an organization envisioned to raise the standard of good character and sound morals in children and young adolescents in the society today.
            </p>

            <p className="text-xl text-gray-700 leading-relaxed mb-8">
              Through our <strong className="text-blue-600">Character building trainings, conferences, television programme and Character building books</strong>, we teach, train and mentor the younger generation on the core traits of Character development and its relevance to their personal and academic success.
            </p>

            <motion.div 
              className="bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 p-8 rounded-3xl mb-8 border-4 border-purple-300"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="text-6xl">🎓</span>
                <h3 className="text-4xl font-bold text-purple-600">Since 2011</h3>
                <span className="text-6xl">🌟</span>
              </div>
              <p className="text-2xl text-center font-bold text-gray-800">
                Character Matters has trained over <span className="text-rainbow text-3xl">40,000 pupils and students</span> in public and private primary and secondary schools across Nigeria! 🇳🇬
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <motion.div 
                className="text-center p-6 bg-purple-50 rounded-2xl"
                whileHover={{ y: -10 }}
              >
                <div className="text-5xl mb-3">👥</div>
                <h4 className="font-bold text-xl text-purple-600">Trainings</h4>
                <p className="text-gray-700">Character building sessions</p>
              </motion.div>
              
              <motion.div 
                className="text-center p-6 bg-pink-50 rounded-2xl"
                whileHover={{ y: -10 }}
              >
                <div className="text-5xl mb-3">📺</div>
                <h4 className="font-bold text-xl text-pink-600">TV Shows</h4>
                <p className="text-gray-700">Broadcasting character lessons</p>
              </motion.div>
              
              <motion.div 
                className="text-center p-6 bg-blue-50 rounded-2xl"
                whileHover={{ y: -10 }}
              >
                <div className="text-5xl mb-3">📚</div>
                <h4 className="font-bold text-xl text-blue-600">Books</h4>
                <p className="text-gray-700">Educational materials</p>
              </motion.div>
            </div>
          </div>
        </AnimatedCard>
      </motion.div>
    </div>
  );
};

export default About;
