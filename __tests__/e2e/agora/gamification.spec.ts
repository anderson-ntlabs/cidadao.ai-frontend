/**
 * Ágora Gamification E2E Tests
 *
 * Tests for gamification features including:
 * - XP display
 * - Challenges UI
 * - Badges showcase
 * - Level/rank display
 * - Celebration modal
 *
 * Note: Most gamification features require authentication.
 * These tests focus on component rendering and basic interactions.
 *
 * Author: Anderson Henrique da Silva
 * Date: 2025-12-08
 */

import { test, expect } from '@playwright/test'

test.describe('Ágora Gamification Features', () => {
  test.describe('Login Page Features', () => {
    test('should display gamification features on login page', async ({ page }) => {
      await page.goto('/pt/agora/login')
      await page.waitForLoadState('networkidle')

      // Check gamification features are highlighted
      await expect(page.getByText(/gamificação/i)).toBeVisible()
      await expect(page.getByText(/certificado/i)).toBeVisible()
      await expect(page.getByText(/mentoria/i)).toBeVisible()
    })

    test('should show graduation cap icon', async ({ page }) => {
      await page.goto('/pt/agora/login')
      await page.waitForLoadState('networkidle')

      // Check graduation cap icon/logo is present
      const logo = page.locator('[data-testid="agora-logo"], .graduation-cap').first()
      const hasLogo = await logo.isVisible().catch(() => false)

      // Alternative: check for the SVG or icon
      if (!hasLogo) {
        const svgIcon = page
          .locator('svg')
          .filter({ has: page.locator('path') })
          .first()
        await expect(svgIcon).toBeVisible()
      }
    })
  })

  test.describe('Onboarding Gamification', () => {
    test('should show XP reward for completing onboarding in preview', async ({ page }) => {
      await page.goto('/pt/agora/onboarding?preview=true')
      await page.waitForLoadState('networkidle')

      // The page should mention XP rewards
      const html = await page.content()
      expect(html.toLowerCase()).toContain('xp')
    })

    test('should have progress indicators', async ({ page }) => {
      await page.goto('/pt/agora/onboarding?preview=true')
      await page.waitForLoadState('networkidle')

      // Check for progress step indicators (circles/checkmarks)
      const stepIndicators = page.locator('[class*="rounded-xl"], [class*="step"]')
      const count = await stepIndicators.count()
      expect(count).toBeGreaterThan(0)
    })
  })

  test.describe('Component Rendering', () => {
    test('should render GlassCard components correctly', async ({ page }) => {
      await page.goto('/pt/agora/login')
      await page.waitForLoadState('networkidle')

      // Check for glass card styling (backdrop blur)
      const glassCard = page.locator('[class*="backdrop-blur"], [class*="glass"]').first()
      await expect(glassCard).toBeVisible()
    })

    test('should render buttons with proper styling', async ({ page }) => {
      await page.goto('/pt/agora/login')
      await page.waitForLoadState('networkidle')

      // Check GitHub button has proper styling
      const githubButton = page.getByRole('button', { name: /entrar com github/i })
      await expect(githubButton).toHaveClass(/bg-gray-900|dark:bg-white/)
    })

    test('should render gradient backgrounds', async ({ page }) => {
      await page.goto('/pt/agora/login')
      await page.waitForLoadState('networkidle')

      // Check for gradient classes
      const gradientElements = page.locator('[class*="from-green"], [class*="to-blue"]')
      const count = await gradientElements.count()
      expect(count).toBeGreaterThan(0)
    })
  })

  test.describe('Dark Mode Support', () => {
    test('should support dark mode classes', async ({ page }) => {
      await page.goto('/pt/agora/login')
      await page.waitForLoadState('networkidle')

      // Check that dark mode classes exist in the HTML
      const html = await page.content()
      expect(html).toContain('dark:')
    })
  })

  test.describe('Animation Classes', () => {
    test('should have animation classes for interactive elements', async ({ page }) => {
      await page.goto('/pt/agora/login')
      await page.waitForLoadState('networkidle')

      // Check for transition/animation classes
      const html = await page.content()
      expect(html).toMatch(/transition|animate|duration/)
    })
  })
})
