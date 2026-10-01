# Prisma ORM 7

The Netlify function imports the API from `backend/src/app.ts` and uses the Prisma 7 client generated from `backend/prisma/schema.prisma`. The separate `characterMatters/` Composer app has its own Prisma 8 setup.

## Versions

The root workspace and `backend/` both pin `prisma` and `@prisma/client` to `7.10.0`. Run `npm run prisma:check-versions` to verify the declarations; Netlify runs this check on every build.

## Client generation

After changing the schema, regenerate the client:

```sh
npm run prisma:generate
```

The generated client is written to `backend/src/generated/prisma/` and is recreated during the backend build.

## Database connections

Runtime queries use `DATABASE_URL_POOLED` when set, otherwise `DATABASE_URL`. Prisma migration commands use `DIRECT_URL` when set and fall back to `DATABASE_URL`.

```sh
npm --prefix backend run prisma:migrate
npm run prisma:deploy
```

Review migration changes and test them against a staging database before applying them in production.