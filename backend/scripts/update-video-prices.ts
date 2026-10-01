import dotenv from 'dotenv';
dotenv.config();

import prisma from '../src/config/prisma';
import { Prisma } from '../src/generated/prisma/client';

async function main() {
  console.log('🚀 Updating price for all video assets to ₦50,000...');

  const result = await prisma.lesson.updateMany({
    data: {
      price: new Prisma.Decimal(50000),
    },
  });

  console.log(`✅ Updated ${result.count} video assets to ₦50,000 NGN.`);

  const videos = await prisma.lesson.findMany({
    select: {
      id: true,
      title: true,
      price: true,
    },
  });

  console.log('📹 Current Video Assets & Prices:', videos);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('❌ Error updating video prices:', e);
  await prisma.$disconnect();
  process.exit(1);
});
