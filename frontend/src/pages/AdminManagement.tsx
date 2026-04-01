import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface UserWithRole {
  _id: string;
  name: string;
  email: string;
  role: string;
  subscription?: any;
  createdAt?: string;
}

interface AdminMetrics {
  totalUsers: number;
  totalSubscribers: number;
  totalVideos: number;
  totalGalleryItems: number;
  activeSubscriptions: number;
}

const AdminManagement: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'users' | 'subscriptions'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') return;

    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [metricsRes, usersRes, subsRes] = await Promise.all([
          api.get('/admin/metrics'),
          api.get('/admin/users'),
          api.get('/admin/subscriptions'),
        ]);

        setMetrics(metricsRes.data.metrics);
        setUsers(usersRes.data.users);
        setSubscriptions(subsRes.data.recentSubscriptions);
      } catch (err: any) {
        setError(err.message || 'Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [user]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err: any) {
      setError('Failed to update user role');
    }
  };

  if (user?.role !== 'admin') {
    return <div className="container mx-auto p-6 text-center">Admin access required.</div>;
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="container mx-auto p-6">
      <motion.h1 className="text-4xl font-bold mb-6" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        Admin Management
      </motion.h1>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6">
        {(['overview', 'users', 'subscriptions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 rounded font-semibold ${
              selectedTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-gray-600">Loading admin data...</div>
      ) : (
        <>
          {/* Overview Tab */}
          {selectedTab === 'overview' && metrics && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { label: 'Total Users', value: metrics.totalUsers, color: 'bg-blue-500' },
                { label: 'Subscribers', value: metrics.totalSubscribers, color: 'bg-green-500' },
                { label: 'Videos', value: metrics.totalVideos, color: 'bg-purple-500' },
                { label: 'Gallery Items', value: metrics.totalGalleryItems, color: 'bg-pink-500' },
                { label: 'Active Subs', value: metrics.activeSubscriptions, color: 'bg-yellow-500' },
              ].map((metric, i) => (
                <motion.div
                  key={i}
                  className={`${metric.color} text-white p-6 rounded-lg shadow`}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <h3 className="text-sm font-semibold opacity-80">{metric.label}</h3>
                  <p className="text-3xl font-bold mt-2">{metric.value}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Users Tab */}
          {selectedTab === 'users' && (
            <div>
              <div className="mb-4 flex gap-4">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded"
                />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 border rounded"
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="subscriber">Subscriber</option>
                  <option value="free-user">Free User</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Role</th>
                      <th className="p-2 text-left">Subscription</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u._id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{u.name}</td>
                        <td className="p-2">{u.email}</td>
                        <td className="p-2">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            className="px-2 py-1 border rounded"
                          >
                            <option value="free-user">Free User</option>
                            <option value="subscriber">Subscriber</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="p-2">{u.subscription?.plan || 'None'}</td>
                        <td className="p-2">
                          <button className="text-red-500 hover:underline text-sm">Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subscriptions Tab */}
          {selectedTab === 'subscriptions' && (
            <div className="grid gap-4">
              {subscriptions.map((sub) => (
                <div key={sub._id} className="bg-white p-4 rounded shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{sub.user?.name}</h3>
                      <p className="text-sm text-gray-600">{sub.user?.email}</p>
                      <p className="text-sm">Plan: {sub.plan} ({sub.billingCycle})</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded text-white text-sm ${
                        sub.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                      }`}>
                        {sub.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Expires: {new Date(sub.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminManagement;
