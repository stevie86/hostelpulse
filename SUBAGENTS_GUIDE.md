# Subagents for HostelPulse Development

This document outlines potential subagents that could help accelerate development of the HostelPulse hostel management system.

## 1. Code Quality Agent
**Purpose**: Automated testing, linting, and type checking
- Run `npm run build`, `npm run lint`, and tests automatically
- Perform code quality checks before commits
- Identify potential bugs or performance issues
- Suggest code improvements based on best practices

## 2. Documentation Agent  
**Purpose**: Automated documentation generation and maintenance
- Generate API documentation from TypeScript types
- Keep README files updated with new features
- Document database schema changes
- Maintain user guides and help documentation
- Generate inline code documentation

## 3. Testing Agent
**Purpose**: Automated testing execution and analysis
- Run unit, integration, and end-to-end tests
- Generate test reports and coverage analysis
- Identify failing tests and suggest fixes
- Create new tests for new features
- Monitor test performance and flaky tests

## 4. Database Agent
**Purpose**: Database schema management and optimization
- Generate new migration files
- Synchronize database schema between environments
- Optimize queries and suggest indexes
- Generate TypeScript types from database schema
- Validate RLS policies in Supabase

## 5. UI/UX Consistency Agent
**Purpose**: Maintain design system and UI consistency
- Ensure consistent component usage
- Validate color scheme and typography
- Check accessibility compliance
- Identify responsive design issues
- Maintain design tokens and style guides

## 6. Monitoring Agent
**Purpose**: Track application performance and user behavior
- Monitor application errors and performance
- Generate usage analytics
- Alert for system issues
- Track user engagement metrics
- Identify bottlenecks in user flows

## 7. Security Agent
**Purpose**: Security scanning and vulnerability assessment
- Check for security vulnerabilities in dependencies
- Validate RLS policy implementation
- Scan for common web vulnerabilities (XSS, CSRF, etc.)
- Ensure proper authentication/authorization
- Review environment variable handling

## 8. Deployment Agent
**Purpose**: Automated deployment and environment management
- Deploy to staging/production environments
- Validate environment configurations
- Roll back failed deployments
- Monitor deployment status
- Manage environment variables across deployments

## 9. Feature Suggestion Agent
**Purpose**: Analyze usage data and suggest new features
- Analyze user behavior patterns
- Suggest feature improvements based on usage
- Prioritize backlog items
- Identify missing functionality
- Generate feature request summaries

## 10. Migration Agent
**Purpose**: Handle data migrations and transformations
- Generate data migration scripts
- Handle user data transformations
- Manage schema updates with zero downtime
- Validate data integrity after migrations
- Coordinate with frontend changes

## Implementation Priority
1. **Code Quality Agent** - Essential for maintaining stability
2. **Testing Agent** - Critical for ensuring functionality
3. **Documentation Agent** - Important for maintainability  
4. **Database Agent** - Key for data integrity
5. **Deployment Agent** - Needed for reliable releases