// test-full-auth-flow.js
const { createClient } = require('@supabase/supabase-js');

// Use configuration from .env.local
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5NTA2MDY0MTZ9.HkQ4-WqE7wFj7m4Xg5IY4C3Z4wU0V0k8fj4u3Q8Y3kM';

console.log('Testing full authentication flow...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFullFlow() {
  try {
    console.log('1. Creating a test user...');
    
    // Create a test user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: `test${Date.now()}@example.com`,
      password: 'TestPassword123!',
      options: {
        data: {
          name: 'Test User'
        }
      }
    });
    
    if (authError) {
      console.log('Auth error:', authError.message);
      return;
    }
    
    console.log('User created:', authData.user?.id || 'No user ID');
    
    // Get the session token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('Session error:', sessionError.message);
      return;
    }
    
    const jwtToken = session?.access_token;
    if (!jwtToken) {
      console.log('No JWT token found in session');
      return;
    }
    
    console.log('JWT token obtained');
    
    // Test database access with the JWT token
    console.log('2. Testing database access with JWT token...');
    const { data: guests, error: dbError } = await supabase
      .from('guests')
      .select('*')
      .limit(1);
    
    if (dbError) {
      console.log('Database error:', dbError.message);
      console.log('Error details:', dbError);
    } else {
      console.log('Database success - found', guests.length, 'guests');
    }
    
  } catch (err) {
    console.error('Unexpected error:', err.message);
    console.error('Stack trace:', err.stack);
  }
}

testFullFlow();