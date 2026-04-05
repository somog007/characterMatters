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

type GalleryGroup = {
  title: string;
  items: GalleryItem[];
  school?: string;
  location?: string;
  eventDate?: string;
};

const groupByTitle = (items: GalleryItem[]): GalleryGroup[] => {
  const groups = new Map<string, GalleryGroup>();

  for (const item of items) {
    const key = item.title || 'More Highlights';

    if (!groups.has(key)) {
      groups.set(key, {
        title: key,
        items: [],
        school: item.school,
        location: item.location,
        eventDate: item.eventDate,
      });
    }

    groups.get(key)!.items.push(item);
  }

  return Array.from(groups.values());
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
      Events: groupByTitle(items.filter((item) => item.category === 'Events')),
      'School Seminars': groupByTitle(items.filter((item) => item.category === 'School Seminars')),
      Uncategorized: groupByTitle(items.filter((item) => !item.category)),
    };
  }, [items]);

  const renderCard = (item: GalleryItem, index: number) => (
    <article key={item._id} className="overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm">
      {item.mediaType === 'video' ? (
        <div className="relative">
          <video controls className="h-56 w-full object-cover bg-black">
            <source src={item.url} type="video/mp4" />
          </video>
          <span className="absolute right-3 top-3 rounded-full bg-black/70 px-2 py-1 text-xs font-semibold text-white">
            Video
          </span>
        </div>
      ) : (
        <div className="relative">
          <img src={item.url} alt={`${item.title} ${index + 1}`} className="h-56 w-full object-cover" />
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-purple-800">
            Image
          </span>
        </div>
      )}
    </article>
  );

  const renderGroup = (group: GalleryGroup) => (
    <section key={group.title} className="space-y-4 rounded-2xl border border-purple-100 bg-white/70 p-5 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col gap-2 border-b border-purple-100 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-xl font-bold text-purple-900">{group.title}</h3>
          {(group.school || group.location) && (
            <p className="text-sm text-gray-600">{group.school || group.location}</p>
          )}
          {group.eventDate && (
            <p className="text-xs text-gray-500">{new Date(group.eventDate).toLocaleDateString()}</p>
          )}
        </div>
        <p className="text-sm font-semibold text-purple-700">
          {group.items.length} {group.items.length === 1 ? 'asset' : 'assets'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {group.items.map((item, index) => renderCard(item, index))}
      </div>
    </section>
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
        <div className="space-y-8">{grouped[category].map(renderGroup)}</div>
      )}

      {!loading && !error && category === 'All' && items.length > 0 && (
        <div className="space-y-10">
          {grouped.Events.length > 0 && (
            <section>
              <h2 className="mb-4 text-2xl font-bold text-purple-800">Events</h2>
              <div className="space-y-8">{grouped.Events.map(renderGroup)}</div>
            </section>
          )}

          {grouped['School Seminars'].length > 0 && (
            <section>
              <h2 className="mb-4 text-2xl font-bold text-purple-800">School Seminars</h2>
              <div className="space-y-8">{grouped['School Seminars'].map(renderGroup)}</div>
            </section>
          )}

          {grouped.Uncategorized.length > 0 && (
            <section>
              <h2 className="mb-4 text-2xl font-bold text-purple-800">More Highlights</h2>
              <div className="space-y-8">{grouped.Uncategorized.map(renderGroup)}</div>
            </section>
          )}
        </div>
      )}
    </section>
  );
}