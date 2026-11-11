import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { env } from './env';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const runtimeDatabaseUrl = env.databaseUrl;
if (!runtimeDatabaseUrl) {
  throw new Error('DATABASE_URL or DATABASE_URL_POOLED must be configured');
}

// Serverless-friendly pool: give up on a connection attempt after 10 s instead of
// waiting indefinitely (pg's default), keep sockets alive, and drop idle connections
// quickly so a function that was frozen does not reuse a dead socket.
const adapter = new PrismaPg({
  connectionString: runtimeDatabaseUrl,
  max: 5,
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 10_000,
  keepAlive: true,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

globalForPrisma.prisma = prisma;

export default prisma;
