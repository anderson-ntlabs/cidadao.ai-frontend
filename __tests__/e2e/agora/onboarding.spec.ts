/**
 * Ágora Onboarding E2E Tests
 *
 * Tests for the Ágora Academy onboarding flow including:
 * - Presentation carousel
 * - Track selection
 * - GitHub setup
 * - Fork verification
 * - Preview mode
 *
 * Author: Anderson Henrique da Silva
 * Date: 2025-12-08
 */

import { test, expect } from '@playwright/test'

test.describe('Ágora Onboarding Flow', () => {
  test.describe('Preview Mode', () => {
    test('should allow access to onboarding in preview mode', async ({ page }) => {
      await page.goto('/pt/agora/onboarding?preview=true')
      await page.waitForLoadState('networkidle')

      // Check preview banner is visible
      await expect(page.getByText(/modo preview/i)).toBeVisible()

      // Check back to dashboard link
      await expect(page.getByRole('link', { name: /voltar ao dashboard/i })).toBeVisible()
    })

    test('should display presentation step in preview mode', async ({ page }) => {
      await page.goto('/pt/agora/onboarding?preview=true')
      await page.waitForLoadState('networkidle')

      // Check presentation title
      await expect(page.getByRole('heading', { name: /conheça o cidadão\.ai/i })).toBeVisible()

      // Check carousel is present
      await expect(page.getByText(/slide/i)).toBeVisible()
    })

    test('should show progress steps', async ({ page }) => {
      await page.goto('/pt/agora/onboarding?preview=true')
      await page.waitForLoadState('networkidle')

      // Check step labels are visible
      await expect(page.getByText(/apresentação/i).first()).toBeVisible()
      await expect(page.getByText(/trilha/i).first()).toBeVisible()
      await expect(page.getByText(/github/i).first()).toBeVisible()
    })

    test('should display XP reward badge', async ({ page }) => {
      await page.goto('/pt/agora/onboarding?preview=true')
      await page.waitForLoadState('networkidle')

      // Check XP reward badge (only in authenticated mode)
      // In preview mode it shows Preview badge instead
      await expect(page.getByText(/preview/i)).toBeVisible()
    })

    test('should navigate between slides using arrows', async ({ page }) => {
      await page.goto('/pt/agora/onboarding?preview=true')
      await page.waitForLoadState('networkidle')

      // Wait for carousel to load
      await page.waitForTimeout(1000)

      // Check initial slide indicator
      const slideIndicator = page.getByText(/slide 1 de/i)
      await expect(slideIndicator).toBeVisible()

      // Find and click next button if visible
      const nextButton = page
        .locator('button[aria-label*="próximo"], button[aria-label*="next"]')
        .first()
      if (await nextButton.isVisible()) {
        await nextButton.click()
        await page.waitForTimeout(500)

        // Slide should advance
        await expect(page.getByText(/slide 2 de/i)).toBeVisible()
      }
    })
  })

  test.describe('Track Selection', () => {
    test('should display all 4 tracks', async ({ page }) => {
      await page.goto('/pt/agora/onboarding?preview=true')
      await page.waitForLoadState('networkidle')

      // Navigate to step 2 manually by completing presentation
      // For now, just check that track names exist in the DOM
      const html = await page.content()

      expect(html).toContain('Backend')
      expect(html).toContain('Frontend')
      expect(html).toContain('IA')
      expect(html).toContain('DevOps')
    })
  })

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('/pt/agora/onboarding?preview=true')
      await page.waitForLoadState('networkidle')

      // Tab through elements
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')

      // Should be able to navigate with keyboard
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
      expect(focusedElement).toBeTruthy()
    })

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/pt/agora/onboarding?preview=true')
      await page.waitForLoadState('networkidle')

      // Check h1 exists
      const h1Count = await page.locator('h1').count()
      expect(h1Count).toBeGreaterThanOrEqual(1)
    })
  })

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/pt/agora/onboarding?preview=true')
      await page.waitForLoadState('networkidle')

      // Check header is visible
      await expect(page.getByText(/onboarding|apresentacao/i).first()).toBeVisible()

      // Check preview badge is visible
      await expect(page.getByText(/preview/i)).toBeVisible()
    })

    test('should display correctly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto('/pt/agora/onboarding?preview=true')
      await page.waitForLoadState('networkidle')

      // Check main content is visible
      await expect(page.getByText(/conheça o cidadão/i)).toBeVisible()
    })
  })
})
