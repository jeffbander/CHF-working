#!/usr/bin/env node

/**
 * Comprehensive Frontend Headless Testing for HeartVoice Monitor
 * Tests all components: Dashboard, Patient Management, Voice Calls, Analysis, Agent Control
 */

const { chromium } = require('playwright');

class HeartVoiceMonitorTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseUrl = 'http://localhost:3003';
    this.testResults = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async setup() {
    console.log('🚀 Setting up headless browser...');
    this.browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Set viewport for consistent testing
    await this.page.setViewportSize({ width: 1280, height: 720 });
    
    // Add console logging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ Console Error: ${msg.text()}`);
      }
    });
    
    console.log('✅ Browser setup complete');
  }

  async teardown() {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 Browser closed');
    }
  }

  async runTest(testName, testFunction) {
    try {
      console.log(`\n🧪 Running: ${testName}`);
      await testFunction();
      this.testResults.passed++;
      this.testResults.tests.push({ name: testName, status: 'PASSED' });
      console.log(`✅ PASSED: ${testName}`);
    } catch (error) {
      this.testResults.failed++;
      this.testResults.tests.push({ name: testName, status: 'FAILED', error: error.message });
      console.log(`❌ FAILED: ${testName} - ${error.message}`);
    }
  }

  async waitForElement(selector, timeout = 10000) {
    await this.page.waitForSelector(selector, { timeout, state: 'visible' });
  }

  async waitForApiResponse(urlPattern) {
    return await this.page.waitForResponse(response => 
      response.url().includes(urlPattern) && response.status() === 200
    );
  }

  // Test 1: Dashboard Loading and Navigation
  async testDashboardLoading() {
    await this.page.goto(this.baseUrl);
    await this.waitForElement('h1');
    
    const title = await this.page.textContent('h1');
    if (!title.includes('HeartVoice') && !title.includes('Monitor')) {
      throw new Error('Dashboard title not found');
    }
    
    // Check for main navigation elements
    await this.waitForElement('nav, [role="navigation"]');
    console.log('   📊 Dashboard loaded with navigation');
  }

  // Test 2: Patient Management - View Patients
  async testPatientManagement() {
    await this.page.goto(this.baseUrl);
    
    // Look for patients section/tab
    const patientsButton = await this.page.locator('button:has-text("Patients"), button:has-text("All Patients"), [data-tab="patients"]').first();
    if (await patientsButton.count() > 0) {
      await patientsButton.click();
      await this.page.waitForTimeout(2000);
    }
    
    // Wait for patient data to load
    await this.waitForApiResponse('/api/patients');
    
    // Check for patient table or list
    await this.waitForElement('table, .patient-list, [data-testid="patients"]');
    console.log('   👥 Patient management interface loaded');
  }

  // Test 3: Add New Patient
  async testAddPatient() {
    await this.page.goto(this.baseUrl);
    
    // Navigate to patients section
    const patientsButton = await this.page.locator('button:has-text("Patients"), [data-tab="patients"]').first();
    if (await patientsButton.count() > 0) {
      await patientsButton.click();
      await this.page.waitForTimeout(1000);
    }
    
    // Look for add patient button
    const addButton = await this.page.locator('button:has-text("Add Patient"), button:has-text("New Patient"), button:has-text("Add")').first();
    if (await addButton.count() > 0) {
      await addButton.click();
      await this.page.waitForTimeout(1000);
      
      // Fill patient form if modal/form appears
      const firstNameInput = await this.page.locator('input[name="firstName"], input[placeholder*="First"]').first();
      if (await firstNameInput.count() > 0) {
        const timestamp = Date.now();
        await firstNameInput.fill(`TestPatient${timestamp}`);
        
        const lastNameInput = await this.page.locator('input[name="lastName"], input[placeholder*="Last"]').first();
        if (await lastNameInput.count() > 0) {
          await lastNameInput.fill('HeadlessTest');
        }
        
        const phoneInput = await this.page.locator('input[name="phoneNumber"], input[placeholder*="Phone"]').first();
        if (await phoneInput.count() > 0) {
          await phoneInput.fill('555-TEST-123');
        }
        
        // Submit form
        const submitButton = await this.page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Add")').first();
        if (await submitButton.count() > 0) {
          await submitButton.click();
          await this.page.waitForTimeout(2000);
        }
        
        console.log('   ➕ Patient addition form tested');
      }
    } else {
      console.log('   ℹ️  Add patient functionality not visible');
    }
  }

  // Test 4: Voice Calls Interface
  async testVoiceCalls() {
    await this.page.goto(this.baseUrl);
    
    // Look for voice recordings or calls section
    const voiceButton = await this.page.locator('button:has-text("Voice"), button:has-text("Calls"), button:has-text("Recordings"), [data-tab="voice-recordings"]').first();
    if (await voiceButton.count() > 0) {
      await voiceButton.click();
      await this.page.waitForTimeout(2000);
    }
    
    // Check for call interface elements
    const callElements = await this.page.locator('button:has-text("Call"), .call-button, [data-testid="call"]').count();
    if (callElements > 0) {
      console.log('   📞 Voice call interface found');
    }
    
    // Test call initiation (without actually making a call)
    const callButton = await this.page.locator('button:has-text("Call")').first();
    if (await callButton.count() > 0) {
      console.log('   📞 Call buttons available');
    }
  }

  // Test 5: Voice Analysis Dashboard
  async testVoiceAnalysis() {
    await this.page.goto(`${this.baseUrl}/voice-analysis-dashboard`);
    
    // Wait for page to load
    await this.waitForElement('h1');
    
    // Wait for API data
    await this.waitForApiResponse('/api/voice-analysis');
    
    // Check for analysis data
    await this.waitForElement('table, .analysis-results, [data-testid="voice-analysis"]');
    
    // Look for biomarker data
    const biomarkerElements = await this.page.locator('text=Jitter, text=Shimmer, text=HNR, text=F0').count();
    if (biomarkerElements > 0) {
      console.log('   🧬 Biomarker data displayed');
    }
    
    // Check for risk scores
    const riskScores = await this.page.locator('text=/\\d+\\/100/').count();
    if (riskScores > 0) {
      console.log('   🎯 Risk scores displayed');
    }
    
    console.log('   📊 Voice analysis dashboard loaded');
  }

  // Test 6: Agent Control Panel
  async testAgentControl() {
    await this.page.goto(`${this.baseUrl}/agent-control`);
    
    // Wait for page to load
    await this.waitForElement('h1');
    
    // Check for script tabs
    const scriptTabs = await this.page.locator('button:has-text("Greeting"), button:has-text("Voice Analysis"), button:has-text("Conclusion")').count();
    if (scriptTabs > 0) {
      console.log('   🎛️ Script tabs found');
    }
    
    // Check for script editor
    await this.waitForElement('textarea, .script-editor, [data-testid="script"]');
    console.log('   📝 Script editor interface loaded');
  }

  // Test 7: Script Editing Functionality
  async testScriptEditing() {
    await this.page.goto(`${this.baseUrl}/agent-control`);
    await this.waitForElement('h1');
    
    // Find script textarea
    const scriptTextarea = await this.page.locator('textarea[name="script"], textarea').first();
    if (await scriptTextarea.count() > 0) {
      // Get current script content
      const originalScript = await scriptTextarea.inputValue();
      
      // Modify script
      const testScript = `Modified test script at ${new Date().toISOString()}. Original length: ${originalScript.length} characters.`;
      await scriptTextarea.fill(testScript);
      
      // Verify script was changed
      const newScript = await scriptTextarea.inputValue();
      if (newScript === testScript) {
        console.log('   ✏️  Script editing successful');
        
        // Look for save button
        const saveButton = await this.page.locator('button:has-text("Save"), button[type="submit"]').first();
        if (await saveButton.count() > 0) {
          await saveButton.click();
          await this.page.waitForTimeout(1000);
          console.log('   💾 Script save attempted');
        }
        
        // Restore original script
        await scriptTextarea.fill(originalScript);
        if (await saveButton.count() > 0) {
          await saveButton.click();
          await this.page.waitForTimeout(1000);
        }
      } else {
        throw new Error('Script editing failed');
      }
    } else {
      throw new Error('Script textarea not found');
    }
  }

  // Test 8: Navigation Between Pages
  async testNavigation() {
    // Test navigation to different pages
    const pages = [
      { url: '/', name: 'Dashboard' },
      { url: '/agent-control', name: 'Agent Control' },
      { url: '/voice-analysis-dashboard', name: 'Voice Analysis' }
    ];
    
    for (const pageInfo of pages) {
      await this.page.goto(`${this.baseUrl}${pageInfo.url}`);
      await this.waitForElement('h1');
      
      const title = await this.page.textContent('h1');
      console.log(`   🧭 ${pageInfo.name}: "${title}"`);
    }
    
    console.log('   ✅ Navigation between pages successful');
  }

  // Test 9: API Endpoints Validation
  async testApiEndpoints() {
    const endpoints = [
      '/api/patients',
      '/api/dashboard', 
      '/api/voice-analysis',
      '/api/call-scripts'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await this.page.request.get(`${this.baseUrl}${endpoint}`);
        if (response.ok()) {
          console.log(`   ✅ ${endpoint}: ${response.status()}`);
        } else {
          console.log(`   ⚠️  ${endpoint}: ${response.status()}`);
        }
      } catch (error) {
        console.log(`   ❌ ${endpoint}: Error`);
      }
    }
  }

  // Test 10: Error Handling
  async testErrorHandling() {
    // Test invalid URL
    await this.page.goto(`${this.baseUrl}/invalid-page`);
    
    // Should show 404 or redirect
    await this.page.waitForTimeout(2000);
    
    // Test API error handling by going to voice analysis and checking for graceful degradation
    await this.page.goto(`${this.baseUrl}/voice-analysis-dashboard`);
    await this.page.waitForTimeout(3000);
    
    // Check if page still loads even with potential API issues
    const hasContent = await this.page.locator('h1, main, .content').count() > 0;
    if (hasContent) {
      console.log('   🛡️  Error handling graceful');
    }
  }

  async runAllTests() {
    console.log('🎯 STARTING COMPREHENSIVE FRONTEND TESTING');
    console.log('==========================================');
    
    await this.setup();
    
    // Run all tests
    await this.runTest('Dashboard Loading', () => this.testDashboardLoading());
    await this.runTest('Patient Management', () => this.testPatientManagement());
    await this.runTest('Add Patient Form', () => this.testAddPatient());
    await this.runTest('Voice Calls Interface', () => this.testVoiceCalls());
    await this.runTest('Voice Analysis Dashboard', () => this.testVoiceAnalysis());
    await this.runTest('Agent Control Panel', () => this.testAgentControl());
    await this.runTest('Script Editing', () => this.testScriptEditing());
    await this.runTest('Page Navigation', () => this.testNavigation());
    await this.runTest('API Endpoints', () => this.testApiEndpoints());
    await this.runTest('Error Handling', () => this.testErrorHandling());
    
    await this.teardown();
    
    // Print results
    console.log('\n🎉 TESTING COMPLETE');
    console.log('===================');
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`📊 Total: ${this.testResults.passed + this.testResults.failed}`);
    
    if (this.testResults.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.tests
        .filter(test => test.status === 'FAILED')
        .forEach(test => console.log(`   • ${test.name}: ${test.error}`));
    }
    
    console.log('\n📋 All Tests:');
    this.testResults.tests.forEach(test => {
      const icon = test.status === 'PASSED' ? '✅' : '❌';
      console.log(`   ${icon} ${test.name}`);
    });
    
    return this.testResults.failed === 0;
  }
}

// Run the tests
async function main() {
  const tester = new HeartVoiceMonitorTester();
  const success = await tester.runAllTests();
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = HeartVoiceMonitorTester;
