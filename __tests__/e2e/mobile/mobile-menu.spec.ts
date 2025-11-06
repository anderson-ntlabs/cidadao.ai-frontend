import { test, expect } from '@playwright/test'
import { setupAuth } from '../../helpers/auth.setup'

/**
 * Mobile Menu E2E Tests
 *
 * Tests mobile hamburger menu functionality including:
 * - Menu button visibility on public pages
 * - Menu button absence on authenticated pages
 * - Menu open/close behavior
 * - Navigation via menu
 * - Backdrop click to close
 */

// Configure mobile viewport
test.use({
  viewport: { width: 390, height: 844 }, // iPhone 13
  hasTouch: true,
  isMobile: true,
})

test.describe('Mobile Menu - Public Pages', () => {
  test('should display menu button on landing page', async ({ page }) => {
    await page.goto('/pt')
    await page.waitForLoadState('networkidle')

    // Wait for menu button to be ready
    await page.waitForSelector('button[aria-label*="menu"], button[aria-label*="Menu"]', {
      state: 'visible',
      timeout: 10000,
    })

    const menuButton = page.getByRole('button', { name: /open menu/i })
    await expect(menuButton).toBeVisible()

    // Check touch target size (WCAG AA: 44x44px minimum)
    const box = await menuButton.boundingBox()
    expect(box?.width).toBeGreaterThanOrEqual(44)
    expect(box?.height).toBeGreaterThanOrEqual(44)
  })

  test('should open menu when button is tapped', async ({ page }) => {
    await page.goto('/pt')
    await page.waitForLoadState('networkidle')

    // Wait for menu button to be ready
    await page.waitForSelector('button[aria-label*="menu"], button[aria-label*="Menu"]', {
      state: 'visible',
      timeout: 10000,
    })

    // Tap menu button
    const menuButton = page.getByRole('button', { name: /open menu/i })
    await menuButton.tap()

    // Wait for menu to open
    await page.waitForTimeout(500)

    // Check if menu drawer is visible
    const menuDrawer = page.getByRole('dialog', { name: /mobile navigation menu/i })
    await expect(menuDrawer).toBeVisible()

    // Check if backdrop is visible
    const backdrop = page.locator('.fixed.inset-0.z-40.bg-black\\/50')
    await expect(backdrop).toBeVisible()
  })

  test('should close menu when close button is tapped', async ({ page }) => {
    await page.goto('/pt')
    await page.waitForLoadState('networkidle')

    // Wait for menu button to be ready
    await page.waitForSelector('button[aria-label*="menu"], button[aria-label*="Menu"]', {
      state: 'visible',
      timeout: 10000,
    })

    // Open menu
    await page.getByRole('button', { name: /open menu/i }).tap()
    await page.waitForTimeout(500)

    // Close menu via close button
    const closeButton = page.getByRole('button', { name: /close menu/i })
    await closeButton.tap()

    await page.waitForTimeout(500)

    // Menu should be hidden
    const menuDrawer = page.getByRole('dialog', { name: /mobile navigation menu/i })
    await expect(menuDrawer).not.toBeVisible()
  })

  test('should close menu when backdrop is tapped', async ({ page }) => {
    await page.goto('/pt')
    await page.waitForLoadState('networkidle')

    // Wait for menu button to be ready
    await page.waitForSelector('button[aria-label*="menu"], button[aria-label*="Menu"]', {
      state: 'visible',
      timeout: 10000,
    })

    // Open menu
    await page.getByRole('button', { name: /open menu/i }).tap()
    await page.waitForTimeout(500)

    // Tap backdrop
    const backdrop = page.locator('.fixed.inset-0.z-40.bg-black\\/50')
    await backdrop.click({ position: { x: 350, y: 400 } }) // Right side of screen

    await page.waitForTimeout(500)

    // Menu should be hidden
    const menuDrawer = page.getByRole('dialog', { name: /mobile navigation menu/i })
    await expect(menuDrawer).not.toBeVisible()
  })

  test('should navigate to page when menu item is tapped', async ({ page }) => {
    await page.goto('/pt')
    await page.waitForLoadState('networkidle')

    // Wait for menu button to be ready
    await page.waitForSelector('button[aria-label*="menu"], button[aria-label*="Menu"]', {
      state: 'visible',
      timeout: 10000,
    })

    // Open menu
    await page.getByRole('button', { name: /open menu/i }).tap()
    await page.waitForTimeout(500)

    // Tap "Agentes" menu item
    const agentsLink = page.getByRole('link', { name: /agentes/i })
    await agentsLink.tap()

    await page.waitForLoadState('networkidle')

    // Should navigate to agents page
    await expect(page).toHaveURL(/\/pt\/agents/)

    // Menu should be closed after navigation
    await page.waitForTimeout(500)
    const menuDrawer = page.getByRole('dialog', { name: /mobile navigation menu/i })
    await expect(menuDrawer).not.toBeVisible()
  })

  test('should lock body scroll when menu is open', async ({ page }) => {
    await page.goto('/pt')
    await page.waitForLoadState('networkidle')

    // Wait for menu button to be ready
    await page.waitForSelector('button[aria-label*="menu"], button[aria-label*="Menu"]', {
      state: 'visible',
      timeout: 10000,
    })

    // Check initial body overflow
    const initialOverflow = await page.evaluate(() => document.body.style.overflow)
    expect(initialOverflow).toBe('')

    // Open menu
    await page.getByRole('button', { name: /open menu/i }).tap()
    await page.waitForTimeout(500)

    // Body scroll should be hidden
    const menuOpenOverflow = await page.evaluate(() => document.body.style.overflow)
    expect(menuOpenOverflow).toBe('hidden')

    // Close menu
    await page.getByRole('button', { name: /close menu/i }).tap()
    await page.waitForTimeout(500)

    // Body scroll should be restored
    const menuClosedOverflow = await page.evaluate(() => document.body.style.overflow)
    expect(menuClosedOverflow).toBe('unset')
  })

  test('should display menu on all public pages', async ({ page }) => {
    const publicPages = ['/pt', '/pt/agents', '/pt/about', '/pt/manifesto', '/pt/system']

    for (const pagePath of publicPages) {
      await page.goto(pagePath)
      await page.waitForLoadState('networkidle')

      const menuButton = page.getByRole('button', { name: /open menu/i })
      await expect(menuButton).toBeVisible()
    }
  })
})

