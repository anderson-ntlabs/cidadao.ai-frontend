import { test, expect } from '@playwright/test'

test.describe('PWA Features', () => {
  test('should have PWA manifest', async ({ page }) => {
    await page.goto('/')

    // Check for manifest link
    const manifestLink = await page.locator('link[rel="manifest"]')
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json')

    // Fetch and validate manifest
    const response = await page.request.get('/manifest.json')
    expect(response.ok()).toBeTruthy()

    const manifest = await response.json()
    expect(manifest.name).toBe('Cidadão.AI')
    expect(manifest.short_name).toBe('Cidadão.AI')
    expect(manifest.start_url).toBe('/')
    expect(manifest.display).toBe('standalone')
    expect(manifest.theme_color).toBe('#16a34a')
    expect(manifest.background_color).toBe('#ffffff')
    expect(manifest.icons).toHaveLength(8)
  })

  test('should register service worker', async ({ page }) => {
    await page.goto('/')

    // Wait for service worker registration
    const swRegistration = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        return registration ? true : false
      }
      return false
    })

    expect(swRegistration).toBeTruthy()
  })

  test('should have meta tags for mobile', async ({ page }) => {
    await page.goto('/')

    // Check viewport meta tag
    const viewport = await page.locator('meta[name="viewport"]')
    await expect(viewport).toHaveAttribute('content', 'width=device-width, initial-scale=1')

    // Check theme-color meta tag
    const themeColor = await page.locator('meta[name="theme-color"]')
    await expect(themeColor).toHaveAttribute('content', '#16a34a')

    // Check apple mobile web app capable
    const appleCapable = await page.locator('meta[name="apple-mobile-web-app-capable"]')
    await expect(appleCapable).toHaveAttribute('content', 'yes')

    // Check apple status bar style
    const appleStatusBar = await page.locator('meta[name="apple-mobile-web-app-status-bar-style"]')
    await expect(appleStatusBar).toHaveAttribute('content', 'black-translucent')
  })

  test('should have apple touch icon', async ({ page }) => {
    await page.goto('/')

    // Check for apple touch icon
    const appleTouchIcon = await page.locator('link[rel="apple-touch-icon"]')
    await expect(appleTouchIcon).toHaveAttribute('href', '/apple-touch-icon.png')

    // Verify icon exists
    const response = await page.request.get('/apple-touch-icon.png')
    expect(response.ok()).toBeTruthy()
  })

  test('should work offline for cached pages', async ({ page, context }) => {
    // First visit to cache the page
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Wait for service worker to be ready
    await page.waitForTimeout(2000)

    // Go offline
    await context.setOffline(true)

    // Try to navigate to cached page
    await page.reload()

    // Page should still load (from cache)
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should show install prompt on desktop', async ({ page, browserName }) => {
    // Skip on Safari as it doesn't support PWA install prompts
    if (browserName === 'webkit') {
      test.skip()
    }

    await page.goto('/')

    // Check for install button
    const installButton = page.locator('[data-testid="pwa-install-button"]')

    // Install button might be visible on desktop browsers that support PWA
    if (await installButton.isVisible()) {
      await expect(installButton).toHaveText(/Instalar/)
    }
  })

  test('should handle orientation changes', async ({ page, context }) => {
    // Only test on mobile devices
    if (!context._options.isMobile) {
      test.skip()
    }

    await page.goto('/')

    // Check portrait orientation
    await page.evaluate(() => {
      // @ts-ignore
      window.screen.orientation.type = 'portrait-primary'
      window.dispatchEvent(new Event('orientationchange'))
    })

    // Layout should adapt
    await expect(page.locator('body')).toBeVisible()

    // Check landscape orientation
    await page.evaluate(() => {
      // @ts-ignore
      window.screen.orientation.type = 'landscape-primary'
      window.dispatchEvent(new Event('orientationchange'))
    })

    // Layout should still be functional
    await expect(page.locator('body')).toBeVisible()
  })

  test('should have splash screens for iOS', async ({ page }) => {
    await page.goto('/')

    // Check for iOS splash screen links
    const splashScreens = await page.locator('link[rel="apple-touch-startup-image"]').all()
    expect(splashScreens.length).toBeGreaterThan(0)

    // Verify at least one splash screen exists
    if (splashScreens.length > 0) {
      const href = await splashScreens[0].getAttribute('href')
      if (href) {
        const response = await page.request.get(href)
        expect(response.ok()).toBeTruthy()
      }
    }
  })

  test('should handle app shortcuts', async ({ page }) => {
    // Load manifest
    const response = await page.request.get('/manifest.json')
    const manifest = await response.json()

    // Check if shortcuts are defined
    if (manifest.shortcuts) {
      expect(manifest.shortcuts).toBeInstanceOf(Array)

      // Each shortcut should have required properties
      for (const shortcut of manifest.shortcuts) {
        expect(shortcut).toHaveProperty('name')
        expect(shortcut).toHaveProperty('url')
        expect(shortcut).toHaveProperty('icons')
      }
    }
  })

  test('should prefetch resources for performance', async ({ page }) => {
    await page.goto('/')

    // Check for prefetch/preload links
    const prefetchLinks = await page.locator('link[rel="prefetch"], link[rel="preload"]').all()

    // Should have some prefetched resources
    expect(prefetchLinks.length).toBeGreaterThan(0)
  })
})
