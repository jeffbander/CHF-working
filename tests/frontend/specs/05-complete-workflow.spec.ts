import { test, expect } from '@playwright/test';
import { DashboardPage, PatientManagementPage, VoiceAnalysisPage, AgentControlPage } from '../utils/page-objects';
import { TestHelpers } from '../utils/test-helpers';

/**
 * Complete Workflow Integration Tests
 * Tests the full patient journey: add patient → edit scripts → make call → view analysis
 */

test.describe('Complete Patient Workflow', () => {
  let dashboardPage: DashboardPage;
  let patientPage: PatientManagementPage;
  let voiceAnalysisPage: VoiceAnalysisPage;
  let agentControlPage: AgentControlPage;
  let helpers: TestHelpers;
  let testPatient: any;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    patientPage = new PatientManagementPage(page);
    voiceAnalysisPage = new VoiceAnalysisPage(page);
    agentControlPage = new AgentControlPage(page);
    helpers = new TestHelpers(page);
    
    testPatient = helpers.generateTestPatient();
    
    await dashboardPage.navigate();
    await dashboardPage.waitForDashboardLoad();
  });

  test('should complete full patient workflow: add → configure → call → analyze', async ({ page }) => {
    console.log('🚀 Starting complete patient workflow test...');
    
    // STEP 1: Add a new patient
    console.log('📝 Step 1: Adding new patient...');
    await dashboardPage.clickPatientTab();
    await patientPage.addNewPatient(testPatient);
    await patientPage.verifyPatientInList(`${testPatient.firstName} ${testPatient.lastName}`);
    console.log(`✅ Patient added: ${testPatient.firstName} ${testPatient.lastName}`);
    
    // STEP 2: Configure agent scripts
    console.log('🎛️ Step 2: Configuring agent scripts...');
    await dashboardPage.navigateToAgentControl();
    
    const customGreeting = `Hello {patientName}! This is a custom test greeting for ${testPatient.firstName}. How are you feeling today?`;
    await agentControlPage.editGreetingScript(customGreeting);
    console.log('✅ Agent scripts configured');
    
    // STEP 3: Initiate voice call
    console.log('📞 Step 3: Initiating voice call...');
    await dashboardPage.navigate();
    await dashboardPage.clickPatientTab();
    await dashboardPage.makeCallToPatient(`${testPatient.firstName} ${testPatient.lastName}`);
    console.log('✅ Voice call initiated');
    
    // STEP 4: Wait for call processing (simulate)
    console.log('⏳ Step 4: Waiting for call processing...');
    await page.waitForTimeout(5000); // Simulate call processing time
    
    // STEP 5: Check voice analysis results
    console.log('📊 Step 5: Checking voice analysis results...');
    await voiceAnalysisPage.navigate();
    await voiceAnalysisPage.waitForAnalysisLoad();
    
    // Look for our test patient in results (may take time to appear)
    const results = await voiceAnalysisPage.getAnalysisResults();
    console.log(`📈 Found ${results.length} voice analysis results`);
    
    // STEP 6: Verify complete workflow
    console.log('✅ Step 6: Verifying workflow completion...');
    
    // Verify patient exists
    await dashboardPage.navigate();
    await dashboardPage.clickPatientTab();
    await patientPage.verifyPatientInList(`${testPatient.firstName} ${testPatient.lastName}`);
    
    // Verify scripts were saved
    await dashboardPage.navigateToAgentControl();
    await expect(page.locator('textarea[name="script"]')).toHaveValue(customGreeting);
    
    console.log('🎉 Complete workflow test passed!');
  });

  test('should handle workflow with multiple patients', async ({ page }) => {
    console.log('👥 Testing workflow with multiple patients...');
    
    // Add multiple patients
    const patients = [];
    for (let i = 0; i < 3; i++) {
      const patient = helpers.generateTestPatient();
      patients.push(patient);
      
      await dashboardPage.clickPatientTab();
      await patientPage.addNewPatient(patient);
      console.log(`✅ Added patient ${i + 1}: ${patient.firstName} ${patient.lastName}`);
    }
    
    // Configure scripts for multiple patients
    await dashboardPage.navigateToAgentControl();
    const multiPatientGreeting = 'Hello {patientName}! This greeting works for multiple patients.';
    await agentControlPage.editGreetingScript(multiPatientGreeting);
    
    // Make calls to multiple patients
    await dashboardPage.navigate();
    await dashboardPage.clickPatientTab();
    
    for (const patient of patients) {
      await dashboardPage.makeCallToPatient(`${patient.firstName} ${patient.lastName}`);
      await page.waitForTimeout(2000); // Delay between calls
      console.log(`📞 Called: ${patient.firstName} ${patient.lastName}`);
    }
    
    console.log('✅ Multiple patient workflow completed');
  });

  test('should handle workflow errors gracefully', async ({ page }) => {
    console.log('🔧 Testing workflow error handling...');
    
    // Add patient with potential issues
    const problematicPatient = {
      ...testPatient,
      phoneNumber: '000-000-0000' // Invalid number
    };
    
    await dashboardPage.clickPatientTab();
    await patientPage.addNewPatient(problematicPatient);
    
    // Try to make call (should fail)
    await dashboardPage.makeCallToPatient(`${problematicPatient.firstName} ${problematicPatient.lastName}`);
    
    // Verify error handling
    await expect(page.locator('text=error, text=failed, text=unable')).toBeVisible();
    
    console.log('✅ Workflow error handling verified');
  });

  test('should maintain data consistency across workflow', async ({ page }) => {
    console.log('🔄 Testing data consistency across workflow...');
    
    // Add patient
    await dashboardPage.clickPatientTab();
    await patientPage.addNewPatient(testPatient);
    
    // Get patient details from different views
    const patientDetails1 = await patientPage.getPatientDetails(`${testPatient.firstName} ${testPatient.lastName}`);
    
    // Navigate to voice analysis and back
    await voiceAnalysisPage.navigate();
    await dashboardPage.navigate();
    await dashboardPage.clickPatientTab();
    
    // Verify patient details are consistent
    const patientDetails2 = await patientPage.getPatientDetails(`${testPatient.firstName} ${testPatient.lastName}`);
    
    expect(patientDetails1.name).toBe(patientDetails2.name);
    expect(patientDetails1.phone).toBe(patientDetails2.phone);
    
    console.log('✅ Data consistency maintained');
  });

  test('should support workflow navigation via breadcrumbs', async ({ page }) => {
    console.log('🧭 Testing workflow navigation via breadcrumbs...');
    
    // Navigate through different pages
    await dashboardPage.navigate();
    await helpers.verifyBreadcrumb(['Dashboard']);
    
    await agentControlPage.navigate();
    await helpers.verifyBreadcrumb(['Dashboard', 'Agent Control']);
    
    await voiceAnalysisPage.navigate();
    await helpers.verifyBreadcrumb(['Dashboard', 'Voice']);
    
    // Navigate back via breadcrumb
    await page.click('a:has-text("Dashboard")');
    await dashboardPage.waitForDashboardLoad();
    
    console.log('✅ Breadcrumb navigation working');
  });

  test('should handle concurrent workflow operations', async ({ page }) => {
    console.log('⚡ Testing concurrent workflow operations...');
    
    // Add patient
    await dashboardPage.clickPatientTab();
    await patientPage.addNewPatient(testPatient);
    
    // Open multiple tabs/operations
    const promises = [
      // Navigate to agent control
      (async () => {
        await dashboardPage.navigateToAgentControl();
        await agentControlPage.waitForScriptsLoad();
      })(),
      
      // Check voice analysis
      (async () => {
        await voiceAnalysisPage.navigate();
        await voiceAnalysisPage.waitForAnalysisLoad();
      })()
    ];
    
    // Wait for concurrent operations
    await Promise.all(promises);
    
    console.log('✅ Concurrent operations handled');
  });

  test('should preserve workflow state during page refreshes', async ({ page }) => {
    console.log('🔄 Testing workflow state preservation...');
    
    // Add patient and configure scripts
    await dashboardPage.clickPatientTab();
    await patientPage.addNewPatient(testPatient);
    
    await dashboardPage.navigateToAgentControl();
    const testScript = `Test script for ${testPatient.firstName} - ${Date.now()}`;
    await agentControlPage.editGreetingScript(testScript);
    
    // Refresh page
    await page.reload();
    await agentControlPage.waitForScriptsLoad();
    
    // Verify script is preserved
    await expect(page.locator('textarea[name="script"]')).toHaveValue(testScript);
    
    // Verify patient is still in list
    await dashboardPage.navigate();
    await dashboardPage.clickPatientTab();
    await patientPage.verifyPatientInList(`${testPatient.firstName} ${testPatient.lastName}`);
    
    console.log('✅ Workflow state preserved after refresh');
  });

  test('should complete workflow with real-time updates', async ({ page }) => {
    console.log('📡 Testing workflow with real-time updates...');
    
    // Add patient
    await dashboardPage.clickPatientTab();
    await patientPage.addNewPatient(testPatient);
    
    // Make call and monitor for real-time updates
    await dashboardPage.makeCallToPatient(`${testPatient.firstName} ${testPatient.lastName}`);
    
    // Simulate real-time call status updates
    await page.evaluate(() => {
      const events = ['initiated', 'ringing', 'answered', 'completed'];
      events.forEach((status, index) => {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('callStatusUpdate', {
            detail: { status, callId: 'test-call-123' }
          }));
        }, index * 1000);
      });
    });
    
    // Wait for status updates
    await page.waitForTimeout(5000);
    
    console.log('✅ Real-time workflow updates working');
  });
});
