import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import prisma from '../src/config/prisma';

const EMAIL = 'weaversprivateschool2023@gmail.com';
const CLOUDINARY_BRONZE_URL = 'https://collection.cloudinary.com/crau2l9a/fafda5942927feb6d904a3105bda1d79';

async function main() {
  console.log(`Setting up Bronze Package subscription for ${EMAIL}...`);

  // 1. Check or create User
  let user = await prisma.user.findUnique({
    where: { email: EMAIL },
  });

  if (!user) {
    const hashedPassword = await bcrypt.hash('Weavers2026!', 10);
    user = await prisma.user.create({
      data: {
        email: EMAIL,
        fullName: 'Weavers Private School',
        schoolName: 'Weavers Private School',
        passwordHash: hashedPassword,
        role: 'USER',
        status: 'active',
      },
    });
    console.log(`Created new user for ${EMAIL} with ID: ${user.id}`);
  } else {
    console.log(`Found existing user ${EMAIL} with ID: ${user.id}`);
  }

  // 2. Set up / update Subscription to active Bronze Package (package_6)
  const now = new Date();
  const nextYear = new Date(now);
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  const subscription = await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {
      plan: 'package_6',
      status: 'ACTIVE',
      billingCycle: 'ACADEMIC_SESSION',
      priceAmountNgn: 150000,
      startDate: now,
      currentPeriodStart: now,
      currentPeriodEnd: nextYear,
      endDate: nextYear,
      paymentProvider: 'PAYSTACK',
    },
    create: {
      userId: user.id,
      plan: 'package_6',
      status: 'ACTIVE',
      billingCycle: 'ACADEMIC_SESSION',
      priceAmountNgn: 150000,
      startDate: now,
      currentPeriodStart: now,
      currentPeriodEnd: nextYear,
      endDate: nextYear,
      paymentProvider: 'PAYSTACK',
    },
  });

  console.log('Successfully activated Bronze Package subscription:');
  console.log({
    userId: user.id,
    email: user.email,
    plan: subscription.plan,
    status: subscription.status,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cloudinaryLink: CLOUDINARY_BRONZE_URL,
  });

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('Error setting up Bronze user:', e);
  await prisma.$disconnect();
  process.exit(1);
});
