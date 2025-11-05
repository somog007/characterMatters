import React from 'react';
import { motion } from 'framer-motion';
import FloatingStars from '../components/FloatingStars';
import AnimatedCard from '../components/AnimatedCard';

const Team: React.FC = () => {
  const teamMembers = [
    {
      name: 'Anuoluwapo Awofisan',
      role: 'Team Lead Trainer, Author & Publisher',
      emoji: '👩‍🏫',
      color: 'purple'
    },
    {
      name: 'Femi Odubawo',
      role: 'Strategic Partner',
      emoji: '👨‍💼',
      color: 'blue'
    },
    {
      name: 'Kehinde Oyedeji',
      role: 'Strategic Partner',
      emoji: '👨‍💼',
      color: 'pink'
    },
    {
      name: 'Jerry Xavier Osagie',
      role: 'Strategic Partner',
      emoji: '👨‍💼',
      color: 'green'
    }
  ];

  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    purple: { bg: 'from-purple-50 to-pink-50', text: 'text-purple-600', border: 'border-purple-300' },
    blue: { bg: 'from-blue-50 to-cyan-50', text: 'text-blue-600', border: 'border-blue-300' },
    pink: { bg: 'from-pink-50 to-rose-50', text: 'text-pink-600', border: 'border-pink-300' },
    green: { bg: 'from-green-50 to-emerald-50', text: 'text-green-600', border: 'border-green-300' }
  };

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <FloatingStars count={15} />
      
      <motion.h1 
        className="text-5xl font-bold mb-12 text-center text-rainbow animate-float relative z-10"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        👥 Meet Our Amazing Team! 🌟
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        {teamMembers.map((member, index) => (
          <motion.div
            key={member.name}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <AnimatedCard>
              <div className={`p-8 bg-gradient-to-br ${colorMap[member.color].bg} rounded-3xl border-4 ${colorMap[member.color].border}`}>
                <motion.div 
                  className="text-center mb-6"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <span className="text-8xl">{member.emoji}</span>
                </motion.div>
                
                <h2 className={`text-3xl font-bold ${colorMap[member.color].text} mb-3 text-center`}>
                  {member.name}
                </h2>
                
                <p className="text-xl text-gray-700 text-center font-semibold">
                  {member.role}
                </p>

                {index === 0 && (
                  <motion.div 
                    className="mt-6 bg-white p-4 rounded-2xl text-center"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="text-2xl">⭐ Lead Team Member ⭐</span>
                  </motion.div>
                )}
              </div>
            </AnimatedCard>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mt-16 relative z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
      >
        <AnimatedCard>
          <div className="p-8 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 rounded-3xl text-center border-4 border-purple-300">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="inline-block text-6xl mb-4"
            >
              🌟
            </motion.div>
            <h3 className="text-3xl font-bold text-purple-600 mb-4">
              Working Together for Character Excellence!
            </h3>
            <p className="text-xl text-gray-700">
              Our dedicated team works tirelessly to build strong character and moral values in the next generation of leaders! 🎯✨
            </p>
          </div>
        </AnimatedCard>
      </motion.div>
    </div>
  );
};

export default Team;
