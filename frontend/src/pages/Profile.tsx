import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { RootState } from '../store';
import FloatingStars from '../components/FloatingStars';

const Profile: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative">
      <FloatingStars count={20} />

      <motion.div
        className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-rainbow relative z-10"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        <div className="text-center mb-8">
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
          >
            👤
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900">{user.name}'s Profile</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="mt-1 text-lg text-gray-900">{user.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-lg text-gray-900">{user.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <p className="mt-1 text-lg text-gray-900 capitalize">{user.role}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;