import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [path.resolve(__dirname, '../vitest.setup.ts')],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'lib/**/*.{ts,tsx}',
        'hooks/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        'store/**/*.{ts,tsx}',
        'contexts/**/*.{ts,tsx}',
        'data/**/*.{ts,tsx}',
      ],
      exclude: [
        'node_modules/',
        '.next/',
        'out/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'coverage/',
        '__tests__/',
        'test/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/*.stories.{ts,tsx}',
        'vitest.setup.ts',
        'stories/**',
        '.storybook/**',
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 60,
        statements: 60,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../'),
      // Mock modules that are not installed but used in tests
      'jspdf-autotable': path.resolve(__dirname, '../__mocks__/jspdf-autotable.ts'),
      'driver.js': path.resolve(__dirname, '../__mocks__/driver.js.ts'),
    },
  },
})
