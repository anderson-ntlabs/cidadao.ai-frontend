import { test, expect, type Page } from '@playwright/test'
import { setupAuth } from '../helpers/auth.setup'

/**
 * Mobile Chat E2E Tests
 *
 * Tests chat functionality on mobile devices including:
 * - Virtual keyboard handling
 * - Message sending and receiving
 * - Touch interactions
 * - Scroll behavior
 * - Agent selection
 * - Suggestions
 */

// Configure mobile viewport
test.use({
  viewport: { width: 390, height: 844 }, // iPhone 13
  hasTouch: true,
  isMobile: true,
})

test.describe('Mobile Chat Experience', () => {
  test.beforeEach(async ({ page, context }) => {
    // Setup authentication
    await setupAuth(page, context)

    // Navigate to chat page
    await page.goto('/pt/app/chat')
    await page.waitForLoadState('networkidle')
  })

  test('should display chat interface correctly on mobile', async ({ page }) => {
    // Check header exists
    await expect(page.getByRole('banner')).toBeVisible()

    // Check chat messages container
    const messagesContainer = page.locator('[data-testid="chat-messages"]')
    await expect(messagesContainer).toBeVisible()

    // Check input area with proper touch target
    const chatInput = page.getByPlaceholder(/digite sua mensagem/i)
    await expect(chatInput).toBeVisible()

    // Verify minimum touch target height (44px WCAG AA, 48px preferred)
    const inputBox = await chatInput.boundingBox()
    expect(inputBox?.height).toBeGreaterThanOrEqual(44)

    // Check send button
    const sendButton = page.getByRole('button', { name: /enviar/i })
    await expect(sendButton).toBeVisible()
  })

  test('should handle virtual keyboard appearance', async ({ page }) => {
    const chatInput = page.getByPlaceholder(/digite sua mensagem/i)

    // Focus on input (triggers virtual keyboard)
    await chatInput.click()
    await page.waitForTimeout(500) // Wait for keyboard animation

    // Input should still be visible (not hidden by keyboard)
    await expect(chatInput).toBeInViewport()

    // Type message
    await chatInput.fill('Test message with virtual keyboard')

    // Verify text was entered
    await expect(chatInput).toHaveValue('Test message with virtual keyboard')
  })

  test('should send message on mobile', async ({ page }) => {
    const chatInput = page.getByPlaceholder(/digite sua mensagem/i)
    const sendButton = page.getByRole('button', { name: /enviar/i })

    // Type message
    await chatInput.fill('Hello from mobile device!')

    // Send message via button tap
    await sendButton.tap()

    // Wait for message to appear
    await page.waitForTimeout(1000)

    // Check if message appears in chat
    await expect(page.getByText('Hello from mobile device!')).toBeVisible()

    // Input should be cleared
    await expect(chatInput).toHaveValue('')
  })

  test('should handle touch scroll in chat', async ({ page }) => {
    // Add multiple messages to enable scrolling
    const chatInput = page.getByPlaceholder(/digite sua mensagem/i)
    const sendButton = page.getByRole('button', { name: /enviar/i })

    for (let i = 1; i <= 5; i++) {
      await chatInput.fill(`Message ${i}`)
      await sendButton.tap()
      await page.waitForTimeout(500)
    }

    const messagesContainer = page.locator('[data-testid="chat-messages"]')

    // Get initial scroll position
    const initialScroll = await messagesContainer.evaluate((el) => el.scrollTop)

    // Perform touch scroll
    await messagesContainer.evaluate((el) => {
      el.scrollTop = 0 // Scroll to top
    })

    await page.waitForTimeout(300)

    // Verify scroll changed
    const newScroll = await messagesContainer.evaluate((el) => el.scrollTop)
    expect(newScroll).not.toBe(initialScroll)
  })

  test('should select agent on mobile', async ({ page }) => {
    // Check if agent selector exists
    const agentSelector = page.locator('[data-testid="agent-selector"]')

    if (await agentSelector.isVisible()) {
      // Tap to open agent list
      await agentSelector.tap()

      // Wait for agent list to appear
      await page.waitForTimeout(500)

      // Select an agent (e.g., Abaporu)
      const agentOption = page.getByRole('button', { name: /abaporu/i })
      if (await agentOption.isVisible()) {
        await agentOption.tap()

        // Verify agent was selected
        await expect(page.getByText(/abaporu/i)).toBeVisible()
      }
    }
  })

  test('should tap on suggestion chips', async ({ page }) => {
    // Wait for suggestions to appear
    await page.waitForTimeout(1000)

    // Look for suggestion chips
    const suggestionChip = page.locator('[data-testid="suggestion-chip"]').first()

    if (await suggestionChip.isVisible()) {
      const suggestionText = await suggestionChip.textContent()

      // Tap suggestion
      await suggestionChip.tap()

      // Verify suggestion was added to input
      const chatInput = page.getByPlaceholder(/digite sua mensagem/i)
      const inputValue = await chatInput.inputValue()

      expect(inputValue).toContain(suggestionText?.trim() || '')
    }
  })

  test('should show loading state while generating response', async ({ page }) => {
    const chatInput = page.getByPlaceholder(/digite sua mensagem/i)
    const sendButton = page.getByRole('button', { name: /enviar/i })

    // Send message
    await chatInput.fill('What is transparency?')
    await sendButton.tap()

    // Look for loading indicator
    const loadingIndicator = page.locator('[data-testid="loading-indicator"]')

    // Loading should appear (even if briefly)
    await expect(loadingIndicator).toBeVisible({ timeout: 2000 })
  })

  test('should handle long messages correctly', async ({ page }) => {
    const chatInput = page.getByPlaceholder(/digite sua mensagem/i)

    const longMessage =
      'This is a very long message that tests how the chat interface handles lengthy text input on mobile devices with limited screen space. ' +
      'It should wrap properly and not break the layout. The input field should expand or scroll as needed.'

    await chatInput.fill(longMessage)

    // Input should still be visible and readable
    await expect(chatInput).toBeVisible()
    await expect(chatInput).toHaveValue(longMessage)
  })

  test('should maintain scroll position when keyboard appears', async ({ page }) => {
    // Send several messages to create scrollable content
    const chatInput = page.getByPlaceholder(/digite sua mensagem/i)
    const sendButton = page.getByRole('button', { name: /enviar/i })

    for (let i = 1; i <= 10; i++) {
      await chatInput.fill(`Message ${i}`)
      await sendButton.tap()
      await page.waitForTimeout(300)
    }

    // Scroll to middle of chat
    const messagesContainer = page.locator('[data-testid="chat-messages"]')
    await messagesContainer.evaluate((el) => {
      el.scrollTop = el.scrollHeight / 2
    })

    const scrollBefore = await messagesContainer.evaluate((el) => el.scrollTop)

    // Focus input (show keyboard)
    await chatInput.click()
    await page.waitForTimeout(500)

    // Scroll position should be maintained or adjusted appropriately
    const scrollAfter = await messagesContainer.evaluate((el) => el.scrollTop)

    // Allow some tolerance for keyboard adjustment
    expect(Math.abs(scrollAfter - scrollBefore)).toBeLessThan(100)
  })
})

