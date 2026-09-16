'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import type { RootState } from '@/store';

export default function Header() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state: RootState) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    setMobileMenuOpen(false);
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Videos', path: '/videos' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Books', path: '/products' },
    { name: 'eBooks', path: '/ebooks' },
    { name: 'Team', path: '/team' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white shadow-lg sticky top-0 z-50"
    >
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link 
            href="/" 
            className="flex-1 flex items-center h-full mr-2 max-w-[200px] sm:max-w-xs md:max-w-md hover:scale-[1.02] transition-transform"
          >
            <img 
              src="/images/header-logo.jpg" 
              alt="Character Matters" 
              className="h-10 sm:h-12 md:h-14 w-full object-contain object-left rounded-lg shadow-xs"
            />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`hover:text-yellow-300 transition-colors font-semibold text-sm xl:text-base ${
                  pathname === item.path ? 'text-yellow-300 underline font-bold' : ''
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className={`hover:text-yellow-300 transition-colors font-semibold text-sm ${
                    pathname === '/dashboard' ? 'text-yellow-300 underline' : ''
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className={`hover:text-yellow-300 transition-colors font-semibold text-sm ${
                    pathname === '/profile' ? 'text-yellow-300 underline' : ''
                  }`}
                >
                  Profile
                </Link>
                {user?.role !== 'subscriber' && (
                  <Link
                    href="/subscribe"
                    className={`hover:text-yellow-300 transition-colors font-semibold text-sm ${
                      pathname === '/subscribe' ? 'text-yellow-300 underline' : ''
                    }`}
                  >
                    Upgrade
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-full font-semibold transition-colors text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-green-500 hover:bg-green-600 px-4 py-1.5 rounded-full font-semibold transition-colors text-sm"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-white/20 hover:bg-white/30 focus:outline-none transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="lg:hidden mt-3 pt-3 border-t border-white/20 flex flex-col space-y-2 overflow-hidden"
            >
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-2 px-3 rounded-lg font-semibold transition-colors text-base flex items-center justify-between ${
                    pathname === item.path ? 'bg-white/25 text-yellow-300 font-bold' : 'hover:bg-white/10'
                  }`}
                >
                  <span>{item.name}</span>
                  {pathname === item.path && <span>⭐</span>}
                </Link>
              ))}

              {isAuthenticated ? (
                <div className="pt-2 border-t border-white/20 flex flex-col space-y-2">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 px-3 rounded-lg font-semibold hover:bg-white/10"
                  >
                    📊 Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 px-3 rounded-lg font-semibold hover:bg-white/10"
                  >
                    👤 Profile
                  </Link>
                  {user?.role !== 'subscriber' && (
                    <Link
                      href="/subscribe"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2 px-3 rounded-lg font-semibold bg-yellow-400 text-purple-900 text-center"
                    >
                      🌟 Upgrade Account
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left py-2 px-3 rounded-lg font-semibold bg-red-500 hover:bg-red-600 text-white mt-1"
                  >
                    👋 Logout
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-white/20">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-2.5 px-3 rounded-lg font-semibold bg-green-500 text-center text-white shadow-md hover:bg-green-600"
                  >
                    🔑 Login / Sign In
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}
