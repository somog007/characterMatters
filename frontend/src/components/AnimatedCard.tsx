import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({ children, delay = 0, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ 
        scale: 1.05, 
        rotate: [0, -1, 1, 0],
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.95 }}
      transition={{
        duration: 0.5,
        delay,
        type: 'spring',
        stiffness: 200,
        damping: 20
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
