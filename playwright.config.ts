import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.TEST_URL || 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video recording */
    video: 'retain-on-failure',

    /* Extended timeout for network requests - important for AI tests */
    navigationTimeout: 45000,
    actionTimeout: 20000,

    /* Accept any SSL certificates (useful for ngrok) */
    ignoreHTTPSErrors: true,

    /* Extra options for Stagehand tests */
    extraHTTPHeaders: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    }
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        /* Force headless for WSL compatibility */
        headless: true,
        /* Larger viewport for better visibility */
        viewport: { width: 1280, height: 720 },
        /* Optimized for Stagehand AI element discovery */
        launchOptions: {
          slowMo: process.env.TEST_DEBUG === '1' ? 1000 : 250,
          args: [
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--allow-running-insecure-content'
          ]
        }
      },
    },

    /* Stagehand-optimized project for AI testing */
    {
      name: 'stagehand',
      use: {
        ...devices['Desktop Chrome'],
        headless: false,
        viewport: { width: 1440, height: 900 },
        launchOptions: {
          slowMo: 500,
          args: [
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--allow-running-insecure-content',
            '--enable-features=VaapiVideoDecoder',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding'
          ]
        }
      },
      testMatch: '**/stagehand-*.spec.ts'
    },

    /* Headless project for CI/CD */
    {
      name: 'chromium-headless',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        /* Increased timeouts for headless AI tests */
        actionTimeout: 30000,
        navigationTimeout: 60000
      },
    },

    /* Voice testing specific project */
    {
      name: 'voice-tests',
      use: {
        ...devices['Desktop Chrome'],
        headless: false,
        viewport: { width: 1280, height: 720 },
        /* Audio/video permissions for voice testing */
        permissions: ['microphone', 'camera'],
        launchOptions: {
          slowMo: 750,
          args: [
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
            '--allow-running-insecure-content'
          ]
        }
      },
      testMatch: '**/voice-*.spec.ts'
    },

    /* Firefox for cross-browser testing */
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        headless: false,
      },
    },

    /* Webkit/Safari for additional coverage */
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        headless: false,
      },
    },
  ],

  /* Only start webServer if testing against localhost */
  webServer: process.env.TEST_URL?.includes('localhost') || !process.env.TEST_URL ? {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  } : undefined,

  /* Extended timeout for AI-powered tests */
  timeout: process.env.CI ? 120 * 1000 : 180 * 1000,

  /* Expect timeout */
  expect: {
    timeout: 15 * 1000,
  },

  /* Output directory for test artifacts */
  outputDir: 'test-results/',

  /* Global setup for Stagehand tests */
  globalSetup: process.env.npm_lifecycle_event?.includes('stagehand') ?
    require.resolve('./tests/helpers/global-setup.ts') : undefined,
});