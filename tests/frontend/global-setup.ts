import { chromium, FullConfig } from '@playwright/test';

/**
 * Global setup for HeartVoice Monitor frontend tests
 * Ensures server is ready and test data is prepared
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up HeartVoice Monitor frontend tests...');
  
  // Launch browser to verify server is running
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for server to be ready
    console.log('⏳ Waiting for server to be ready...');
    await page.goto('http://localhost:3003', { waitUntil: 'networkidle' });
    
    // Verify main dashboard loads
    await page.waitForSelector('h1', { timeout: 30000 });
    console.log('✅ Server is ready and dashboard loads');
    
    // Verify API endpoints are working
    const response = await page.request.get('/api/patients');
    if (response.ok()) {
      console.log('✅ API endpoints are responding');
    } else {
      throw new Error('API endpoints not responding');
    }
    
    // Prepare test data if needed
    console.log('📊 Preparing test data...');
    
    // Clean up any existing test patients
    const patients = await response.json();
    if (patients.patients) {
      console.log(`📋 Found ${patients.patients.length} existing patients`);
    }
    
    console.log('🎉 Global setup complete!');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
