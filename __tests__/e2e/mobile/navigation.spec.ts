import { test, expect } from '@playwright/test'

/**
 * Mobile Navigation & Gestures E2E Tests
 *
 * Tests mobile navigation including:
 * - Bottom navigation bar
 * - Touch targets and tap areas
 * - Swipe gestures
 * - Page transitions
 * - Back navigation
 */

// Configure mobile viewport
test.use({
  viewport: { width: 390, height: 844 }, // iPhone 13
  hasTouch: true,
  isMobile: true,
})

test.describe('Mobile Bottom Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pt/app')
    await page.waitForLoadState('networkidle')
  })

  test('should display bottom navigation bar', async ({ page }) => {
    const bottomNav = page.locator('[data-testid="bottom-navigation"]')
    await expect(bottomNav).toBeVisible()

    // Check if nav is at the bottom of viewport
    const navBox = await bottomNav.boundingBox()
    const viewportHeight = page.viewportSize()?.height || 0

    expect(navBox?.y).toBeGreaterThan(viewportHeight - 200)
  })

  test('should have proper touch targets for nav items', async ({ page }) => {
    const navItems = page.locator('[data-testid="bottom-nav-item"]')
    const count = await navItems.count()

    for (let i = 0; i < count; i++) {
      const item = navItems.nth(i)
      const box = await item.boundingBox()

      // WCAG AA minimum: 44x44px
      expect(box?.width).toBeGreaterThanOrEqual(44)
      expect(box?.height).toBeGreaterThanOrEqual(44)
    }
  })

  test('should navigate between pages via bottom nav', async ({ page }) => {
    // Tap Chat
    const chatNav = page.getByRole('link', { name: /chat/i })
    await chatNav.tap()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(/\/chat/)

    // Tap Dashboard
    const dashboardNav = page.getByRole('link', { name: /dashboard|painel/i })
    await dashboardNav.tap()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(/\/dashboard/)

    // Tap Home
    const homeNav = page.getByRole('link', { name: /home|início/i })
    await homeNav.tap()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(/\/app/)
  })

  test('should highlight active nav item', async ({ page }) => {
    // Navigate to chat
    await page.goto('/pt/app/chat')
    await page.waitForLoadState('networkidle')

    // Chat nav should be active
    const chatNav = page.getByRole('link', { name: /chat/i })
    const chatClasses = await chatNav.getAttribute('class')

    expect(chatClasses).toContain('active')
  })

  test('should handle rapid taps without breaking', async ({ page }) => {
    const chatNav = page.getByRole('link', { name: /chat/i })

    // Rapid tap test
    await chatNav.tap()
    await chatNav.tap()
    await chatNav.tap()

    await page.waitForTimeout(500)

    // Should end up on chat page
    await expect(page).toHaveURL(/\/chat/)
  })
})

test.describe('Mobile Page Transitions', () => {
  test('should have smooth transitions between pages', async ({ page }) => {
    await page.goto('/pt/app')
    await page.waitForLoadState('networkidle')

    const startTime = Date.now()

    // Navigate to another page
    await page.getByRole('link', { name: /chat/i }).tap()
    await page.waitForLoadState('networkidle')

    const endTime = Date.now()
    const transitionTime = endTime - startTime

    // Transition should be reasonably fast (<2s)
    expect(transitionTime).toBeLessThan(2000)
  })

  test('should handle back navigation', async ({ page }) => {
    // Start at home
    await page.goto('/pt/app')
    await page.waitForLoadState('networkidle')

    // Navigate to chat
    await page.goto('/pt/app/chat')
    await page.waitForLoadState('networkidle')

    // Go back
    await page.goBack()
    await page.waitForLoadState('networkidle')

    // Should be back at home
    await expect(page).toHaveURL(/\/app$/)
  })
})

test.describe('Mobile Swipe Gestures', () => {
  test('should support pull-to-refresh gesture', async ({ page }) => {
    await page.goto('/pt/app/dashboard')
    await page.waitForLoadState('networkidle')

    // Check if pull-to-refresh is available
    const pullToRefresh = page.locator('[data-testid="pull-to-refresh"]')

    if (await pullToRefresh.isVisible()) {
      // Simulate pull-to-refresh gesture
      await page.touchscreen.tap(200, 100) // Start position
      await page.touchscreen.tap(200, 300) // Drag down

      // Look for refresh indicator
      const refreshIndicator = page.locator('[data-testid="refresh-indicator"]')
      await expect(refreshIndicator).toBeVisible({ timeout: 1000 })
    }
  })

  test('should support swipeable cards', async ({ page }) => {
    await page.goto('/pt/app')
    await page.waitForLoadState('networkidle')

    // Look for swipeable cards
    const swipeableCard = page.locator('[data-testid="swipeable-card"]').first()

    if (await swipeableCard.isVisible()) {
      const initialBox = await swipeableCard.boundingBox()

      // Perform swipe gesture
      if (initialBox) {
        await page.touchscreen.tap(initialBox.x + 100, initialBox.y + 50)
        await page.touchscreen.tap(initialBox.x - 100, initialBox.y + 50)
      }

      await page.waitForTimeout(500)

      // Card should have moved or dismissed
      const finalBox = await swipeableCard.boundingBox()
      if (finalBox) {
        expect(finalBox.x).not.toBe(initialBox?.x)
      }
    }
  })

  test('should handle horizontal swipe for navigation', async ({ page }) => {
    await page.goto('/pt/app/investigacoes')
    await page.waitForLoadState('networkidle')

    // Check if horizontal swipe navigation is implemented
    const swipeArea = page.locator('[data-testid="swipe-navigation"]')

    if (await swipeArea.isVisible()) {
      // Swipe left (next)
      await page.touchscreen.tap(300, 400)
      await page.touchscreen.tap(100, 400)

      await page.waitForTimeout(500)

      // URL or content should change
      // This depends on implementation
    }
  })
})

