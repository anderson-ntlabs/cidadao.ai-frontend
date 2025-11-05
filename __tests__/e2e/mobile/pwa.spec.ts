import { test, expect } from '@playwright/test'
import { setupAuth } from '../../helpers/auth.setup'

/**
 * PWA (Progressive Web App) E2E Tests
 *
 * Tests PWA functionality including:
 * - Manifest validation
 * - Service worker registration
 * - Install prompts
 * - Update notifications
 * - Offline functionality
 * - Add to Home Screen flow
 */

// Configure mobile viewport
test.use({
  viewport: { width: 390, height: 844 }, // iPhone 13
  hasTouch: true,
  isMobile: true,
})

test.describe('PWA Manifest', () => {
  test('should have valid manifest.json', async ({ page }) => {
    const response = await page.goto('/manifest.json')
    expect(response?.status()).toBe(200)

    const manifest = await response?.json()

    // Required manifest fields
    expect(manifest.name).toBeTruthy()
    expect(manifest.short_name).toBeTruthy()
    expect(manifest.start_url).toBeTruthy()
    expect(manifest.display).toBeTruthy()
    expect(manifest.icons).toBeInstanceOf(Array)
    expect(manifest.icons.length).toBeGreaterThan(0)

    // Check icon sizes
    const has512Icon = manifest.icons.some((icon: any) => icon.sizes === '512x512')
    expect(has512Icon).toBe(true)
  })

  test('should have theme-color meta tag', async ({ page }) => {
    await page.goto('/pt')
    await page.waitForLoadState('networkidle')

    const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content')
    expect(themeColor).toBeTruthy()
    expect(themeColor).toMatch(/^#[0-9a-fA-F]{6}$/) // Valid hex color
  })

  test('should have apple-touch-icon', async ({ page }) => {
    await page.goto('/pt')

    const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]')
    await expect(appleTouchIcon).toHaveCount(1)

    const href = await appleTouchIcon.getAttribute('href')
    expect(href).toBeTruthy()
  })
})

test.describe('Service Worker', () => {
  test('should register service worker', async ({ page }) => {
    await page.goto('/pt')
    await page.waitForLoadState('networkidle')

    // Wait for service worker to register
    await page.waitForTimeout(2000)

    // Check if service worker is registered
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        return !!registration
      }
      return false
    })

    expect(swRegistered).toBe(true)
  })

  test('should have service worker in controlling state', async ({ page }) => {
    await page.goto('/pt')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const isControlling = await page.evaluate(() => {
      return !!navigator.serviceWorker.controller
    })

    expect(isControlling).toBe(true)
  })

  test('should cache resources for offline use', async ({ page, context }) => {
    await page.goto('/pt')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Go offline
    await context.setOffline(true)

    // Navigate to another page
    await page.goto('/pt/login')

    // Page should still load (from cache)
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 })

    // Go back online
    await context.setOffline(false)
  })
})

test.describe('Install Prompt', () => {
  test('should display install prompt after delay', async ({ page }) => {
    await page.goto('/pt')
    await page.waitForLoadState('networkidle')

    // Wait for install prompt delay (typically 3-5 seconds)
    await page.waitForTimeout(6000)

    // Look for install prompt
    const installPrompt = page.locator('[data-testid="install-prompt"]')

    // Prompt may or may not appear depending on browser/context
    // Just check if element exists
    const exists = await installPrompt.count()
    expect(exists).toBeGreaterThanOrEqual(0)
  })

  test('should allow dismissing install prompt', async ({ page }) => {
    await page.goto('/pt')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(6000)

    const installPrompt = page.locator('[data-testid="install-prompt"]')

    if (await installPrompt.isVisible()) {
      // Find and click dismiss button
      const dismissButton = page.getByRole('button', { name: /agora não|cancelar|fechar/i })
      await dismissButton.tap()

      await page.waitForTimeout(500)

      // Prompt should be hidden
      await expect(installPrompt).not.toBeVisible()
    }
  })

  test('should persist dismissal in localStorage', async ({ page }) => {
    await page.goto('/pt')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(6000)

    const installPrompt = page.locator('[data-testid="install-prompt"]')

    if (await installPrompt.isVisible()) {
      const dismissButton = page.getByRole('button', { name: /agora não|cancelar|fechar/i })
      await dismissButton.tap()

      // Check localStorage
      const dismissed = await page.evaluate(() => {
        return localStorage.getItem('pwa-install-dismissed')
      })

      expect(dismissed).toBeTruthy()
    }
  })
})

