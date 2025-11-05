import React from 'react';
import { motion } from 'framer-motion';
import FloatingStars from '../components/FloatingStars';
import AnimatedCard from '../components/AnimatedCard';

const Services: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 relative">
      <FloatingStars count={12} />
      
      <motion.h1 
        className="text-5xl font-bold mb-12 text-center text-rainbow animate-float relative z-10"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        🎯 Our Services ✨
      </motion.h1>

      <div className="space-y-8 relative z-10">
        {/* Trainings/Conferences */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatedCard>
            <div className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl">
              <div className="flex items-center gap-4 mb-6">
                <motion.span 
                  className="text-7xl"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  🎓
                </motion.span>
                <h2 className="text-4xl font-bold text-purple-600">
                  TRAININGS/CONFERENCES
                </h2>
              </div>
              <p className="text-xl text-gray-700 leading-relaxed">
                Periodic trainings and conferences are organized in primary and secondary schools to teach students on the fundamentals of Character such as <strong className="text-pink-600">Trustworthiness, Compassion, Responsibility, Respect, Fairness, Empathy, Leadership</strong> etc.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {['Trustworthiness', 'Compassion', 'Responsibility', 'Respect', 'Fairness', 'Empathy', 'Leadership'].map((trait, index) => (
                  <motion.span
                    key={trait}
                    className="px-4 py-2 bg-white rounded-full text-purple-600 font-bold border-2 border-purple-300"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    ✨ {trait}
                  </motion.span>
                ))}
              </div>
            </div>
          </AnimatedCard>
        </motion.div>

        {/* Television Programme */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <AnimatedCard>
            <div className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl">
              <div className="flex items-center gap-4 mb-6">
                <motion.span 
                  className="text-7xl"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  📺
                </motion.span>
                <h2 className="text-4xl font-bold text-blue-600">
                  TELEVISION PROGRAMME
                </h2>
              </div>
              <p className="text-xl text-gray-700 leading-relaxed mb-4">
                In <strong className="text-pink-600">2016</strong>, Character Matters began airing on Television on cable channels: <strong className="text-blue-600">WAP TV, RAVE TV, R2TV and JYBE TV</strong>, providing the platform for students to discuss issues that affect their character development and formation.
              </p>
              <p className="text-xl text-gray-700 leading-relaxed">
                In addition, students are also able to hone their <strong className="text-purple-600">communication and presentation skills</strong> on television. 🎬
              </p>
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {['WAP TV', 'RAVE TV', 'R2TV', 'JYBE TV'].map((channel, index) => (
                  <motion.div
                    key={channel}
                    className="p-4 bg-white rounded-2xl text-center font-bold text-blue-600 border-3 border-blue-300 shadow-lg"
                    whileHover={{ y: -5 }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    📡 {channel}
                  </motion.div>
                ))}
              </div>
            </div>
          </AnimatedCard>
        </motion.div>

        {/* Character Building Books */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <AnimatedCard>
            <div className="p-8 bg-gradient-to-br from-green-50 to-yellow-50 rounded-3xl">
              <div className="flex items-center gap-4 mb-6">
                <motion.span 
                  className="text-7xl"
                  animate={{ rotate: [-5, 5, -5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  📚
                </motion.span>
                <h2 className="text-4xl font-bold text-green-600">
                  CHARACTER BUILDING BOOKS
                </h2>
              </div>
              
              <motion.div 
                className="bg-yellow-100 p-6 rounded-2xl mb-6 border-4 border-yellow-300"
                whileHover={{ scale: 1.02 }}
              >
                <p className="text-xl font-bold text-center text-gray-800">
                  ✅ Approved by <span className="text-green-600">Lagos State Ministry of Education</span> in 2023! 🎉
                </p>
              </motion.div>

              <p className="text-xl text-gray-700 leading-relaxed mb-6">
                With the recent approval of our character building books by the Lagos State Ministry of Education in 2023, our books are used to impact character skills in young children and adolescents, helping them to develop strong and unwavering value system.
              </p>

              <div className="bg-white p-6 rounded-2xl mb-6">
                <h3 className="text-2xl font-bold text-purple-600 mb-4">📖 Our Book Series:</h3>
                <ul className="space-y-3 text-lg text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">🌟</span>
                    <span><strong className="text-pink-600">"The ABC of Good Character"</strong> - For nursery pupils</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">💝</span>
                    <span><strong className="text-blue-600">"The World Kindness Day Series 1 & 2"</strong> - For nursery pupils</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">📘</span>
                    <span><strong className="text-purple-600">"Character Matters and Social Etiquettes Bk 1, 2, 3, 4 & 5"</strong> - For primary pupils</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">🎯</span>
                    <span><strong className="text-green-600">"Character is Who You Are"</strong> - For secondary students</span>
                  </li>
                </ul>
              </div>

              <motion.div 
                className="bg-gradient-to-r from-purple-100 to-pink-100 p-8 rounded-3xl text-center border-4 border-purple-300"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="text-6xl mb-4">🎊</div>
                <p className="text-3xl font-bold text-gray-800 mb-2">
                  Over <span className="text-rainbow text-4xl">50,000 copies</span> printed and sold!
                </p>
                <p className="text-lg text-gray-700">
                  Used as Moral Instruction and Civic Education textbooks in schools across <strong className="text-purple-600">Lagos, Oyo, Ogun, FCT, Edo, Bayelsa, Rivers, Akwa-Ibom, Ondo and Ekiti States</strong> 🇳🇬
                </p>
              </motion.div>
            </div>
          </AnimatedCard>
        </motion.div>
      </div>
    </div>
  );
};

export default Services;
