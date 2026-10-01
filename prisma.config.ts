import 'dotenv/config';
import { definePrismaConfig } from 'prisma/config';
import { defineConfig as ormConfig } from '@prisma/orm-postgres/config';

export default definePrismaConfig({
  orm: ormConfig({
    contract: './backend/prisma/prisma8-auth.contract.ts',
    output: './backend/src/generated/prisma8',
    db: {
      connection: process.env['DATABASE_URL']!,
    },
  }),
});
