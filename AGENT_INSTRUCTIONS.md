# Agent Instructions for HostelPulse Project

## Change Logging Protocol
- All development activities and modifications should be logged to the `changes` directory
- Each session should be recorded in a dated markdown file (e.g., `2025-09-28-session.md`)
- Include details of what was changed, why it was changed, and any impact on the system

## Project Context
- **Project**: HostelPulse - A hostel management SaaS platform
- **Technology Stack**: Next.js, Supabase, TypeScript
- **Purpose**: Help hostel owners manage daily operations with real-time arrivals/departures tracking, booking management, and guest database

## Key Directories
- `/changes` - Session logs and change records
- `/components` - React UI components
- `/pages` - Next.js pages and API routes
- `/lib` - Core libraries and utilities (including Supabase client)
- `/supabase/migrations` - Database schema definitions
- `/public` - Static assets

## Important Configuration
- Environment variables in `.env.local` (not committed to repo)
- Database schema in `supabase/migrations/001_initial_schema.sql`
- Supabase client configuration in `lib/supabase.ts`
- API authentication in `lib/apiAuth.ts`

## Critical Features
- User authentication with Supabase Auth
- Room and guest management
- Booking system with conflict detection
- Housekeeping task management
- Real-time dashboard for arrivals/departures
- CSV import/export functionality

## Deployment Notes
- Deployed on Vercel with Supabase backend
- Uses RLS (Row Level Security) for data isolation
- Responsive design for mobile and desktop operations