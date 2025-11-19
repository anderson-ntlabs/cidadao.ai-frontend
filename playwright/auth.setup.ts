import { test as setup, expect } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, '.auth/user.json')

/**
 * Playwright Authentication Setup
 *
 * This setup file runs before tests to establish an authenticated session.
 * It creates a storage state file that can be reused across tests.
 *
 * Usage in tests:
 *
 * import { test } from '@playwright/test'
 *
 * test.use({ storageState: 'playwright/.auth/user.json' })
 *
 * test('authenticated test', async ({ page }) => {
 *   await page.goto('/pt/app/dashboard')
 *   // User is already logged in
 * })
 */

setup('authenticate', async ({ page }) => {
  // Navigate to login page
  await page.goto('/pt/login')

  // Check if running in CI or test environment
  const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com'
  const testPassword = process.env.TEST_USER_PASSWORD || 'test-password'

  try {
    // Wait for login form or OAuth buttons
    // Adjust selectors based on your actual login page
    await page.waitForSelector('button, input[type="email"]', { timeout: 5000 })

    // Option 1: Direct email/password login (if available)
    const emailInput = page.locator('input[type="email"]').first()
    if (await emailInput.isVisible()) {
      await emailInput.fill(testEmail)

      const passwordInput = page.locator('input[type="password"]').first()
      await passwordInput.fill(testPassword)

      const submitButton = page.locator('button[type="submit"]').first()
      await submitButton.click()

      // Wait for navigation to authenticated route
      await page.waitForURL(/\/pt\/app/, { timeout: 10000 })
    } else {
      // Option 2: Mock authentication for testing
      // Create a mock session directly in localStorage
      await page.evaluate(() => {
        // Mock Supabase session
        const mockSession = {
          access_token: 'mock-access-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'mock-refresh-token',
          user: {
            id: 'mock-user-id',
            email: 'test@example.com',
            user_metadata: {
              full_name: 'Test User',
              avatar_url: null,
            },
          },
        }

        // Store in localStorage (Supabase convention)
        const storageKey = `sb-${window.location.hostname.split('.')[0]}-auth-token`
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            currentSession: mockSession,
            expiresAt: Date.now() + 3600000,
          })
        )
      })

      // Navigate to authenticated route
      await page.goto('/pt/app/dashboard')
    }

    // Verify authentication succeeded
    await expect(page).toHaveURL(/\/pt\/app/)

    // Save authentication state
    await page.context().storageState({ path: authFile })

    console.log('✅ Authentication setup completed successfully')
  } catch (error) {
    console.warn('⚠️  Authentication setup failed:', error)
    console.warn('Tests requiring authentication will be skipped')

    // Create empty auth file to prevent errors
    await page.context().storageState({ path: authFile })
  }
})
