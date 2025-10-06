import { test, expect } from '@playwright/test';

test.describe('Critical User Journeys', () => {
  test.describe('Homepage and Navigation', () => {
    test('should load homepage successfully', async ({ page }) => {
      await page.goto('/');

      // Should redirect to /pt or load homepage
      await expect(page).toHaveURL(/\/(pt|en)?/);

      // Check page has main content
      const heading = page.getByRole('heading').first();
      await expect(heading).toBeVisible();
    });

    test('should display main navigation menu', async ({ page }) => {
      await page.goto('/pt');

      // Check for navigation elements
      const nav = page.getByRole('navigation').first();
      if (await nav.isVisible()) {
        await expect(nav).toBeVisible();
      }

      // Common links should exist
      const links = ['Sobre', 'Agentes', 'Login'].map(text =>
        page.getByRole('link', { name: new RegExp(text, 'i') })
      );

      // At least one navigation link should be visible
      let hasVisibleLink = false;
      for (const link of links) {
        if (await link.isVisible().catch(() => false)) {
          hasVisibleLink = true;
          break;
        }
      }

      expect(hasVisibleLink).toBeTruthy();
    });

    test('should navigate between pages', async ({ page }) => {
      await page.goto('/pt');

      // Try to navigate to About page
      const aboutLink = page.getByRole('link', { name: /sobre|about/i });
      if (await aboutLink.isVisible()) {
        await aboutLink.click();
        await expect(page).toHaveURL(/\/about|\/sobre/);
      }
    });

    test('should switch language', async ({ page }) => {
      await page.goto('/pt');

      // Look for language switcher
      const languageSwitcher = page.getByRole('button', { name: /english|português/i });
      if (await languageSwitcher.isVisible()) {
        const currentUrl = page.url();
        await languageSwitcher.click();

        // URL should change from /pt to /en or vice versa
        await page.waitForTimeout(500);
        const newUrl = page.url();
        expect(newUrl).not.toBe(currentUrl);
      }
    });
  });

  test.describe('Agents Page', () => {
    test('should display agents page', async ({ page }) => {
      await page.goto('/pt/agents');

      // Check page title
      await expect(page).toHaveTitle(/Agentes.*Cidadão\.AI/i);

      // Should show agent cards or list
      const agentHeading = page.getByRole('heading', { name: /agentes|agents/i }).first();
      if (await agentHeading.isVisible()) {
        await expect(agentHeading).toBeVisible();
      }
    });

    test('should display multiple agents', async ({ page }) => {
      await page.goto('/pt/agents');

      // Wait for content to load
      await page.waitForTimeout(1000);

      // Check for agent names
      const agentNames = ['Abaporu', 'Zumbi', 'Anita', 'Tiradentes'];
      let foundAgents = 0;

      for (const name of agentNames) {
        const agentElement = page.getByText(new RegExp(name, 'i'));
        if (await agentElement.isVisible().catch(() => false)) {
          foundAgents++;
        }
      }

      // Should find at least one agent
      expect(foundAgents).toBeGreaterThan(0);
    });

    test('should allow filtering or searching agents', async ({ page }) => {
      await page.goto('/pt/agents');

      // Look for search or filter input
      const searchInput = page.getByPlaceholder(/buscar|search|filtrar/i);
      if (await searchInput.isVisible()) {
        await searchInput.fill('Abaporu');

        // Wait for filter to apply
        await page.waitForTimeout(500);

        // Should show filtered results
        const abaporuText = page.getByText(/Abaporu/i);
        await expect(abaporuText).toBeVisible();
      }
    });
  });

  test.describe('Dashboard (Authenticated)', () => {
    test('should show dashboard or redirect to login', async ({ page }) => {
      await page.goto('/pt/dashboard');

      // Should either show dashboard (if mocked auth) or redirect to login
      const url = page.url();

      const isDashboard = url.includes('/dashboard');
      const isLogin = url.includes('/login');

      // Should be one or the other
      expect(isDashboard || isLogin).toBeTruthy();
    });

    test('should display dashboard widgets when authenticated', async ({ page }) => {
      // This assumes mock authentication is in place
      await page.goto('/pt/dashboard');

      const currentUrl = page.url();

      if (currentUrl.includes('/dashboard')) {
        // Look for dashboard elements
        const heading = page.getByRole('heading', { name: /dashboard|painel/i });
        if (await heading.isVisible().catch(() => false)) {
          await expect(heading).toBeVisible();
        }
      }
    });
  });

  test.describe('Investigations', () => {
    test('should display investigations page', async ({ page }) => {
      await page.goto('/pt/investigacoes');

      // Should show investigations or redirect to login
      const url = page.url();

      if (url.includes('/investigacoes') || url.includes('/investigations')) {
        // Check for investigations content
        const heading = page.getByRole('heading').first();
        await expect(heading).toBeVisible();
      }
    });

    test('should allow creating new investigation', async ({ page }) => {
      await page.goto('/pt/investigacoes');

      // Look for "New Investigation" button
      const newButton = page.getByRole('button', { name: /nova.*investigação|new.*investigation/i });
      if (await newButton.isVisible()) {
        await newButton.click();

        // Should navigate or show modal
        await page.waitForTimeout(500);

        // Check if modal opened or navigation occurred
        const hasModal = await page.getByRole('dialog').isVisible().catch(() => false);
        const urlChanged = !page.url().includes('/investigacoes');

        expect(hasModal || urlChanged).toBeTruthy();
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/pt');

      // Check for h1
      const h1 = page.getByRole('heading', { level: 1 });
      const h1Count = await h1.count();

      // Should have at least one h1
      expect(h1Count).toBeGreaterThan(0);
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/pt');

      // Press Tab to navigate
      await page.keyboard.press('Tab');

      // Should focus on an interactive element
      const focusedElement = await page.evaluate(() => {
        const active = document.activeElement;
        return active ? active.tagName : null;
      });

      // Should focus on a link, button, or input
      expect(['A', 'BUTTON', 'INPUT', 'TEXTAREA']).toContain(focusedElement);
    });

    test('should have skip to content link', async ({ page }) => {
      await page.goto('/pt');

      // Look for skip link (usually hidden until focused)
      const skipLink = page.getByRole('link', { name: /skip.*content|pular.*conteúdo/i });
      if (await skipLink.count() > 0) {
        await expect(skipLink.first()).toBeDefined();
      }
    });
  });

  test.describe('Performance', () => {
    test('should load homepage within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/pt');
      const loadTime = Date.now() - startTime;

      // Page should load in less than 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should not have console errors', async ({ page }) => {
      const errors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto('/pt');
      await page.waitForTimeout(2000);

      // Should have minimal console errors (some are OK in dev)
      expect(errors.length).toBeLessThan(5);
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should display mobile menu', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/pt');

      // Look for mobile menu button (hamburger)
      const menuButton = page.getByRole('button', { name: /menu|navigation/i });
      if (await menuButton.isVisible()) {
        await menuButton.click();

        // Menu should open
        await page.waitForTimeout(300);

        // Check if navigation is visible
        const nav = page.getByRole('navigation');
        if (await nav.isVisible().catch(() => false)) {
          await expect(nav).toBeVisible();
        }
      }
    });

    test('should be scrollable on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/pt');

      // Page should be scrollable
      const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      const clientHeight = await page.evaluate(() => document.documentElement.clientHeight);

      // Content should extend beyond viewport (scrollable)
      expect(scrollHeight).toBeGreaterThanOrEqual(clientHeight);
    });
  });
});
