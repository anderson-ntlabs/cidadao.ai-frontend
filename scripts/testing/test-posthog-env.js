#!/usr/bin/env node

/**
 * PostHog Environment Diagnostic Tool
 *
 * Tests if PostHog environment variables are correctly configured
 * Run: node scripts/test-posthog-env.js
 */

console.log('\n🔍 PostHog Environment Diagnostic\n')
console.log('='.repeat(60))

// Check environment variables
const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST
const nodeEnv = process.env.NODE_ENV

console.log('\n📋 Environment Variables:')
console.log(`   NODE_ENV: ${nodeEnv || '❌ Not set'}`)
console.log(
  `   NEXT_PUBLIC_POSTHOG_KEY: ${apiKey ? '✅ Set (' + apiKey.substring(0, 8) + '...)' : '❌ Not set'}`
)
console.log(`   NEXT_PUBLIC_POSTHOG_HOST: ${apiHost || '❌ Not set (will use default)'}`)

// Check .env.local file
const fs = require('fs')
const path = require('path')

const envLocalPath = path.join(process.cwd(), '.env.local')
const envExamplePath = path.join(process.cwd(), '.env.example')

console.log('\n📁 Configuration Files:')
console.log(`   .env.local: ${fs.existsSync(envLocalPath) ? '✅ Exists' : '❌ Not found'}`)
console.log(`   .env.example: ${fs.existsSync(envExamplePath) ? '✅ Exists' : '⚠️  Not found'}`)

if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8')
  const hasPosthogKey = envContent.includes('NEXT_PUBLIC_POSTHOG_KEY')
  const hasPosthogHost = envContent.includes('NEXT_PUBLIC_POSTHOG_HOST')

  console.log(`   .env.local contains POSTHOG_KEY: ${hasPosthogKey ? '✅ Yes' : '❌ No'}`)
  console.log(
    `   .env.local contains POSTHOG_HOST: ${hasPosthogHost ? '✅ Yes' : '⚠️  No (optional)'}`
  )
}

// Recommendations
console.log('\n💡 Recommendations:')

if (!apiKey) {
  console.log('   ❌ CRITICAL: NEXT_PUBLIC_POSTHOG_KEY is not set!')
  console.log('   → Add to .env.local:')
  console.log('     NEXT_PUBLIC_POSTHOG_KEY=phc_YOUR_KEY_HERE')
  console.log('   → Or add to Vercel environment variables')
  console.log('   → Get your key at: https://app.posthog.com/project/settings')
} else {
  console.log('   ✅ PostHog API key is configured')
}

if (!apiHost) {
  console.log(
    '   ⚠️  NEXT_PUBLIC_POSTHOG_HOST not set (will use default: https://us.i.posthog.com)'
  )
  console.log('   → If using EU cloud, add to .env.local:')
  console.log('     NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com')
  console.log('   → If using self-hosted, set your custom URL')
} else {
  console.log(`   ✅ PostHog host is configured: ${apiHost}`)
}

// Test consent mechanism
console.log('\n🔐 Consent Mechanism Analysis:')
console.log('   PostHog requires BOTH consents to collect data:')
console.log('   1. Cookie Consent (cookie-consent = "accepted")')
console.log('   2. Research Consent (research-consent = "accepted")')
console.log('')
console.log('   ⚠️  If user closes ANY banner, PostHog will NOT collect data!')
console.log('   ⚠️  This is VERY restrictive and may explain low collection rates.')

// Next steps
console.log('\n🚀 Next Steps:')
console.log('   1. Set environment variables (if missing)')
console.log('   2. Restart dev server: npm run dev')
console.log('   3. Clear localStorage in browser (F12 → Application → Local Storage)')
console.log('   4. Accept BOTH consent banners')
console.log('   5. Open browser console and check for:')
console.log('      "[PostHog] Initialized successfully"')
console.log('   6. Verify events in PostHog dashboard:')
console.log('      https://app.posthog.com/project/events')

console.log('\n' + '='.repeat(60))
console.log('✅ Diagnostic complete!\n')
