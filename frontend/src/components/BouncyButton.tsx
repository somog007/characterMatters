import React from 'react';
import { motion } from 'framer-motion';

interface BouncyButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  disabled?: boolean;
  className?: string;
}

const BouncyButton: React.FC<BouncyButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = ''
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
    secondary: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
    danger: 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ 
        scale: 1.1,
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
      }}
      whileTap={{ 
        scale: 0.9,
        rotate: [0, -5, 5, 0]
      }}
      animate={{
        y: [0, -5, 0],
      }}
      transition={{
        y: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }
      }}
      className={`
        ${variants[variant]}
        px-8 py-3 rounded-full font-bold text-lg
        shadow-lg transform transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
};

export default BouncyButton;
