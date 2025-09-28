// test-supabase-connection.js
const { createClient } = require('@supabase/supabase-js');

// Use configuration from .env.local
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5NTA2MDY0MTZ9.HkQ4-WqE7wFj7m4Xg5IY4C3Z4wU0V0k8fj4u3Q8Y3kM';

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('Attempting to connect to Supabase...');
    
    // Test basic connection by getting user info (this should work even if not logged in)
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log('Auth error:', error.message);
      // This is expected if not logged in
    } else {
      console.log('Auth success:', data);
    }
    
    // Test database connection by trying to access a table
    console.log('Testing database access...');
    const { data: guests, error: dbError } = await supabase
      .from('guests')
      .select('*')
      .limit(1);
    
    if (dbError) {
      console.log('Database error:', dbError.message);
      console.log('Error details:', dbError);
    } else {
      console.log('Database success - found', guests.length, 'guests');
      if (guests.length > 0) {
        console.log('Sample guest:', guests[0]);
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err.message);
    console.error('Stack trace:', err.stack);
  }
}

testConnection();