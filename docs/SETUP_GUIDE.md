# Developer Setup Guide
Follow these steps to get the environment running locally.

## 1. Prerequisites
- **Runtime:** [Mise](https://mise.jdx.dev/) installed.
- **Database:** PostgreSQL running locally or accessible via URL.

## 2. Environment Initialization
Mise will automatically install the correct versions of Node and pnpm.
```bash
# Trust the configuration
mise trust
# Install tools
mise install
```

## 3. Database Setup
Create a `.env.local` based on `.env.example` and update `DATABASE_URL`.
```bash
# Push schema to local DB
mise exec -- npx prisma db push
# Seed initial data (Admin user & Demo property)
mise exec -- pnpm prisma db seed
```

## 4. Run Development Server
```bash
# Start server on port 4002
mise exec -- pnpm dev --port 4002
```

## 5. Testing & Verification
```bash
# Run unit tests
mise exec -- pnpm test
# Run linting
mise exec -- pnpm lint
# Run Prettier check
mise exec -- pnpm format:check
```

## 6. Authentication
- **Local:** `AUTH_SECRET` can be any random string.
- **Preview:** `AUTH_TRUST_HOST=true` must be set in Vercel settings.
