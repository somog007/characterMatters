'use client';

import { useMemo, useState } from 'react';

type Category = 'All' | 'Events' | 'School Seminars';
type MediaType = 'image' | 'video';

type GalleryItem = {
  id: string;
  title: string;
  category: 'Events' | 'School Seminars';
  mediaType: MediaType;
  url: string;
};

type GalleryGroup = {
  title: string;
  items: GalleryItem[];
};

const enc = encodeURIComponent;

const makeItem = (
  category: 'Events' | 'School Seminars',
  folder: string,
  filename: string,
): GalleryItem => {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const mediaType: MediaType = ext === 'mp4' || ext === 'mov' || ext === 'webm' ? 'video' : 'image';
  return {
    id: `${folder}/${filename}`,
    title: folder,
    category,
    mediaType,
    url: `/images/gallery/${enc(category)}/${enc(folder)}/${enc(filename)}`,
  };
};

const STATIC_GALLERY: GalleryItem[] = [
  makeItem('Events', '001-ado-odo-ota-napps-ogun-state', 'WhatsApp Image 2026-04-01 at 1.18.37 PM (1).jpeg'),
  makeItem('Events', '001-ado-odo-ota-napps-ogun-state', 'WhatsApp Image 2026-04-01 at 1.18.37 PM (2).jpeg'),
  makeItem('Events', '001-ado-odo-ota-napps-ogun-state', 'WhatsApp Image 2026-04-01 at 1.18.37 PM.jpeg'),
  makeItem('Events', '001-ado-odo-ota-napps-ogun-state', 'WhatsApp Image 2026-04-01 at 1.18.38 PM (1).jpeg'),
  makeItem('Events', '001-ado-odo-ota-napps-ogun-state', 'WhatsApp Image 2026-04-01 at 1.18.38 PM (2).jpeg'),
  makeItem('Events', '001-ado-odo-ota-napps-ogun-state', 'WhatsApp Image 2026-04-01 at 1.18.38 PM (3).jpeg'),
  makeItem('Events', '001-ado-odo-ota-napps-ogun-state', 'WhatsApp Image 2026-04-01 at 1.18.38 PM.jpeg'),
  makeItem('Events', '001-ado-odo-ota-napps-ogun-state', 'WhatsApp Video 2026-04-01 at 1.18.37 PM.mp4'),
  makeItem('Events', '002-amuwo-odofin-napps-festac-lagos', 'WhatsApp Image 2026-04-01 at 1.20.05 PM.jpeg'),
  makeItem('Events', '002-amuwo-odofin-napps-festac-lagos', 'WhatsApp Image 2026-04-01 at 1.20.06 PM (1).jpeg'),
  makeItem('Events', '002-amuwo-odofin-napps-festac-lagos', 'WhatsApp Image 2026-04-01 at 1.20.06 PM (2).jpeg'),
  makeItem('Events', '002-amuwo-odofin-napps-festac-lagos', 'WhatsApp Image 2026-04-01 at 1.20.06 PM.jpeg'),
  makeItem('Events', '003-afed-south-south-educational', 'WhatsApp Image 2026-04-01 at 1.23.19 PM (1).jpeg'),
  makeItem('Events', '003-afed-south-south-educational', 'WhatsApp Image 2026-04-01 at 1.23.19 PM.jpeg'),
  makeItem('Events', '003-afed-south-south-educational', 'WhatsApp Image 2026-04-01 at 1.23.20 PM.jpeg'),
  makeItem('Events', '004-lagos-ministry-subeb-noa-character-building', 'WhatsApp Image 2026-04-01 at 1.03.47 PM.jpeg'),
  makeItem('Events', '004-lagos-ministry-subeb-noa-character-building', 'WhatsApp Image 2026-04-01 at 1.03.48 PM.jpeg'),
  makeItem('Events', '004-lagos-ministry-subeb-noa-character-building', 'WhatsApp Image 2026-04-01 at 1.03.50 PM.jpeg'),
  makeItem('Events', '004-lagos-ministry-subeb-noa-character-building', 'WhatsApp Image 2026-04-01 at 1.03.51 PM.jpeg'),
  makeItem('Events', '004-lagos-ministry-subeb-noa-character-building', 'WhatsApp Image 2026-04-01 at 1.03.52 PM.jpeg'),
  makeItem('Events', '004-lagos-ministry-subeb-noa-character-building', 'WhatsApp Image 2026-04-01 at 1.03.53 PM.jpeg'),
  makeItem('Events', '004-lagos-ministry-subeb-noa-character-building', 'WhatsApp Image 2026-04-01 at 1.03.54 PM.jpeg'),
  makeItem('Events', '004-lagos-ministry-subeb-noa-character-building', 'WhatsApp Image 2026-04-01 at 1.03.55 PM.jpeg'),
  makeItem('Events', '004-lagos-ministry-subeb-noa-character-building', 'WhatsApp Image 2026-04-01 at 1.03.56 PM.jpeg'),
  makeItem('Events', '004-lagos-ministry-subeb-noa-character-building', 'WhatsApp Image 2026-04-01 at 1.03.57 PM (1).jpeg'),
  makeItem('Events', '004-lagos-ministry-subeb-noa-character-building', 'WhatsApp Image 2026-04-01 at 1.03.57 PM.jpeg'),
  makeItem('School Seminars', 'Character Building Seminar at Diamond Hall School, Idimu Lagos', 'WhatsApp Image 2026-04-01 at 12.45.30 PM.jpeg'),
  makeItem('School Seminars', 'Character Building Seminar at Diamond Hall School, Idimu Lagos', 'WhatsApp Image 2026-04-01 at 12.45.31 PM.jpeg'),
  makeItem('School Seminars', 'Character Building Seminar at Diamond Hall School, Idimu Lagos', 'WhatsApp Image 2026-04-01 at 12.45.47 PM (1).jpeg'),
  makeItem('School Seminars', 'Character Building Seminar at Diamond Hall School, Idimu Lagos', 'WhatsApp Image 2026-04-01 at 12.45.47 PM (2).jpeg'),
  makeItem('School Seminars', 'Character Building Seminar at Diamond Hall School, Idimu Lagos', 'WhatsApp Image 2026-04-01 at 12.45.47 PM.jpeg'),
  makeItem('School Seminars', 'Character Building Seminar at Diamond Hall School, Idimu Lagos', 'WhatsApp Image 2026-04-01 at 12.45.48 PM.jpeg'),
  makeItem('School Seminars', 'Self Confidence Training at Weavers Private School, Kay - Farm Estate, Iju - Fagba, Lagos', 'WhatsApp Image 2026-04-01 at 12.51.43 PM.jpeg'),
  makeItem('School Seminars', 'Self Confidence Training at Weavers Private School, Kay - Farm Estate, Iju - Fagba, Lagos', 'WhatsApp Image 2026-04-01 at 12.51.46 PM.jpeg'),
  makeItem('School Seminars', 'Self Confidence Training at Weavers Private School, Kay - Farm Estate, Iju - Fagba, Lagos', 'WhatsApp Image 2026-04-01 at 12.51.47 PM.jpeg'),
  makeItem('School Seminars', 'Self Confidence Training at Weavers Private School, Kay - Farm Estate, Iju - Fagba, Lagos', 'WhatsApp Image 2026-04-01 at 12.51.48 PM.jpeg'),
  makeItem('School Seminars', 'Self Confidence Training at Weavers Private School, Kay - Farm Estate, Iju - Fagba, Lagos', 'WhatsApp Image 2026-04-01 at 12.51.53 PM.jpeg'),
  makeItem('School Seminars', 'Sexual Purity and Awareness Seminar for Students of Ferscoat International School, Ipaja - Lagos', 'WhatsApp Image 2026-04-01 at 12.37.01 PM.jpeg'),
  makeItem('School Seminars', 'Sexual Purity and Awareness Seminar for Students of Ferscoat International School, Ipaja - Lagos', 'WhatsApp Image 2026-04-01 at 12.37.12 PM.jpeg'),
  makeItem('School Seminars', 'Sexual Purity and Awareness Seminar for Students of Ferscoat International School, Ipaja - Lagos', 'WhatsApp Image 2026-04-01 at 12.37.13 PM.jpeg'),
  makeItem('School Seminars', 'Sexual Purity and Awareness Seminar for Students of Ferscoat International School, Ipaja - Lagos', 'WhatsApp Image 2026-04-01 at 12.37.15 PM.jpeg'),
  makeItem('School Seminars', 'Sexual Purity and Awareness Seminar for Students of Ferscoat International School, Ipaja - Lagos', 'WhatsApp Image 2026-04-01 at 12.37.16 PM (1).jpeg'),
  makeItem('School Seminars', 'Sexual Purity and Awareness Seminar for Students of Ferscoat International School, Ipaja - Lagos', 'WhatsApp Image 2026-04-01 at 12.37.16 PM.jpeg'),
  makeItem('School Seminars', 'Sexual Purity and Awareness Seminar for Students of Ferscoat International School, Ipaja - Lagos', 'WhatsApp Image 2026-04-01 at 12.38.02 PM.jpeg'),
  makeItem('School Seminars', 'Sexual Purity and Awareness Seminar for Students of Ferscoat International School, Ipaja - Lagos', 'WhatsApp Image 2026-04-01 at 12.38.03 PM.jpeg'),
  makeItem('School Seminars', 'Sexual Purity and Awareness Seminar for Students of Ferscoat International School, Ipaja - Lagos', 'WhatsApp Image 2026-04-01 at 12.38.15 PM.jpeg'),
];