test.describe('Mobile Chat - Portrait vs Landscape', () => {
  test('should adapt to landscape orientation', async ({ page }) => {
    // Switch to landscape
    await page.setViewportSize({ width: 844, height: 390 })

    await page.goto('/pt/app/chat')
    await page.waitForLoadState('networkidle')

    // Chat should still be functional
    const chatInput = page.getByPlaceholder(/digite sua mensagem/i)
    await expect(chatInput).toBeVisible()

    // Input should have adequate height even in landscape
    const inputBox = await chatInput.boundingBox()
    expect(inputBox?.height).toBeGreaterThanOrEqual(44)
  })
})

test.describe('Mobile Chat - Accessibility', () => {
  test('should have accessible form controls', async ({ page }) => {
    await page.goto('/pt/app/chat')

    // Check ARIA labels
    const chatInput = page.getByPlaceholder(/digite sua mensagem/i)
    const ariaLabel = await chatInput.getAttribute('aria-label')

    expect(ariaLabel).toBeTruthy()
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/pt/app/chat')

    const chatInput = page.getByPlaceholder(/digite sua mensagem/i)

    // Tab to input
    await page.keyboard.press('Tab')

    // Verify input is focused
    await expect(chatInput).toBeFocused()

    // Type with keyboard
    await page.keyboard.type('Testing keyboard input')

    await expect(chatInput).toHaveValue('Testing keyboard input')
  })
})
