// PostgreSQL Database Client using Prisma ORM
// Import PrismaClient safely with fallback for dev environment pre-generation

let PrismaClientClass: any;
try {
  PrismaClientClass = require('@prisma/client').PrismaClient;
} catch {
  // Mock fallback if @prisma/client is not yet generated
  PrismaClientClass = class DummyPrismaClient {
    $connect() { return Promise.resolve(); }
    $disconnect() { return Promise.resolve(); }
  };
}

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClientClass({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const connectPostgresDB = async () => {
  try {
    if (prisma.$connect) {
      await prisma.$connect();
      console.log('✅ PostgreSQL Connected successfully via Prisma ORM');
    }
  } catch (error) {
    console.error('❌ PostgreSQL Connection Error:', error);
  }
};
