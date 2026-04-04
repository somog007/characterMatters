import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

import Gallery from '../models/Gallery';
import User from '../models/User';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/video-ebook-platform';

const SOURCE_ROOT = 'C:/Users/user/Pictures/WhatsApp Images/Character Matters';
const EVENTS_DIR = path.join(SOURCE_ROOT, 'EVENTS');
const SEMINARS_DIR = path.join(SOURCE_ROOT, 'School Seminars');
const TARGET_UPLOADS = path.join(process.cwd(), 'uploads');

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const VIDEO_EXTS = new Set(['.mp4', '.mov', '.webm', '.mkv']);

type Category = 'Events' | 'School Seminars';

type MediaFile = {
  sourcePath: string;
  filename: string;
  mediaType: 'image' | 'video';
  category: Category;
  title: string;
};

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const mediaTypeFor = (ext: string): 'image' | 'video' | null => {
  const lower = ext.toLowerCase();
  if (IMAGE_EXTS.has(lower)) return 'image';
  if (VIDEO_EXTS.has(lower)) return 'video';
  return null;
};

const walk = (dir: string): string[] => {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const out: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
};

const collectMedia = (rootDir: string, category: Category): MediaFile[] => {
  const files = walk(rootDir);
  return files
    .map((filePath) => {
      const ext = path.extname(filePath);
      const mediaType = mediaTypeFor(ext);
      if (!mediaType) return null;

      const rel = path.relative(rootDir, filePath).replace(/\\/g, '/');
      const parts = rel.split('/');
      const eventTitle = parts.length > 1 ? parts[0] : category;
      const base = path.basename(filePath);

      return {
        sourcePath: filePath,
        filename: base,
        mediaType,
        category,
        title: eventTitle,
      } as MediaFile;
    })
    .filter((item): item is MediaFile => !!item);
};

const main = async () => {
  await mongoose.connect(MONGO_URI);

  if (!fs.existsSync(TARGET_UPLOADS)) {
    fs.mkdirSync(TARGET_UPLOADS, { recursive: true });
  }

  const adminUser = await User.findOne({ role: 'admin' }).select('_id').lean();
  const fallbackUser = await User.findOne().select('_id').lean();
  let creator: any = adminUser?._id || fallbackUser?._id;

  if (!creator) {
    const seededAdmin = await User.create({
      name: 'Local Gallery Admin',
      email: `gallery-admin-${Date.now()}@local.test`,
      password: 'TempPassword123!',
      role: 'admin',
    });
    creator = seededAdmin._id;
    console.log(`Created local admin user for import: ${seededAdmin.email}`);
  }

  const media = [
    ...collectMedia(EVENTS_DIR, 'Events'),
    ...collectMedia(SEMINARS_DIR, 'School Seminars'),
  ];

  let inserted = 0;
  let skipped = 0;

  for (const item of media) {
    const dedupe = await Gallery.findOne({
      title: item.title,
      category: item.category,
      mediaType: item.mediaType,
      description: item.filename,
    }).lean();

    if (dedupe) {
      skipped++;
      continue;
    }

    const slug = toSlug(item.title);
    const destName = `${slug}-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(item.filename).toLowerCase()}`;
    const destPath = path.join(TARGET_UPLOADS, destName);
    const publicUrl = `http://localhost:5000/uploads/${destName}`;

    fs.copyFileSync(item.sourcePath, destPath);

    await Gallery.create({
      title: item.title,
      description: item.filename,
      category: item.category,
      mediaType: item.mediaType,
      url: publicUrl,
      createdBy: creator,
    });

    inserted++;
  }

  console.log(`Imported gallery media. Inserted: ${inserted}, Skipped: ${skipped}, Total scanned: ${media.length}`);
  await mongoose.disconnect();
};

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
