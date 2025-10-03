/**
 * Vitest Integration Test Configuration
 * Task 12 Implementation - 통합 테스트 작성
 * 
 * Specialized configuration for integration tests with:
 * - Extended timeouts for complex interactions
 * - Browser environment simulation
 * - Performance monitoring
 * - Coverage reporting for integration scenarios
 */

import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: [
      'src/**/*.integration.test.{js,ts}',
      'src/**/*Integration*.test.{js,ts}',
      'src/**/*.test.suite.{js,ts}'
    ],
    exclude: [
      'node_modules/**',
      'src/**/*.unit.test.{js,ts}',
      'src/**/*.spec.{js,ts}'
    ],
    environment: 'jsdom',
    setupFiles: [
      'src/lib/holographic/__tests__/setup.ts',
      'src/lib/utils/__tests__/integration-setup.ts'
    ],
    globals: true,
    
    // Extended timeouts for integration tests
    testTimeout: 10000, // 10 seconds for complex interactions
    hookTimeout: 5000,  // 5 seconds for setup/teardown
    
    // Performance monitoring
    benchmark: {
      include: ['**/*.{bench,benchmark}.{js,ts}'],
      exclude: ['node_modules/**']
    },
    
    // Coverage configuration for integration tests
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage/integration',
      include: [
        'src/lib/components/EnhancedCard.svelte',
        'src/lib/utils/cardStateManager.ts',
        'src/lib/utils/touchIntegration.ts',
        'src/lib/utils/performanceOptimizer.ts'
      ],
      exclude: [
        'node_modules/',
        'src/lib/holographic/__tests__/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/*.test.*',
        '**/*.spec.*'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 85,
          lines: 85,
          statements: 85
        },
        // Specific thresholds for critical components
        'src/lib/components/EnhancedCard.svelte': {
          branches: 90,
          functions: 95,
          lines: 90,
          statements: 90
        },
        'src/lib/utils/touchIntegration.ts': {
          branches: 85,
          functions: 90,
          lines: 85,
          statements: 85
        }
      }
    },
    
    // Browser simulation options
    browser: {
      enabled: false, // Use jsdom for faster execution
      name: 'chromium',
      provider: 'playwright',
      headless: true
    },
    
    // Parallel execution for faster testing
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 2
      }
    },
    
    // Retry configuration for flaky integration tests
    retry: 2,
    
    // Reporter configuration
    reporter: [
      'verbose',
      'json',
      'html'
    ],
    outputFile: {
      json: './test-results/integration-results.json',
      html: './test-results/integration-report.html'
    },
    
    // Environment variables for integration tests
    env: {
      NODE_ENV: 'test',
      VITEST_INTEGRATION: 'true',
      BROWSER_TEST: 'false'
    },
    
    // Mock configuration
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    
    // Watch mode configuration
    watch: false, // Disable watch mode for CI/CD
    
    // Logging configuration
    logHeapUsage: true,
    
    // Custom matchers and utilities - merged with main setupFiles above
  },
  
  // Build configuration for test environment
  define: {
    __TEST_ENV__: true,
    __INTEGRATION_TEST__: true
  },
  
  // Resolve configuration for test imports
  resolve: {
    alias: {
      '$lib': new URL('./src/lib', import.meta.url).pathname,
      '$app': new URL('./src/app', import.meta.url).pathname
    }
  }
});