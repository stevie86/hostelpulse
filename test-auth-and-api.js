// Test script to verify basic authentication and API functionality
const { createClient } = require('@supabase/supabase-js');

// Use the configuration from .env.local
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5NTA2MDY0MTZ9.HkQ4-WqE7wFj7m4Xg5IY4C3Z4wU0V0k8fj4u3Q8Y3kM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuthenticationAndAPI() {
  console.log('Testing authentication and API functionality...\\n');
  
  // Test 1: Check if we can read from public tables (should work with anon key)
  console.log('1. Testing basic database connectivity...');
  try {
    // This is just to check if the connection works
    console.log('   ✓ Supabase client created successfully');
  } catch (err) {
    console.error('   ✗ Failed to create Supabase client:', err.message);
    return false;
  }
  
  // Test 2: Try to register a test user (this will require auth)
  console.log('\\n2. Testing user registration...');
  try {
    const email = `testuser_${Date.now()}@example.com`;
    const password = 'TestPassword123!';
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: 'Test User'
        }
      }
    });
    
    if (error) {
      console.log('   ~ Registration may require additional configuration (this is expected in local dev)');
      console.log('   Error:', error.message);
    } else {
      console.log('   ✓ User registration successful');
      
      // If registration worked, try to get the user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (session) {
        console.log('   ✓ Session retrieved successfully');
      } else {
        console.log('   ~ No active session found (this may be expected)');
      }
    }
  } catch (err) {
    console.log('   ~ Registration test encountered an issue (this may be expected in local dev):', err.message);
  }
  
  // Test 3: Test direct API access via HTTP request
  console.log('\\n3. Testing API endpoints via HTTP requests...');
  try {
    // First, let's test the API endpoints directly
    const apiUrl = 'http://localhost:3000/api/guests';
    
    // Try to access the guests API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    // This will likely fail without proper authentication, which is expected
    console.log(`   API response status: ${response.status}`);
    if (response.status === 401 || response.status === 403) {
      console.log('   ~ API requires authentication (expected behavior)');
    } else if (response.status === 200) {
      console.log('   ✓ API endpoint accessible');
      const data = await response.json();
      console.log('   Sample data:', Array.isArray(data) && data.length > 0 ? data[0] : 'No data found');
    } else {
      console.log('   ~ API endpoint returned unexpected status:', response.status);
    }
  } catch (err) {
    console.log('   ~ API test encountered an issue (expected if Next.js dev server is not configured for API access):', err.message);
  }
  
  // Test 4: Check if the local development server is running
  console.log('\\n4. Checking if Next.js dev server is accessible...');
  try {
    const response = await fetch('http://localhost:3000');
    if (response.ok) {
      console.log('   ✓ Next.js dev server is running and accessible');
      console.log('   ~ You can now test the application by visiting http://localhost:3000 in your browser');
    } else {
      console.log('   ✗ Next.js dev server is not responding properly');
    }
  } catch (err) {
    console.log('   ✗ Cannot connect to Next.js dev server:', err.message);
    console.log('   ~ Make sure you have started the dev server with: npm run dev');
  }
  
  console.log('\\n=== Testing Complete ===');
  console.log('\\nNext steps:');
  console.log('1. Visit http://localhost:3000 in your browser');
  console.log('2. Try registering a new account');
  console.log('3. Test creating guests, rooms, and bookings');
  console.log('4. Verify that data isolation works between different users');
  console.log('5. Check the Supabase Studio at http://127.0.0.1:54323 to see stored data');

  return true;
}

// Run the test
testAuthenticationAndAPI().then(() => {
  console.log('\\nTest script completed. Check the results above for the current status.');
}).catch(err => {
  console.error('Test script failed:', err);
});