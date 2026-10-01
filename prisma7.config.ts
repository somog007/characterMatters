import 'dotenv/config';
import { defineConfig, env } from '@prisma/prisma7/config';

export default defineConfig({
  schema: 'backend/prisma/schema.prisma',
  migrations: {
    path: 'backend/prisma/migrations',
  },
  datasource: {
    url: process.env['DIRECT_URL'] ?? env('DATABASE_URL'),
  },
});