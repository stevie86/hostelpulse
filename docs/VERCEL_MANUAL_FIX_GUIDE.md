# Vercel Production Fix Guide

**Date:** 2025-12-21
**Problem:** Login fails on production due to misconfigured environment variables

---

## Quick Checklist

- [ ] Step 1: Access Vercel Project Settings
- [ ] Step 2: Configure AUTH_SECRET
- [ ] Step 3: Configure AUTH_URL / NEXTAUTH_URL
- [ ] Step 4: Verify DATABASE_URL
- [ ] Step 5: Seed the Production Database
- [ ] Step 6: Redeploy
- [ ] Step 7: Verify Login Works

---

## Step 1: Access Vercel Project Settings

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your **hostelpulse** project (likely `hostelpulse-ng`)
3. Click **Settings** tab (top nav)
4. Click **Environment Variables** (left sidebar)

---

## Step 2: Configure AUTH_SECRET

This is the encryption key for NextAuth.js sessions.

### Generate a New Secret (if needed)

Run this in your terminal:
```bash
openssl rand -base64 32
```

### Add to Vercel

| Field | Value |
|-------|-------|
| **Key** | `AUTH_SECRET` |
| **Value** | Your generated 32+ character string |
| **Environments** | Check **Production**, **Preview**, **Development** |

Also add the same value for legacy compatibility:

| Field | Value |
|-------|-------|
| **Key** | `NEXTAUTH_SECRET` |
| **Value** | Same as AUTH_SECRET |
| **Environments** | Check **Production**, **Preview**, **Development** |

---

## Step 3: Configure AUTH_URL / NEXTAUTH_URL

This tells NextAuth where your app is hosted.

### Add AUTH_URL

| Field | Value |
|-------|-------|
| **Key** | `AUTH_URL` |
| **Value** | `https://hostelpulse-ng.vercel.app` (your actual production URL) |
| **Environments** | Check **Production** only |

### Add NEXTAUTH_URL

| Field | Value |
|-------|-------|
| **Key** | `NEXTAUTH_URL` |
| **Value** | `https://hostelpulse-ng.vercel.app` (same URL) |
| **Environments** | Check **Production** only |

> **Note:** For Preview deployments, Vercel automatically sets `VERCEL_URL`. You can leave these unset for Preview, or use `https://${VERCEL_URL}` pattern.

---

## Step 4: Verify DATABASE_URL

Check that `DATABASE_URL` is set and points to your Vercel Postgres (Neon) instance.

1. In Vercel, go to **Storage** tab
2. Click on your Postgres database
3. Copy the connection string from **Connection String** > **Pooling** (recommended) or **Direct**
4. Go back to **Settings** > **Environment Variables**
5. Verify `DATABASE_URL` matches the copied value

The format should look like:
```
postgres://default:PASSWORD@ep-something-123456.us-east-1.aws.neon.tech/verceldb?sslmode=require
```

---

## Step 5: Seed the Production Database

Your production database is empty - it needs the admin user and demo data.

### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI if needed
pnpm add -g vercel

# Link to your project (if not already linked)
vercel link

# Pull production env vars to local .env
vercel env pull .env.production.local

# Run seed with production database
DATABASE_URL="your-production-database-url" npx prisma db seed
```

### Option B: Using Prisma Studio Remotely

```bash
# Set production DATABASE_URL temporarily
export DATABASE_URL="postgres://default:PASSWORD@ep-something.neon.tech/verceldb?sslmode=require"

# Push schema (if not already done)
npx prisma db push

# Seed the database
npx prisma db seed
```

### Option C: Direct SQL via Vercel Dashboard

1. Go to **Storage** > Your Postgres DB > **Data** tab
2. Use the SQL editor to insert the admin user manually:

```sql
-- Create admin user (password: admin123 - change in production!)
INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@hostelpulse.com',
  'Admin User',
  '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQlPJIQmPBNqJrEjG.PWXXX0XXXX', -- bcrypt hash
  'admin',
  NOW(),
  NOW()
);
```

> **Important:** You'll need to generate a proper bcrypt hash for the password. The seed script does this automatically, so Option A or B is preferred.

---

## Step 6: Redeploy

After setting all environment variables:

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **...** menu > **Redeploy**
4. Select **Redeploy with existing Build Cache** (faster) or full rebuild
5. Wait for deployment to complete

---

## Step 7: Verify Login Works

1. Go to your production URL: `https://hostelpulse-ng.vercel.app`
2. Click Login
3. Enter credentials:
   - Email: `admin@hostelpulse.com`
   - Password: `admin123` (or whatever your seed uses)
4. You should be redirected to the dashboard

---

## Troubleshooting

### Still getting "Invalid credentials"?
- Database wasn't seeded properly
- Run `prisma db seed` against production DATABASE_URL

### Getting "JWTSessionError"?
- AUTH_SECRET is missing or different between environments
- Ensure AUTH_SECRET and NEXTAUTH_SECRET have identical values

### Redirect loop after login?
- AUTH_URL doesn't match the actual domain
- Check for trailing slashes (should be `https://domain.com` not `https://domain.com/`)

### "User not found" error?
- Database is empty
- Run the seed script (Step 5)

### Check Vercel Function Logs

1. Go to **Deployments** > Latest deployment
2. Click **Functions** tab
3. Look for `/api/auth/[...nextauth]` or `/api/auth/callback/credentials`
4. Check logs for specific error messages

---

## Environment Variables Summary

| Variable | Production Value | Required |
|----------|-----------------|----------|
| `DATABASE_URL` | Your Neon/Postgres connection string | Yes |
| `AUTH_SECRET` | 32+ char random string | Yes |
| `NEXTAUTH_SECRET` | Same as AUTH_SECRET | Yes (legacy) |
| `AUTH_URL` | `https://your-domain.vercel.app` | Yes |
| `NEXTAUTH_URL` | Same as AUTH_URL | Yes (legacy) |

---

*Guide created 2025-12-21*
