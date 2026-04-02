'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';

type Category = 'All' | 'Events' | 'School Seminars';

type GalleryItem = {
  _id: string;
  title: string;
  description?: string;
  category?: 'Events' | 'School Seminars';
  school?: string;
  location?: string;
  eventDate?: string;
  mediaType: 'image' | 'video';
  url: string;
};

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>('All');

  useEffect(() => {
    const loadGallery = async () => {
      try {
        setLoading(true);
        const params = category === 'All' ? { limit: 100 } : { category, limit: 100 };
        const response = await api.get('/gallery', { params });
        setItems(response.data?.items || []);
        setError(null);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Could not load gallery right now.');
      } finally {
        setLoading(false);
      }
    };

    loadGallery();
  }, [category]);

  const grouped = useMemo(() => {
    return {
      Events: items.filter((item) => item.category === 'Events'),
      'School Seminars': items.filter((item) => item.category === 'School Seminars'),
      Uncategorized: items.filter((item) => !item.category),
    };
  }, [items]);

  const renderCard = (item: GalleryItem) => (
    <article key={item._id} className="overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm">
      {item.mediaType === 'video' ? (
        <video controls className="h-56 w-full object-cover bg-black">
          <source src={item.url} type="video/mp4" />
        </video>
      ) : (
        <img src={item.url} alt={item.title} className="h-56 w-full object-cover" />
      )}
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-2 text-base font-bold text-purple-900">{item.title}</h3>
        {(item.school || item.location) && (
          <p className="text-sm text-gray-600">{item.school || item.location}</p>
        )}
        {item.description && <p className="line-clamp-2 text-sm text-gray-700">{item.description}</p>}
        {item.eventDate && (
          <p className="text-xs text-gray-500">{new Date(item.eventDate).toLocaleDateString()}</p>
        )}
      </div>
    </article>
  );

  return (
    <section className="container mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-purple-900 md:text-4xl">Events & School Seminars Gallery</h1>
        <p className="mt-2 text-gray-600">Highlights from our events, trainings, and school engagements.</p>
      </header>

      <div className="mb-8 flex flex-wrap gap-3">
        {(['All', 'Events', 'School Seminars'] as const).map((value) => (
          <button
            key={value}
            onClick={() => setCategory(value)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              category === value
                ? 'border-purple-600 bg-purple-600 text-white'
                : 'border-purple-200 bg-white text-purple-700 hover:border-purple-400'
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-600">Loading gallery...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p className="text-gray-600">No media uploaded yet. Content will appear here after upload.</p>
      )}

      {!loading && !error && category !== 'All' && items.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{items.map(renderCard)}</div>
      )}

      {!loading && !error && category === 'All' && items.length > 0 && (
        <div className="space-y-10">
          {grouped.Events.length > 0 && (
            <section>
              <h2 className="mb-4 text-2xl font-bold text-purple-800">Events</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{grouped.Events.map(renderCard)}</div>
            </section>
          )}

          {grouped['School Seminars'].length > 0 && (
            <section>
              <h2 className="mb-4 text-2xl font-bold text-purple-800">School Seminars</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {grouped['School Seminars'].map(renderCard)}
              </div>
            </section>
          )}

          {grouped.Uncategorized.length > 0 && (
            <section>
              <h2 className="mb-4 text-2xl font-bold text-purple-800">More Highlights</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {grouped.Uncategorized.map(renderCard)}
              </div>
            </section>
          )}
        </div>
      )}
    </section>
  );
}