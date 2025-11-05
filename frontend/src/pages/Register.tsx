import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppDispatch, RootState } from '../store';
import { register } from '../store/authSlice';
import BouncyButton from '../components/BouncyButton';
import FloatingStars from '../components/FloatingStars';

const Register: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      await dispatch(register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })).unwrap();
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <FloatingStars count={15} />
      
      <motion.div 
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-rainbow relative z-10"
        initial={{ scale: 0, y: 100 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        <div>
          <motion.div
            className="text-center text-6xl mb-4"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ✨
          </motion.div>
          <h2 className="text-center text-4xl font-extrabold text-rainbow animate-wiggle">
            Join the Fun! 🎉
          </h2>
          <p className="text-center text-xl text-purple-600 font-bold mt-2">
            Create your adventure account!
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <motion.div 
              className="rounded-2xl bg-red-100 border-4 border-red-400 p-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
            >
              <p className="text-lg font-bold text-red-800 text-center">😢 {error}</p>
            </motion.div>
          )}
          <div className="space-y-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none relative block w-full px-6 py-4 border-4 border-purple-300 placeholder-gray-500 text-gray-900 rounded-2xl focus:outline-none focus:border-pink-400 text-lg font-bold"
                placeholder="👤 Full Name"
                value={formData.name}
                onChange={handleChange}
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-6 py-4 border-4 border-blue-300 placeholder-gray-500 text-gray-900 rounded-2xl focus:outline-none focus:border-purple-400 text-lg font-bold"
                placeholder="📧 Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-6 py-4 border-4 border-green-300 placeholder-gray-500 text-gray-900 rounded-2xl focus:outline-none focus:border-yellow-400 text-lg font-bold"
                placeholder="🔒 Password"
                value={formData.password}
                onChange={handleChange}
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-6 py-4 border-4 border-pink-300 placeholder-gray-500 text-gray-900 rounded-2xl focus:outline-none focus:border-blue-400 text-lg font-bold"
                placeholder="🔐 Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </motion.div>
          </div>

          <div>
            <BouncyButton
              type="submit"
              disabled={loading}
              variant="success"
              className="w-full py-4 text-xl"
            >
              {loading ? '⏳ Creating account...' : '🎉 Sign up'}
            </BouncyButton>
          </div>

          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.1 }}
          >
            <Link to="/login" className="font-bold text-2xl text-purple-600 hover:text-pink-600">
              🔑 Already have an account? Sign in!
            </Link>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
