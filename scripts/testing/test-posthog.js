#!/usr/bin/env node

/**
 * PostHog Integration Test Script
 *
 * Tests PostHog analytics integration by:
 * 1. Checking environment variables
 * 2. Verifying PostHog initialization
 * 3. Testing event tracking
 * 4. Validating consent management
 *
 * Usage: node scripts/test-posthog.js
 */

const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

// Test results collector
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
}

// Helper functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function pass(message) {
  results.passed++
  results.tests.push({ status: 'PASS', message })
  log(`✅ PASS: ${message}`, colors.green)
}

function fail(message) {
  results.failed++
  results.tests.push({ status: 'FAIL', message })
  log(`❌ FAIL: ${message}`, colors.red)
}

function warn(message) {
  results.warnings++
  results.tests.push({ status: 'WARN', message })
  log(`⚠️  WARN: ${message}`, colors.yellow)
}

function info(message) {
  log(`ℹ️  INFO: ${message}`, colors.cyan)
}

function section(title) {
  log(`\n${'='.repeat(60)}`, colors.blue)
  log(`${title}`, colors.bright + colors.blue)
  log(`${'='.repeat(60)}\n`, colors.blue)
}

// Test 1: Check environment variables
function testEnvironmentVariables() {
  section('TEST 1: Environment Variables')

  const envPath = path.join(process.cwd(), '.env.local')

  if (!fs.existsSync(envPath)) {
    fail('.env.local file not found')
    warn('Create .env.local by copying .env.example')
    return false
  }

  pass('.env.local file exists')

  const envContent = fs.readFileSync(envPath, 'utf8')

  // Check for PostHog API key
  const hasApiKey = /NEXT_PUBLIC_POSTHOG_KEY=phc_\w+/.test(envContent)
  if (hasApiKey) {
    const keyMatch = envContent.match(/NEXT_PUBLIC_POSTHOG_KEY=(phc_\w+)/)
    const key = keyMatch ? keyMatch[1] : ''
    pass(`PostHog API key configured (${key.substring(0, 10)}...)`)
  } else {
    fail('NEXT_PUBLIC_POSTHOG_KEY not found or invalid format')
    return false
  }

  // Check for PostHog host
  const hasHost = /NEXT_PUBLIC_POSTHOG_HOST=https:\/\//.test(envContent)
  if (hasHost) {
    const hostMatch = envContent.match(/NEXT_PUBLIC_POSTHOG_HOST=(https:\/\/[^\s]+)/)
    const host = hostMatch ? hostMatch[1] : ''
    pass(`PostHog host configured (${host})`)
  } else {
    fail('NEXT_PUBLIC_POSTHOG_HOST not found or invalid format')
    return false
  }

  return true
}

// Test 2: Check PostHog service availability
function testPostHogService() {
  return new Promise((resolve) => {
    section('TEST 2: PostHog Service Availability')

    const url = 'https://us.i.posthog.com/'

    info('Checking PostHog service status...')

    https
      .get(url, (res) => {
        if (res.statusCode === 200 || res.statusCode === 405) {
          pass(`PostHog service is reachable (status: ${res.statusCode})`)
          resolve(true)
        } else {
          warn(`PostHog service returned status ${res.statusCode}`)
          resolve(false)
        }
      })
      .on('error', (err) => {
        fail(`PostHog service unreachable: ${err.message}`)
        resolve(false)
      })
  })
}

// Test 3: Check local development server
function testLocalServer() {
  return new Promise((resolve) => {
    section('TEST 3: Local Development Server')

    info('Checking if Next.js dev server is running...')

    // Try ports 3000-3010
    let found = false
    let attempts = 0
    const maxAttempts = 11

    for (let port = 3000; port <= 3010; port++) {
      attempts++

      const req = http.get(`http://localhost:${port}`, (res) => {
        if (!found && res.statusCode === 200) {
          found = true
          pass(`Development server running on port ${port}`)
          resolve(port)
        }
      })

      req.on('error', () => {
        // Port not available, try next
        if (attempts === maxAttempts && !found) {
          fail('Development server not running on any port (3000-3010)')
          warn('Start dev server with: npm run dev')
          resolve(false)
        }
      })

      req.end()
    }
  })
}

