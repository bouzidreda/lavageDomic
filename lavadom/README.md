# Lavadom

Lavadom is a full-stack platform for on-demand washing services in the Moroccan market.

This monorepo contains:
- `apps/web`: React + Vite frontend (client/provider/admin flows)
- `services/api`: Node.js + Express backend with Oracle DB

## Tech Stack
- Frontend: React 18, TypeScript, Vite, React Router, TanStack Query
- Backend: Node.js, Express, TypeScript, Zod validation
- Database: Oracle (schema + seed SQL included)
- Auth: JWT access/refresh tokens
- Payments: PayPal-ready service integration
- Provider verification: KYC document workflow (review/approve/reject)

## Monorepo Structure
- `apps/web` - Web application
- `services/api` - REST API service
- `services/api/src/db/schema.sql` - Oracle schema
- `services/api/src/db/seed.sql` - Seed data

## Prerequisites
- Node.js 18+
- pnpm 9+
- Oracle database (XE or compatible)

## Environment Variables
Create `.env` in repo root (or copy from `.env.example`).

### Minimum required
- `WEB_PORT=5173`
- `API_PORT=4000`
- `ORACLE_USER=APPUSER`
- `ORACLE_PASSWORD=APP_PASS`
- `ORACLE_CONNECT_STRING=localhost/XEPDB1`
- `JWT_ACCESS_SECRET=change_me_access`
- `JWT_REFRESH_SECRET=change_me_refresh`
- `JWT_ACCESS_TTL_SEC=900`
- `JWT_REFRESH_TTL_SEC=2592000`
- `BCRYPT_COST=12`
- `CORS_ORIGIN=http://localhost:5173`
- `RATE_LIMIT_PER_MIN=120`

### Optional but supported
- `APP_BASE_URL=http://localhost:5173`
- `PASSWORD_RESET_TTL_MIN=30`
- `PLATFORM_COMMISSION_RATE=0.15`
- `SMTP_HOST=`
- `SMTP_PORT=`
- `SMTP_USER=`
- `SMTP_PASS=`
- `SMTP_FROM=no-reply@lavadom.ma`
- `SMS_FROM=Lavadom`
- `DOCS_ENCRYPTION_KEY=change-me-in-production`
- `PAYPAL_CLIENT_ID=`
- `PAYPAL_CLIENT_SECRET=`
- `PAYPAL_API_BASE=https://api-m.sandbox.paypal.com`

Frontend API base (in `apps/web/.env` if needed):
- `VITE_API_BASE=http://localhost:4000`

## Installation
```bash
pnpm install
```

## Database Setup (Oracle)
Run SQL scripts in this order:
1. `services/api/src/db/schema.sql`
2. `services/api/src/db/seed.sql`

## Run in Development
From repo root:
```bash
pnpm dev
```

This runs both:
- Web: `http://localhost:5173`
- API: `http://localhost:4000`

## Build
```bash
pnpm build
```

## Typecheck
```bash
pnpm typecheck
```

## Lint
```bash
pnpm lint
```

## API Overview
Base path: `/v1`

Main modules:
- `/v1/health`
- `/v1/auth`
- `/v1/users`
- `/v1/providers`
- `/v1/bookings`
- `/v1/reviews`
- `/v1/admin`

## Implemented Product Features
- Multi-role auth: client, provider, admin
- Provider KYC submission and admin review workflow
- Provider discovery with filters and geolocation
- Booking lifecycle management
- PayPal-ready payment intent/capture flow
- Password reset flow
- Admin dashboard (users, provider verification, commissions, CMS entries)
- Multilingual web UI: French, English, Arabic (RTL)
- Responsive marketing homepage + interactive mega-menu

## Notes
- Oracle is the supported DB for this project.
- Backend is Node.js/Express (not Laravel).
- Payment and maps integrations are wired to be deployment-ready with environment credentials.

## Deployment
Typical production deployment:
1. Set production environment variables.
2. Provision Oracle DB and run schema/seed.
3. Build both apps (`pnpm build`).
4. Serve `apps/web/dist` via static hosting/CDN.
5. Run `services/api` behind a process manager and reverse proxy.

## License
Internal / educational project unless otherwise specified by repository owner.