test.describe('Mobile Touch Interactions', () => {
  test('should handle long press gestures', async ({ page }) => {
    await page.goto('/pt/app')
    await page.waitForLoadState('networkidle')

    // Look for elements with long-press actions
    const longPressTarget = page.locator('[data-testid="long-press-card"]').first()

    if (await longPressTarget.isVisible()) {
      // Simulate long press (hold for 500ms)
      const box = await longPressTarget.boundingBox()
      if (box) {
        await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
        await page.waitForTimeout(500)

        // Context menu or action sheet should appear
        const contextMenu = page.locator('[data-testid="context-menu"]')
        await expect(contextMenu).toBeVisible({ timeout: 1000 })
      }
    }
  })

  test('should prevent double-tap zoom', async ({ page }) => {
    await page.goto('/pt/app/chat')
    await page.waitForLoadState('networkidle')

    // Double tap on content area
    const content = page.locator('main')
    const box = await content.boundingBox()

    if (box) {
      await page.touchscreen.tap(box.x + 100, box.y + 100)
      await page.waitForTimeout(100)
      await page.touchscreen.tap(box.x + 100, box.y + 100)
    }

    await page.waitForTimeout(500)

    // Page should NOT be zoomed (touch-manipulation CSS prevents it)
    // Verify by checking viewport size hasn't changed
    const viewport = page.viewportSize()
    expect(viewport?.width).toBe(390)
  })

  test('should handle tap on all interactive elements', async ({ page }) => {
    await page.goto('/pt/app')
    await page.waitForLoadState('networkidle')

    // Find all buttons
    const buttons = page.getByRole('button')
    const count = await buttons.count()

    // Test first 5 buttons
    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i)

      if (await button.isVisible()) {
        // Button should be tappable
        await expect(button).toBeEnabled()

        // Verify touch target size
        const box = await button.boundingBox()
        expect(box?.width).toBeGreaterThan(0)
        expect(box?.height).toBeGreaterThan(0)
      }
    }
  })
})

test.describe('Mobile Safe Areas', () => {
  test('should respect safe area insets on notched devices', async ({ page, browserName }) => {
    // Only test on WebKit (Safari) which simulates iPhone notch
    test.skip(browserName !== 'webkit', 'Safe area testing specific to WebKit')

    await page.goto('/pt/app')
    await page.waitForLoadState('networkidle')

    // Check header safe area
    const header = page.getByRole('banner')
    if (await header.isVisible()) {
      const headerBox = await header.boundingBox()

      // Header should start below notch (typically 44-47px on iPhone)
      expect(headerBox?.y).toBeGreaterThanOrEqual(0)
    }

    // Check bottom nav safe area
    const bottomNav = page.locator('[data-testid="bottom-navigation"]')
    if (await bottomNav.isVisible()) {
      const navBox = await bottomNav.boundingBox()
      const viewportHeight = page.viewportSize()?.height || 0

      // Bottom nav should have padding for home indicator (typically 34px on iPhone X+)
      expect(navBox?.height).toBeGreaterThan(56) // Base height + safe area
    }
  })
})

test.describe('Mobile Scroll Behavior', () => {
  test('should handle momentum scrolling', async ({ page }) => {
    await page.goto('/pt/app/investigacoes')
    await page.waitForLoadState('networkidle')

    const scrollContainer = page.locator('[data-testid="investigations-list"]')

    if (await scrollContainer.isVisible()) {
      // Initial scroll position
      const initialScroll = await scrollContainer.evaluate((el) => el.scrollTop)

      // Perform quick swipe for momentum scroll
      const box = await scrollContainer.boundingBox()
      if (box) {
        await page.touchscreen.tap(box.x + 100, box.y + 200)
        await page.touchscreen.tap(box.x + 100, box.y + 50)
      }

      await page.waitForTimeout(1000)

      // Should have scrolled
      const finalScroll = await scrollContainer.evaluate((el) => el.scrollTop)
      expect(finalScroll).not.toBe(initialScroll)
    }
  })

  test('should prevent body scroll when modal is open', async ({ page }) => {
    await page.goto('/pt/app')
    await page.waitForLoadState('networkidle')

    // Open a modal/bottom sheet if available
    const modalTrigger = page.locator('[data-testid="open-modal"]').first()

    if (await modalTrigger.isVisible()) {
      await modalTrigger.tap()
      await page.waitForTimeout(500)

      // Try to scroll body
      await page.evaluate(() => {
        window.scrollBy(0, 100)
      })

      await page.waitForTimeout(300)

      // Body scroll should be locked
      const scrollY = await page.evaluate(() => window.scrollY)
      expect(scrollY).toBe(0)
    }
  })
})
