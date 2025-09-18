import { chromium, FullConfig } from '@playwright/test';

/**
 * Global setup for Stagehand E2E tests
 *
 * This setup file prepares the test environment for AI-powered testing
 * and verifies that the application is accessible.
 */

async function globalSetup(config: FullConfig) {
  console.log('🔧 Setting up Stagehand E2E test environment...');

  const baseURL = process.env.TEST_URL || (config as any).use?.baseURL || 'http://localhost:3000';
  const wsURL = process.env.WS_URL || 'https://1cdf34f35bcc.ngrok.app';

  console.log(`🌐 Target URL: ${baseURL}`);
  console.log(`🔌 WebSocket URL: ${wsURL}`);

  // Launch browser to verify connectivity
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  try {
    // Test application accessibility
    console.log('🌐 Testing application connectivity...');
    await page.goto(baseURL, { timeout: 30000 });

    // Wait for the application to load
    await page.waitForSelector('h1, [data-testid="clinical-header"]', { timeout: 20000 });

    // Check if it's the correct application
    const title = await page.title();
    if (title && (title.includes('HeartVoice') || title.includes('Clinical'))) {
      console.log('✅ Application is accessible and responding');
    } else {
      console.log('⚠️ Application title does not match expected pattern');
    }

    // Test API endpoints
    console.log('🔍 Testing API endpoints...');
    const apiEndpoints = ['/api/dashboard', '/api/patients'];

    for (const endpoint of apiEndpoints) {
      try {
        const response = await page.request.get(`${baseURL}${endpoint}`);
        console.log(`  ${endpoint}: ${response.ok() ? '✅' : '⚠️'} (${response.status()})`);
      } catch (error) {
        console.log(`  ${endpoint}: ❌ Failed to connect`);
      }
    }

    // Set up global test data storage
    process.env.GLOBAL_TEST_STATE = JSON.stringify({
      baseURL,
      wsURL,
      timestamp: Date.now(),
      setupComplete: true
    });

    console.log('✅ Global setup completed successfully');

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

export default globalSetup;