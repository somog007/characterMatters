import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { galleryAPI } from '../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface GalleryItem {
  _id: string;
  title: string;
  description?: string;
  location?: string;
  school?: string;
  eventDate?: string;
  mediaType: 'image' | 'video';
  url: string;
  createdBy: { name: string };
}

const Gallery: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState({ title: '', description: '', location: '', school: '', eventDate: '', mediaType: 'image' });

  const { user } = useSelector((state: RootState) => state.auth);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const res = await galleryAPI.getAll();
      setItems(res.data.items || []);
    } catch (err: any) {
      setError(err.message || 'Could not load gallery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !meta.title) {
      return setError('Please provide a title and file');
    }

    const formData = new FormData();
    formData.append('title', meta.title);
    formData.append('description', meta.description);
    formData.append('location', meta.location);
    formData.append('school', meta.school);
    formData.append('eventDate', meta.eventDate);
    formData.append('mediaType', meta.mediaType as 'image' | 'video');
    formData.append('file', file);

    if (meta.mediaType === 'image') {
      formData.append('thumbnail', URL.createObjectURL(file));
    }

    try {
      setUploading(true);
      await galleryAPI.create(formData);
      setMeta({ title: '', description: '', location: '', school: '', eventDate: '', mediaType: 'image' });
      setFile(null);
      fetchGallery();
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

  return (
    <div className="container mx-auto p-6">
      <motion.h1 className="text-4xl font-bold mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        Events Gallery
      </motion.h1>

      {user?.role === 'admin' && (
        <motion.form onSubmit={handleUpload} className="grid gap-4 mb-8" initial={{ opacity: 0.5 }} animate={{ opacity: 1 }}>
          <input value={meta.title} onChange={(e) => setMeta((prev) => ({ ...prev, title: e.target.value }))} required placeholder="Title" className="p-2 border rounded" />
          <input value={meta.description} onChange={(e) => setMeta((prev) => ({ ...prev, description: e.target.value }))} placeholder="Description" className="p-2 border rounded" />
          <input value={meta.location} onChange={(e) => setMeta((prev) => ({ ...prev, location: e.target.value }))} placeholder="Location" className="p-2 border rounded" />
          <input value={meta.school} onChange={(e) => setMeta((prev) => ({ ...prev, school: e.target.value }))} placeholder="School" className="p-2 border rounded" />
          <input type="date" value={meta.eventDate} onChange={(e) => setMeta((prev) => ({ ...prev, eventDate: e.target.value }))} className="p-2 border rounded" />
          <select value={meta.mediaType} onChange={(e) => setMeta((prev) => ({ ...prev, mediaType: e.target.value }))} className="p-2 border rounded">
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
          <input type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} required className="p-2" />
          <button type="submit" disabled={uploading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            {uploading ? 'Uploading...' : 'Upload Media'}
          </button>
          {error && <div className="text-red-500">{error}</div>}
        </motion.form>
      )}

      {loading ? (
        <div className="text-gray-600">Loading gallery...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item._id} className="bg-white rounded-lg shadow p-4">
              <div className="mb-3 font-semibold text-lg">{item.title}</div>
              <div className="text-sm text-gray-600 mb-2">{item.school || item.location || 'N/A'}</div>
              {item.mediaType === 'image' ? (
                <img src={item.url} alt={item.title} className="rounded-md w-full h-56 object-cover" />
              ) : (
                <video controls className="rounded-md w-full h-56 object-cover">
                  <source src={item.url} type="video/mp4" />
                </video>
              )}
              <p className="text-sm mt-2 text-gray-700">{item.description}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">{new Date(item.eventDate || '').toLocaleDateString() || 'No date'}</span>
                {user?.role === 'admin' && (
                  <button onClick={() => handleDelete(item._id)} className="text-red-500 text-sm hover:underline">
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
