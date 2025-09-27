# HostelPulse Deployment Guide

## Prerequisites

1. Node.js 16+
2. A Supabase account
3. A Vercel account

## Supabase Setup

1. Create a new Supabase project at https://app.supabase.io/
2. Get your project credentials:
   - Project URL (Settings > API)
   - anon key (Settings > API)
   - service role key (Settings > API)

3. Set up the database tables by running the SQL migration:
   ```sql
   -- Create tables
   CREATE TABLE IF NOT EXISTS guests (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     name TEXT NOT NULL,
     email TEXT NOT NULL,
     phone TEXT,
     notes TEXT,
     owner_id UUID NOT NULL
   );

   CREATE TABLE IF NOT EXISTS rooms (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     name TEXT NOT NULL,
     type TEXT NOT NULL CHECK (type IN ('private', 'dorm')),
     max_capacity INTEGER NOT NULL DEFAULT 1,
     owner_id UUID NOT NULL
   );

   CREATE TABLE IF NOT EXISTS beds (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     owner_id UUID NOT NULL
   );

   CREATE TABLE IF NOT EXISTS bookings (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
     room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
     bed_id UUID REFERENCES beds(id) ON DELETE CASCADE,
     check_in DATE NOT NULL,
     check_out DATE NOT NULL,
     status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
     notes TEXT,
     owner_id UUID NOT NULL,
     CONSTRAINT booking_accommodation CHECK (room_id IS NOT NULL OR bed_id IS NOT NULL)
   );

   -- Create indexes
   CREATE INDEX idx_guests_owner_id ON guests(owner_id);
   CREATE INDEX idx_rooms_owner_id ON rooms(owner_id);
   CREATE INDEX idx_beds_owner_id ON beds(owner_id);
   CREATE INDEX idx_beds_room_id ON beds(room_id);
   CREATE INDEX idx_bookings_owner_id ON bookings(owner_id);
   CREATE INDEX idx_bookings_guest_id ON bookings(guest_id);
   CREATE INDEX idx_bookings_room_id ON bookings(room_id);
   CREATE INDEX idx_bookings_bed_id ON bookings(bed_id);
   CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);

   -- Enable RLS
   ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
   ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
   ALTER TABLE beds ENABLE ROW LEVEL SECURITY;
   ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

   -- Create RLS policies
   CREATE POLICY "Users can only access their own guests" ON guests
     FOR ALL USING (auth.uid() = owner_id);

   CREATE POLICY "Users can only access their own rooms" ON rooms
     FOR ALL USING (auth.uid() = owner_id);

   CREATE POLICY "Users can only access their own beds" ON beds
     FOR ALL USING (auth.uid() = owner_id);

   CREATE POLICY "Users can only access their own bookings" ON bookings
     FOR ALL USING (auth.uid() = owner_id);
   ```

## Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Admin Configuration (Optional)
ADMIN_API_TOKEN=your-secret-admin-token
REQUIRE_API_AUTH=1  # Set to 0 to disable auth for MVP/testing

# CORS Configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Application Configuration
NEXT_PUBLIC_SITE_NAME=HostelPulse
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

## Vercel Deployment

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Connect your repository to Vercel:
   - Go to https://vercel.com/
   - Click "New Project"
   - Import your Git repository
3. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Add environment variables in the Vercel project settings:
   - Go to your project > Settings > Environment Variables
   - Add all the environment variables from your `.env.local` file
5. Deploy!

## Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env.local` file with your environment variables
4. Run the development server:
   ```
   npm run dev
   ```
5. Visit http://localhost:3000

## Database Schema

The application uses four main tables:

1. **guests** - Stores guest information
2. **rooms** - Stores room information (private or dorm type)
3. **beds** - Stores individual beds within dorm rooms
4. **bookings** - Stores booking information linking guests to rooms/beds

## Authentication

The application uses Supabase Auth for user authentication. Users can register, login, and reset their passwords through the built-in authentication pages.

## Data Import/Export

The application supports CSV import/export for guests and bookings:
- GET `/api/csv/guests` - Export guests as CSV
- POST `/api/csv/guests` - Import guests from CSV
- GET `/api/csv/bookings` - Export bookings as CSV
- POST `/api/csv/bookings` - Import bookings from CSV

## API Endpoints

### Guests
- GET `/api/guests` - Retrieve all guests
- POST `/api/guests` - Create a new guest
- PUT `/api/guests` - Update a guest

### Rooms
- GET `/api/rooms` - Retrieve all rooms
- POST `/api/rooms` - Create a new room

### Bookings
- GET `/api/bookings` - Retrieve all bookings
- POST `/api/bookings` - Create a new booking
- PUT `/api/bookings` - Update a booking

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Make sure your Supabase credentials are correct and that you've enabled email authentication in your Supabase project settings.
2. **Database Connection**: Verify that your database tables and RLS policies are set up correctly.
3. **Environment Variables**: Double-check that all required environment variables are set correctly in both your local environment and Vercel project settings.

### Getting Help

If you encounter issues with the deployment:
1. Check the Vercel deployment logs for error messages
2. Verify your Supabase project settings and credentials
3. Ensure all environment variables are correctly configured
4. Check that the database schema has been applied correctly