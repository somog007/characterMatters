import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import Gallery from '../models/Gallery';

dotenv.config();

type Category = 'Events' | 'School Seminars';

type MediaType = 'image' | 'video';

type GalleryDoc = {
  _id: mongoose.Types.ObjectId;
  category: Category;
  title: string;
  description?: string;
  mediaType: MediaType;
  url: string;
};

type StaticFile = {
  category: Category;
  title: string;
  filename: string;
  relUrl: string;
  absPath: string;
  mediaType: MediaType;
  keyExact: string;
  keyLoose: string;
};

type MatchResult = {
  file?: StaticFile;
  reason: 'exact' | 'loose' | 'already-correct' | 'unresolved' | 'ambiguous';
  candidates?: StaticFile[];
};

const args = new Set(process.argv.slice(2));
const applyMode = args.has('--apply');
const verbose = args.has('--verbose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/video-ebook-platform';
const PUBLIC_GALLERY_ROOT = process.env.GALLERY_PUBLIC_ROOT || path.resolve(process.cwd(), '..', 'web', 'public', 'images', 'gallery');

const imageExts = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);
const videoExts = new Set(['.mp4', '.mov', '.webm', '.mkv']);

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9]/g, '');

const stripLegacyPrefix = (value: string): string =>
  value
    .replace(/^events--/i, '')
    .replace(/^event--/i, '')
    .replace(/^seminars--/i, '')
    .replace(/^school-seminars--/i, '')
    .replace(/^schoolseminars--/i, '');

const looseKey = (value: string): string => normalize(value).replace(/\d+$/, '');

