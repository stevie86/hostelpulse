# Vercel Deployment Guide

This document provides the environment variable configuration required for Vercel deployments (Production and Preview).

## Required Environment Variables

### 1. Authentication Variables

| Variable | Environment | Required | Description |
|----------|-------------|----------|-------------|
| `AUTH_SECRET` | Production, Preview | **Yes** | Secret key for JWT encryption. Must be at least 32 characters. Generate with: `openssl rand -base64 32` |
| `AUTH_URL` | Production | **Yes** | Full URL of the production deployment (e.g., `https://hostelpulse-ng.vercel.app`) |
| `AUTH_TRUST_HOST` | Preview | **Yes** | Set to `true` for preview deployments to allow dynamic hostnames |

**Note:** NextAuth v5 uses `AUTH_*` environment variables. The legacy `NEXTAUTH_*` prefix is also supported for backwards compatibility.

### 2. Database Variables

| Variable | Environment | Required | Description |
|----------|-------------|----------|-------------|
| `DATABASE_URL` | Production, Preview | **Yes** | PostgreSQL connection string. For Vercel Postgres, use the provided connection string |
| `POSTGRES_PRISMA_URL` | Production, Preview | No | Vercel Postgres pooled connection (optional, for connection pooling) |
| `POSTGRES_URL_NON_POOLING` | Production, Preview | No | Vercel Postgres direct connection (for migrations) |

### 3. Application Variables

| Variable | Environment | Required | Description |
|----------|-------------|----------|-------------|
| `APP_URL` | All | No | Application base URL (defaults to `VERCEL_URL` on Vercel) |
| `NODE_ENV` | All | Auto | Set automatically by Vercel |

## Setup Steps

### Step 1: Create a Vercel Postgres Database

1. Go to your Vercel project dashboard
2. Navigate to **Storage** > **Create** > **Postgres**
3. Name your database (e.g., `hostelpulse-db`)
4. Click **Create**
5. The `DATABASE_URL` will be automatically added to your environment variables

### Step 2: Configure Authentication Secrets

#### Generate a new AUTH_SECRET:
```bash
openssl rand -base64 32
```

#### Set in Vercel Dashboard:
1. Go to **Settings** > **Environment Variables**
2. Add `AUTH_SECRET` with your generated value
3. **Scope:** Production AND Preview
4. Add `AUTH_URL` with your production URL (e.g., `https://hostelpulse-ng.vercel.app`)
5. **Scope:** Production only
6. Add `AUTH_TRUST_HOST` with value `true`
7. **Scope:** Preview only

### Step 3: Run Database Migrations

After deployment, you need to push the Prisma schema and seed the database:

#### Option A: Via Vercel CLI
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Link to your project
vercel link

# Run migrations using production environment
vercel env pull .env.production.local
DATABASE_URL=$(grep DATABASE_URL .env.production.local | cut -d= -f2-) npx prisma db push
DATABASE_URL=$(grep DATABASE_URL .env.production.local | cut -d= -f2-) npx prisma db seed
```

#### Option B: Via Vercel Dashboard (One-time setup script)
Add a build hook or use the Vercel CLI to run:
```bash
npx prisma db push && npx prisma db seed
```

### Step 4: Verify Deployment

1. Navigate to your production URL
2. Sign in with the seeded admin credentials:
   - Email: `admin@hostelpulse.com`
   - Password: `password`
3. Verify you reach the dashboard without redirect loops

## Troubleshooting

### "User not found" error
- **Cause:** Database is not seeded
- **Fix:** Run `npx prisma db seed` against the production database

### JWT Session Errors / Redirect Loops
- **Cause:** `AUTH_SECRET` mismatch or missing
- **Fix:** Ensure `AUTH_SECRET` is set in both Production and Preview environments with the same value

### Database Connection Errors
- **Cause:** Invalid `DATABASE_URL` or database not accessible
- **Fix:**
  1. Verify the Vercel Postgres database exists
  2. Check the connection string format
  3. Ensure SSL is enabled (`?sslmode=require` in URL)

### "AUTH_TRUST_HOST" Errors on Preview
- **Cause:** Missing `AUTH_TRUST_HOST` environment variable
- **Fix:** Add `AUTH_TRUST_HOST=true` to Preview environment

## Environment Variable Checklist

Before deploying to production, verify:

- [ ] `AUTH_SECRET` is set (Production + Preview)
- [ ] `AUTH_URL` is set to production URL (Production only)
- [ ] `AUTH_TRUST_HOST=true` is set (Preview only)
- [ ] `DATABASE_URL` is set and database is accessible
- [ ] Database schema is pushed (`prisma db push`)
- [ ] Database is seeded with admin user (`prisma db seed`)

## Security Notes

1. **Never commit secrets** to version control
2. **Rotate `AUTH_SECRET`** periodically (this will invalidate existing sessions)
3. **Use different secrets** for Production vs Development
4. **Logs:** The application redacts `DATABASE_URL` in non-production logs to prevent credential exposure
