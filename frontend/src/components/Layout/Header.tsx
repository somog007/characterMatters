import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/authSlice';
import BouncyButton from '../BouncyButton';

const Header: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <motion.header 
      className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 shadow-rainbow"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 hover:scale-110 transform transition-transform">
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-2xl"
            >
              🌟
            </motion.span>
            <span className="text-3xl font-bold text-white drop-shadow-lg">
              Character Matters
            </span>
            <motion.span
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-2xl"
            >
              🎨
            </motion.span>
          </Link>

          <nav className="hidden md:flex space-x-4">
            <motion.div whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/"
                className="text-white font-bold hover:text-yellow-200 px-2 py-2 rounded-md text-base drop-shadow"
              >
                🏠 Home
              </Link>
            </motion.div>
            {isAuthenticated && (
              <motion.div whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/dashboard"
                  className="text-white font-bold hover:text-yellow-200 px-2 py-2 rounded-md text-base drop-shadow"
                >
                  📊 Dashboard
                </Link>
              </motion.div>
            )}
            <motion.div whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/about"
                className="text-white font-bold hover:text-yellow-200 px-2 py-2 rounded-md text-base drop-shadow"
              >
                📖 About
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/services"
                className="text-white font-bold hover:text-yellow-200 px-2 py-2 rounded-md text-base drop-shadow"
              >
                🎯 Services
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/videos"
                className="text-white font-bold hover:text-yellow-200 px-2 py-2 rounded-md text-base drop-shadow"
              >
                🎬 Videos
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/products"
                className="text-white font-bold hover:text-yellow-200 px-2 py-2 rounded-md text-base drop-shadow"
              >
                📚 Books
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/ebooks"
                className="text-white font-bold hover:text-yellow-200 px-2 py-2 rounded-md text-base drop-shadow"
              >
                � eBooks
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/team"
                className="text-white font-bold hover:text-yellow-200 px-2 py-2 rounded-md text-base drop-shadow"
              >
                👥 Team
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/contact"
                className="text-white font-bold hover:text-yellow-200 px-2 py-2 rounded-md text-base drop-shadow"
              >
                📞 Contact
              </Link>
            </motion.div>
            {user?.role === 'admin' && (
              <motion.div whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/admin"
                  className="text-white font-bold hover:text-yellow-200 px-2 py-2 rounded-md text-base drop-shadow"
                >
                  ⚙️ Admin
                </Link>
              </motion.div>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <motion.span 
                  className="text-white font-bold bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  👤 Hello, {user?.name}!
                </motion.span>
                <BouncyButton
                  onClick={handleLogout}
                  variant="danger"
                  className="text-sm px-6 py-2"
                >
                  👋 Logout
                </BouncyButton>
              </>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/login"
                    className="text-white font-bold hover:text-yellow-200 px-3 py-2 rounded-md text-lg"
                  >
                    🔑 Login
                  </Link>
                </motion.div>
                <BouncyButton
                  onClick={() => navigate('/register')}
                  variant="success"
                  className="text-sm px-6 py-2"
                >
                  ✨ Sign Up
                </BouncyButton>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;