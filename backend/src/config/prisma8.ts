import 'dotenv/config';
import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from '../generated/prisma8/contract.d';
import contractJson from '../generated/prisma8/contract.json';

const runtimeDatabaseUrl = process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL;

if (!runtimeDatabaseUrl) {
  throw new Error('DATABASE_URL or DATABASE_URL_POOLED must be configured');
}

const prisma8 = postgres<Contract>({
  contractJson,
  url: runtimeDatabaseUrl,
});

export default prisma8;