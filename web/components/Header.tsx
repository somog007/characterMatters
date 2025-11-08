'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/authSlice';
import { motion } from 'framer-motion';
import type { RootState } from '@/store';

export default function Header() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Videos', path: '/videos' },
    { name: 'Books', path: '/products' },
    { name: 'eBooks', path: '/ebooks' },
    { name: 'Team', path: '/team' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-white shadow-lg sticky top-0 z-50"
    >
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold hover:scale-110 transition-transform">
            Character Matters ⭐
          </Link>
          
          <div className="flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`hover:text-yellow-300 transition-colors font-semibold ${
                  pathname === item.path ? 'text-yellow-300 underline' : ''
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className={`hover:text-yellow-300 transition-colors font-semibold ${
                    pathname === '/dashboard' ? 'text-yellow-300 underline' : ''
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className={`hover:text-yellow-300 transition-colors font-semibold ${
                    pathname === '/profile' ? 'text-yellow-300 underline' : ''
                  }`}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full font-semibold transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-full font-semibold transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
    </motion.header>
  );
}
