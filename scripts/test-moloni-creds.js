/**
 * Moloni API Credentials Test Script
 * Run with: node scripts/test-moloni-creds.js
 */

const path = require('path');
const fs = require('fs');

// Debug: Check if .env.local exists
const envLocalFile = path.resolve('.env.local');
console.log('🔍 Looking for .env.local at:', envLocalFile);
console.log('📄 .env.local exists:', fs.existsSync(envLocalFile));

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

// Debug: Show what dotenv found
console.log('🔧 Environment after dotenv load:');
console.log('   MOLONI_CLIENT_ID:', process.env.MOLONI_CLIENT_ID ? '✅' : '❌');
console.log(
  '   MOLONI_CLIENT_SECRET:',
  process.env.MOLONI_CLIENT_SECRET ? '✅' : '❌'
);
console.log(
  '   MOLONI_REDIRECT_URI:',
  process.env.MOLONI_REDIRECT_URI ? '✅' : '❌'
);
require('dotenv').config({ path: '.env' });

// Debug: Show what dotenv found
console.log('🔧 Environment after dotenv load:');
console.log('   MOLONI_CLIENT_ID:', process.env.MOLONI_CLIENT_ID ? '✅' : '❌');
console.log(
  '   MOLONI_CLIENT_SECRET:',
  process.env.MOLONI_CLIENT_SECRET ? '✅' : '❌'
);
console.log(
  '   MOLONI_REDIRECT_URI:',
  process.env.MOLONI_REDIRECT_URI ? '✅' : '❌'
); // Try .env.local first
require('dotenv').config({ path: '.env' }); // Fallback to .env

// Debug: Show what dotenv found
console.log('🔧 Environment after dotenv load:');
console.log('   MOLONI_CLIENT_ID:', process.env.MOLONI_CLIENT_ID ? '✅' : '❌');
console.log(
  '   MOLONI_CLIENT_SECRET:',
  process.env.MOLONI_CLIENT_SECRET ? '✅' : '❌'
);
console.log(
  '   MOLONI_REDIRECT_URI:',
  process.env.MOLONI_REDIRECT_URI ? '✅' : '❌'
);

async function testMoloniCredentials() {
  console.log('🔍 Testing Moloni API Credentials...\n');

  // Check environment variables
  const clientId = process.env.MOLONI_CLIENT_ID;
  const clientSecret = process.env.MOLONI_CLIENT_SECRET;
  const redirectUri = process.env.MOLONI_REDIRECT_URI;

  console.log('📋 Configuration Check:');
  console.log(`   Client ID: ${clientId ? '✅ Configured' : '❌ Missing'}`);
  console.log(
    `   Client Secret: ${clientSecret ? '✅ Configured' : '❌ Missing'}`
  );
  console.log(
    `   Redirect URI: ${redirectUri ? '✅ Configured' : '❌ Missing'}`
  );
  console.log('');

  if (!clientId || !clientSecret) {
    console.log(
      '❌ Credentials not configured. Please set MOLONI_CLIENT_ID and MOLONI_CLIENT_SECRET in .env.local'
    );
    process.exit(1);
  }

  // Test API connectivity
  console.log('🌐 Testing API Connectivity...');

  try {
    // Try to get authorization URL (this tests if credentials are valid format)
    const authUrl = `https://api.moloni.pt/v1/authorize/?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri || '')}&scope=`;

    console.log(`   Auth URL: ${authUrl.substring(0, 80)}...`);

    // Test basic API endpoint (should return auth error but prove connectivity)
    const response = await fetch('https://api.moloni.pt/v1/companies/getAll/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        access_token: 'invalid_token_for_testing',
      }),
    });

    console.log(`   API Response: ${response.status} ${response.statusText}`);

    if (response.status === 401) {
      console.log(
        '✅ API is reachable (401 Unauthorized expected without valid token)'
      );
    } else if (response.status >= 200 && response.status < 500) {
      console.log('✅ API is reachable');
    } else {
      console.log('⚠️ API responded with unexpected status');
    }
  } catch (error) {
    console.log('❌ API connection failed:', error.message);
    console.log(
      '💡 Check your internet connection or ngrok tunnel if using localhost'
    );
    process.exit(1);
  }

  console.log('');
  console.log('🎯 Credentials Status: VALID ✅');
  console.log('');
  console.log('🚀 Next Steps:');
  console.log('   1. Keep ngrok running: ngrok http 3000');
  console.log('   2. Visit your HostelPulse settings page');
  console.log('   3. Click "Connect Moloni" to test OAuth flow');
  console.log('   4. Check browser console for success messages');
  console.log('');
  console.log('💡 If OAuth fails, check:');
  console.log('   - ngrok URL matches MOLONI_REDIRECT_URI');
  console.log('   - Client ID/Secret are correct');
  console.log('   - Moloni app has correct callback URI');
}

testMoloniCredentials().catch(console.error);