const EVENT_LABELS: Record<string, string> = {
  '001-ado-odo-ota-napps-ogun-state': 'NAPPS Meeting — Ado Odo Ota, Ogun State',
  '002-amuwo-odofin-napps-festac-lagos': 'NAPPS Meeting — Amuwo Odofin, Festac Lagos',
  '003-afed-south-south-educational': 'AFED South South Educational Conference',
  '004-lagos-ministry-subeb-noa-character-building': 'Lagos Ministry / SUBEB / NOA — Character Building Programme',
};

const displayTitle = (item: GalleryItem) =>
  item.category === 'Events' ? (EVENT_LABELS[item.title] ?? item.title) : item.title;

const groupByTitle = (items: GalleryItem[]): GalleryGroup[] => {
  const groups = new Map<string, GalleryGroup>();
  for (const item of items) {
    const key = item.title;
    if (!groups.has(key)) groups.set(key, { title: key, items: [] });
    groups.get(key)!.items.push(item);
  }
  return Array.from(groups.values());
};

export default function GalleryPage() {
  const [category, setCategory] = useState<Category>('All');

  const grouped = useMemo(
    () => ({
      Events: groupByTitle(
        STATIC_GALLERY.filter((i) => i.category === 'Events' && (category === 'All' || category === 'Events')),
      ),
      'School Seminars': groupByTitle(
        STATIC_GALLERY.filter(
          (i) => i.category === 'School Seminars' && (category === 'All' || category === 'School Seminars'),
        ),
      ),
    }),
    [category],
  );

  const renderCard = (item: GalleryItem, index: number) => (
    <article key={item.id} className="overflow-hidden rounded-xl border border-purple-100 bg-white shadow-sm">
      {item.mediaType === 'video' ? (
        <div className="relative">
          <video controls className="h-56 w-full bg-black object-cover">
            <source src={item.url} type="video/mp4" />
          </video>
          <span className="absolute right-3 top-3 rounded-full bg-black/70 px-2 py-1 text-xs font-semibold text-white">
            Video
          </span>
        </div>
      ) : (
        <div className="relative">
          <img
            src={item.url}
            alt={`${displayTitle(item)} — photo ${index + 1}`}
            className="h-56 w-full object-cover"
            loading="lazy"
          />
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-purple-800">
            Image
          </span>
        </div>
      )}
    </article>
  );

  const renderGroup = (group: GalleryGroup) => {
    const label = group.items[0] ? displayTitle(group.items[0]) : group.title;
    return (
      <section
        key={group.title}
        className="space-y-4 rounded-2xl border border-purple-100 bg-white/70 p-5 shadow-sm backdrop-blur-sm"
      >
        <div className="flex flex-col gap-2 border-b border-purple-100 pb-4 md:flex-row md:items-end md:justify-between">
          <h3 className="text-xl font-bold text-purple-900">{label}</h3>
          <p className="text-sm font-semibold text-purple-700">
            {group.items.length} {group.items.length === 1 ? 'asset' : 'assets'}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {group.items.map((item, idx) => renderCard(item, idx))}
        </div>
      </section>
    );
  };

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

      <div className="space-y-10">
        {grouped.Events.length > 0 && (
          <section>
            {category === 'All' && <h2 className="mb-4 text-2xl font-bold text-purple-800">Events</h2>}
            <div className="space-y-8">{grouped.Events.map(renderGroup)}</div>
          </section>
        )}
        {grouped['School Seminars'].length > 0 && (
          <section>
            {category === 'All' && <h2 className="mb-4 text-2xl font-bold text-purple-800">School Seminars</h2>}
            <div className="space-y-8">{grouped['School Seminars'].map(renderGroup)}</div>
          </section>
        )}
      </div>
    </section>
  );
}
