#!/usr/bin/env node
/**
 * Sentry Validation Script
 *
 * Tests if Sentry is properly configured and capturing errors in production
 *
 * Usage:
 *   node scripts/test-sentry.js [production-url]
 *
 * Example:
 *   node scripts/test-sentry.js https://cidadao-ai.vercel.app
 */

const https = require('https');
const http = require('http');

const PRODUCTION_URL = process.argv[2] || 'https://cidadao-ai.vercel.app';
const TEST_ENDPOINTS = [
  '/',
  '/pt',
  '/pt/login',
  '/pt/about',
];

console.log('🔍 Sentry Validation Script');
console.log('=' .repeat(50));
console.log(`Target: ${PRODUCTION_URL}\n`);

/**
 * Make HTTP request
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    client.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Check if Sentry is configured in HTML
 */
function checkSentryInHTML(html) {
  // Look for Sentry DSN in the HTML
  const hasSentryScript = html.includes('sentry') || html.includes('ingest.sentry.io');
  const hasSentryDSN = html.match(/https:\/\/[a-z0-9]+@[a-z0-9]+\.ingest\.sentry\.io\/\d+/);

  return {
    configured: hasSentryScript || !!hasSentryDSN,
    dsn: hasSentryDSN ? hasSentryDSN[0] : null,
  };
}

/**
 * Test endpoint
 */
async function testEndpoint(path) {
  const url = `${PRODUCTION_URL}${path}`;

  try {
    console.log(`📡 Testing: ${path}`);

    const response = await makeRequest(url);

    if (response.statusCode !== 200) {
      console.log(`   ⚠️  Status: ${response.statusCode}\n`);
      return false;
    }

    const sentryCheck = checkSentryInHTML(response.body);

    if (sentryCheck.configured) {
      console.log(`   ✅ Sentry CONFIGURED`);
      if (sentryCheck.dsn) {
        console.log(`   🔑 DSN: ${sentryCheck.dsn.substring(0, 50)}...`);
      }
      console.log('');
      return true;
    } else {
      console.log(`   ❌ Sentry NOT FOUND in HTML`);
      console.log('');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    return false;
  }
}

/**
 * Generate test error (for manual testing)
 */
function generateTestInstructions() {
  console.log('\n' + '='.repeat(50));
  console.log('📝 Manual Test Instructions');
  console.log('='.repeat(50));
  console.log(`
1. Open Browser Console on: ${PRODUCTION_URL}

2. Paste this code to trigger a test error:

   throw new Error('Sentry Test Error - ' + new Date().toISOString());

3. Check Sentry Dashboard (sentry.io):
   - Go to Issues
   - You should see the test error
   - Check if environment is "production"
   - Verify breadcrumbs are captured

4. Expected in Sentry:
   ✅ Error message: "Sentry Test Error - [timestamp]"
   ✅ Environment: production
   ✅ Browser: [your browser]
   ✅ URL: ${PRODUCTION_URL}
   ✅ Breadcrumbs showing navigation

If you see the error in Sentry within 1-2 minutes:
🎉 SUCCESS! Sentry is working correctly!

If NOT:
❌ Check:
   - NEXT_PUBLIC_SENTRY_DSN is set in Vercel
   - Vercel deployment finished successfully
   - No browser console errors about Sentry
`);
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting validation...\n');

  let successCount = 0;

  for (const endpoint of TEST_ENDPOINTS) {
    const success = await testEndpoint(endpoint);
    if (success) successCount++;
  }

  console.log('='.repeat(50));
  console.log('📊 Results');
  console.log('='.repeat(50));
  console.log(`Endpoints tested: ${TEST_ENDPOINTS.length}`);
  console.log(`Sentry found: ${successCount}/${TEST_ENDPOINTS.length}`);

  if (successCount > 0) {
    console.log('\n✅ Sentry appears to be configured!');
    generateTestInstructions();
  } else {
    console.log('\n❌ Sentry NOT detected in production HTML');
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if NEXT_PUBLIC_SENTRY_DSN is set in Vercel');
    console.log('2. Verify the environment variable is for "Production"');
    console.log('3. Make sure you redeployed after adding the variable');
    console.log('4. Check build logs for Sentry initialization');
    console.log(`5. Try accessing ${PRODUCTION_URL} directly to verify deployment`);
  }

  console.log('\n' + '='.repeat(50));
}

// Run
main().catch(console.error);
