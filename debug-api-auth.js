// Debug script to test the API authentication middleware specifically
const { createClient } = require('@supabase/supabase-js');

// Use the configuration from .env.local
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5NTA2MDY0MTZ9.HkQ4-WqE7wFj7m4Xg5IY4C3Z4wU0V0k8fj4u3Q8Y3kM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugAPIAuth() {
  console.log('Debugging API authentication...\n');
  
  // Step 1: Create a test user
  console.log('1. Creating test user...');
  const email = `debuguser_${Date.now()}@example.com`;
  const password = 'DebugPassword123!';
  
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: 'Debug User'
      }
    }
  });
  
  if (authError) {
    console.error('Authentication error:', authError);
    return;
  }
  
  console.log('   ✓ Test user created');
  const userId = authData.user.id;
  console.log(`   User ID: ${userId}`);
  
  // Step 2: Get the JWT token for the user
  console.log('\n2. Getting user session...');
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('Session error:', sessionError);
    return;
  }
  
  const jwtToken = session?.access_token;
  if (!jwtToken) {
    console.error('No JWT token found in session');
    return;
  }
  
  console.log('   ✓ JWT token obtained');
  
  // Step 3: Try to access an API endpoint with the JWT token
  console.log('\n3. Testing API access with JWT token...');
  try {
    const response = await fetch('http://localhost:3000/api/guests', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log(`   Response status: ${response.status}`);
    const responseBody = await response.text();
    console.log(`   Response body: ${responseBody.substring(0, 200)}...`);
    
    if (response.status === 200) {
      console.log('   ✓ API access successful');
    } else {
      console.log('   ✗ API access failed');
      console.log('   This indicates an issue with the API authentication middleware when using local Supabase');
    }
  } catch (err) {
    console.error('   Error accessing API:', err.message);
  }
  
  // Step 4: Try to access API with service role key (for comparison)
  console.log('\n4. Testing API access with service role key...');
  try {
    const response = await fetch('http://localhost:3000/api/guests', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk1MDYwNjQxNn0.8oGeIM5b2Jg6Dq9BqX7Mv2Z6J8HhJjX2w6Y8y8v2Qc0', // service role key
        'Content-Type': 'application/json',
      }
    });
    
    console.log(`   Response status: ${response.status}`);
    const responseBody = await response.text();
    console.log(`   Response body: ${responseBody.substring(0, 200)}...`);
  } catch (err) {
    console.error('   Error accessing API with service role:', err.message);
  }
  
  console.log('\n=== Debug Complete ===');
  console.log('\nThe issue is likely in the lib/apiAuth.ts file where the Supabase admin client is used.');
  console.log('It may be failing to validate JWT tokens from the local Supabase instance.');
}

debugAPIAuth().catch(console.error);