test.describe('Mobile Menu - Authenticated Pages', () => {
  test.beforeEach(async ({ page, context }) => {
    // Setup authentication for authenticated routes
    await setupAuth(page, context)
  })

  test('should NOT display menu button on authenticated pages', async ({ page }) => {
    const authenticatedPages = [
      '/pt/app',
      '/pt/app/chat',
      '/pt/app/dashboard',
      '/pt/app/investigacoes',
    ]

    for (const pagePath of authenticatedPages) {
      await page.goto(pagePath)
      await page.waitForLoadState('networkidle')

      // Menu button should NOT be visible
      const menuButton = page.getByRole('button', { name: /open menu/i })
      const count = await menuButton.count()

      expect(count).toBe(0)
    }
  })

  test('should have bottom navigation instead of menu', async ({ page }) => {
    await page.goto('/pt/app/chat')
    await page.waitForLoadState('networkidle')

    // Bottom navigation should be visible
    const bottomNav = page.locator('[data-testid="bottom-navigation"]')
    await expect(bottomNav).toBeVisible({ timeout: 3000 })

    // Menu button should NOT exist
    const menuButton = page.getByRole('button', { name: /open menu/i })
    await expect(menuButton).not.toBeVisible()
  })
})

test.describe('Mobile Menu - Accessibility', () => {
  test('should have proper ARIA attributes', async ({ page }) => {
    await page.goto('/pt')
    await page.waitForLoadState('networkidle')

    // Wait for menu button to be ready
    await page.waitForSelector('button[aria-label*="menu"], button[aria-label*="Menu"]', {
      state: 'visible',
      timeout: 10000,
    })

    // Menu button should have proper label
    const menuButton = page.getByRole('button', { name: /open menu/i })
    const ariaLabel = await menuButton.getAttribute('aria-label')
    expect(ariaLabel).toBe('Open menu')

    // Open menu
    await menuButton.tap()
    await page.waitForTimeout(500)

    // Drawer should have dialog role
    const menuDrawer = page.getByRole('dialog', { name: /mobile navigation menu/i })
    await expect(menuDrawer).toHaveAttribute('role', 'dialog')
    await expect(menuDrawer).toHaveAttribute('aria-modal', 'true')

    // Close button should have proper label
    const closeButton = page.getByRole('button', { name: /close menu/i })
    const closeAriaLabel = await closeButton.getAttribute('aria-label')
    expect(closeAriaLabel).toBe('Close menu')
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/pt')
    await page.waitForLoadState('networkidle')

    // Wait for menu button to be ready
    await page.waitForSelector('button[aria-label*="menu"], button[aria-label*="Menu"]', {
      state: 'visible',
      timeout: 10000,
    })

    // Tab to menu button
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab') // Should focus on menu button

    // Open menu with Enter
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)

    // Menu should be open
    const menuDrawer = page.getByRole('dialog', { name: /mobile navigation menu/i })
    await expect(menuDrawer).toBeVisible()

    // Tab to close button
    await page.keyboard.press('Tab')

    // Close menu with Enter
    await page.keyboard.press('Enter')
    await page.waitForTimeout(500)

    // Menu should be closed
    await expect(menuDrawer).not.toBeVisible()
  })
})

test.describe('Mobile Menu - Animation', () => {
  test('should have smooth slide-in animation', async ({ page }) => {
    await page.goto('/pt')
    await page.waitForLoadState('networkidle')

    // Wait for menu button to be ready
    await page.waitForSelector('button[aria-label*="menu"], button[aria-label*="Menu"]', {
      state: 'visible',
      timeout: 10000,
    })

    const menuDrawer = page.getByRole('dialog', { name: /mobile navigation menu/i })

    // Initial state: menu should be off-screen (translate-x-full)
    const initialTransform = await menuDrawer.evaluate(
      (el) => window.getComputedStyle(el).transform
    )

    // Open menu
    await page.getByRole('button', { name: /open menu/i }).tap()

    // Wait for animation (300ms transition)
    await page.waitForTimeout(400)

    // Menu should be on-screen (translate-x-0)
    const openTransform = await menuDrawer.evaluate((el) => window.getComputedStyle(el).transform)

    expect(initialTransform).not.toBe(openTransform)
  })

  test('should have smooth backdrop fade-in', async ({ page }) => {
    await page.goto('/pt')
    await page.waitForLoadState('networkidle')

    // Wait for menu button to be ready
    await page.waitForSelector('button[aria-label*="menu"], button[aria-label*="Menu"]', {
      state: 'visible',
      timeout: 10000,
    })

    const backdrop = page.locator('.fixed.inset-0.z-40.bg-black\\/50')

    // Open menu
    await page.getByRole('button', { name: /open menu/i }).tap()

    // Wait for animation
    await page.waitForTimeout(400)

    // Backdrop should be visible with opacity
    const opacity = await backdrop.evaluate((el) => window.getComputedStyle(el).opacity)
    expect(parseFloat(opacity)).toBeGreaterThan(0.9)
  })
})
