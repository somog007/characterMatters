import React from 'react';
import { motion } from 'framer-motion';
import FloatingStars from '../components/FloatingStars';
import AnimatedCard from '../components/AnimatedCard';

const Products: React.FC = () => {
  const books = [
    { title: 'The ABC of Good Character', category: 'Nursery', emoji: '🌟', color: 'purple' },
    { title: 'The World Kindness Day Series 1', category: 'Nursery', emoji: '💝', color: 'pink' },
    { title: 'The World Kindness Day Series 2', category: 'Nursery', emoji: '💝', color: 'pink' },
    { title: 'Character Matters & Social Etiquettes Book 1', category: 'Primary', emoji: '📘', color: 'blue' },
    { title: 'Character Matters & Social Etiquettes Book 2', category: 'Primary', emoji: '📘', color: 'blue' },
    { title: 'Character Matters & Social Etiquettes Book 3', category: 'Primary', emoji: '📘', color: 'blue' },
    { title: 'Character Matters & Social Etiquettes Book 4', category: 'Primary', emoji: '📘', color: 'blue' },
    { title: 'Character Matters & Social Etiquettes Book 5', category: 'Primary', emoji: '📘', color: 'blue' },
    { title: 'Character is Who You Are', category: 'Secondary', emoji: '🎯', color: 'green' },
    { title: 'French Language Book 1', category: 'Language', emoji: '🇫🇷', color: 'orange' },
    { title: 'French Language Book 2', category: 'Language', emoji: '🇫🇷', color: 'orange' },
    { title: 'French Language Book 3', category: 'Language', emoji: '🇫🇷', color: 'orange' },
    { title: 'Character Building Workbook 1', category: 'Activity', emoji: '✏️', color: 'yellow' },
    { title: 'Character Building Workbook 2', category: 'Activity', emoji: '✏️', color: 'yellow' },
  ];

  const colorMap: Record<string, { bg: string; text: string; border: string; badge: string }> = {
    purple: { bg: 'from-purple-50 to-purple-100', text: 'text-purple-600', border: 'border-purple-300', badge: 'bg-purple-200 text-purple-800' },
    pink: { bg: 'from-pink-50 to-pink-100', text: 'text-pink-600', border: 'border-pink-300', badge: 'bg-pink-200 text-pink-800' },
    blue: { bg: 'from-blue-50 to-blue-100', text: 'text-blue-600', border: 'border-blue-300', badge: 'bg-blue-200 text-blue-800' },
    green: { bg: 'from-green-50 to-green-100', text: 'text-green-600', border: 'border-green-300', badge: 'bg-green-200 text-green-800' },
    orange: { bg: 'from-orange-50 to-orange-100', text: 'text-orange-600', border: 'border-orange-300', badge: 'bg-orange-200 text-orange-800' },
    yellow: { bg: 'from-yellow-50 to-yellow-100', text: 'text-yellow-600', border: 'border-yellow-300', badge: 'bg-yellow-200 text-yellow-800' },
  };

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <FloatingStars count={15} />
      
      <motion.h1 
        className="text-5xl font-bold mb-8 text-center text-rainbow animate-float relative z-10"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        📚 Our Amazing Books! 🌟
      </motion.h1>

      <motion.div
        className="text-center mb-12 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <AnimatedCard>
          <div className="p-8 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 rounded-3xl border-4 border-purple-300">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-3xl font-bold text-purple-600 mb-4">
              Approved by Lagos State Ministry of Education
            </h2>
            <p className="text-xl text-gray-700">
              Used in schools across Nigeria since 2023! 🇳🇬
            </p>
          </div>
        </AnimatedCard>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
        {books.map((book, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <AnimatedCard>
              <div className={`p-6 bg-gradient-to-br ${colorMap[book.color].bg} rounded-3xl border-4 ${colorMap[book.color].border} h-full`}>
                <motion.div
                  className="text-center mb-4"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                >
                  <span className="text-7xl">{book.emoji}</span>
                </motion.div>
                
                <h3 className={`text-xl font-bold ${colorMap[book.color].text} mb-3 text-center min-h-[60px] flex items-center justify-center`}>
                  {book.title}
                </h3>
                
                <div className="text-center">
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${colorMap[book.color].badge}`}>
                    {book.category}
                  </span>
                </div>
              </div>
            </AnimatedCard>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mt-16 relative z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5 }}
      >
        <AnimatedCard>
          <div className="p-8 bg-gradient-to-r from-green-100 to-blue-100 rounded-3xl text-center border-4 border-green-300">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block text-6xl mb-4"
            >
              🎊
            </motion.div>
            <h3 className="text-3xl font-bold text-green-600 mb-4">
              Over 50,000 Copies Sold!
            </h3>
            <p className="text-xl text-gray-700">
              Building strong character in children across 10 Nigerian states! 🌟✨
            </p>
          </div>
        </AnimatedCard>
      </motion.div>
    </div>
  );
};

export default Products;