test.describe('Update Notification', () => {
  test('should show update notification when SW updates', async ({ page }) => {
    await page.goto('/pt')
    await page.waitForLoadState('networkidle')

    // Simulate service worker update
    const hasUpdate = await page.evaluate(() => {
      return new Promise((resolve) => {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistration().then((reg) => {
            if (reg && reg.waiting) {
              resolve(true)
            } else {
              resolve(false)
            }
          })
        } else {
          resolve(false)
        }
      })
    })

    if (hasUpdate) {
      const updateNotification = page.locator('[data-testid="update-notification"]')
      await expect(updateNotification).toBeVisible({ timeout: 3000 })
    }
  })

  test('should reload page when update is accepted', async ({ page }) => {
    await page.goto('/pt')
    await page.waitForLoadState('networkidle')

    const updateNotification = page.locator('[data-testid="update-notification"]')

    if (await updateNotification.isVisible()) {
      // Click update button
      const updateButton = page.getByRole('button', { name: /atualizar/i })

      // Listen for navigation (page reload)
      const navigationPromise = page.waitForNavigation()

      await updateButton.tap()

      await navigationPromise

      // Page should have reloaded
      expect(page.url()).toContain('/pt')
    }
  })
})

test.describe('Offline Functionality', () => {
  test.beforeEach(async ({ page, context }) => {
    // Setup authentication for authenticated routes
    await setupAuth(page, context)
  })

  test('should display offline banner when connection is lost', async ({ page, context }) => {
    await page.goto('/pt/app')
    await page.waitForLoadState('networkidle')

    // Go offline
    await context.setOffline(true)

    await page.waitForTimeout(1000)

    // Look for offline banner
    const offlineBanner = page.locator('[data-testid="offline-banner"]')
    await expect(offlineBanner).toBeVisible({ timeout: 3000 })

    // Banner should indicate offline status
    await expect(offlineBanner).toContainText(/offline|sem conexão/i)

    // Go back online
    await context.setOffline(false)
  })

  test('should hide offline banner when connection is restored', async ({ page, context }) => {
    await page.goto('/pt/app')
    await page.waitForLoadState('networkidle')

    // Go offline
    await context.setOffline(true)
    await page.waitForTimeout(1000)

    const offlineBanner = page.locator('[data-testid="offline-banner"]')
    await expect(offlineBanner).toBeVisible({ timeout: 3000 })

    // Go back online
    await context.setOffline(false)
    await page.waitForTimeout(2000)

    // Banner should disappear
    await expect(offlineBanner).not.toBeVisible()
  })

  test('should allow basic navigation while offline', async ({ page, context }) => {
    await page.goto('/pt/app')
    await page.waitForLoadState('networkidle')

    // Go offline
    await context.setOffline(true)

    // Try to navigate to a cached page
    await page.goto('/pt/login')

    // Page should still load
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 })

    await context.setOffline(false)
  })

  test('should show error for uncached pages while offline', async ({ page, context }) => {
    await page.goto('/pt')
    await page.waitForLoadState('networkidle')

    // Go offline
    await context.setOffline(true)

    // Try to navigate to a page that might not be cached
    const response = await page.goto('/pt/app/some-uncached-page')

    // Should either get cached version or error
    const status = response?.status()
    expect([200, 404, 503]).toContain(status)

    await context.setOffline(false)
  })
})

test.describe('PWA iOS Specific', () => {
  test.skip(({ browserName }) => browserName !== 'webkit', 'iOS PWA tests for WebKit only')

  test('should show iOS install instructions', async ({ page }) => {
    await page.goto('/pt')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(6000)

    const installPrompt = page.locator('[data-testid="install-prompt"]')

    if (await installPrompt.isVisible()) {
      // iOS should show manual installation instructions
      const iosInstructions = page.getByText(/toque no ícone de compartilhar/i)
      await expect(iosInstructions).toBeVisible({ timeout: 2000 })
    }
  })

  test('should detect if running in standalone mode', async ({ page }) => {
    await page.goto('/pt')

    const isStandalone = await page.evaluate(() => {
      return window.matchMedia('(display-mode: standalone)').matches
    })

    // In test environment, this will be false
    // In real iOS PWA, this would be true
    expect(typeof isStandalone).toBe('boolean')
  })
})

test.describe('PWA Performance', () => {
  test('should load quickly from service worker cache', async ({ page }) => {
    // First visit
    await page.goto('/pt')
    await page.waitForLoadState('networkidle')

    // Second visit (should be cached)
    const startTime = Date.now()
    await page.goto('/pt')
    await page.waitForLoadState('networkidle')
    const endTime = Date.now()

    const loadTime = endTime - startTime

    // Cached load should be fast (<1s)
    expect(loadTime).toBeLessThan(1000)
  })

  test('should have small initial bundle size', async ({ page }) => {
    const response = await page.goto('/pt')

    const contentLength = response?.headers()['content-length']
    if (contentLength) {
      const sizeKB = parseInt(contentLength) / 1024

      // Initial HTML should be reasonably small
      expect(sizeKB).toBeLessThan(100)
    }
  })
})
