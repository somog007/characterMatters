'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface BouncyButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export default function BouncyButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '',
  type = 'button'
}: BouncyButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    secondary: 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600',
    danger: 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={`px-6 py-3 rounded-full text-white font-bold shadow-lg ${variants[variant]} ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        y: {
          repeat: Infinity,
          duration: 2,
          ease: 'easeInOut',
        },
      }}
    >
      {children}
    </motion.button>
  );
}
