import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright Mobile Testing Configuration
 *
 * Specialized configuration for mobile E2E testing with:
 * - Multiple mobile device emulations
 * - Touch and viewport configurations
 * - Mobile-specific test settings
 *
 * Run mobile tests with:
 * npx playwright test --config=playwright.mobile.config.ts
 */

export default defineConfig({
  testDir: './__tests__/e2e/mobile',
  testMatch: '**/*.spec.ts',

  // Timeout configurations
  timeout: 30 * 1000, // 30 seconds per test
  expect: {
    timeout: 5000, // 5 seconds for expect assertions
  },

  // Test execution
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report/mobile' }],
    ['json', { outputFile: 'playwright-report/mobile/results.json' }],
    ['list'],
  ],

  // Shared settings for all projects
  use: {
    // Base URL
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',

    // Collect trace on failure
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Mobile-specific settings
    hasTouch: true,
    isMobile: true,

    // Geolocation (São Paulo, Brazil)
    geolocation: { latitude: -23.5505, longitude: -46.6333 },
    permissions: ['geolocation'],

    // Locale
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  },

  // Mobile device projects
  projects: [
    // === iOS Devices ===

    {
      name: 'iPhone SE',
      use: {
        ...devices['iPhone SE'],
        // iPhone SE (2022): 375x667, 326 PPI
        // Small screen testing for compact layouts
      },
    },

    {
      name: 'iPhone 12',
      use: {
        ...devices['iPhone 12'],
        // iPhone 12: 390x844, 460 PPI
        // Standard modern iPhone size
      },
    },

    {
      name: 'iPhone 13 Pro',
      use: {
        ...devices['iPhone 13 Pro'],
        // iPhone 13 Pro: 390x844, 460 PPI
        // ProMotion display (120Hz)
      },
    },

    {
      name: 'iPhone 14 Pro Max',
      use: {
        ...devices['iPhone 14 Pro Max'],
        // iPhone 14 Pro Max: 430x932, 460 PPI
        // Largest iPhone, Dynamic Island
      },
    },

    // === Android Devices ===

    {
      name: 'Pixel 5',
      use: {
        ...devices['Pixel 5'],
        // Pixel 5: 393x851, 432 PPI
        // Standard modern Android size
      },
    },

    {
      name: 'Galaxy S21',
      use: {
        ...devices['Galaxy S8'],
        viewport: { width: 360, height: 800 },
        // Galaxy S21: 360x800 (compact)
        // Popular Android phone
      },
    },

    {
      name: 'Galaxy S23 Ultra',
      use: {
        ...devices['Galaxy S9+'],
        viewport: { width: 412, height: 915 },
        // Galaxy S23 Ultra: 412x915 (large)
        // Large Android flagship
      },
    },

    // === Tablets ===

    {
      name: 'iPad Mini',
      use: {
        ...devices['iPad Mini'],
        // iPad Mini: 768x1024
        // Small tablet testing
      },
    },

    {
      name: 'iPad Pro 11',
      use: {
        ...devices['iPad (gen 7)'],
        viewport: { width: 834, height: 1194 },
        // iPad Pro 11": 834x1194
        // Modern tablet size
      },
    },

    // === Portrait and Landscape ===

    {
      name: 'iPhone 13 Landscape',
      use: {
        ...devices['iPhone 13'],
        viewport: { width: 844, height: 390 }, // Rotated
      },
    },

    {
      name: 'Pixel 5 Landscape',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 851, height: 393 }, // Rotated
      },
    },
  ],

  // Web server for local testing
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
