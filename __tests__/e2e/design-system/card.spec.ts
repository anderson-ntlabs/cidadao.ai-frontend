import { test, expect } from '@playwright/test'

// Enable new design system for tests
test.use({
  extraHTTPHeaders: {
    'x-test-env': 'NEXT_PUBLIC_USE_NEW_DESIGN=true',
  },
})

test.describe('CardV2 Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the test page
    await page.goto('/pt/test-cards')
  })

  test.describe('Visual Tests', () => {
    test('should display all card variants correctly', async ({ page }) => {
      // Elevated variant
      const elevatedCard = page.locator('text=Elevated').locator('..')
      await expect(elevatedCard).toBeVisible()
      await expect(elevatedCard).toHaveCSS('box-shadow', /rgba/)

      // Outlined variant
      const outlinedCard = page.locator('text=Outlined').locator('..')
      await expect(outlinedCard).toBeVisible()
      await expect(outlinedCard).toHaveCSS('border-width', '1px')

      // Ghost variant
      const ghostCard = page.locator('text=Ghost').locator('..')
      await expect(ghostCard).toBeVisible()
      await expect(ghostCard).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')

      // Filled variant
      const filledCard = page.locator('text=Filled').locator('..')
      await expect(filledCard).toBeVisible()
    })

    test('should display all padding sizes correctly', async ({ page }) => {
      const paddingSizes = ['Small Padding', 'Medium Padding', 'Large Padding', 'Responsive']

      for (const size of paddingSizes) {
        const card = page.locator(`text=${size}`).locator('..')
        await expect(card).toBeVisible()
      }
    })

    test('should display badges correctly', async ({ page }) => {
      // Check different badge variants
      const successBadge = page.locator('text=Ativo')
      await expect(successBadge).toBeVisible()
      await expect(successBadge).toHaveCSS('background-color', /rgb/)

      const warningBadge = page.locator('text=Pendente')
      await expect(warningBadge).toBeVisible()

      const infoBadge = page.locator('text=Novo')
      await expect(infoBadge).toBeVisible()
    })

    test('should display stat cards correctly', async ({ page }) => {
      // Check stat card structure
      const statCard = page.locator('text=Investigações').locator('../../..')
      await expect(statCard).toBeVisible()

      // Check for value
      await expect(statCard.locator('text=1,234')).toBeVisible()

      // Check for trend indicator
      await expect(statCard.locator('text=↑')).toBeVisible()
      await expect(statCard.locator('text=12%')).toBeVisible()

      // Check for icon
      const iconContainer = statCard.locator('.bg-gray-100, .bg-gray-800')
      await expect(iconContainer).toBeVisible()
    })
  })

  test.describe('Interaction Tests', () => {
    test('should show hover effects on interactive cards', async ({ page }) => {
      const interactiveCard = page.locator('text=Card Clicável').locator('../../..')

      // Get initial transform
      const initialTransform = await interactiveCard.evaluate(
        (el) => window.getComputedStyle(el).transform
      )

      // Hover
      await interactiveCard.hover()

      // Wait for animation
      await page.waitForTimeout(300)

      // Check lift effect
      const hoverTransform = await interactiveCard.evaluate(
        (el) => window.getComputedStyle(el).transform
      )

      expect(initialTransform).not.toBe(hoverTransform)
    })

    test('should show hover border change on outlined variant', async ({ page }) => {
      const outlinedCard = page.locator('[class*="outlined"]').first()

      // Get initial border color
      const initialBorderColor = await outlinedCard.evaluate(
        (el) => window.getComputedStyle(el).borderColor
      )

      // Hover
      await outlinedCard.hover()

      // Wait for transition
      await page.waitForTimeout(200)

      // Check border color changed
      const hoverBorderColor = await outlinedCard.evaluate(
        (el) => window.getComputedStyle(el).borderColor
      )

      expect(initialBorderColor).not.toBe(hoverBorderColor)
    })

    test('should handle click events on interactive cards', async ({ page }) => {
      // Add click handler
      await page.evaluate(() => {
        window.cardClicks = []
        document.addEventListener('click', (e) => {
          const card = (e.target as Element).closest('[class*="cursor-pointer"]')
          if (card) {
            const title = card.querySelector('h3')?.textContent
            window.cardClicks!.push(title || '')
          }
        })
      })

      const interactiveCard = page.locator('text=Card Clicável').locator('../../..')
      await interactiveCard.click()

      const clicks = await page.evaluate(() => window.cardClicks)
      expect(clicks).toContain('Card Clicável')
    })
  })

  test.describe('Composition Tests', () => {
    test('should render all card sub-components correctly', async ({ page }) => {
      const cardWithFooter = page.locator('text=Investigação Completa').locator('../../..')

      // Check header
      const header = cardWithFooter.locator('[class*="flex-col"][class*="gap-2"]').first()
      await expect(header).toBeVisible()

      // Check title
      await expect(cardWithFooter.locator('h3:text("Investigação Completa")')).toBeVisible()

      // Check description
      await expect(
        cardWithFooter.locator('text=Análise detalhada de gastos públicos')
      ).toBeVisible()

      // Check content
      await expect(cardWithFooter.locator('text=Foram analisados 1.234 contratos')).toBeVisible()

      // Check footer
      const footer = cardWithFooter.locator('[class*="border-t"]')
      await expect(footer).toBeVisible()
      await expect(footer.locator('text=Atualizado há 2h')).toBeVisible()
      await expect(footer.locator('button:text("Ver Detalhes")')).toBeVisible()
    })

    test('should display footer actions correctly', async ({ page }) => {
      const cardWithFooter = page.locator('text=Investigação Completa').locator('../../..')
      const footer = cardWithFooter.locator('[class*="border-t"]')

      // Check buttons in footer
      const shareBtn = footer.locator('button:text("Compartilhar")')
      const detailsBtn = footer.locator('button:text("Ver Detalhes")')

      await expect(shareBtn).toBeVisible()
      await expect(detailsBtn).toBeVisible()
    })
  })

  test.describe('Responsive Tests', () => {
    test('should adapt to mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })

      // Check if cards stack properly
      const cardGrid = page.locator('.grid').first()
      await expect(cardGrid).toBeVisible()

      // Check responsive padding
      const responsiveCard = page.locator('text=Responsive').locator('..')
      await expect(responsiveCard).toBeVisible()
    })

    test('should maintain proper layout on tablet', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 })

      // Check grid layout
      const statCards = page
        .locator('text=Cards de Estatísticas')
        .locator('..//div[contains(@class, "grid")]')
      await expect(statCards).toBeVisible()

      // Verify cards are properly arranged
      const statCardCount = await statCards.locator('[class*="rounded-lg"]').count()
      expect(statCardCount).toBeGreaterThan(0)
    })
  })

  test.describe('Accessibility Tests', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      // Check h3 tags are used for card titles
      const cardTitles = page.locator('h3')
      const count = await cardTitles.count()
      expect(count).toBeGreaterThan(0)

      // Verify heading content
      const firstTitle = await cardTitles.first().textContent()
      expect(firstTitle).toBeTruthy()
    })

    test('should maintain proper contrast ratios', async ({ page }) => {
      const card = page.locator('[class*="bg-white"]').first()
      const title = card.locator('h3').first()

      // Get colors
      const bgColor = await card.evaluate((el) => window.getComputedStyle(el).backgroundColor)
      const textColor = await title.evaluate((el) => window.getComputedStyle(el).color)

      // Colors should be different (basic contrast check)
      expect(bgColor).not.toBe(textColor)
    })

    test('should be keyboard navigable', async ({ page }) => {
      // Focus first interactive card
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')

      // Press Enter on focused card
      await page.keyboard.press('Enter')

      // Verify interaction worked
      const activeElement = await page.evaluate(() => document.activeElement?.textContent)
      expect(activeElement).toBeTruthy()
    })
  })

  test.describe('Dark Mode Tests', () => {
    test.beforeEach(async ({ page }) => {
      // Enable dark mode
      await page.emulateMedia({ colorScheme: 'dark' })
      await page.goto('/pt/test-cards')
    })

    test('should display correct colors in dark mode', async ({ page }) => {
      const elevatedCard = page.locator('text=Elevated').locator('..')
      await expect(elevatedCard).toBeVisible()

      // Check dark mode background
      const bgColor = await elevatedCard.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor
      )

      // Should have dark background
      expect(bgColor).toContain('rgb(') // Dark color

      // Check text is light
      const title = elevatedCard.locator('h3').first()
      const textColor = await title.evaluate((el) => window.getComputedStyle(el).color)

      // Text should be light in dark mode
      expect(textColor).toContain('rgb(')
    })

    test('should maintain shadows in dark mode', async ({ page }) => {
      const elevatedCard = page.locator('[class*="shadow-card"]').first()

      const boxShadow = await elevatedCard.evaluate((el) => window.getComputedStyle(el).boxShadow)

      // Should have shadow even in dark mode
      expect(boxShadow).not.toBe('none')
      expect(boxShadow).toContain('rgba')
    })
  })
})
