import 'dotenv/config';
import { defineConfig } from '@prisma/prisma7/config';

const databaseUrl = process.env['DIRECT_URL'] || process.env['DATABASE_URL'];

if (!databaseUrl) {
  throw new Error('DIRECT_URL or DATABASE_URL must be configured');
}

export default defineConfig({
  schema: 'backend/prisma/schema.prisma',
  migrations: {
    path: 'backend/prisma/migrations',
  },
  datasource: {
    url: databaseUrl,
  },
});