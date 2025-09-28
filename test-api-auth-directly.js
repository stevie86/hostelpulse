// test-api-auth-directly.js
const { createClient } = require('@supabase/supabase-js');

// Simulate the apiAuth.ts logic
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk1MDYwNjQxNn0.8oGeIM5b2Jg6Dq9BqX7Mv2Z6J8HhJjX2w6Y8y8v2Qc0';

// Mock request object (no auth headers)
const mockReqWithoutAuth = {
  headers: {}
};

// Mock request object with fake auth header
const mockReqWithFakeAuth = {
  headers: {
    authorization: 'Bearer fake-token'
  }
};

// Mock response object
const mockRes = {
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    this.responseData = data;
    return this;
  }
};

console.log('Testing API authentication logic...');

// Simulate the authenticateRequest function from apiAuth.ts
async function authenticateRequest(req, res) {
  // Default to ON unless explicitly disabled with REQUIRE_API_AUTH=0
  const requireAuth = process.env.REQUIRE_API_AUTH !== '0';
  console.log('REQUIRE_API_AUTH from env:', process.env.REQUIRE_API_AUTH);
  console.log('Authentication required:', requireAuth);
  
  // Skip auth if not required (MVP mode)
  if (!requireAuth) {
    console.log('✅ Authentication skipped (MVP mode)');
    return { user: null, isAdmin: false };
  }

  // Check admin token first (emergency/CI access)
  const adminTokenHeader = req.headers['x-admin-token'];
  // In real implementation, this would check against process.env.ADMIN_API_TOKEN
  if (adminTokenHeader === 'test-admin-token') {
    console.log('✅ Admin token accepted');
    return { user: null, isAdmin: true };
  }

  // Check JWT token
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    console.log('❌ Missing or invalid authorization header');
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return null;
  }

  console.log('✅ Valid auth header found');
  // In real implementation, this would validate the token
  // For now, we'll simulate a successful validation
  const token = authHeader.slice(7);
  return { user: { id: 'test-user-id' }, isAdmin: false };
}

async function runTests() {
  console.log('\n=== Test 1: Request without auth headers (should work in MVP mode) ===');
  const res1 = { ...mockRes };
  const auth1 = await authenticateRequest(mockReqWithoutAuth, res1);
  console.log('Result:', auth1);
  if (res1.statusCode) {
    console.log('Response status:', res1.statusCode);
    console.log('Response data:', res1.responseData);
  }
  
  console.log('\n=== Test 2: Request with fake auth header (should work) ===');
  const res2 = { ...mockRes };
  const auth2 = await authenticateRequest(mockReqWithFakeAuth, res2);
  console.log('Result:', auth2);
  if (res2.statusCode) {
    console.log('Response status:', res2.statusCode);
    console.log('Response data:', res2.responseData);
  }
  
  console.log('\n=== Test 3: Setting REQUIRE_API_AUTH=0 explicitly ===');
  process.env.REQUIRE_API_AUTH = '0';
  const res3 = { ...mockRes };
  const auth3 = await authenticateRequest(mockReqWithoutAuth, res3);
  console.log('Result:', auth3);
  if (res3.statusCode) {
    console.log('Response status:', res3.statusCode);
    console.log('Response data:', res3.responseData);
  }
}

runTests();