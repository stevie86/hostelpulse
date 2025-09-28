# Debugging Plan for HostelPulse API Issues

## Current Status
- ✅ Frontend application loads correctly
- ✅ Local Supabase instance is running
- ❌ API endpoints return 500 Internal Server Errors
- ❌ Unable to see detailed error logs

## Immediate Next Steps to Unblock Progress

### 1. Check Detailed Error Logs
```bash
# Kill existing Next.js processes
pkill -f "next dev"

# Start dev server with detailed logging
cd /home/user/webdev/hostelpulse
npm run dev
```

### 2. Verify Supabase Configuration
Check that the environment variables in `.env.local` match the local Supabase instance:
```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=[correct anon key from supabase status]
SUPABASE_SERVICE_ROLE_KEY=[correct service role key from supabase status]
```

Get the correct keys with:
```bash
cd /home/user/webdev/hostelpulse
supabase status
```

### 3. Test API Endpoints Directly
Create a test script to isolate the issue:

```javascript
// test-api-debug.js
const { createClient } = require('@supabase/supabase-js');

// Use configuration from .env.local
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'your-anon-key-from-supabase-status';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAPI() {
  console.log('1. Testing Supabase connection...');
  
  try {
    // Test direct database access
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Database error:', error);
      return;
    }
    
    console.log('✅ Database connection successful');
    console.log('Sample data:', data);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }
  
  console.log('\n2. Testing API route directly...');
  try {
    const response = await fetch('http://localhost:3000/api/guests', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Response status: ${response.status}`);
    const text = await response.text();
    console.log(`Response body: ${text.substring(0, 200)}...`);
  } catch (err) {
    console.error('❌ API test failed:', err.message);
  }
}

testAPI();
```

### 4. Check API Route Implementation
Look at `/pages/api/guests.ts` to see if there are any obvious issues:

```bash
cd /home/user/webdev/hostelpulse
cat pages/api/guests.ts
```

### 5. Verify Supabase Tables Exist
Check that all required tables exist in the local database:

```bash
# Connect to local database
supabase db shell

# Then run SQL:
# \dt  -- List all tables
# SELECT * FROM guests LIMIT 1;  -- Test if table exists
```

### 6. Check RLS Policies
Verify that Row Level Security policies are correctly set up:

```bash
# Check RLS status
supabase db shell

# Then run SQL:
# SELECT tablename, relrowsecurity FROM pg_tables WHERE schemaname = 'public';
```

## Expected Outcomes

Once these debugging steps are completed, you should be able to:

1. ✅ See detailed error messages that explain why the API is failing
2. ✅ Verify that the Supabase configuration is correct
3. ✅ Confirm that all database tables exist and have proper RLS policies
4. ✅ Identify the specific issue preventing API endpoints from working

## Next Steps After Debugging

Once the root cause is identified:

1. **If it's a configuration issue** - Update `.env.local` with correct values
2. **If it's a database schema issue** - Apply missing migrations or fix table structures
3. **If it's an authentication issue** - Fix JWT configuration or API auth middleware
4. **If it's a code issue** - Fix the API route implementation

## Timeline

- Debugging phase: 1-2 hours
- Fix implementation: 1-4 hours depending on root cause
- Testing and verification: 1 hour

This should unblock your progress and allow you to complete the MVP testing and deployment.