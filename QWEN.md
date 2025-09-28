# QWEN.md - Project Instructions and Guidelines for HostelPulse

## Project Overview
HostelPulse is a modern SaaS platform designed specifically for hostel owners to manage daily operations efficiently. Built with Next.js and Supabase, it focuses on streamlining hostel operations like arrivals/departures tracking, booking management, and guest database management.

## Project Structure
- `/components` - React UI components
- `/pages` - Next.js pages and API routes
- `/lib` - Core libraries and utilities (including Supabase client)
- `/supabase/migrations` - Database schema definitions
- `/public` - Static assets
- `/docs` - Documentation files
- `/changes` - Session logs and change records

## Development Workflow
1. Always work with local Supabase first (follow LOCAL_SUPABASE_SETUP.md)
2. Create a branch for each feature/bug fix
3. Follow the definition of done in docs/definition-of-done.md
4. Update session logs in the changes directory
5. Test locally before pushing to cloud

## Environment Configuration
- Use `.env.local` for local development settings
- Cloud deployments use environment variables configured in Vercel
- Keep sensitive keys secure and never commit to git

## Code Standards
- Use TypeScript consistently
- Follow existing code patterns and styling
- Write clear, concise comments for complex logic
- Maintain responsive UI components
- Implement proper error handling

## Database Schema
- Use the migration files in `supabase/migrations/` for schema changes
- Always enable RLS (Row Level Security) for multi-tenant isolation
- Include proper indexes for frequently queried fields
- Use consistent naming conventions (`owner_id` for user relationships)

## Testing Strategy
1. Unit tests for utility functions
2. Integration tests for API routes
3. End-to-end tests for critical user flows
4. Manual testing for UI components

## Deployment Process
1. Complete local testing with local Supabase
2. Push changes to GitHub
3. Verify Vercel preview deployment
4. Test on staging environment
5. Deploy to production

## Potential agno Use Cases for Enhancing User Experience

Based on the agno framework (https://github.com/agno-agi/agno), here are practical implementations for HostelPulse where agno could provide meaningful value:

### 1. Telegram Assistant for Hostel Owners
- **Description**: agno could serve as a Telegram bot that allows hostel owners to manage operations from their phone, including checking arrivals/departures, receiving booking notifications, and managing housekeeping tasks.
- **Implementation**: Create a Telegram bot that connects to HostelPulse API, allowing owners to ask "Who's checking in today?", "Room 101 status?", or "Mark room 205 as cleaned". This provides real mobility and remote access to hostel operations.

### 2. Conversational Guest Communication Hub
- **Description**: agno could serve as an AI concierge that handles common guest questions before, during, and after their stay through various channels (web chat, WhatsApp, Telegram), reducing direct communication with hostel staff.
- **Implementation**: Deploy agno across multiple communication channels to handle FAQ, check-in instructions, local recommendations, and basic requests without staff intervention.

### 3. Predictive Analytics Dashboard with Natural Language Queries
- **Description**: agno could enable hostel owners to ask questions about their business in plain English like "How busy will we be next weekend?" or "What's our occupancy trend for this month?" and get visual answers.
- **Implementation**: Add a chat interface to the dashboard allowing owners to get business insights through conversation rather than navigating complex reports.

### 4. Voice-Enabled Housekeeping Management
- **Description**: agno could allow housekeeping staff to update room statuses via voice commands on mobile devices, reducing the need for physical checklists or complex apps.
- **Implementation**: Create a mobile interface where staff can say "Room 101 is cleaned" or "Room 205 needs maintenance" and have the system update accordingly.

### 5. Smart Booking Assistant for Owners
- **Description**: agno could help hostel owners manage reservations more efficiently, suggesting optimal room assignments, alerting to potential conflicts, and automating routine booking tasks.
- **Implementation**: Integrate agno into the booking management interface to provide intelligent suggestions and automate routine operations.

### 6. Revenue Insights and Recommendations
- **Description**: agno could proactively analyze revenue patterns and suggest optimizations, like "You had 5 no-shows last week on Fridays. Consider implementing a prepayment policy for Friday arrivals."
- **Implementation**: Create an agno-powered advisory system that monitors business metrics and provides actionable recommendations in plain language.

### 7. Automated Guest Communication with Personalization
- **Description**: agno could manage automated, highly personalized communication with guests, adjusting tone and content based on guest preferences, previous stays, and cultural background.
- **Implementation**: Enhance the notification system with agno's ability to craft personalized messages rather than generic templates.

## When to Consider agno vs. Simpler Solutions

While agno provides powerful conversational AI capabilities, it may be overkill for simpler use cases. Consider these alternatives:

- **Basic notifications**: Use simple email/SMS instead of AI-powered messaging
- **Simple forms**: Use standard UI forms instead of conversational interfaces
- **Static reports**: Use pre-generated reports instead of on-demand AI analytics

## Telegram Assistant Specific Benefits

A Telegram assistant using agno could provide particular value by offering:
- Real-time notifications for new bookings and check-ins
- Quick status queries without logging into the web app
- Remote management capabilities for owners on the go
- Integration with other Telegram services and bots
- Familiar interface for staff who already use Telegram
- Direct communication with guests if they prefer Telegram

## Troubleshooting Common Issues
- **Build errors**: Check for TypeScript type mismatches and component prop issues
- **Supabase connection**: Verify environment variables and CORS settings
- **Authentication**: Check RLS policies and user roles
- **Performance**: Monitor API response times and database query performance

## Performance Optimization
- Implement proper database indexing
- Use efficient queries with appropriate select statements
- Optimize images and static assets
- Implement proper caching strategies

## Security Considerations
- Always use RLS for data isolation between users
- Validate and sanitize all user inputs
- Use environment variables for sensitive data
- Implement proper authentication and authorization
- Review and audit permissions regularly

## Monitoring and Analytics
- Track user engagement and feature usage
- Monitor error rates and performance metrics
- Set up alerts for critical issues
- Collect user feedback for improvement opportunities