import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="text-8xl mb-4"
      >
        🧐
      </motion.div>
      <h1 className="text-4xl font-extrabold text-purple-600 mb-2">Page not found</h1>
      <p className="text-gray-700 mb-6 max-w-xl">
        The page you're looking for doesn't exist. If you just started the app, make sure you're using the correct address: <strong>http://localhost:5175/</strong>.
      </p>
      <div className="flex gap-3">
        <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold">Go to Login</Link>
        <Link to="/" className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-3 rounded-xl font-bold">Go to Home</Link>
      </div>
    </div>
  );
};

export default NotFound;
