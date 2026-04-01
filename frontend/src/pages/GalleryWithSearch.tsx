import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { motion } from 'framer-motion';
import { galleryAPI } from '../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

type CategoryFilter = 'All' | 'Events' | 'School Seminars';

interface GalleryItem {
  _id: string;
  title: string;
  description?: string;
  category: 'Events' | 'School Seminars';
  location?: string;
  school?: string;
  eventDate?: string;
  mediaType: 'image' | 'video';
  url: string;
  createdBy: { name: string };
}

const CATEGORIES: CategoryFilter[] = ['All', 'Events', 'School Seminars'];

const categoryStyles: Record<string, string> = {
  Events: 'border-blue-600 text-blue-600',
  'School Seminars': 'border-green-600 text-green-600',
};

const GalleryWithSearch: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [meta, setMeta] = useState({
    title: '',
    description: '',
    location: '',
    school: '',
    eventDate: '',
    mediaType: 'image',
    category: 'Events' as 'Events' | 'School Seminars',
  });

  const { user } = useSelector((state: RootState) => state.auth);

  const fetchGallery = async (page: number = 1, reset = false) => {
    try {
      const params: Record<string, any> = { page, limit: 20 };
      if (searchTerm) params.search = searchTerm;
      if (activeCategory !== 'All') params.category = activeCategory;

      const res = await galleryAPI.getAll(params);
      const newItems: GalleryItem[] = res.data.items || [];

      if (reset) {
        setItems(newItems);
      } else {
        setItems((prev) => [...prev, ...newItems]);
      }

      setHasMore(res.data.totalPages > page);
    } catch (err: any) {
      setError(err.message || 'Could not load gallery');
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    setItems([]);
    setHasMore(true);
    fetchGallery(1, true);
  }, [searchTerm, activeCategory]);

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchGallery(nextPage);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !meta.title) return setError('Please provide a title and file');

    const formData = new FormData();
    Object.entries(meta).forEach(([k, v]) => formData.append(k, v));
    formData.append('file', file);

    try {
      setUploading(true);
      setError(null);
      await galleryAPI.create(formData);
      setMeta({ title: '', description: '', location: '', school: '', eventDate: '', mediaType: 'image', category: 'Events' });
      setFile(null);
      setCurrentPage(1);
      setItems([]);
      setHasMore(true);
      fetchGallery(1, true);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await galleryAPI.delete(id);
      setItems(items.filter((it) => it._id !== id));
    } catch (err: any) {
      setError(err.message || 'Delete failed');
    }
  };

  // Group items by category for "All" view
  const groupedItems =
    activeCategory === 'All'
      ? (['Events', 'School Seminars'] as const).reduce<Record<string, GalleryItem[]>>(
          (acc, cat) => {
            acc[cat] = items.filter((i) => i.category === cat);
            return acc;
          },
          {} as Record<string, GalleryItem[]>
        )
      : null;

  const renderGrid = (gridItems: GalleryItem[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {gridItems.map((item) => (
        <motion.div
          key={item._id}
          className="bg-white rounded-xl shadow-md overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {item.mediaType === 'image' ? (
            <img src={item.url} alt={item.title} className="w-full h-52 object-cover" />
          ) : (
            <video controls className="w-full h-52 bg-black">
              <source src={item.url} type="video/mp4" />
            </video>
          )}
          <div className="p-4">
            <div className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">{item.title}</div>
            {(item.school || item.location) && (
              <div className="text-xs text-gray-500 mb-1">{item.school || item.location}</div>
            )}
            {item.description && <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>}
            <div className="flex justify-between items-center mt-2">
              {item.eventDate && (
                <span className="text-xs text-gray-400">
                  {new Date(item.eventDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              )}
              {user?.role === 'admin' && (
                <button onClick={() => handleDelete(item._id)} className="text-red-500 text-xs hover:underline ml-auto">
                  Delete
                </button>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Gallery</h1>
        <p className="text-gray-500 mt-1">Photos and videos from our events and school seminars</p>
      </motion.div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by title, school, location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-3 mb-8 border-b border-gray-200">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeCategory === cat
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Admin Upload Form */}
      {user?.role === 'admin' && (
        <motion.form
          onSubmit={handleUpload}
          className="grid gap-3 mb-10 bg-gray-50 border border-gray-200 p-6 rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h3 className="font-bold text-lg text-gray-800">Upload New Media</h3>
          {error && <div className="text-red-600 text-sm p-2 bg-red-50 rounded">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={meta.title}
              onChange={(e) => setMeta((p) => ({ ...p, title: e.target.value }))}
              required
              placeholder="Title *"
              className="p-2 border rounded"
            />
            <select
              value={meta.category}
              onChange={(e) => setMeta((p) => ({ ...p, category: e.target.value as 'Events' | 'School Seminars' }))}
              className="p-2 border rounded"
            >
              <option value="Events">Events</option>
              <option value="School Seminars">School Seminars</option>
            </select>
            <input
              value={meta.description}
              onChange={(e) => setMeta((p) => ({ ...p, description: e.target.value }))}
              placeholder="Description"
              className="p-2 border rounded"
            />
            <input
              value={meta.school}
              onChange={(e) => setMeta((p) => ({ ...p, school: e.target.value }))}
              placeholder="School / Organization"
              className="p-2 border rounded"
            />
            <input
              value={meta.location}
              onChange={(e) => setMeta((p) => ({ ...p, location: e.target.value }))}
              placeholder="Location"
              className="p-2 border rounded"
            />
            <input
              type="date"
              value={meta.eventDate}
              onChange={(e) => setMeta((p) => ({ ...p, eventDate: e.target.value }))}
              className="p-2 border rounded"
            />
            <select
              value={meta.mediaType}
              onChange={(e) => setMeta((p) => ({ ...p, mediaType: e.target.value }))}
              className="p-2 border rounded"
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              required
              className="p-2"
            />
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 w-fit"
          >
            {uploading ? 'Uploading...' : 'Upload Media'}
          </button>
        </motion.form>
      )}

      {/* Gallery Content */}
      <InfiniteScroll
        dataLength={items.length}
        next={handleLoadMore}
        hasMore={hasMore}
        loader={<div className="text-center py-6 text-gray-400">Loading more...</div>}
        endMessage={
          items.length > 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">All items loaded</div>
          ) : (
            <div className="text-center py-12 text-gray-400">No gallery items yet. Check back after deployment!</div>
          )
        }
      >
        {activeCategory === 'All' && groupedItems ? (
          <div className="space-y-12">
            {(['Events', 'School Seminars'] as const).map((cat) =>
              groupedItems[cat].length > 0 ? (
                <section key={cat}>
                  <div className={`flex items-center gap-3 mb-4 pb-2 border-b-2 ${categoryStyles[cat]}`}>
                    <h2 className="text-2xl font-bold text-gray-800">{cat}</h2>
                    <span className="text-sm text-gray-500">{groupedItems[cat].length} item{groupedItems[cat].length !== 1 ? 's' : ''}</span>
                  </div>
                  {renderGrid(groupedItems[cat])}
                </section>
              ) : null
            )}
            {items.length === 0 && (
              <div className="text-center py-12 text-gray-400">No gallery items yet. Check back after deployment!</div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {activeCategory !== 'All' && items.length > 0 && (
              <div className={`flex items-center gap-3 mb-4 pb-2 border-b-2 ${categoryStyles[activeCategory]}`}>
                <h2 className="text-2xl font-bold text-gray-800">{activeCategory}</h2>
                <span className="text-sm text-gray-500">{items.length} item{items.length !== 1 ? 's' : ''}</span>
              </div>
            )}
            {renderGrid(items)}
          </div>
        )}
      </InfiniteScroll>
    </div>
  );
};

export default GalleryWithSearch;

