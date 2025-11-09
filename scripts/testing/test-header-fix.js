/**
 * Test script to verify that the duplicate header issue is fixed
 *
 * This script checks both public and authenticated routes to ensure:
 * - Public routes show only the public header
 * - Authenticated routes show only the authenticated header
 */

const puppeteer = require('puppeteer')

async function testHeaderFix() {
  console.log('🔍 Testing header fix for duplicate headers...\n')

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()

    // Test public route
    console.log('📄 Testing public route (/pt)...')
    await page.goto('http://localhost:3000/pt', { waitUntil: 'networkidle0' })

    // Count headers on public page
    const publicHeaders = await page.$$('header')
    console.log(`  - Found ${publicHeaders.length} header(s) on public page`)

    // Check navigation items on public page
    const publicNavItems = await page.evaluate(() => {
      const navLinks = Array.from(document.querySelectorAll('header nav a'))
      return navLinks.map((link) => link.textContent)
    })
    console.log(`  - Navigation items: ${publicNavItems.join(', ')}`)

    if (publicHeaders.length !== 1) {
      console.error('❌ ERROR: Expected 1 header on public page, found', publicHeaders.length)
    } else {
      console.log('✅ Public page shows single header correctly')
    }

    // Test authenticated route (mock login first)
    console.log('\n🔐 Testing authenticated route (/pt/dashboard)...')

    // Set mock auth cookie/localStorage to simulate logged-in state
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem(
        'mock-auth',
        JSON.stringify({
          user: { id: '1', email: 'test@example.com', name: 'Test User' },
          isAuthenticated: true,
        })
      )
    })

    await page.goto('http://localhost:3000/pt/dashboard', { waitUntil: 'networkidle0' })

    // Count headers on authenticated page
    const authHeaders = await page.$$('header')
    console.log(`  - Found ${authHeaders.length} header(s) on authenticated page`)

    // Check navigation items on authenticated page
    const authNavItems = await page.evaluate(() => {
      const navLinks = Array.from(document.querySelectorAll('header nav a'))
      return navLinks.map((link) => link.textContent)
    })
    console.log(`  - Navigation items: ${authNavItems.join(', ')}`)

    if (authHeaders.length !== 1) {
      console.error('❌ ERROR: Expected 1 header on authenticated page, found', authHeaders.length)
    } else {
      console.log('✅ Authenticated page shows single header correctly')
    }

    // Final verdict
    console.log('\n📊 Summary:')
    if (publicHeaders.length === 1 && authHeaders.length === 1) {
      console.log('✅ Header fix successful! No duplicate headers found.')
    } else {
      console.log('❌ Header fix failed. Duplicate headers still present.')
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  } finally {
    await browser.close()
  }
}

// Run the test
testHeaderFix().catch(console.error)
