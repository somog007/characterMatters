import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import prisma from '../src/config/prisma';

const WEAVERS_EMAIL = 'weaversprivateschool2023@gmail.com';
const ADMIN_EMAIL = 'charactermattersng@gmail.com';
const CLOUDINARY_BRONZE_URL = 'https://collection.cloudinary.com/crau2l9a/fafda5942927feb6d904a3105bda1d79';

async function main() {
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;
  const weaversPassword = process.env.INITIAL_WEAVERS_PASSWORD;
  if (!adminPassword || !weaversPassword) {
    throw new Error('Set INITIAL_ADMIN_PASSWORD and INITIAL_WEAVERS_PASSWORD before running this script');
  }

  console.log('Provisioning workspace accounts...');

  const now = new Date();
  const nextYear = new Date(now);
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  // 1. Setup Admin Account: charactermattersng@gmail.com
  const adminHashedPassword = await bcrypt.hash(adminPassword, 12);
  const adminUser = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      fullName: 'Character Matters Admin',
      passwordHash: adminHashedPassword,
      role: 'ADMIN',
      status: 'must_change_password',
    },
    create: {
      email: ADMIN_EMAIL,
      fullName: 'Character Matters Admin',
      passwordHash: adminHashedPassword,
      role: 'ADMIN',
      status: 'must_change_password',
    },
  });

  await prisma.subscription.upsert({
    where: { userId: adminUser.id },
    update: {
      plan: 'package_1', // Platinum / Admin full access
      status: 'ACTIVE',
      billingCycle: 'YEARLY',
      priceAmountNgn: 0,
      startDate: now,
      currentPeriodStart: now,
      currentPeriodEnd: nextYear,
      endDate: nextYear,
      paymentProvider: 'MANUAL',
    },
    create: {
      userId: adminUser.id,
      plan: 'package_1',
      status: 'ACTIVE',
      billingCycle: 'YEARLY',
      priceAmountNgn: 0,
      startDate: now,
      currentPeriodStart: now,
      currentPeriodEnd: nextYear,
      endDate: nextYear,
      paymentProvider: 'MANUAL',
    },
  });

  console.log(`Admin account provisioned: ${ADMIN_EMAIL}. Password change is required at first login.`);

  // 2. Setup User Account: weaversprivateschool2023@gmail.com
  const weaversHashedPassword = await bcrypt.hash(weaversPassword, 12);
  const weaversUser = await prisma.user.upsert({
    where: { email: WEAVERS_EMAIL },
    update: {
      fullName: 'Weavers Private School',
      schoolName: 'Weavers Private School',
      passwordHash: weaversHashedPassword,
      role: 'USER',
      status: 'must_change_password',
    },
    create: {
      email: WEAVERS_EMAIL,
      fullName: 'Weavers Private School',
      schoolName: 'Weavers Private School',
      passwordHash: weaversHashedPassword,
      role: 'USER',
      status: 'must_change_password',
    },
  });

  const weaversSub = await prisma.subscription.upsert({
    where: { userId: weaversUser.id },
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
      userId: weaversUser.id,
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

  console.log(`User account provisioned: ${WEAVERS_EMAIL}. Password change is required at first login.`);
  console.log({
    userId: weaversUser.id,
    email: weaversUser.email,
    plan: weaversSub.plan,
    status: weaversSub.status,
    currentPeriodEnd: weaversSub.currentPeriodEnd,
    cloudinaryLink: CLOUDINARY_BRONZE_URL,
  });

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('❌ Error setting up accounts:', e);
  await prisma.$disconnect();
  process.exit(1);
});
