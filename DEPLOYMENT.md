# Production Deployment Guide

## Architecture
The application uses Next.js, an Express API, PostgreSQL through Prisma, and Paystack payments. This repository supports two API hosting paths: a Netlify function configured by `netlify.toml`, or a standalone Render service configured by `render.yaml`. Choose one API path for production. Environment variables configured for one provider are not automatically available to the other.

## Netlify Frontend
1. Connect the repository to Netlify; `netlify.toml` configures the Next.js plugin and build.
2. Set `NEXT_PUBLIC_SITE_URL` to the exact public site URL and `NEXT_PUBLIC_API_URL=/api` when using the Netlify function.
3. For the Netlify-function API path, set these in Netlify's environment-variable settings:
   - `DATABASE_URL` and `DIRECT_URL` for PostgreSQL; set `DATABASE_URL_POOLED` to the provider's pooled connection URL for Netlify Functions (the runtime prefers it when present)
   - `JWT_SECRET` with at least 32 random characters
   - `FRONTEND_URL` to the exact public site origin
   - `PAYSTACK_SECRET_KEY` and `PAYSTACK_CALLBACK_URL`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`
   - `CDN_SIGNING_SECRET` and `HLS_AES_128_MASTER_KEY` for protected video playback
   - `SENDGRID_API_KEY` and `FROM_EMAIL` if transactional email is enabled
   - `SENDGRID_DATA_RESIDENCY=eu` only when using an EU regional SendGrid subuser; otherwise leave unset
   - `SENTRY_DSN` and `REDIS_URL` only if those services are configured
4. Deploy and inspect Netlify build and function logs.

## Render API Alternative
1. Create a Render Web Service connected to this repository, using `backend` as its root directory.
2. Use the Blueprint build and start commands from `render.yaml` (`npm ci && npm run build`, then `node dist/app.js`).
3. Set `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `FRONTEND_URL`, `PAYSTACK_SECRET_KEY`, and `PAYSTACK_CALLBACK_URL` in Render.
4. Also set the Cloudinary credentials, `CDN_SIGNING_SECRET`, and `HLS_AES_128_MASTER_KEY`. Set `SENDGRID_API_KEY` and `FROM_EMAIL` if email is enabled. Set `SENDGRID_DATA_RESIDENCY=eu` only for an EU regional SendGrid subuser. `NODE_ENV=production` is configured in the Blueprint.
5. To route the frontend to Render, set `NEXT_PUBLIC_API_URL` to `https://<render-service-host>/api` and remove or disable the Netlify `/api/*` function redirect so requests are not intercepted by the function.

## Environment Variable Notes
- `DIRECT_URL` should be the database provider's direct, non-pooled connection string for Prisma migrations. Netlify Functions prefer `DATABASE_URL_POOLED` for runtime queries and fall back to `DATABASE_URL` when it is unset.
- `HLS_AES_128_MASTER_KEY` must be 32 hexadecimal characters (16 bytes) and match the key used to encrypt the HLS media.
- `CDN_SIGNING_SECRET` must be at least 32 characters.
- `PAYSTACK_PUBLIC_KEY` is not required by the current backend checkout flow. The frontend does not read `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`.
- `PORT` defaults to 5000 locally; Render supplies the service port.
- Production secrets belong in the hosting provider's environment settings, not committed files. Rotate any credential that has been exposed.

## Post-Deployment Checks
1. Confirm `/api/health` returns HTTP 200 and reports `database: connected`.
2. Register and log in; test the dashboard and profile with the production domain.
3. Confirm CORS and cookie-based authentication work from the exact public frontend origin.
4. Complete a controlled Paystack test transaction and confirm backend verification updates the subscription.
5. Test protected playback, including manifest and HLS key retrieval.
6. Check transactional email if enabled, then review provider logs and verify the rollback procedure.

## Local Verification
```powershell
cd backend
npm ci
npm run build
npm test -- --runInBand
```
