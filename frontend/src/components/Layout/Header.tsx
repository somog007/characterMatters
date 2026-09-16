import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/authSlice';
import BouncyButton from '../BouncyButton';

const Header: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    setMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <motion.header 
      className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white shadow-rainbow sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      <div className="container mx-auto px-4 py-2.5">
        <div className="flex justify-between items-center h-14 md:h-16">
          <Link to="/" className="flex-1 flex items-center h-full mr-2 max-w-[200px] sm:max-w-xs md:max-w-md hover:scale-[1.02] transform transition-transform">
            <img
              src="/images/header-logo.jpg"
              alt="Character Matters"
              className="h-10 sm:h-12 md:h-14 w-full object-contain object-left rounded-lg drop-shadow-md"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex space-x-3 items-center">
            <Link to="/" className="text-white font-bold hover:text-yellow-200 px-2 py-1.5 rounded-md text-sm drop-shadow">
              🏠 Home
            </Link>
            {isAuthenticated && (
              <Link to="/dashboard" className="text-white font-bold hover:text-yellow-200 px-2 py-1.5 rounded-md text-sm drop-shadow">
                📊 Dashboard
              </Link>
            )}
            {isAuthenticated && (
              <Link to="/profile" className="text-white font-bold hover:text-yellow-200 px-2 py-1.5 rounded-md text-sm drop-shadow">
                👤 Profile
              </Link>
            )}
            <Link to="/about" className="text-white font-bold hover:text-yellow-200 px-2 py-1.5 rounded-md text-sm drop-shadow">
              📖 About
            </Link>
            <Link to="/services" className="text-white font-bold hover:text-yellow-200 px-2 py-1.5 rounded-md text-sm drop-shadow">
              🎯 Services
            </Link>
            <Link to="/videos" className="text-white font-bold hover:text-yellow-200 px-2 py-1.5 rounded-md text-sm drop-shadow">
              🎬 Videos
            </Link>
            <Link to="/products" className="text-white font-bold hover:text-yellow-200 px-2 py-1.5 rounded-md text-sm drop-shadow">
              📚 Books
            </Link>
            <Link to="/ebooks" className="text-white font-bold hover:text-yellow-200 px-2 py-1.5 rounded-md text-sm drop-shadow">
              📚 eBooks
            </Link>
            <Link to="/gallery" className="text-white font-bold hover:text-yellow-200 px-2 py-1.5 rounded-md text-sm drop-shadow">
              🖼️ Gallery
            </Link>
            <Link to="/team" className="text-white font-bold hover:text-yellow-200 px-2 py-1.5 rounded-md text-sm drop-shadow">
              👥 Team
            </Link>
            <Link to="/contact" className="text-white font-bold hover:text-yellow-200 px-2 py-1.5 rounded-md text-sm drop-shadow">
              📞 Contact
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-white font-bold hover:text-yellow-200 px-2 py-1.5 rounded-md text-sm drop-shadow">
                ⚙️ Admin
              </Link>
            )}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <span className="text-white font-bold bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm text-sm">
                  👤 {user?.name}
                </span>
                <BouncyButton onClick={handleLogout} variant="danger" className="text-xs px-4 py-1.5">
                  👋 Logout
                </BouncyButton>
              </>
            ) : (
              <>
                <Link to="/login" className="text-white font-bold hover:text-yellow-200 px-3 py-1.5 text-sm">
                  🔑 Login
                </Link>
                <BouncyButton onClick={() => navigate('/register')} variant="success" className="text-xs px-4 py-1.5">
                  ✨ Sign Up
                </BouncyButton>
              </>
            )}
          </div>

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg bg-white/20 hover:bg-white/30 focus:outline-none transition-colors"
            aria-label="Toggle Mobile Navigation"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="xl:hidden mt-2 pt-2 border-t border-white/20 flex flex-col space-y-1.5 overflow-hidden"
            >
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg font-semibold hover:bg-white/10 text-base">
                🏠 Home
              </Link>
              {isAuthenticated && (
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg font-semibold hover:bg-white/10 text-base">
                  📊 Dashboard
                </Link>
              )}
              {isAuthenticated && (
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg font-semibold hover:bg-white/10 text-base">
                  👤 Profile
                </Link>
              )}
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg font-semibold hover:bg-white/10 text-base">
                📖 About
              </Link>
              <Link to="/services" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg font-semibold hover:bg-white/10 text-base">
                🎯 Services
              </Link>
              <Link to="/videos" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg font-semibold hover:bg-white/10 text-base">
                🎬 Videos
              </Link>
              <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg font-semibold hover:bg-white/10 text-base">
                📚 Books
              </Link>
              <Link to="/ebooks" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg font-semibold hover:bg-white/10 text-base">
                📚 eBooks
              </Link>
              <Link to="/gallery" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg font-semibold hover:bg-white/10 text-base">
                🖼️ Gallery
              </Link>
              <Link to="/team" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg font-semibold hover:bg-white/10 text-base">
                👥 Team
              </Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg font-semibold hover:bg-white/10 text-base">
                📞 Contact
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="py-2 px-3 rounded-lg font-semibold hover:bg-white/10 text-base">
                  ⚙️ Admin
                </Link>
              )}

              <div className="pt-2 border-t border-white/20">
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="w-full text-left py-2 px-3 rounded-lg font-semibold bg-red-500 text-white"
                  >
                    👋 Logout
                  </button>
                ) : (
                  <div className="flex gap-2 pt-1">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 py-2 px-3 text-center rounded-lg font-semibold bg-white/20 hover:bg-white/30 text-white"
                    >
                      🔑 Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 py-2 px-3 text-center rounded-lg font-semibold bg-green-500 hover:bg-green-600 text-white"
                    >
                      ✨ Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;