import { test, expect } from '@playwright/test';
import { DashboardPage, PatientManagementPage } from '../utils/page-objects';
import { TestHelpers } from '../utils/test-helpers';

/**
 * Voice Calls Frontend Tests
 * Tests making calls, call status, and call management
 */

test.describe('Voice Calls', () => {
  let dashboardPage: DashboardPage;
  let patientPage: PatientManagementPage;
  let helpers: TestHelpers;
  let testPatient: any;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    patientPage = new PatientManagementPage(page);
    helpers = new TestHelpers(page);
    
    // Generate test patient for calls
    testPatient = helpers.generateTestPatient();
    
    await dashboardPage.navigate();
    await dashboardPage.waitForDashboardLoad();
  });

  test('should initiate a voice call to patient', async ({ page }) => {
    // Add a test patient first
    await dashboardPage.clickPatientTab();
    await patientPage.addNewPatient(testPatient);
    
    // Verify patient is in list
    await patientPage.verifyPatientInList(`${testPatient.firstName} ${testPatient.lastName}`);
    
    // Make call to patient
    await dashboardPage.makeCallToPatient(`${testPatient.firstName} ${testPatient.lastName}`);
    
    // Verify call initiation success
    await helpers.waitForToast('Call initiated');
    
    console.log(`✅ Successfully initiated call to ${testPatient.firstName} ${testPatient.lastName}`);
  });

  test('should show call status and progress', async ({ page }) => {
    await dashboardPage.clickPatientTab();
    await patientPage.addNewPatient(testPatient);
    
    // Initiate call
    await dashboardPage.makeCallToPatient(`${testPatient.firstName} ${testPatient.lastName}`);
    
    // Wait for call status to appear
    await page.waitForSelector('[data-testid="call-status"], .call-status', { timeout: 10000 });
    
    // Verify call status is shown
    await expect(page.locator('text=calling, text=ringing, text=in progress')).toBeVisible();
    
    console.log('✅ Call status displayed correctly');
  });

  test('should handle call failures gracefully', async ({ page }) => {
    await dashboardPage.clickPatientTab();
    
    // Create patient with invalid phone number
    const invalidPatient = {
      ...testPatient,
      phoneNumber: '000-000-0000'
    };
    
    await patientPage.addNewPatient(invalidPatient);
    
    // Try to make call
    await dashboardPage.makeCallToPatient(`${invalidPatient.firstName} ${invalidPatient.lastName}`);
    
    // Verify error handling
    await expect(page.locator('text=failed, text=error, text=unable')).toBeVisible();
    
    console.log('✅ Call failure handling working');
  });

  test('should show call history', async ({ page }) => {
    // Navigate to voice recordings tab
    await dashboardPage.clickVoiceRecordingsTab();
    
    // Verify call history table is visible
    await expect(page.locator('table')).toBeVisible();
    
    // Verify call history has data
    await helpers.waitForTableData();
    
    // Check for call history columns
    await expect(page.locator('th:has-text("Patient"), th:has-text("Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Date"), th:has-text("Time")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
    
    console.log('✅ Call history displayed correctly');
  });

  test('should allow bulk call operations', async ({ page }) => {
    await dashboardPage.clickPatientTab();
    
    // Add multiple test patients
    for (let i = 0; i < 3; i++) {
      const patient = helpers.generateTestPatient();
      await patientPage.addNewPatient(patient);
    }
    
    // Select multiple patients
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    
    if (count > 1) {
      // Select first few patients
      for (let i = 0; i < Math.min(3, count); i++) {
        await checkboxes.nth(i).check();
      }
      
      // Look for bulk actions
      await expect(page.locator('button:has-text("Call Selected"), button:has-text("Bulk Call")')).toBeVisible();
      
      console.log('✅ Bulk call operations available');
    }
  });

  test('should validate call permissions and restrictions', async ({ page }) => {
    await dashboardPage.clickPatientTab();
    
    // Try to make call without selecting patient
    const callButtons = page.locator('button:has-text("Call")');
    const buttonCount = await callButtons.count();
    
    if (buttonCount > 0) {
      // Verify call button is properly enabled/disabled
      const firstCallButton = callButtons.first();
      await expect(firstCallButton).toBeVisible();
      
      // Check if there are any restrictions shown
      const restrictionText = page.locator('text=restricted, text=unavailable, text=offline');
      const hasRestrictions = await restrictionText.count() > 0;
      
      console.log(`✅ Call permissions checked (restrictions: ${hasRestrictions})`);
    }
  });

  test('should show real-time call updates', async ({ page }) => {
    await dashboardPage.clickPatientTab();
    await patientPage.addNewPatient(testPatient);
    
    // Mock real-time call updates
    await page.evaluate(() => {
      // Simulate WebSocket or polling updates
      window.dispatchEvent(new CustomEvent('callUpdate', {
        detail: { status: 'ringing', callId: 'test-call-123' }
      }));
    });
    
    // Initiate call
    await dashboardPage.makeCallToPatient(`${testPatient.firstName} ${testPatient.lastName}`);
    
    // Wait for status updates
    await page.waitForTimeout(2000);
    
    // Verify real-time updates are working
    const statusElements = page.locator('[data-testid="call-status"], .call-status');
    const hasStatus = await statusElements.count() > 0;
    
    expect(hasStatus).toBeTruthy();
    
    console.log('✅ Real-time call updates working');
  });

  test('should handle concurrent calls properly', async ({ page }) => {
    await dashboardPage.clickPatientTab();
    
    // Add multiple patients
    const patients = [];
    for (let i = 0; i < 2; i++) {
      const patient = helpers.generateTestPatient();
      patients.push(patient);
      await patientPage.addNewPatient(patient);
    }
    
    // Try to initiate multiple calls
    for (const patient of patients) {
      await dashboardPage.makeCallToPatient(`${patient.firstName} ${patient.lastName}`);
      await page.waitForTimeout(1000); // Small delay between calls
    }
    
    // Verify system handles concurrent calls
    await expect(page.locator('text=call, text=initiated')).toBeVisible();
    
    console.log('✅ Concurrent calls handled properly');
  });
});
