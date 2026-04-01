/**
 * Gallery Seed Script
 * ===================
 * Run this AFTER the app is deployed and a MongoDB connection is available.
 *
 * Usage (from repo root):
 *   cd backend
 *   npx ts-node ../scripts/seed-gallery.ts
 *
 * Requirements:
 *   - MONGODB_URI environment variable set
 *   - ADMIN_USER_ID environment variable set  (the _id of the admin account)
 *   - Media files already uploaded to your CDN / S3 bucket
 *     → Replace each `url` placeholder with the real public URL before running.
 *
 * Local image source (to upload manually via the admin upload form after deployment):
 *   C:\Users\user\Pictures\WhatsApp Images\Character Matters\EVENTS\
 *   C:\Users\user\Pictures\WhatsApp Images\Character Matters\School Seminars\
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const MONGODB_URI = process.env.MONGODB_URI || '';
const ADMIN_USER_ID = process.env.ADMIN_USER_ID || '';

if (!MONGODB_URI || !ADMIN_USER_ID) {
  console.error('❌  Set MONGODB_URI and ADMIN_USER_ID in your environment before running this script.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// SEED DATA
// Replace every `url` value with the CDN/S3 public URL of the uploaded file.
// ---------------------------------------------------------------------------

const galleryItems = [
  // ============================================================
  // CATEGORY: Events
  // ============================================================

  // -- Event 1: Ado Odo Ota Napps Meeting, Ogun State ----------
  {
    category: 'Events',
    title: 'NAPPS Meeting – Ado Odo Ota, Ogun State',
    description: 'Presentation on the introduction of Character and Moral Building Books to school owners at the Ado Odo Ota NAPPS meeting, Ogun State.',
    location: 'Ado Odo Ota, Ogun State',
    mediaType: 'image',
    url: 'PLACEHOLDER_ado_odo_ota_1.jpeg',       // WhatsApp Image 2026-04-01 at 1.18.37 PM.jpeg
  },
  {
    category: 'Events',
    title: 'NAPPS Meeting – Ado Odo Ota, Ogun State',
    description: 'Presentation on the introduction of Character and Moral Building Books to school owners at the Ado Odo Ota NAPPS meeting, Ogun State.',
    location: 'Ado Odo Ota, Ogun State',
    mediaType: 'image',
    url: 'PLACEHOLDER_ado_odo_ota_2.jpeg',       // WhatsApp Image 2026-04-01 at 1.18.37 PM (1).jpeg
  },
  {
    category: 'Events',
    title: 'NAPPS Meeting – Ado Odo Ota, Ogun State',
    description: 'Presentation on the introduction of Character and Moral Building Books to school owners at the Ado Odo Ota NAPPS meeting, Ogun State.',
    location: 'Ado Odo Ota, Ogun State',
    mediaType: 'image',
    url: 'PLACEHOLDER_ado_odo_ota_3.jpeg',       // WhatsApp Image 2026-04-01 at 1.18.37 PM (2).jpeg
  },
  {
    category: 'Events',
    title: 'NAPPS Meeting – Ado Odo Ota, Ogun State',
    description: 'Presentation on the introduction of Character and Moral Building Books to school owners at the Ado Odo Ota NAPPS meeting, Ogun State.',
    location: 'Ado Odo Ota, Ogun State',
    mediaType: 'image',
    url: 'PLACEHOLDER_ado_odo_ota_4.jpeg',       // WhatsApp Image 2026-04-01 at 1.18.38 PM.jpeg
  },
  {
    category: 'Events',
    title: 'NAPPS Meeting – Ado Odo Ota, Ogun State',
    description: 'Presentation on the introduction of Character and Moral Building Books to school owners at the Ado Odo Ota NAPPS meeting, Ogun State.',
    location: 'Ado Odo Ota, Ogun State',
    mediaType: 'image',
    url: 'PLACEHOLDER_ado_odo_ota_5.jpeg',       // WhatsApp Image 2026-04-01 at 1.18.38 PM (1).jpeg
  },
  {
    category: 'Events',
    title: 'NAPPS Meeting – Ado Odo Ota, Ogun State',
    description: 'Presentation on the introduction of Character and Moral Building Books to school owners at the Ado Odo Ota NAPPS meeting, Ogun State.',
    location: 'Ado Odo Ota, Ogun State',
    mediaType: 'image',
    url: 'PLACEHOLDER_ado_odo_ota_6.jpeg',       // WhatsApp Image 2026-04-01 at 1.18.38 PM (2).jpeg
  },
  {
    category: 'Events',
    title: 'NAPPS Meeting – Ado Odo Ota, Ogun State',
    description: 'Presentation on the introduction of Character and Moral Building Books to school owners at the Ado Odo Ota NAPPS meeting, Ogun State.',
    location: 'Ado Odo Ota, Ogun State',
    mediaType: 'image',
    url: 'PLACEHOLDER_ado_odo_ota_7.jpeg',       // WhatsApp Image 2026-04-01 at 1.18.38 PM (3).jpeg
  },
  {
    category: 'Events',
    title: 'NAPPS Meeting – Ado Odo Ota, Ogun State (Video)',
    description: 'Video footage from the presentation at the Ado Odo Ota NAPPS meeting, Ogun State.',
    location: 'Ado Odo Ota, Ogun State',
    mediaType: 'video',
    url: 'PLACEHOLDER_ado_odo_ota_video.mp4',    // WhatsApp Video 2026-04-01 at 1.18.37 PM.mp4
  },

  // -- Event 2: Amuwo Odofin Napps Meeting, Festac Town, Lagos --
  {
    category: 'Events',
    title: 'NAPPS Meeting – Amuwo Odofin, Festac Town, Lagos',
    description: 'Presentation on the introduction of Character and Moral Building Books to school owners at the Amuwo Odofin NAPPS meeting, Festac Town, Lagos.',
    location: 'Festac Town, Lagos',
    mediaType: 'image',
    url: 'PLACEHOLDER_amuwo_1.jpeg',             // WhatsApp Image 2026-04-01 at 1.20.05 PM.jpeg
  },
  {
    category: 'Events',
    title: 'NAPPS Meeting – Amuwo Odofin, Festac Town, Lagos',
    description: 'Presentation on the introduction of Character and Moral Building Books to school owners at the Amuwo Odofin NAPPS meeting, Festac Town, Lagos.',
    location: 'Festac Town, Lagos',
    mediaType: 'image',
    url: 'PLACEHOLDER_amuwo_2.jpeg',             // WhatsApp Image 2026-04-01 at 1.20.06 PM.jpeg
  },
  {
    category: 'Events',
    title: 'NAPPS Meeting – Amuwo Odofin, Festac Town, Lagos',
    description: 'Presentation on the introduction of Character and Moral Building Books to school owners at the Amuwo Odofin NAPPS meeting, Festac Town, Lagos.',
    location: 'Festac Town, Lagos',
    mediaType: 'image',
    url: 'PLACEHOLDER_amuwo_3.jpeg',             // WhatsApp Image 2026-04-01 at 1.20.06 PM (1).jpeg
  },
  {
    category: 'Events',
    title: 'NAPPS Meeting – Amuwo Odofin, Festac Town, Lagos',
    description: 'Presentation on the introduction of Character and Moral Building Books to school owners at the Amuwo Odofin NAPPS meeting, Festac Town, Lagos.',
    location: 'Festac Town, Lagos',
    mediaType: 'image',
    url: 'PLACEHOLDER_amuwo_4.jpeg',             // WhatsApp Image 2026-04-01 at 1.20.06 PM (2).jpeg
  },

  // -- Event 3: AFED South South Educational --
  {
    category: 'Events',
    title: 'AFED South South Educational Conference',
    description: 'Presentation on the introduction of Character and Moral Building Books to school owners during the Association for Formidable Educational Development (AFED) South South Educational conference.',
    mediaType: 'image',
    url: 'PLACEHOLDER_afed_1.jpeg',              // WhatsApp Image 2026-04-01 at 1.23.19 PM.jpeg
  },
  {
    category: 'Events',
    title: 'AFED South South Educational Conference',
    description: 'Presentation on the introduction of Character and Moral Building Books to school owners during the AFED South South Educational conference.',
    mediaType: 'image',
    url: 'PLACEHOLDER_afed_2.jpeg',              // WhatsApp Image 2026-04-01 at 1.23.19 PM (1).jpeg
  },
  {
    category: 'Events',
    title: 'AFED South South Educational Conference',
    description: 'Presentation on the introduction of Character and Moral Building Books to school owners during the AFED South South Educational conference.',
    mediaType: 'image',
    url: 'PLACEHOLDER_afed_3.jpeg',              // WhatsApp Image 2026-04-01 at 1.23.20 PM.jpeg
  },

  // -- Event 4: Lagos SUBEB / NOA Character Building Day --
  {
    category: 'Events',
    title: 'Character Building Day – Lagos SUBEB & NOA Partnership',
    description: 'Character Matters partners with the Lagos State Ministry of Education, State Universal Basic Education Board (SUBEB) and National Orientation Agency (NOA) in organizing a Character Building Day.',
    location: 'Lagos State',
    mediaType: 'image',
    url: 'PLACEHOLDER_subeb_1.jpeg',             // WhatsApp Image 2026-04-01 at 1.03.47 PM.jpeg
  },
  {
    category: 'Events',
    title: 'Character Building Day – Lagos SUBEB & NOA Partnership',
    description: 'Character Matters partners with the Lagos State Ministry of Education, SUBEB and NOA in organizing a Character Building Day.',
    location: 'Lagos State',
    mediaType: 'image',
    url: 'PLACEHOLDER_subeb_2.jpeg',             // WhatsApp Image 2026-04-01 at 1.03.48 PM.jpeg
  },
  {
    category: 'Events',
    title: 'Character Building Day – Lagos SUBEB & NOA Partnership',
    description: 'Character Matters partners with the Lagos State Ministry of Education, SUBEB and NOA in organizing a Character Building Day.',
    location: 'Lagos State',
    mediaType: 'image',
    url: 'PLACEHOLDER_subeb_3.jpeg',             // WhatsApp Image 2026-04-01 at 1.03.50 PM.jpeg
  },
  {
    category: 'Events',
    title: 'Character Building Day – Lagos SUBEB & NOA Partnership',
    description: 'Character Matters partners with the Lagos State Ministry of Education, SUBEB and NOA in organizing a Character Building Day.',
    location: 'Lagos State',
    mediaType: 'image',
    url: 'PLACEHOLDER_subeb_4.jpeg',             // WhatsApp Image 2026-04-01 at 1.03.51 PM.jpeg
  },
  {
    category: 'Events',
    title: 'Character Building Day – Lagos SUBEB & NOA Partnership',
    description: 'Character Matters partners with the Lagos State Ministry of Education, SUBEB and NOA in organizing a Character Building Day.',
    location: 'Lagos State',
    mediaType: 'image',
    url: 'PLACEHOLDER_subeb_5.jpeg',             // WhatsApp Image 2026-04-01 at 1.03.52 PM.jpeg
  },
  {
    category: 'Events',
    title: 'Character Building Day – Lagos SUBEB & NOA Partnership',
    description: 'Character Matters partners with the Lagos State Ministry of Education, SUBEB and NOA in organizing a Character Building Day.',
    location: 'Lagos State',
    mediaType: 'image',
    url: 'PLACEHOLDER_subeb_6.jpeg',             // WhatsApp Image 2026-04-01 at 1.03.53 PM.jpeg
  },
  {
    category: 'Events',
    title: 'Character Building Day – Lagos SUBEB & NOA Partnership',
    description: 'Character Matters partners with the Lagos State Ministry of Education, SUBEB and NOA in organizing a Character Building Day.',
    location: 'Lagos State',
    mediaType: 'image',
    url: 'PLACEHOLDER_subeb_7.jpeg',             // WhatsApp Image 2026-04-01 at 1.03.54 PM.jpeg
  },
  {
    category: 'Events',
    title: 'Character Building Day – Lagos SUBEB & NOA Partnership',
    description: 'Character Matters partners with the Lagos State Ministry of Education, SUBEB and NOA in organizing a Character Building Day.',
    location: 'Lagos State',
    mediaType: 'image',
    url: 'PLACEHOLDER_subeb_8.jpeg',             // WhatsApp Image 2026-04-01 at 1.03.55 PM.jpeg
  },
  {
    category: 'Events',
    title: 'Character Building Day – Lagos SUBEB & NOA Partnership',
    description: 'Character Matters partners with the Lagos State Ministry of Education, SUBEB and NOA in organizing a Character Building Day.',
    location: 'Lagos State',
    mediaType: 'image',
    url: 'PLACEHOLDER_subeb_9.jpeg',             // WhatsApp Image 2026-04-01 at 1.03.56 PM.jpeg
  },
  {
    category: 'Events',
    title: 'Character Building Day – Lagos SUBEB & NOA Partnership',
    description: 'Character Matters partners with the Lagos State Ministry of Education, SUBEB and NOA in organizing a Character Building Day.',
    location: 'Lagos State',
    mediaType: 'image',
    url: 'PLACEHOLDER_subeb_10.jpeg',            // WhatsApp Image 2026-04-01 at 1.03.57 PM.jpeg
  },
  {
    category: 'Events',
    title: 'Character Building Day – Lagos SUBEB & NOA Partnership',
    description: 'Character Matters partners with the Lagos State Ministry of Education, SUBEB and NOA in organizing a Character Building Day.',
    location: 'Lagos State',
    mediaType: 'image',
    url: 'PLACEHOLDER_subeb_11.jpeg',            // WhatsApp Image 2026-04-01 at 1.03.57 PM (1).jpeg
  },

  // ============================================================
  // CATEGORY: School Seminars
  // ============================================================

  // -- Seminar 1: Diamond Hall School, Idimu, Lagos ------------
  {
    category: 'School Seminars',
    title: 'Character Building Seminar – Diamond Hall School, Idimu, Lagos',
    school: 'Diamond Hall School',
    location: 'Idimu, Lagos',
    mediaType: 'image',
    url: 'PLACEHOLDER_diamond_hall_1.jpeg',      // WhatsApp Image 2026-04-01 at 12.45.30 PM.jpeg
  },
  {
    category: 'School Seminars',
    title: 'Character Building Seminar – Diamond Hall School, Idimu, Lagos',
    school: 'Diamond Hall School',
    location: 'Idimu, Lagos',
    mediaType: 'image',
    url: 'PLACEHOLDER_diamond_hall_2.jpeg',      // WhatsApp Image 2026-04-01 at 12.45.31 PM.jpeg
  },
  {
    category: 'School Seminars',
    title: 'Character Building Seminar – Diamond Hall School, Idimu, Lagos',
    school: 'Diamond Hall School',
    location: 'Idimu, Lagos',
    mediaType: 'image',
    url: 'PLACEHOLDER_diamond_hall_3.jpeg',      // WhatsApp Image 2026-04-01 at 12.45.47 PM.jpeg
  },
  {
    category: 'School Seminars',
    title: 'Character Building Seminar – Diamond Hall School, Idimu, Lagos',
    school: 'Diamond Hall School',
    location: 'Idimu, Lagos',
    mediaType: 'image',
    url: 'PLACEHOLDER_diamond_hall_4.jpeg',      // WhatsApp Image 2026-04-01 at 12.45.47 PM (1).jpeg
  },
  {
    category: 'School Seminars',
    title: 'Character Building Seminar – Diamond Hall School, Idimu, Lagos',
    school: 'Diamond Hall School',
    location: 'Idimu, Lagos',
    mediaType: 'image',
    url: 'PLACEHOLDER_diamond_hall_5.jpeg',      // WhatsApp Image 2026-04-01 at 12.45.47 PM (2).jpeg
  },
  {
    category: 'School Seminars',
    title: 'Character Building Seminar – Diamond Hall School, Idimu, Lagos',
    school: 'Diamond Hall School',
    location: 'Idimu, Lagos',
    mediaType: 'image',
    url: 'PLACEHOLDER_diamond_hall_6.jpeg',      // WhatsApp Image 2026-04-01 at 12.45.48 PM.jpeg
  },

  // -- Seminar 2: Weavers Private School, Iju-Fagba, Lagos -----
  {
    category: 'School Seminars',
    title: 'Self Confidence Training – Weavers Private School, Iju-Fagba, Lagos',
    school: 'Weavers Private School',
    location: 'Kay-Farm Estate, Iju-Fagba, Lagos',
    mediaType: 'image',
    url: 'PLACEHOLDER_weavers_1.jpeg',           // WhatsApp Image 2026-04-01 at 12.51.43 PM.jpeg
  },
  {
    category: 'School Seminars',
    title: 'Self Confidence Training – Weavers Private School, Iju-Fagba, Lagos',
    school: 'Weavers Private School',
    location: 'Kay-Farm Estate, Iju-Fagba, Lagos',
    mediaType: 'image',
    url: 'PLACEHOLDER_weavers_2.jpeg',           // WhatsApp Image 2026-04-01 at 12.51.46 PM.jpeg
  },
  {
    category: 'School Seminars',
    title: 'Self Confidence Training – Weavers Private School, Iju-Fagba, Lagos',
    school: 'Weavers Private School',
    location: 'Kay-Farm Estate, Iju-Fagba, Lagos',
    mediaType: 'image',
    url: 'PLACEHOLDER_weavers_3.jpeg',           // WhatsApp Image 2026-04-01 at 12.51.47 PM.jpeg
  },
  {
    category: 'School Seminars',
    title: 'Self Confidence Training – Weavers Private School, Iju-Fagba, Lagos',
    school: 'Weavers Private School',
    location: 'Kay-Farm Estate, Iju-Fagba, Lagos',
    mediaType: 'image',
    url: 'PLACEHOLDER_weavers_4.jpeg',           // WhatsApp Image 2026-04-01 at 12.51.48 PM.jpeg
  },
  {
    category: 'School Seminars',
    title: 'Self Confidence Training – Weavers Private School, Iju-Fagba, Lagos',
    school: 'Weavers Private School',
    location: 'Kay-Farm Estate, Iju-Fagba, Lagos',
    mediaType: 'image',
    url: 'PLACEHOLDER_weavers_5.jpeg',           // WhatsApp Image 2026-04-01 at 12.51.53 PM.jpeg
  },

  // -- Seminar 3: Ferscoat International School, Ipaja, Lagos ---
  {
    category: 'School Seminars',
    title: 'Sexual Purity & Awareness Seminar – Ferscoat International School, Ipaja, Lagos',
    school: 'Ferscoat International School',
    location: 'Ipaja, Lagos',
    mediaType: 'image',
    url: 'PLACEHOLDER_ferscoat_1.jpeg',          // WhatsApp Image 2026-04-01 at 12.37.01 PM.jpeg
  },
  {
    category: 'School Seminars',
    title: 'Sexual Purity & Awareness Seminar – Ferscoat International School, Ipaja, Lagos',
    school: 'Ferscoat International School',
    location: 'Ipaja, Lagos',
    mediaType: 'image',
    url: 'PLACEHOLDER_ferscoat_2.jpeg',          // WhatsApp Image 2026-04-01 at 12.37.12 PM.jpeg
  },
  {
    category: 'School Seminars',
    title: 'Sexual Purity & Awareness Seminar – Ferscoat International School, Ipaja, Lagos',
    school: 'Ferscoat International School',
    location: 'Ipaja, Lagos',
    mediaType: 'image',
    url: 'PLACEHOLDER_ferscoat_3.jpeg',          // WhatsApp Image 2026-04-01 at 12.37.13 PM.jpeg
  },
  {
    category: 'School Seminars',
    title: 'Sexual Purity & Awareness Seminar – Ferscoat International School, Ipaja, Lagos',
    school: 'Ferscoat International School',
    location: 'Ipaja, Lagos',
    mediaType: 'image',
    url: 'PLACEHOLDER_ferscoat_4.jpeg',          // WhatsApp Image 2026-04-01 at 12.37.15 PM.jpeg
  },
  {
    category: 'School Seminars',
    title: 'Sexual Purity & Awareness Seminar – Ferscoat International School, Ipaja, Lagos',
    school: 'Ferscoat International School',
    location: 'Ipaja, Lagos',
    mediaType: 'image',
    url: 'PLACEHOLDER_ferscoat_5.jpeg',          // WhatsApp Image 2026-04-01 at 12.37.16 PM.jpeg
  },
  {
    category: 'School Seminars',
    title: 'Sexual Purity & Awareness Seminar – Ferscoat International School, Ipaja, Lagos',
    school: 'Ferscoat International School',
    location: 'Ipaja, Lagos',
    mediaType: 'image',
    url: 'PLACEHOLDER_ferscoat_6.jpeg',          // WhatsApp Image 2026-04-01 at 12.37.16 PM (1).jpeg
  },
  {
    category: 'School Seminars',
    title: 'Sexual Purity & Awareness Seminar – Ferscoat International School, Ipaja, Lagos',
    school: 'Ferscoat International School',
    location: 'Ipaja, Lagos',
    mediaType: 'image',
    url: 'PLACEHOLDER_ferscoat_7.jpeg',          // WhatsApp Image 2026-04-01 at 12.38.02 PM.jpeg
  },
  {
    category: 'School Seminars',
    title: 'Sexual Purity & Awareness Seminar – Ferscoat International School, Ipaja, Lagos',
    school: 'Ferscoat International School',
    location: 'Ipaja, Lagos',
    mediaType: 'image',
    url: 'PLACEHOLDER_ferscoat_8.jpeg',          // WhatsApp Image 2026-04-01 at 12.38.03 PM.jpeg
  },
  {
    category: 'School Seminars',
    title: 'Sexual Purity & Awareness Seminar – Ferscoat International School, Ipaja, Lagos',
    school: 'Ferscoat International School',
    location: 'Ipaja, Lagos',
    mediaType: 'image',
    url: 'PLACEHOLDER_ferscoat_9.jpeg',          // WhatsApp Image 2026-04-01 at 12.38.15 PM.jpeg
  },
] as const;

// ---------------------------------------------------------------------------
// Seed logic
// ---------------------------------------------------------------------------

async function seedGallery() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅  Connected to MongoDB');

  // Dynamically import after connection to avoid model registration issues
  const { default: Gallery } = await import('../backend/src/models/Gallery');

  const adminId = new mongoose.Types.ObjectId(ADMIN_USER_ID);
  let inserted = 0;
  let skipped = 0;

  for (const item of galleryItems) {
    if (item.url.startsWith('PLACEHOLDER_')) {
      console.warn(`⚠️   Skipping "${item.title}" — URL is still a placeholder. Upload the file first.`);
      skipped++;
      continue;
    }

    const exists = await Gallery.findOne({ url: item.url });
    if (exists) {
      console.log(`↩️   Already exists: ${item.title}`);
      skipped++;
      continue;
    }

    await Gallery.create({ ...item, createdBy: adminId });
    console.log(`✔   Inserted: ${item.title}`);
    inserted++;
  }

  console.log(`\n✅  Done. Inserted: ${inserted}, Skipped/Already exists: ${skipped}`);
  await mongoose.disconnect();
}

seedGallery().catch((err) => {
  console.error('❌  Seed failed:', err);
  process.exit(1);
});
