# Production Deployment Guide

## Architecture
The Next.js App Router serves the pages. Express handles the API and authentication routes; `web/functions/api.ts` wraps `backend/src/app.ts` with `serverless-http`, and Netlify rewrites `/api/*` to that function. Do not add duplicate Next.js auth route handlers. Netlify is the only hosting target; the API is not deployed anywhere else.

## Netlify Frontend
1. Connect the repository to Netlify; `netlify.toml` configures the Next.js plugin and build.
2. In Netlify **Site configuration > Environment variables**, set the production variables below. Use **Functions** scope for runtime secrets and **Builds** scope for `NEXT_PUBLIC_*` values (the latter are compiled into the frontend). Redeploy after changing any value.
   - `NODE_ENV=production`
   - `SITE_URL=https://charactermattersng.org` and `NEXT_PUBLIC_SITE_URL=https://charactermattersng.org`
   - `API_URL=https://charactermattersng.org/api` and `NEXT_PUBLIC_API_URL=/api`
   - `DATABASE_URL` and `DIRECT_URL` for PostgreSQL; use standard `postgresql://` URLs with the `@prisma/adapter-pg` runtime. Set `DATABASE_URL_POOLED` only if the provider supplies a separate pooled runtime connection.
   - `JWT_SECRET` with at least 32 random characters, preferably 64+ from a cryptographic generator; use the same secret for all API and email-background Functions
   - `JWT_EXPIRES_IN=7d`
   - `SENDGRID_API_KEY` with Mail Send permission and `SENDGRID_FROM_EMAIL` at an authenticated/verified domain
   - `PAYSTACK_SECRET_KEY` and `PAYSTACK_CALLBACK_URL`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`
   - `CDN_SIGNING_SECRET` and `HLS_AES_128_MASTER_KEY` for protected video playback
   - `SENDGRID_DATA_RESIDENCY=eu` only when using an EU regional SendGrid subuser; otherwise leave unset
   - `SENTRY_DSN` and `REDIS_URL` only if those services are configured
3. Confirm both `charactermattersng.org` and `www.charactermattersng.org` are assigned to this Netlify site, the preferred domain is `www.charactermattersng.org`, and Netlify has issued HTTPS certificates for both names. Redeploy and inspect Function logs after any code or environment change.

Signup creates the user and email-verification token in one Prisma transaction. Verification email delivery is handed to a Netlify Background Function so a SendGrid failure does not roll back signup or hold the response. Existing accounts are migrated as verified; new accounts must verify before login. The Netlify build already runs Prisma generation through the backend build.

## Hosting boundary
This auth deployment intentionally requires the same-origin `/api` path and uses a Netlify Background Function for verification email delivery. Do not point `NEXT_PUBLIC_API_URL` directly at a separate API host: that would bypass the same-origin cookie/CORS assumptions and leave email dispatch tied to Netlify. Moving the API off Netlify requires a coordinated cookie, CORS, and email-queue design change.

## Environment Variable Notes
- `DIRECT_URL` should be the database provider's direct, non-pooled connection string for Prisma migrations. Netlify Functions prefer `DATABASE_URL_POOLED` for runtime queries and fall back to `DATABASE_URL` when it is unset.
- `SENDGRID_FROM_EMAIL` must be a verified Single Sender or, preferably, an address on an authenticated domain. Use SendGrid's HTTP API integration; do not configure SMTP.
- `HLS_AES_128_MASTER_KEY` must be 32 hexadecimal characters (16 bytes) and match the key used to encrypt the HLS media.
- `CDN_SIGNING_SECRET` must be at least 32 characters.
- `PAYSTACK_PUBLIC_KEY` is not required by the current backend checkout flow. The frontend does not read `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`.
- `PORT` is only used by the local Express server (`npm run dev:backend`) and defaults to 5000; Netlify Functions ignore it.
- Production secrets belong in the hosting provider's environment settings, not committed files. Rotate any credential that has been exposed.
- Netlify's secret scan omits only `.netlify/.next/cache/**`, where Turbopack can snapshot build-time environment values; this cache is not deployed output. Do not broaden the omission to Functions or published assets. The application uses SendGrid directly through its HTTP API, independently of the optional Netlify Emails plugin.

## Post-Deployment Checks
1. Confirm `/api/health` returns HTTP 200 and reports `database: connected`, `configuration: valid`, and `localhostUrls: false`.
2. Run `npm run test:auth-smoke` with a dedicated verified test account supplied through `SMOKE_TEST_EMAIL` and `SMOKE_TEST_PASSWORD`; optionally set `SMOKE_TEST_SITE_URL` (default `https://www.charactermattersng.org`). The script creates one unique unverified test account; clean it up through the approved database process after testing.
3. Register a separate test account, verify the email, then log in. Check duplicate signup, invalid/expired verification, resend, wrong password, cookie flags, and dashboard access.
4. Confirm requests stay on `https://www.charactermattersng.org`; cookies should be `Secure`, `HttpOnly` for the access cookie, and `SameSite=Lax`.
5. Complete a controlled Paystack test transaction and test protected playback.
6. Inspect Netlify **Logs > Functions** for `api` and `send-verification-background`; check SendGrid activity and DNS authentication.

## DNS and migration
Public DNS currently delegates to Netlify DNS (`dns1.p07.nsone.net` through `dns4.p07.nsone.net`). The apex and `www` currently resolve to `63.176.8.218` and `35.157.26.135`. A live check returns an apex-to-`www` HTTPS redirect, redirects HTTP to HTTPS, and returns a successful HTTPS response for `www`. The apex has no visible SPF TXT or MX record; `_dmarc` already has `v=DMARC1; p=none;`. Manage DNS records in Netlify DNS while those nameservers remain authoritative; do not replace working website records without comparing them to the Netlify domain panel.

If SendGrid Domain Authentication is not set up, create it in [SendGrid > Settings > Sender Authentication > Authenticate Your Domain](https://www.twilio.com/docs/sendgrid/ui/account-and-settings/how-to-set-up-domain-authentication), selecting Netlify DNS. Add the exact generated CNAME records (including unique DKIM selectors and SendGrid targets) and any SPF/DMARC records shown there in Netlify DNS. Those CNAME targets are account-specific and cannot safely be guessed. The current apex lookup found no SPF TXT; if SendGrid requires a manual SPF record, add/merge `v=spf1 include:sendgrid.net ~all` at `@` (include any other legitimate senders in the same SPF record). Do not create a second SPF record. Keep the existing `_dmarc` record; adjust it only after reviewing current mail senders and monitoring needs.

For external DNS, Netlify's current recommended apex target is an ALIAS/ANAME/flattened CNAME to `apex-loadbalancer.netlify.com`; the fallback is an A record to `75.2.60.5`. For `www`, use the site-specific CNAME target shown in Netlify's domain panel. Your live DNS is already delegated to Netlify DNS and serving successfully, so verify rather than replace its active records. See [Netlify external DNS setup](https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/).

### Baseline migration (one-time)
`20260101000000_init` creates the base schema (all tables except the email-verification additions); `20261002000000_add_email_verification` then adds `users.emailVerified` and `email_verification_tokens`. Before this baseline existed, `migrate deploy` could not build the schema on an empty database. Pick the case that matches the production database (check with `npx prisma7 migrate status --config prisma7.config.ts`, or list tables in the database console):

1. **Empty database (no `users` table):** run `npm --prefix backend run prisma:deploy`. Both migrations apply.
2. **Tables exist (created earlier with `db push`) but there is no `_prisma_migrations` history:** mark the baseline as already applied, then deploy so only the email-verification migration runs:
   ```powershell
   npx prisma7 migrate resolve --applied 20260101000000_init --config prisma7.config.ts
   npm --prefix backend run prisma:deploy
   ```
   If `users.emailVerified` and `email_verification_tokens` already exist too, also resolve `20261002000000_add_email_verification` as applied instead of deploying it.
3. **`_prisma_migrations` already lists `20261002000000_add_email_verification`:** resolve the baseline as applied (case 2, first command only).

Set `DIRECT_URL` (or `DATABASE_URL`) in your shell to the production direct connection string before running these; `prisma7.config.ts` reads it. After deploying, `POST /api/auth/login` with an unknown email must return 400 "Invalid credentials", not 500.

The root `package.json` overrides `effect` to v4 for the Prisma 8 tooling; it pins `@prisma/config@7.10.0` back to `effect@3.20.0` because the Prisma 7 CLI cannot load `prisma7.config.ts` otherwise. Keep that nested override while both Prisma versions are installed.

For Prisma, inspect the migration SQL and check the target/staging database first. Then run from the repository root:

```powershell
npm ci --legacy-peer-deps --include=dev --workspaces=true --include-workspace-root
npm --prefix backend run prisma:generate
npm --prefix backend run prisma:deploy
```

`prisma:deploy` runs `prisma7 migrate deploy` using `DIRECT_URL` (or `DATABASE_URL` as a fallback). Apply the migration on staging before production and verify the `users.emailVerified` column and `email_verification_tokens` table before deploying code that uses them. Do not run production migrations until you have verified the backup and current schema.

## Local Verification
```powershell
cd backend
npm ci
npm run build
npm test -- --runInBand
```
