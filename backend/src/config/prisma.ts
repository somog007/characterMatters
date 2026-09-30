import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

if (process.env.DATABASE_URL && !process.env.DIRECT_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const runtimeDatabaseUrl = process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(runtimeDatabaseUrl ? { datasources: { db: { url: runtimeDatabaseUrl } } } : {}),
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
