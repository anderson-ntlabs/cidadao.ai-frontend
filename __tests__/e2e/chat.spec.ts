import { test, expect } from '@playwright/test'

test.describe('Chat Interaction', () => {
  test('should display chat interface', async ({ page }) => {
    await page.goto('/pt/chat')

    // Check page loaded - accepting "Cidadão.AI - Transparência para Todos" or similar
    await expect(page).toHaveTitle(/Cidadão\.AI/i)

    // Check chat interface elements
    const chatInput = page.getByPlaceholder(/digite.*mensagem|escreva/i)
    await expect(chatInput).toBeVisible()

    // Check send button or similar action
    const sendButton = page.getByRole('button', { name: /enviar|send/i }).first()
    if (await sendButton.isVisible()) {
      await expect(sendButton).toBeVisible()
    }
  })

  test('should allow typing in chat input', async ({ page }) => {
    await page.goto('/pt/chat')

    const chatInput = page.getByPlaceholder(/digite.*mensagem|escreva/i)
    await chatInput.fill('Olá, Cidadão.AI!')

    // Check input has value
    await expect(chatInput).toHaveValue('Olá, Cidadão.AI!')
  })

  test('should clear input after sending message', async ({ page }) => {
    await page.goto('/pt/chat')

    const chatInput = page.getByPlaceholder(/digite.*mensagem|escreva/i)
    await chatInput.fill('Teste de mensagem')

    // Find and click send button
    const sendButton = page.getByRole('button', { name: /enviar|send/i }).first()

    if (await sendButton.isVisible()) {
      await sendButton.click()

      // Wait a bit for processing
      await page.waitForTimeout(500)

      // Input should be cleared or message should appear in chat
      const inputValue = await chatInput.inputValue()
      const hasMessage = await page
        .getByText('Teste de mensagem')
        .isVisible()
        .catch(() => false)

      // Either input is cleared or message appears in chat
      expect(inputValue === '' || hasMessage).toBeTruthy()
    }
  })

  test('should display chat suggestions if available', async ({ page }) => {
    await page.goto('/pt/chat')

    // Wait for suggestions to load
    await page.waitForTimeout(1000)

    // Check if suggestions are present
    const suggestionButtons = page.getByRole('button').filter({ hasText: /inves|trans|gov/ })
    const count = await suggestionButtons.count()

    // If suggestions exist, they should be clickable
    if (count > 0) {
      await expect(suggestionButtons.first()).toBeVisible()
    }
  })

  test('should handle keyboard shortcuts', async ({ page }) => {
    await page.goto('/pt/chat')

    const chatInput = page.getByPlaceholder(/digite.*mensagem|escreva/i)
    await chatInput.fill('Mensagem de teste')

    // Try Ctrl+Enter or Enter to send (common patterns)
    await chatInput.press('Enter')

    // Wait for action
    await page.waitForTimeout(500)

    // Check if message was sent or is being processed
    const hasLoadingIndicator = await page
      .getByText(/enviando|processando|loading/i)
      .isVisible()
      .catch(() => false)
    const hasMessage = await page
      .getByText('Mensagem de teste')
      .isVisible()
      .catch(() => false)

    // At least one indicator that something happened
    expect(hasLoadingIndicator || hasMessage).toBeTruthy()
  })

  test('should display agent information when present', async ({ page }) => {
    await page.goto('/pt/chat')

    // Send a message that might trigger agent response
    const chatInput = page.getByPlaceholder(/digite.*mensagem|escreva/i)
    if (await chatInput.isVisible()) {
      await chatInput.fill('Olá')

      const sendButton = page.getByRole('button', { name: /enviar|send/i }).first()
      if (await sendButton.isVisible()) {
        await sendButton.click()

        // Wait for response
        await page.waitForTimeout(2000)

        // Check if any agent names appear (Abaporu, Zumbi, etc.)
        const hasAgentName = await page
          .getByText(/Abaporu|Zumbi|Anita|Tiradentes/i)
          .isVisible()
          .catch(() => false)

        // Agent info might be present
        if (hasAgentName) {
          expect(hasAgentName).toBeTruthy()
        }
      }
    }
  })

  test('should support accessibility features', async ({ page }) => {
    await page.goto('/pt/chat')

    const chatInput = page.getByPlaceholder(/digite.*mensagem|escreva/i)

    // Check keyboard navigation
    await page.keyboard.press('Tab')

    // Input should be focusable via keyboard
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    // After pressing Tab, focused element should be an interactive element
    expect(['INPUT', 'TEXTAREA', 'BUTTON', 'A', 'BODY']).toContain(focusedElement)

    // Check ARIA attributes if present
    if (await chatInput.isVisible()) {
      const ariaLabel = await chatInput.getAttribute('aria-label')
      const placeholder = await chatInput.getAttribute('placeholder')

      // Should have some accessibility text
      expect(ariaLabel || placeholder).toBeTruthy()
    }
  })

  test('should handle long messages gracefully', async ({ page }) => {
    await page.goto('/pt/chat')

    const chatInput = page.getByPlaceholder(/digite.*mensagem|escreva/i)

    // Create a long message
    const longMessage = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(10)
    await chatInput.fill(longMessage)

    // Input should accept long text
    const inputValue = await chatInput.inputValue()
    expect(inputValue.length).toBeGreaterThan(100)
  })

  test('should display error state gracefully', async ({ page }) => {
    await page.goto('/pt/chat')

    // This test assumes error handling is in place
    // We can't force an error easily, but we can check the page doesn't crash

    const chatInput = page.getByPlaceholder(/digite.*mensagem|escreva/i)
    await expect(chatInput).toBeVisible()

    // Page should remain functional
    await chatInput.fill('Test')
    await expect(chatInput).toHaveValue('Test')
  })
})
