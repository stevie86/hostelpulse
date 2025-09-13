# Environment Setup Guide - P1 Security

## Required Environment Variables

### Supabase Configuration
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Security Configuration (P1)
```bash
# Enable API authentication (set to 1 for production)
REQUIRE_API_AUTH=1

# Admin token for CI/emergency access only
ADMIN_API_TOKEN=your_secure_admin_token_here

# CORS allowed origins (comma-separated)
ALLOWED_ORIGINS=https://your-domain.com,https://your-preview.vercel.app
```

### Additional Configuration
```bash
SENDGRID_API_KEY=your_sendgrid_api_key
NEXT_PUBLIC_SITE_NAME=HostelPulse
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Setup Instructions

### Local Development
1. Copy the variables above to `.env.local`
2. Set `REQUIRE_API_AUTH=0` for easier development
3. Fill in your Supabase project credentials

### Vercel Preview Environment
1. Add all environment variables in Vercel dashboard
2. Set `REQUIRE_API_AUTH=1` to test security
3. Set `ALLOWED_ORIGINS` to include your preview URLs
4. Generate a strong `ADMIN_API_TOKEN`

### Production Environment
1. Ensure `REQUIRE_API_AUTH=1`
2. Use strong, unique `ADMIN_API_TOKEN`
3. Limit `ALLOWED_ORIGINS` to production domains only
4. Enable all security headers

## Security Features Enabled

### API Authentication
- JWT token validation on all API endpoints
- Admin token fallback for CI/emergency access
- 401 responses for unauthorized requests

### CORS Protection
- Origin validation in production
- Security headers applied to all responses
- Preflight request handling

### Row Level Security (RLS)
- Users can only access their own data
- Database-level enforcement
- Automatic owner isolation

## Testing Security

### Test Authentication
```bash
# Should return 401 without token
curl https://your-app.vercel.app/api/guests

# Should work with valid JWT
curl -H "Authorization: Bearer <jwt_token>" https://your-app.vercel.app/api/guests

# Should work with admin token
curl -H "x-admin-token: <admin_token>" https://your-app.vercel.app/api/guests
```

### Test CORS
```bash
# Check security headers
curl -I https://your-app.vercel.app/api/guests
```

### Test RLS
1. Create two users
2. Create data as user A
3. Try to access as user B (should be blocked)
