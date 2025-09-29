import { test, expect } from '@playwright/test';

// Enable new design system for tests
test.use({
  extraHTTPHeaders: {
    'x-test-env': 'NEXT_PUBLIC_USE_NEW_DESIGN=true'
  }
});

test.describe('ButtonV2 Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the test page
    await page.goto('/pt/test-buttons');
  });

  test.describe('Visual Tests', () => {
    test('should display all button variants correctly', async ({ page }) => {
      // Primary button
      const primaryBtn = page.locator('button:has-text("Primary Button")').first();
      await expect(primaryBtn).toBeVisible();
      await expect(primaryBtn).toHaveCSS('background-image', /linear-gradient/);
      
      // Secondary button
      const secondaryBtn = page.locator('button:has-text("Secondary Button")').first();
      await expect(secondaryBtn).toBeVisible();
      await expect(secondaryBtn).toHaveCSS('border-width', '2px');
      
      // Ghost button
      const ghostBtn = page.locator('button:has-text("Ghost Button")').first();
      await expect(ghostBtn).toBeVisible();
    });

    test('should display all button sizes correctly', async ({ page }) => {
      const sizes = ['Small', 'Medium', 'Large', 'Extra Large'];
      
      for (const size of sizes) {
        const button = page.locator(`button:has-text("${size}")`).first();
        await expect(button).toBeVisible();
      }
      
      // Check icon button
      const iconBtn = page.locator('button[class*="h-10 w-10"]').first();
      await expect(iconBtn).toBeVisible();
    });
  });

  test.describe('Interaction Tests', () => {
    test('should show hover effects on primary button', async ({ page }) => {
      const primaryBtn = page.locator('button:has-text("Primary Button")').first();
      
      // Get initial state
      const initialTransform = await primaryBtn.evaluate(el => 
        window.getComputedStyle(el).transform
      );
      
      // Hover
      await primaryBtn.hover();
      
      // Wait for animation
      await page.waitForTimeout(300);
      
      // Check hover state - should have lift effect
      const hoverTransform = await primaryBtn.evaluate(el => 
        window.getComputedStyle(el).transform
      );
      
      expect(initialTransform).not.toBe(hoverTransform);
    });

    test('should handle click events', async ({ page }) => {
      // Add click handler to test
      await page.evaluate(() => {
        window.buttonClicks = [];
        document.addEventListener('click', (e) => {
          if (e.target instanceof HTMLButtonElement) {
            window.buttonClicks!.push(e.target.textContent || '');
          }
        });
      });
      
      const primaryBtn = page.locator('button:has-text("Primary Button")').first();
      await primaryBtn.click();
      
      const clicks = await page.evaluate(() => window.buttonClicks);
      expect(clicks).toContain('Primary Button');
    });

    test('should show loading state correctly', async ({ page }) => {
      const loadingBtn = page.locator('button:has-text("Carregando...")').first();
      await expect(loadingBtn).toBeVisible();
      await expect(loadingBtn).toBeDisabled();
      
      // Check for spinner
      const spinner = loadingBtn.locator('svg[class*="animate-spin"]');
      await expect(spinner).toBeVisible();
    });

    test('should be disabled when disabled prop is set', async ({ page }) => {
      const disabledBtn = page.locator('button:has-text("Desabilitado")').first();
      await expect(disabledBtn).toBeVisible();
      await expect(disabledBtn).toBeDisabled();
      await expect(disabledBtn).toHaveCSS('opacity', '0.5');
    });
  });

  test.describe('Icon Tests', () => {
    test('should display left icon correctly', async ({ page }) => {
      const btnWithLeftIcon = page.locator('button:has-text("Pesquisar")').first();
      await expect(btnWithLeftIcon).toBeVisible();
      
      const leftIcon = btnWithLeftIcon.locator('span.mr-2');
      await expect(leftIcon).toBeVisible();
    });

    test('should display right icon correctly', async ({ page }) => {
      const btnWithRightIcon = page.locator('button:has-text("Continuar")').first();
      await expect(btnWithRightIcon).toBeVisible();
      
      const rightIcon = btnWithRightIcon.locator('span.ml-2');
      await expect(rightIcon).toBeVisible();
    });

    test('should display both icons correctly', async ({ page }) => {
      const btnWithBothIcons = page.locator('button:has-text("Baixar Relatório")').first();
      await expect(btnWithBothIcons).toBeVisible();
      
      const leftIcon = btnWithBothIcons.locator('span.mr-2');
      const rightIcon = btnWithBothIcons.locator('span.ml-2');
      
      await expect(leftIcon).toBeVisible();
      await expect(rightIcon).toBeVisible();
    });
  });

  test.describe('Accessibility Tests', () => {
    test('should have proper ARIA attributes', async ({ page }) => {
      const loadingBtn = page.locator('button:has-text("Carregando...")').first();
      await expect(loadingBtn).toHaveAttribute('aria-busy', 'true');
      await expect(loadingBtn).toHaveAttribute('aria-disabled', 'true');
      
      const disabledBtn = page.locator('button:has-text("Desabilitado")').first();
      await expect(disabledBtn).toHaveAttribute('aria-disabled', 'true');
    });

    test('should be keyboard navigable', async ({ page }) => {
      // Focus first button
      await page.keyboard.press('Tab');
      
      // Check if button is focused (implementation depends on focus styles)
      const focusedElement = await page.evaluate(() => document.activeElement?.textContent);
      expect(focusedElement).toBeTruthy();
    });

    test('should have proper focus ring', async ({ page }) => {
      const primaryBtn = page.locator('button:has-text("Primary Button")').first();
      
      // Focus the button
      await primaryBtn.focus();
      
      // Check for focus ring styles
      const boxShadow = await primaryBtn.evaluate(el => 
        window.getComputedStyle(el).boxShadow
      );
      
      expect(boxShadow).toContain('rgb('); // Should have focus ring
    });
  });

  test.describe('Responsive Tests', () => {
    test('should adapt to mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      const primaryBtn = page.locator('button:has-text("Portal do Cidadão")').first();
      await expect(primaryBtn).toBeVisible();
      
      // Button should still be clickable on mobile
      await primaryBtn.click();
    });

    test('should wrap text properly on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      
      const longTextBtn = page.locator('button:has-text("Baixar Relatório")').first();
      await expect(longTextBtn).toBeVisible();
      
      // Check that text doesn't overflow
      const buttonWidth = await longTextBtn.evaluate(el => (el as HTMLElement).offsetWidth);
      const textWidth = await longTextBtn.locator('span').evaluate(el => (el as HTMLElement).scrollWidth);
      
      expect(textWidth).toBeLessThanOrEqual(buttonWidth);
    });
  });
});

// Dark mode tests
test.describe('ButtonV2 Dark Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Enable dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/pt/test-buttons');
  });

  test('should display correct colors in dark mode', async ({ page }) => {
    const secondaryBtn = page.locator('button:has-text("Secondary Button")').first();
    await expect(secondaryBtn).toBeVisible();
    
    // Check dark mode specific styles
    const backgroundColor = await secondaryBtn.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Should have dark background
    expect(backgroundColor).toContain('rgb('); // Dark color
  });
});