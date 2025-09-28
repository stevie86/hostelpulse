# HostelPulse MVP Deployment Checklist

## Pre-Deployment Tasks

### 1. Supabase Setup
- [ ] Create Supabase account and new project
- [ ] Get Project URL and API keys from Settings > API
- [ ] Apply database schema from `/supabase/migrations/001_initial_schema.sql`:
  ```sql
  -- Copy and paste entire schema file content to SQL Editor in Supabase Dashboard
  ```
- [ ] Enable email authentication in Authentication > Settings
- [ ] Set up email templates in Authentication > Templates (optional but recommended)

### 2. Environment Variables Setup
- [ ] Create `.env.local` file in project root with:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Application Configuration
NEXT_PUBLIC_SITE_NAME=HostelPulse
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### 3. Local Testing
- [ ] Run `npm install` to install dependencies
- [ ] Run `npm run dev` and test all functionality locally
- [ ] Test user registration and login
- [ ] Test creating guests, rooms, and bookings
- [ ] Verify booking conflict detection works properly

### 4. Vercel Deployment Preparation
- [ ] Push all code to a GitHub/GitLab/Bitbucket repository
- [ ] Create Vercel account
- [ ] Install Vercel CLI (optional): `npm i -g vercel`

### 5. Vercel Deployment Process
- [ ] Import your repository in Vercel dashboard
- [ ] Configure the project:
  - Framework Preset: Next.js (should auto-detect)
  - Build Command: `npm run build`
  - Output Directory: `.next` (should auto-detect)
- [ ] Add environment variables in Vercel project settings (Settings > Environment Variables):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_SITE_NAME`
  - `NEXT_PUBLIC_BASE_URL`
- [ ] Deploy and test the live application

## Post-Deployment Tasks

### 6. Verification & Testing
- [ ] Verify authentication works on deployed site
- [ ] Test creating a new account and logging in
- [ ] Test guest/room/booking functionality
- [ ] Verify booking conflict detection works in production
- [ ] Check that dashboard displays data correctly

### 7. Production Considerations
- [ ] Set up custom domain in Vercel (if needed)
- [ ] Configure email delivery settings in Supabase
- [ ] Set up monitoring/error tracking
- [ ] Implement proper error handling for production
- [ ] Set up analytics (optional)

## Troubleshooting

### Common Issues:
1. **Authentication errors**: Check Supabase auth settings and CORS configuration
2. **Database errors**: Verify schema has been properly applied
3. **Build errors**: Ensure all environment variables are set correctly
4. **API errors**: Check that SERVICE_ROLE_KEY has proper permissions

### Supabase Settings to Verify:
- Authentication: Email sign-ups enabled
- Database: RLS policies applied correctly
- Security: Proper CORS settings for your domain