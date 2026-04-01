import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api, { videoAPI, ebookAPI, galleryAPI } from '../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const AdminDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState({ users: 0, videos: 0, ebooks: 0, gallery: 0 });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, videosRes, ebooksRes, galleryRes] = await Promise.all([
          api.get('/users'),
          videoAPI.getAll(),
          ebookAPI.getAll(),
          galleryAPI.getAll(),
        ]);

        const usersCount = usersRes.data?.users?.length || 0;
        const videosCount = videosRes.data?.videos?.length || 0;
        const ebooksCount = ebooksRes.data?.ebooks?.length || 0;
        const galleryCount = galleryRes.data?.items?.length || 0;

        setStats({ users: usersCount, videos: videosCount, ebooks: ebooksCount, gallery: galleryCount });
      } catch (err: any) {
        setError(err.message || 'Could not load admin stats');
      }
    };

    if (user?.role === 'admin') {
      fetchStats();
    }
  }, [user]);

  if (user?.role !== 'admin') {
    return <div className="container mx-auto p-6">Admin access required.</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <motion.h1 className="text-4xl font-bold mb-6" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        Admin Dashboard
      </motion.h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-xl font-semibold">Users</h2>
          <p className="text-4xl font-bold">{stats.users}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-xl font-semibold">Videos</h2>
          <p className="text-4xl font-bold">{stats.videos}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-xl font-semibold">eBooks</h2>
          <p className="text-4xl font-bold">{stats.ebooks}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-xl font-semibold">Gallery Items</h2>
          <p className="text-4xl font-bold">{stats.gallery}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow">
        <h3 className="text-2xl font-bold mb-2">Admin Controls</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a href="/admin/manage" className="text-blue-600 hover:underline">Manage Roles & Subscriptions</a>
          <a href="/gallery" className="text-blue-600 hover:underline">Manage Gallery</a>
          <a href="/videos" className="text-blue-600 hover:underline">Manage Videos</a>
          <a href="/products" className="text-blue-600 hover:underline">Manage eBooks</a>
          <a href="/users" className="text-blue-600 hover:underline">Manage Users</a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
