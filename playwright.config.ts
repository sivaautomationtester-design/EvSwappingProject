import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({

  testDir: './tests',

  testIgnore: [
    '**/login.spec.ts'
  ],

  fullyParallel: false,

  forbidOnly: !!process.env.CI,

  retries: 0,

  // IMPORTANT:
  // Only one worker = one browser session
  workers: 1,

  timeout: 60_000,

  expect: {
    timeout: 10_000
  },

  outputDir: 'test-results',

  reporter: [
    [
      'html',
      {
        outputFolder: 'playwright-report',
        open: 'never'
      }
    ],
    [
      'allure-playwright',
      {
        resultsDir: 'allure-results'
      }
    ],
    //  [
    //   './utils/custom-reporter-acmemove-no-ai.ts'
    // ],
    // [
    //   './utils/custom-reporter-acmemove-allure-style.ts'
    // ],
    // [
    //   './utils/custom-reporter-acmemove-allure-style-status-donut.ts'
    // ],
    [
      './utils/Acme Reporter with Icon.ts'
    ],
    // Portal-style report: Module > Submenu > Feature (menu-report/index.html)
    [
      './utils/acme-menu-reporter.ts'
    ]
  ],

  use: {
    baseURL: process.env.BASE_URL,

    ...devices['Desktop Chrome'],

    headless: false,

    screenshot: 'only-on-failure',

    video: 'on-first-retry',

    trace: 'on-first-retry',

    actionTimeout: 15_000,

    navigationTimeout: 30_000,

    ignoreHTTPSErrors: true,

    testIdAttribute: 'data-testid'
  },

  projects: [
    {
      name: 'chromium',

      use: {
        ...devices['Desktop Chrome'],

        headless: false
      }
    }
  ]
});