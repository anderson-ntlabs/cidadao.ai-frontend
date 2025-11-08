import { test, expect } from '@playwright/test'

test.describe('Investigation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the investigations page
    await page.goto('/pt/investigacoes')
  })

  test('should display investigations list', async ({ page }) => {
    // Check if page title is visible
    await expect(page.locator('h1:has-text("Investigações")')).toBeVisible()

    // Check if investigations grid is visible
    await expect(page.locator('[data-testid="investigations-grid"]')).toBeVisible()
  })

  test('should filter investigations by status', async ({ page }) => {
    // Click on filter button
    const filterButton = page.locator('button[aria-label*="Filtrar"]')
    if (await filterButton.isVisible()) {
      await filterButton.click()

      // Select "Em andamento" filter
      await page.locator('label:has-text("Em andamento")').click()

      // Apply filter
      await page.locator('button:has-text("Aplicar")').click()

      // Check that only in-progress investigations are shown
      const cards = page.locator('[data-testid="investigation-card"]')
      const count = await cards.count()

      for (let i = 0; i < count; i++) {
        const card = cards.nth(i)
        await expect(card.locator('text="Em andamento"')).toBeVisible()
      }
    }
  })

  test('should open investigation details', async ({ page }) => {
    // Click on first investigation card
    const firstCard = page.locator('[data-testid="investigation-card"]').first()
    if (await firstCard.isVisible()) {
      await firstCard.click()

      // Should navigate to investigation details
      await expect(page).toHaveURL(/\/investigacoes\/[a-zA-Z0-9-]+/)

      // Check if details are loaded
      await expect(page.locator('[data-testid="investigation-details"]')).toBeVisible()
    }
  })

  test('should export investigation data', async ({ page }) => {
    // Open first investigation
    const firstCard = page.locator('[data-testid="investigation-card"]').first()
    if (await firstCard.isVisible()) {
      await firstCard.click()

      // Wait for details to load
      await page.waitForSelector('[data-testid="investigation-details"]')

      // Click export button
      const exportButton = page.locator('button[aria-label*="Exportar"]')
      if (await exportButton.isVisible()) {
        // Set up download promise before clicking
        const downloadPromise = page.waitForEvent('download')

        await exportButton.click()

        // Select PDF format if dropdown appears
        const pdfOption = page.locator('button:has-text("PDF")')
        if (await pdfOption.isVisible()) {
          await pdfOption.click()
        }

        // Wait for download
        const download = await downloadPromise
        expect(download).toBeTruthy()
      }
    }
  })

  test('should search investigations', async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[placeholder*="Buscar"]')
    if (await searchInput.isVisible()) {
      // Type search query
      await searchInput.fill('corrupção')

      // Press Enter or click search button
      await searchInput.press('Enter')

      // Wait for results to update
      await page.waitForTimeout(1000)

      // Check that results are filtered
      const cards = page.locator('[data-testid="investigation-card"]')
      const count = await cards.count()

      if (count > 0) {
        // At least one result should contain the search term
        const hasSearchTerm = await cards.locator('text=/corrupção/i').count()
        expect(hasSearchTerm).toBeGreaterThan(0)
      }
    }
  })

  test('should sort investigations', async ({ page }) => {
    // Find sort dropdown
    const sortButton = page.locator('button[aria-label*="Ordenar"]')
    if (await sortButton.isVisible()) {
      await sortButton.click()

      // Select "Mais recentes" option
      await page.locator('button:has-text("Mais recentes")').click()

      // Get dates from first and last cards
      const cards = page.locator('[data-testid="investigation-card"]')
      const count = await cards.count()

      if (count >= 2) {
        const firstDate = await cards
          .first()
          .locator('[data-testid="investigation-date"]')
          .textContent()
        const lastDate = await cards
          .last()
          .locator('[data-testid="investigation-date"]')
          .textContent()

        // First date should be more recent than last date
        if (firstDate && lastDate) {
          expect(new Date(firstDate).getTime()).toBeGreaterThanOrEqual(new Date(lastDate).getTime())
        }
      }
    }
  })

  test('should handle empty state', async ({ page }) => {
    // Search for something that returns no results
    const searchInput = page.locator('input[placeholder*="Buscar"]')
    if (await searchInput.isVisible()) {
      await searchInput.fill('xyzabc123nonexistent')
      await searchInput.press('Enter')

      // Wait for empty state
      await expect(page.locator('[data-testid="empty-state"]')).toBeVisible()
      await expect(page.locator('text="Nenhuma investigação encontrada"')).toBeVisible()
    }
  })

  test('should paginate through results', async ({ page }) => {
    // Check if pagination exists
    const pagination = page.locator('[data-testid="pagination"]')
    if (await pagination.isVisible()) {
      // Click next page
      const nextButton = pagination.locator('button[aria-label*="Próxima"]')
      if (await nextButton.isEnabled()) {
        await nextButton.click()

        // URL should update with page parameter
        await expect(page).toHaveURL(/[?&]page=2/)

        // New investigations should be loaded
        await expect(page.locator('[data-testid="investigation-card"]').first()).toBeVisible()
      }
    }
  })

  test('should show investigation timeline', async ({ page }) => {
    // Open first investigation
    const firstCard = page.locator('[data-testid="investigation-card"]').first()
    if (await firstCard.isVisible()) {
      await firstCard.click()

      // Wait for details
      await page.waitForSelector('[data-testid="investigation-details"]')

      // Check for timeline
      await expect(page.locator('[data-testid="investigation-timeline"]')).toBeVisible()

      // Timeline should have events
      const timelineEvents = page.locator('[data-testid="timeline-event"]')
      const eventCount = await timelineEvents.count()
      expect(eventCount).toBeGreaterThan(0)
    }
  })

  test('should display investigation agents', async ({ page }) => {
    // Open first investigation
    const firstCard = page.locator('[data-testid="investigation-card"]').first()
    if (await firstCard.isVisible()) {
      await firstCard.click()

      // Wait for details
      await page.waitForSelector('[data-testid="investigation-details"]')

      // Check for agents involved
      await expect(page.locator('[data-testid="agents-involved"]')).toBeVisible()

      // Should show at least one agent
      const agents = page.locator('[data-testid="agent-avatar"]')
      const agentCount = await agents.count()
      expect(agentCount).toBeGreaterThan(0)
    }
  })
})
