const { createClient } = require('@supabase/supabase-js');

// Use the configuration directly
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5NTA2MDY0MTZ9.HkQ4-WqE7wFj7m4Xg5IY4C3Z4wU0V0k8fj4u3Q8Y3kM';

console.log('Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing connection to local Supabase...');
  
  try {
    // Test by trying to list guests (should return empty array or error if table doesn't exist)
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error querying guests table:', error.message);
      return false;
    }
    
    console.log('Successfully connected to local Supabase!');
    console.log('Guests table exists and is accessible');
    console.log('Sample data (first record):', data && data[0] ? data[0] : 'No records found');
    return true;
  } catch (err) {
    console.error('Connection failed:', err.message);
    return false;
  }
}

// Run the test
testConnection().then(success => {
  if (success) {
    console.log('✓ Local Supabase setup verification: PASSED');
  } else {
    console.log('✗ Local Supabase setup verification: FAILED');
  }
  process.exit(success ? 0 : 1);
});