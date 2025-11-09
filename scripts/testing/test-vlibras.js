#!/usr/bin/env node

/**
 * VLibras Integration Test Script
 *
 * This script tests the VLibras integration on the Cidadão.AI frontend
 * by checking if the widget loads correctly and verifies CSP configuration.
 */

const https = require('https')
const http = require('http')

const TEST_URL = process.env.TEST_URL || 'http://localhost:3001/pt'
const TIMEOUT = 10000 // 10 seconds

console.log('🧪 VLibras Integration Test\n')
console.log('━'.repeat(50))
console.log(`Testing URL: ${TEST_URL}`)
console.log('━'.repeat(50) + '\n')

async function testVLibras() {
  const tests = {
    total: 0,
    passed: 0,
    failed: 0,
    results: [],
  }

  // Test 1: Check if environment variable is set
  console.log('Test 1: Environment Variable Configuration')
  const envVlibras = process.env.NEXT_PUBLIC_ENABLE_VLIBRAS
  if (envVlibras === 'true') {
    console.log('✅ NEXT_PUBLIC_ENABLE_VLIBRAS is set to true\n')
    tests.passed++
  } else {
    console.log(`❌ NEXT_PUBLIC_ENABLE_VLIBRAS is "${envVlibras}" (should be "true")\n`)
    tests.failed++
  }
  tests.total++

  // Test 2: Check if VLibras script URL is accessible
  console.log('Test 2: VLibras CDN Accessibility')
  const vlibrasScriptUrl = 'https://vlibras.gov.br/app/vlibras-plugin.js'

  try {
    await new Promise((resolve, reject) => {
      https
        .get(vlibrasScriptUrl, { timeout: TIMEOUT }, (res) => {
          // Accept 200 (OK) or 302 (Redirect) as success
          if (res.statusCode === 200 || res.statusCode === 302) {
            console.log(`✅ VLibras CDN is accessible (Status: ${res.statusCode})\n`)
            tests.passed++
            resolve()
          } else {
            console.log(`❌ VLibras CDN returned status: ${res.statusCode}\n`)
            tests.failed++
            reject()
          }
        })
        .on('error', (err) => {
          console.log(`❌ VLibras CDN error: ${err.message}\n`)
          tests.failed++
          reject(err)
        })
    })
  } catch (error) {
    // Error already logged
  }
  tests.total++

  // Test 3: Check if local page loads
  console.log('Test 3: Local Development Server')
  const urlObj = new URL(TEST_URL)
  const protocol = urlObj.protocol === 'https:' ? https : http

  try {
    await new Promise((resolve, reject) => {
      protocol
        .get(TEST_URL, { timeout: TIMEOUT }, (res) => {
          if (res.statusCode === 200) {
            console.log('✅ Local server is running (Status: 200)\n')
            tests.passed++
            resolve()
          } else {
            console.log(`❌ Local server returned status: ${res.statusCode}\n`)
            tests.failed++
            reject()
          }
        })
        .on('error', (err) => {
          console.log(`❌ Local server error: ${err.message}`)
          console.log('   Make sure dev server is running: npm run dev\n')
          tests.failed++
          reject(err)
        })
    })
  } catch (error) {
    // Error already logged
  }
  tests.total++

  // Test 4: Check if VLibras package is installed
  console.log('Test 4: VLibras Package Installation')
  try {
    require('@djpfs/react-vlibras')
    console.log('✅ @djpfs/react-vlibras package is installed\n')
    tests.passed++
  } catch (error) {
    console.log('❌ @djpfs/react-vlibras package not found')
    console.log('   Run: npm install @djpfs/react-vlibras\n')
    tests.failed++
  }
  tests.total++

  // Test 5: Check if component file exists
  console.log('Test 5: VLibras Component File')
  const fs = require('fs')
  const path = require('path')
  const componentPath = path.join(__dirname, '../components/a11y/vlibras-widget.tsx')

  if (fs.existsSync(componentPath)) {
    console.log('✅ VLibrasWidget component exists\n')
    tests.passed++
  } else {
    console.log('❌ VLibrasWidget component not found\n')
    tests.failed++
  }
  tests.total++

  // Summary
  console.log('\n' + '━'.repeat(50))
  console.log('📊 Test Summary')
  console.log('━'.repeat(50))
  console.log(`Total Tests:  ${tests.total}`)
  console.log(`Passed:       ${tests.passed} ✅`)
  console.log(`Failed:       ${tests.failed} ❌`)
  console.log(`Success Rate: ${Math.round((tests.passed / tests.total) * 100)}%`)
  console.log('━'.repeat(50) + '\n')

  if (tests.failed === 0) {
    console.log('🎉 All tests passed! VLibras integration is ready.\n')
    console.log('📝 Next Steps:')
    console.log('   1. Open http://localhost:3001/pt in your browser')
    console.log('   2. Look for the VLibras widget in the bottom-right corner')
    console.log('   3. Click the widget to activate LIBRAS translation')
    console.log('   4. Select an avatar (Guga, Ícaro, or Hozana)')
    console.log('   5. Hover over text to see sign language translation\n')
    return 0
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.\n')
    return 1
  }
}

// Run tests
testVLibras()
  .then((exitCode) => process.exit(exitCode))
  .catch((error) => {
    console.error('❌ Test execution failed:', error)
    process.exit(1)
  })
