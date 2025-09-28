// test-env-vars.js
console.log('Testing environment variables...');

// Environment variables are automatically loaded by Next.js

console.log('REQUIRE_API_AUTH:', process.env.REQUIRE_API_AUTH);
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY);

// Test the auth logic directly
const requireAuth = process.env.REQUIRE_API_AUTH !== '0';
console.log('Authentication required:', requireAuth);

if (!requireAuth) {
  console.log('✅ Authentication is disabled for local development');
} else {
  console.log('❌ Authentication is enabled');
}