# Deployment Guide

## Overview
You will deploy the frontend (Next.js) to **Netlify** and the backend (Express + MongoDB) to a host such as **Render** (or Railway/Heroku). The frontend will communicate with the backend via a public API URL set as `NEXT_PUBLIC_API_URL`.

---
## 1. Frontend (Netlify)

### Files Added
- `netlify.toml`: Configures build base directory (`web`) and Next.js plugin.
- `web/.env.example`: Lists public environment variables to set in Netlify.

### Netlify Setup Steps
1. Commit & push all changes.
2. Create a new site on Netlify and connect the Git repository.
3. Netlify will read `netlify.toml`. Confirm settings:
   - Base directory: `web`
   - Build command: `npm run build`
   - Publish directory: (handled by `@netlify/plugin-nextjs`; leave default if possible)
4. Set environment variables in Site Settings → Build & Deploy → Environment:
   - `NEXT_PUBLIC_API_URL=https://<your-backend-host>/api`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...` (or test key)
   - Any other `NEXT_PUBLIC_*` values required.
5. Trigger a deploy.
6. After deploy, test pages (Home, Login, Register, Dashboard, Profile, Subscribe).

### Cache & Build Optimization (Optional)
Add a `NODE_VERSION` env variable (e.g., 20) to ensure consistent Node.

---
## 2. Backend (Render Deployment Example)

### Provided File
- `render.yaml`: Blueprint for Render specifying build & start commands and env vars required.

### Render Setup Steps
1. Create a new Web Service in Render.
2. Point it to your repository.
3. Select root directory: `backend`.
4. Build command: `npm ci && npm run build`.
5. Start command: `node dist/app.js`.
6. Add environment variables:
   - `PORT=5000`
   - `MONGODB_URI=<your-managed-mongodb-uri>` (e.g., MongoDB Atlas connection string)
   - `JWT_SECRET=<secure-random-string>`
   - `FRONTEND_URL=https://<your-netlify-site>.netlify.app`
   - `STRIPE_SECRET_KEY=sk_live_...`
   - `STRIPE_WEBHOOK_SECRET=whsec_...` (if using webhooks)
   - `SENDGRID_API_KEY=...`
   - `FROM_EMAIL=noreply@yourdomain.com`
   - AWS keys if using S3 (or leave unset to fall back to local disk storage).
7. Deploy service.
8. Once live, note the Render URL and update Netlify `NEXT_PUBLIC_API_URL` accordingly.

### MongoDB
Use MongoDB Atlas (recommended):
- Create free cluster
- Whitelist Render IP or use 0.0.0.0/0 for development
- Create a database user and copy the connection string into `MONGODB_URI`

---
## 3. Stripe Integration (Optional Future Work)
Current subscription implementation uses placeholder `priceId` values. To integrate real Stripe billing:
1. Create Products & Prices in Stripe Dashboard.
2. Replace `price_basic_placeholder` and `price_premium_placeholder` with real Price IDs.
3. Optionally implement Stripe Checkout Session creation route in backend:
```ts
// Example (add to payments route or new route)
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

router.post('/create-checkout-session', auth, async (req, res) => {
  try {
    const { priceId } = req.body;
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: process.env.FRONTEND_URL + '/subscribe?status=success',
      cancel_url: process.env.FRONTEND_URL + '/subscribe?status=cancel',
      customer_email: (req.user as any)?.email,
    });
    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});
```
4. Add checkout button on `/subscribe` page to redirect user to `session.url`.
5. Configure webhook endpoint (`/api/payments/webhook`) for subscription lifecycle events.

---
## 4. Environment Variable Summary
Frontend (Netlify):
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

Backend (Render):
- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `FRONTEND_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET` (if using webhooks)
- `SENDGRID_API_KEY`
- `FROM_EMAIL`
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET_NAME` (if using S3)

---
## 5. Single Package Manager Recommendation
You have multiple lockfiles (pnpm-lock.yaml and package-lock.json). Choose **one** package manager for consistency:
- If using npm everywhere: remove `pnpm-lock.yaml`.
- If migrating to pnpm: add a `pnpm-workspace.yaml` and remove `package-lock.json`.
Netlify warning will disappear after cleanup.

---
## 6. Post-Deployment Smoke Tests
1. Visit Netlify site root `/` (static render).
2. Register a user and ensure API calls succeed (check network tab for 200 responses).
3. Login and access `/dashboard` and `/profile`.
4. Test upgrade flow on `/subscribe` (ensure subscription POST returns success; role changes).
5. Verify CORS: backend should allow Netlify domain (update `FRONTEND_URL`).
6. Confirm assets load quickly (check Lighthouse if desired).

---
## 7. Optional Hardening
- Add security headers via Netlify `_headers` file or `netlify.toml` [[headers]] blocks.
- Enable Stripe webhook signature verification.
- Rotate JWT secret regularly.
- Set `NODE_ENV=production` in both environments.
- Add rate limiter configuration overrides for production thresholds.

---
## 8. Rollback Strategy
- Keep previous successful deploy published (Netlify deploy history).
- For backend: maintain last working image (Render retains previous version). Redeploy by selecting prior build.

---
## 9. Monitoring & Logs
- Netlify: deploy logs + analytics (optional upgrade).
- Render: service logs; add a log drain to external provider (Logtail, Datadog) if needed.
- In-app: Winston already writing to `combined.log` & `error.log` locally; consider cloud storage or external logging in production.

---
## 10. Next Enhancements
- Convert subscription flow to real Stripe Checkout.
- Replace local upload fallback with S3 (ensure bucket & IAM user permissions).
- Add automated tests (Jest) for critical auth/subscription flows.
- Add CI (GitHub Actions) for lint + type-check before Netlify deploy.

---
## Quick Commands (Local Verification)
```powershell
# Frontend
cd web
npm install
npm run build

# Backend
cd ../backend
npm ci
npm run build
node dist/app.js
```

---
Happy deploying! Reach out for Stripe flow wiring or serverless migration when ready.
