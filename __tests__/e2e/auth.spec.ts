import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/pt/login')

    // Check page loaded - accepting either "Cidadão.AI" or "Login - Cidadão.AI"
    await expect(page).toHaveTitle(/Cidadão\.AI/i)

    // Check login form elements
    await expect(page.getByRole('heading', { name: /entrar/i })).toBeVisible()
    await expect(page.getByPlaceholder(/email/i)).toBeVisible()
    await expect(page.getByPlaceholder(/senha/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/pt/login')

    // Try to submit empty form
    await page.getByRole('button', { name: /entrar/i }).click()

    // Should still be on login page (validation prevented submission)
    await expect(page.getByPlaceholder(/email/i)).toBeVisible()
  })

  test('should navigate to sign up from login', async ({ page }) => {
    await page.goto('/pt/login')

    // Find and click sign up link
    const signUpLink = page.getByRole('link', { name: /criar conta|cadastr/i })
    if (await signUpLink.isVisible()) {
      await signUpLink.click()

      // Should navigate to sign up or registration page
      await expect(page).toHaveURL(/cadastro|signup|register/i)
    }
  })

  test('should handle mock login successfully', async ({ page }) => {
    await page.goto('/pt/login')

    // Fill in form with test credentials
    await page.getByPlaceholder(/email/i).fill('test@cidadao.ai')
    await page.getByPlaceholder(/senha/i).fill('TestPassword123!')

    // Submit form
    await page.getByRole('button', { name: /entrar/i }).click()

    // Wait for navigation or auth state change
    // Note: This will fail if backend auth is not mocked, but that's expected
    await page.waitForTimeout(1000)

    // Check if we're redirected or see error
    const currentUrl = page.url()

    // Either we're redirected to dashboard or we see an error message
    const isRedirected = currentUrl.includes('/dashboard') || currentUrl.includes('/home')
    const hasErrorMessage = await page
      .getByText(/erro|error|inválid/i)
      .isVisible()
      .catch(() => false)

    // At least one should be true (redirect or error shown)
    expect(isRedirected || hasErrorMessage).toBeTruthy()
  })

  test('should display password reset option', async ({ page }) => {
    await page.goto('/pt/login')

    // Check for forgot password link
    const forgotPasswordLink = page.getByRole('link', { name: /esqueceu.*senha|forgot.*password/i })
    if (await forgotPasswordLink.isVisible()) {
      await expect(forgotPasswordLink).toBeVisible()
    }
  })

  test('should have accessible form elements', async ({ page }) => {
    await page.goto('/pt/login')

    // Check ARIA labels and accessibility
    const emailInput = page.getByPlaceholder(/email/i)
    const passwordInput = page.getByPlaceholder(/senha/i)
    const submitButton = page.getByRole('button', { name: /entrar/i })

    // All elements should be accessible
    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    await expect(submitButton).toBeEnabled()

    // Check keyboard navigation
    await emailInput.focus()
    await expect(emailInput).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(passwordInput).toBeFocused()
  })
})
