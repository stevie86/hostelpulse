# HostelPulse Deployment Guide

## Overview
This guide provides step-by-step instructions to deploy the HostelPulse application to Vercel with a Supabase backend.

## Prerequisites
- A Vercel account (sign up at https://vercel.com/signup)
- A Supabase account (sign up at https://supabase.com/)
- Git repository with the HostelPulse codebase

## Step 1: Set up Supabase Backend

1. Create a new Supabase project at [app.supabase.com](https://app.supabase.com/)
2. Note down your Project URL and Project API keys from the Settings > API page
3. Apply the database schema by going to SQL Editor and running the contents of `supabase/migrations/001_initial_schema.sql`
4. In the Authentication settings, ensure email authentication is enabled

## Step 2: Get Environment Variables from Supabase

1. In your Supabase dashboard, go to Settings > API
2. Copy your:
   - Project URL (for NEXT_PUBLIC_SUPABASE_URL)
   - anon key (for NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - service role key (for SUPABASE_SERVICE_ROLE_KEY)

## Step 3: Configure Vercel Deployment

1. Push all changes to your GitHub repository:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. Go to [vercel.com](https://vercel.com/) and import your GitHub repository
3. During project setup, Vercel should automatically detect it's a Next.js project
4. In the Environment Variables section, add the following variables:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
   - `NEXT_PUBLIC_SITE_NAME` - Name for your site (e.g., "HostelPulse")
   - `NEXT_PUBLIC_BASE_URL` - The URL of your deployed application (e.g., "https://your-app.vercel.app")

## Step 4: Deploy

1. After configuring environment variables, click "Deploy"
2. Vercel will build and deploy your application
3. The deployment URL will be available in the deployment logs

## Step 5: Verify Deployment

1. Once deployed, access your application at the provided URL
2. Test the following functionality:
   - User registration and login
   - Creating rooms, guests, and bookings
   - Payment processing
   - Housekeeping task management
   - Notification system

## Production Considerations

### Security
- Ensure the SUPABASE_SERVICE_ROLE_KEY is kept secret and not exposed in client-side code
- All Supabase RLS policies should be properly configured to ensure data isolation
- Use HTTPS for all production deployments

### Performance
- Implement proper caching strategies for frequently accessed data
- Use Supabase database indexes effectively
- Optimize database queries in API routes

### Monitoring
- Implement error tracking (e.g., Sentry)
- Set up performance monitoring
- Monitor database performance and optimize queries as needed

## Troubleshooting

### Common Issues
1. **Authentication Issues**: Verify that the Supabase URL and keys are correctly set as environment variables
2. **Database Errors**: Check that the schema was properly applied to your Supabase project
3. **Build Failures**: Ensure all required environment variables are set in Vercel

### Debugging Tips
1. Check Vercel deployment logs for specific error details
2. Verify CORS settings in your Supabase dashboard match your deployed domain
3. Use browser developer tools to inspect network requests and errors

## Rollback Procedure
If issues occur after deployment:
1. In Vercel dashboard, navigate to your project
2. Go to Deployments and select a previous stable deployment
3. Click "Promote" to revert to that version

## Next Steps: Potential agno Integration

After successful deployment, consider implementing an agno framework integration to enhance the user experience:

1. **Telegram Assistant**: Create a Telegram bot for remote hostel management
2. **Conversational Guest Communication**: Implement chat interfaces to handle guest questions
3. **Natural Language Analytics**: Allow owners to ask questions about their business in plain English

For agno integration, you would need to set up a separate endpoint that interfaces with the agno framework and connects it to your existing API endpoints.