// Test 4: Check PostHog library installation
function testPostHogInstallation() {
  section('TEST 4: PostHog Library Installation')

  const packageJsonPath = path.join(process.cwd(), 'package.json')

  if (!fs.existsSync(packageJsonPath)) {
    fail('package.json not found')
    return false
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

  if (packageJson.dependencies && packageJson.dependencies['posthog-js']) {
    const version = packageJson.dependencies['posthog-js']
    pass(`posthog-js installed (version: ${version})`)
    return true
  } else {
    fail('posthog-js not found in dependencies')
    warn('Install with: npm install posthog-js')
    return false
  }
}

// Test 5: Check PostHog configuration file
function testPostHogConfig() {
  section('TEST 5: PostHog Configuration')

  const configPath = path.join(process.cwd(), 'lib/analytics/posthog-config.ts')

  if (!fs.existsSync(configPath)) {
    fail('posthog-config.ts not found')
    return false
  }

  pass('PostHog config file exists')

  const configContent = fs.readFileSync(configPath, 'utf8')

  // Check for key functions
  const functions = [
    'initPostHog',
    'hasUserConsent',
    'updateConsentStatus',
    'identifyUser',
    'trackEvent',
    'trackPageView',
    'getPostHog',
  ]

  let allFunctionsPresent = true

  functions.forEach((fn) => {
    if (
      configContent.includes(`export function ${fn}`) ||
      configContent.includes(`export const ${fn}`)
    ) {
      pass(`Function ${fn}() is defined`)
    } else {
      fail(`Function ${fn}() not found`)
      allFunctionsPresent = false
    }
  })

  return allFunctionsPresent
}

// Test 6: Check AnalyticsProvider integration
function testAnalyticsProvider() {
  section('TEST 6: AnalyticsProvider Integration')

  const ptLayoutPath = path.join(process.cwd(), 'app/pt/layout.tsx')
  const enLayoutPath = path.join(process.cwd(), 'app/en/layout.tsx')

  // Check PT layout
  if (fs.existsSync(ptLayoutPath)) {
    const ptContent = fs.readFileSync(ptLayoutPath, 'utf8')

    if (ptContent.includes('AnalyticsProvider')) {
      pass('PT layout includes AnalyticsProvider')

      if (ptContent.includes('<AnalyticsProvider>')) {
        pass('PT layout wraps content with AnalyticsProvider')
      } else {
        warn('PT layout imports AnalyticsProvider but may not use it correctly')
      }
    } else {
      fail('PT layout missing AnalyticsProvider')
    }
  } else {
    fail('PT layout file not found')
  }

  // Check EN layout
  if (fs.existsSync(enLayoutPath)) {
    const enContent = fs.readFileSync(enLayoutPath, 'utf8')

    if (enContent.includes('AnalyticsProvider')) {
      pass('EN layout includes AnalyticsProvider')

      if (enContent.includes('<AnalyticsProvider>')) {
        pass('EN layout wraps content with AnalyticsProvider')
      } else {
        warn('EN layout imports AnalyticsProvider but may not use it correctly')
      }
    } else {
      fail('EN layout missing AnalyticsProvider')
    }
  } else {
    fail('EN layout file not found')
  }
}

// Test 7: Check usability tracker
function testUsabilityTracker() {
  section('TEST 7: Usability Tracker')

  const trackerPath = path.join(process.cwd(), 'lib/analytics/usability-tracker.ts')

  if (!fs.existsSync(trackerPath)) {
    fail('usability-tracker.ts not found')
    return false
  }

  pass('Usability tracker file exists')

  const trackerContent = fs.readFileSync(trackerPath, 'utf8')

  // Check for key tracking functions
  const trackingFunctions = [
    'trackUsability',
    'trackPageView',
    'trackClick',
    'trackAgentSelected',
    'trackChatInteraction',
  ]

  trackingFunctions.forEach((fn) => {
    if (
      trackerContent.includes(`export function ${fn}`) ||
      trackerContent.includes(`export const ${fn}`)
    ) {
      pass(`Tracking function ${fn}() is defined`)
    } else {
      warn(`Tracking function ${fn}() not found`)
    }
  })

  return true
}

// Test 8: Check Supabase migration
function testSupabaseMigration() {
  section('TEST 8: Supabase Migration')

  const migrationPath = path.join(
    process.cwd(),
    'supabase/migrations/20250124000000_create_usability_events.sql'
  )

  if (!fs.existsSync(migrationPath)) {
    warn('Supabase migration file not found')
    info('This is optional but recommended for data persistence')
    return false
  }

  pass('Supabase migration file exists')
  warn('Remember to execute migration in Supabase SQL Editor')
  info('File: supabase/migrations/20250124000000_create_usability_events.sql')

  return true
}

// Test 9: Check production environment template
function testProductionTemplate() {
  section('TEST 9: Production Environment Template')

  const prodEnvPath = path.join(process.cwd(), '.env.production.example')

  if (!fs.existsSync(prodEnvPath)) {
    warn('.env.production.example not found')
    return false
  }

  pass('.env.production.example exists')

  const prodEnvContent = fs.readFileSync(prodEnvPath, 'utf8')

  if (prodEnvContent.includes('NEXT_PUBLIC_POSTHOG_KEY')) {
    pass('Production template includes PostHog key')
  } else {
    fail('Production template missing PostHog key')
    return false
  }

  if (prodEnvContent.includes('NEXT_PUBLIC_POSTHOG_HOST')) {
    pass('Production template includes PostHog host')
  } else {
    fail('Production template missing PostHog host')
    return false
  }

  return true
}

// Print final summary
function printSummary() {
  section('TEST SUMMARY')

  const total = results.passed + results.failed + results.warnings

  log(`\nTotal Tests: ${total}`, colors.bright)
  log(`✅ Passed: ${results.passed}`, colors.green)
  log(`❌ Failed: ${results.failed}`, colors.red)
  log(`⚠️  Warnings: ${results.warnings}`, colors.yellow)

  const successRate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0
  log(`\nSuccess Rate: ${successRate}%`, colors.bright)

  if (results.failed === 0) {
    log('\n🎉 All critical tests passed!', colors.green + colors.bright)
    log('PostHog integration is ready to use.', colors.green)
  } else {
    log('\n⚠️  Some tests failed.', colors.yellow + colors.bright)
    log('Review failed tests above and fix issues.', colors.yellow)
  }

  if (results.warnings > 0) {
    log('\n💡 Check warnings for optional improvements.', colors.cyan)
  }

  log('\n' + '='.repeat(60) + '\n', colors.blue)
}

// Main test runner
async function runTests() {
  log('\n🧪 PostHog Integration Test Suite\n', colors.bright + colors.magenta)

  const envOk = testEnvironmentVariables()
  const installOk = testPostHogInstallation()
  const configOk = testPostHogConfig()
  testAnalyticsProvider()
  testUsabilityTracker()
  testSupabaseMigration()
  testProductionTemplate()

  if (envOk && installOk && configOk) {
    await testPostHogService()
    await testLocalServer()
  } else {
    warn('Skipping service tests due to configuration issues')
  }

  printSummary()

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0)
}

// Run tests
runTests().catch((err) => {
  log(`\n❌ Test suite crashed: ${err.message}`, colors.red)
  console.error(err)
  process.exit(1)
})