const asMediaType = (filename: string): MediaType | null => {
  const ext = path.extname(filename).toLowerCase();
  if (imageExts.has(ext)) return 'image';
  if (videoExts.has(ext)) return 'video';
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

const encodeSeg = (value: string) => encodeURIComponent(value);

const discoverStaticFiles = (): StaticFile[] => {
  const files = walk(PUBLIC_GALLERY_ROOT);
  const out: StaticFile[] = [];

  for (const absPath of files) {
    const rel = path.relative(PUBLIC_GALLERY_ROOT, absPath).replace(/\\/g, '/');
    const parts = rel.split('/');
    if (parts.length < 2) continue;

    const categoryRaw = parts[0] as Category;
    if (categoryRaw !== 'Events' && categoryRaw !== 'School Seminars') continue;

    const filename = parts[parts.length - 1];
    const mediaType = asMediaType(filename);
    if (!mediaType) continue;

    const title = parts.length >= 3 ? parts[1] : categoryRaw;
    const relUrl = `/images/gallery/${encodeSeg(categoryRaw)}/${encodeSeg(title)}/${encodeSeg(filename)}`;

    out.push({
      category: categoryRaw,
      title,
      filename,
      relUrl,
      absPath,
      mediaType,
      keyExact: normalize(filename),
      keyLoose: looseKey(filename),
    });
  }

  return out;
};

const basenameFromRecord = (doc: GalleryDoc): string => {
  const source = (doc.description && doc.description.trim()) || decodeURIComponent(path.basename(doc.url || ''));
  return source.replace(/\\/g, '/').split('/').pop() || source;
};

const isCurrentStaticUrl = (url: string): boolean => {
  if (!url.startsWith('/images/gallery/')) return false;
  const rel = decodeURIComponent(url.replace(/^\//, ''));
  return fs.existsSync(path.join(path.resolve(process.cwd(), '..', 'web', 'public'), rel));
};

const chooseOne = (records: StaticFile[], used: Set<string>): StaticFile[] => {
  const unused = records.filter((r) => !used.has(r.relUrl));
  return unused.length > 0 ? unused : records;
};

const matchRecord = (doc: GalleryDoc, byCategory: Map<Category, StaticFile[]>, used: Set<string>): MatchResult => {
  if (isCurrentStaticUrl(doc.url)) return { reason: 'already-correct' };

  const pool = (byCategory.get(doc.category) || []).filter((f) => f.mediaType === doc.mediaType);
  if (pool.length === 0) return { reason: 'unresolved' };

  const rawName = basenameFromRecord(doc);
  const legacyName = stripLegacyPrefix(rawName);
  const exactKey = normalize(legacyName);
  const relaxedKey = looseKey(legacyName);

  const exactCandidates = chooseOne(pool.filter((f) => f.keyExact === exactKey), used);
  if (exactCandidates.length === 1) return { reason: 'exact', file: exactCandidates[0] };
  if (exactCandidates.length > 1) return { reason: 'ambiguous', candidates: exactCandidates };

  const looseCandidates = chooseOne(pool.filter((f) => f.keyLoose === relaxedKey), used);
  if (looseCandidates.length === 1) return { reason: 'loose', file: looseCandidates[0] };
  if (looseCandidates.length > 1) return { reason: 'ambiguous', candidates: looseCandidates };

  return { reason: 'unresolved' };
};

async function main() {
  const mode = applyMode ? 'APPLY' : 'DRY-RUN';
  console.log(`Gallery static path migration (${mode})`);
  console.log(`Using gallery root: ${PUBLIC_GALLERY_ROOT}`);

  if (!fs.existsSync(PUBLIC_GALLERY_ROOT)) {
    throw new Error(`Gallery folder not found at: ${PUBLIC_GALLERY_ROOT}. Set GALLERY_PUBLIC_ROOT to override.`);
  }

  await mongoose.connect(MONGODB_URI);

  const staticFiles = discoverStaticFiles();
  if (staticFiles.length === 0) {
    throw new Error('No static media files found under gallery root.');
  }

  const byCategory = new Map<Category, StaticFile[]>([
    ['Events', staticFiles.filter((f) => f.category === 'Events')],
    ['School Seminars', staticFiles.filter((f) => f.category === 'School Seminars')],
  ]);

  const records = (await Gallery.find({}).select('_id category title description mediaType url').lean()) as unknown as GalleryDoc[];

  const used = new Set<string>();
  let alreadyCorrect = 0;
  let wouldUpdate = 0;
  let applied = 0;
  let unresolved = 0;
  let ambiguous = 0;

  const previewUpdates: Array<{ id: string; from: string; to: string; titleFrom: string; titleTo: string }> = [];
  const unresolvedRows: Array<{ id: string; category: string; description?: string; url: string }> = [];
  const ambiguousRows: Array<{ id: string; description?: string; options: string[] }> = [];

  for (const doc of records) {
    const match = matchRecord(doc, byCategory, used);

    if (match.reason === 'already-correct') {
      alreadyCorrect++;
      continue;
    }

    if (!match.file) {
      if (match.reason === 'ambiguous') {
        ambiguous++;
        ambiguousRows.push({
          id: String(doc._id),
          description: doc.description,
          options: (match.candidates || []).slice(0, 4).map((c) => c.relUrl),
        });
      } else {
        unresolved++;
        unresolvedRows.push({
          id: String(doc._id),
          category: doc.category,
          description: doc.description,
          url: doc.url,
        });
      }
      continue;
    }

    const nextUrl = match.file.relUrl;
    const nextTitle = match.file.title;
    const nextDescription = match.file.filename;

    const needsUpdate = doc.url !== nextUrl || doc.title !== nextTitle || (doc.description || '') !== nextDescription;
    if (!needsUpdate) {
      alreadyCorrect++;
      used.add(nextUrl);
      continue;
    }

    wouldUpdate++;
    used.add(nextUrl);

    if (previewUpdates.length < 20) {
      previewUpdates.push({
        id: String(doc._id),
        from: doc.url,
        to: nextUrl,
        titleFrom: doc.title,
        titleTo: nextTitle,
      });
    }

    if (applyMode) {
      await Gallery.updateOne(
        { _id: doc._id },
        {
          $set: {
            url: nextUrl,
            title: nextTitle,
            description: nextDescription,
          },
        }
      );
      applied++;
    }
  }

  console.log('--- Summary ---');
  console.log(`Total records: ${records.length}`);
  console.log(`Already correct: ${alreadyCorrect}`);
  console.log(`${applyMode ? 'Updated' : 'Would update'}: ${wouldUpdate}`);
  console.log(`Unresolved: ${unresolved}`);
  console.log(`Ambiguous: ${ambiguous}`);

  if (previewUpdates.length > 0) {
    console.log('--- Preview updates (first 20) ---');
    for (const row of previewUpdates) {
      console.log(`${row.id}`);
      console.log(`  title: ${row.titleFrom} -> ${row.titleTo}`);
      console.log(`  url:   ${row.from}`);
      console.log(`         ${row.to}`);
    }
  }

  if (unresolvedRows.length > 0) {
    console.log('--- Unresolved records (first 20) ---');
    for (const row of unresolvedRows.slice(0, 20)) {
      console.log(`${row.id} | ${row.category} | ${row.description || '(no description)'}`);
      console.log(`  ${row.url}`);
    }
  }

  if (ambiguousRows.length > 0) {
    console.log('--- Ambiguous records (first 20) ---');
    for (const row of ambiguousRows.slice(0, 20)) {
      console.log(`${row.id} | ${row.description || '(no description)'}`);
      for (const option of row.options) {
        console.log(`  - ${option}`);
      }
    }
  }

  if (verbose) {
    console.log('--- File inventory ---');
    console.log(`Events files: ${(byCategory.get('Events') || []).length}`);
    console.log(`School Seminars files: ${(byCategory.get('School Seminars') || []).length}`);
  }

  if (!applyMode) {
    console.log('Dry-run only. Re-run with --apply to persist updates.');
  }

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
