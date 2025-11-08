import { test, expect } from '@playwright/test'

test.describe('Chat Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the chat page
    await page.goto('/pt/chat')
  })

  test('should load chat interface', async ({ page }) => {
    // Check if chat container is visible
    await expect(page.locator('[data-testid="chat-container"]')).toBeVisible()

    // Check if message input is visible
    await expect(page.locator('textarea[placeholder*="Digite sua mensagem"]')).toBeVisible()

    // Check if send button is visible
    await expect(page.locator('button[aria-label*="Enviar"]')).toBeVisible()
  })

  test('should send and receive messages', async ({ page }) => {
    // Type a message
    const messageInput = page.locator('textarea[placeholder*="Digite sua mensagem"]')
    await messageInput.fill('Olá, preciso de ajuda com transparência pública')

    // Send the message
    await page.locator('button[aria-label*="Enviar"]').click()

    // Wait for user message to appear
    await expect(
      page.locator('text="Olá, preciso de ajuda com transparência pública"')
    ).toBeVisible()

    // Wait for assistant response (with timeout)
    await expect(page.locator('[data-testid="assistant-message"]')).toBeVisible({ timeout: 30000 })
  })

  test('should show typing indicator while loading', async ({ page }) => {
    // Type and send a message
    const messageInput = page.locator('textarea[placeholder*="Digite sua mensagem"]')
    await messageInput.fill('Teste de indicador de digitação')
    await page.locator('button[aria-label*="Enviar"]').click()

    // Check for typing indicator
    await expect(page.locator('[data-testid="typing-indicator"]')).toBeVisible()

    // Typing indicator should disappear after response
    await expect(page.locator('[data-testid="typing-indicator"]')).not.toBeVisible({
      timeout: 30000,
    })
  })

  test('should display suggested actions', async ({ page }) => {
    // Send a message
    await page
      .locator('textarea[placeholder*="Digite sua mensagem"]')
      .fill('O que você pode fazer?')
    await page.locator('button[aria-label*="Enviar"]').click()

    // Wait for response
    await page.waitForSelector('[data-testid="assistant-message"]', { timeout: 30000 })

    // Check for suggested actions
    await expect(page.locator('[data-testid="suggested-actions"]')).toBeVisible()
  })

  test('should handle empty message submission', async ({ page }) => {
    // Try to send empty message
    await page.locator('button[aria-label*="Enviar"]').click()

    // Input should still be empty and no message sent
    await expect(page.locator('textarea[placeholder*="Digite sua mensagem"]')).toHaveValue('')

    // No user messages should be in the chat
    await expect(page.locator('[data-testid="user-message"]')).not.toBeVisible()
  })

  test('should clear chat history', async ({ page }) => {
    // Send a message first
    await page.locator('textarea[placeholder*="Digite sua mensagem"]').fill('Mensagem de teste')
    await page.locator('button[aria-label*="Enviar"]').click()

    // Wait for message to appear
    await expect(page.locator('text="Mensagem de teste"')).toBeVisible()

    // Click clear chat button if available
    const clearButton = page.locator('button[aria-label*="Limpar"]')
    if (await clearButton.isVisible()) {
      await clearButton.click()

      // Confirm clearing if there's a confirmation dialog
      const confirmButton = page.locator('button:has-text("Confirmar")')
      if (await confirmButton.isVisible()) {
        await confirmButton.click()
      }

      // Messages should be cleared
      await expect(page.locator('[data-testid="user-message"]')).not.toBeVisible()
    }
  })

  test('should handle keyboard shortcuts', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Digite sua mensagem"]')

    // Type a message
    await messageInput.fill('Teste com atalho de teclado')

    // Press Enter to send (if not multiline)
    await messageInput.press('Enter')

    // Check if message was sent
    await expect(page.locator('text="Teste com atalho de teclado"')).toBeVisible()
  })

  test('should maintain scroll position', async ({ page }) => {
    // Send multiple messages to create scroll
    for (let i = 1; i <= 5; i++) {
      await page.locator('textarea[placeholder*="Digite sua mensagem"]').fill(`Mensagem ${i}`)
      await page.locator('button[aria-label*="Enviar"]').click()
      await page.waitForTimeout(1000) // Small delay between messages
    }

    // Check that the latest message is visible (auto-scroll to bottom)
    await expect(page.locator('text="Mensagem 5"')).toBeInViewport()
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // Offline mode
    await page.context().setOffline(true)

    // Try to send a message
    await page.locator('textarea[placeholder*="Digite sua mensagem"]').fill('Teste offline')
    await page.locator('button[aria-label*="Enviar"]').click()

    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()

    // Go back online
    await page.context().setOffline(false)
  })

  test('should preserve chat session on page reload', async ({ page }) => {
    // Send a message
    await page
      .locator('textarea[placeholder*="Digite sua mensagem"]')
      .fill('Mensagem antes do reload')
    await page.locator('button[aria-label*="Enviar"]').click()

    // Wait for message to appear
    await expect(page.locator('text="Mensagem antes do reload"')).toBeVisible()

    // Reload the page
    await page.reload()

    // Message should still be visible
    await expect(page.locator('text="Mensagem antes do reload"')).toBeVisible()
  })
})
