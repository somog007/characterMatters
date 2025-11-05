import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { login } from '../store/authSlice';
import { RootState, AppDispatch } from '../store';
import BouncyButton from '../components/BouncyButton';
import FloatingStars from '../components/FloatingStars';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(login(formData)).unwrap();
      navigate('/dashboard');
    } catch (error) {
      // Error handled by slice
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <FloatingStars count={15} />
      
      <motion.div 
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-rainbow relative z-10"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        <div>
          <motion.div
            className="text-center text-6xl mb-4"
            animate={{ rotate: [0, 10, -10, 10, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
          >
            🔑
          </motion.div>
          <h2 className="text-center text-4xl font-extrabold text-rainbow animate-wiggle">
            Welcome Back! 🎉
          </h2>
          <p className="text-center text-xl text-purple-600 font-bold mt-2">
            Let's have some fun!
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <motion.div 
              className="bg-red-100 border-4 border-red-400 text-red-700 px-4 py-3 rounded-2xl text-center font-bold"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
            >
              😢 {error}
            </motion.div>
          )}
          <div className="space-y-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <input
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-6 py-4 border-4 border-purple-300 placeholder-gray-500 text-gray-900 rounded-2xl focus:outline-none focus:border-pink-400 text-lg font-bold"
                placeholder="📧 Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <input
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-6 py-4 border-4 border-blue-300 placeholder-gray-500 text-gray-900 rounded-2xl focus:outline-none focus:border-purple-400 text-lg font-bold"
                placeholder="🔒 Password"
                value={formData.password}
                onChange={handleChange}
              />
            </motion.div>
          </div>

          <div>
            <BouncyButton
              type="submit"
              disabled={loading}
              variant="primary"
              className="w-full py-4 text-xl"
            >
              {loading ? '⏳ Signing in...' : '🚀 Sign in'}
            </BouncyButton>
          </div>

          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.1 }}
          >
            <Link
              to="/register"
              className="font-bold text-2xl text-purple-600 hover:text-pink-600"
            >
              ✨ Don't have an account? Sign up! 
            </Link>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;