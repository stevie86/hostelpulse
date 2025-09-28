# Local Supabase Development Setup for HostelPulse

## Introduction
This guide explains how to set up and use a local Supabase instance for developing HostelPulse. This approach allows for faster development cycles and better debugging before deploying to production.

## Prerequisites
- Node.js 16+ installed
- Docker and Docker Compose installed
- Supabase CLI installed: `npm install -g supabase`

## Setting Up Local Supabase

### 1. Initialize Supabase in Your Project
```bash
cd /home/user/webdev/hostelpulse
supabase init
```

### 2. Start Local Supabase Stack
```bash
supabase start
```

This command will:
- Start PostgreSQL database
- Start Supabase Auth service
- Start other Supabase services
- Set up the database schema from your migrations

### 3. Apply Database Migrations
Your schema is already defined in `/supabase/migrations/001_initial_schema.sql`. When you run `supabase start`, it will apply this migration automatically.

## Configuration for Local Development

### 1. Environment Variables for Local Supabase
Create a `.env.local` file in your project root with local Supabase settings:

```env
# Local Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-key

# Application Configuration
NEXT_PUBLIC_SITE_NAME=HostelPulse
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Development Settings
REQUIRE_API_AUTH=0  # Set to 0 for easier local development, 1 for production
```

Note: The actual keys will be provided by the Supabase CLI when you start the local stack.

### 2. Run the Application Locally
```bash
# Terminal 1: Start Supabase
supabase start

# Terminal 2: Start Next.js app
npm run dev
```

## Schema Management

### Creating New Migrations
```bash
supabase migration new create-table-for-feature-x
```

### Applying Local Changes
```bash
# Apply all pending migrations
supabase db push

# Or migrate only schema changes
supabase migration up
```

### Seeding Local Database
You can create seed data for development:
```bash
supabase db seed
```

## Testing Local Supabase

### 1. Verify Database Schema
- Access the Supabase Studio locally at `http://localhost:54323`
- Confirm all tables exist: guests, rooms, beds, bookings, housekeeping_tasks, payments, notifications
- Verify RLS policies are set up correctly
- Check that indexes exist as defined in your schema

### 2. Test Authentication
- Register a new user via the app
- Verify that user can create bookings and guests
- Confirm data isolation between users (RLS working correctly)

### 3. Test API Endpoints
- Test all CRUD operations for each entity
- Verify booking conflict detection works
- Confirm CSV import/export functionality

## Switching Between Local and Cloud Supabase

### For Local Development
Use the `.env.local` file with local Supabase configuration

### For Production
Use a different environment configuration with cloud Supabase credentials

## Useful Commands

```bash
# Start local Supabase
supabase start

# Stop local Supabase
supabase stop

# Reset local database (DANGER: This will delete all data)
supabase db reset

# View local database logs
supabase logs database

# Connect to local database with psql
supabase db shell

# Generate TypeScript types from local database
supabase gen types typescript --project-id your-project-id > types/supabase.ts
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Supabase uses several ports; ensure they're available
2. **Docker resources**: Ensure Docker has sufficient memory allocated
3. **Migration errors**: Check migration file syntax and order

### Debugging Tips

1. Use Supabase Studio (`http://localhost:54323`) to inspect the database
2. Check logs with `supabase logs`
3. Use `supabase db shell` for direct database access

## Before Moving to Cloud Supabase

### 1. Verify Everything Works Locally
- [x] Local Supabase stack started successfully on ports 54321-54324
- [x] Database migrations applied cleanly (001_initial_schema.sql with all tables)
- [x] All required tables exist: guests, rooms, beds, bookings, housekeeping_tasks, payments, notifications
- [x] RLS policies set up for all tables
- [ ] All API endpoints work correctly (needs testing via application)
- [ ] Authentication flows work (needs testing via application)
- [ ] RLS policies enforce data isolation (needs testing via application)
- [ ] All core features function as expected (needs testing via application)

### 2. Prepare for Cloud Migration
- [ ] Document any differences between local and cloud schema
- [ ] Ensure environment variables are properly configured for production
- [ ] Test backup/restore procedures

## Next Steps
1. Set up local Supabase instance following this guide
2. Verify all HostelPulse features work correctly with local setup
3. Address any issues found during local testing
4. Once fully validated locally, proceed with cloud Supabase setup