import { test, expect } from '@playwright/test';
import { DashboardPage, PatientManagementPage } from '../utils/page-objects';
import { TestHelpers } from '../utils/test-helpers';

/**
 * Patient Management Frontend Tests
 * Tests adding patients, viewing patient list, and patient data validation
 */

test.describe('Patient Management', () => {
  let dashboardPage: DashboardPage;
  let patientPage: PatientManagementPage;
  let helpers: TestHelpers;
  let testPatient: any;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    patientPage = new PatientManagementPage(page);
    helpers = new TestHelpers(page);
    
    // Generate unique test patient
    testPatient = helpers.generateTestPatient();
    
    // Navigate to dashboard
    await dashboardPage.navigate();
    await dashboardPage.waitForDashboardLoad();
  });

  test('should load dashboard and show existing patients', async ({ page }) => {
    // Verify dashboard loads
    await expect(page.locator('h1')).toContainText('HeartVoice Monitor');
    
    // Click patients tab
    await dashboardPage.clickPatientTab();
    
    // Verify patients table is visible
    await expect(page.locator('table')).toBeVisible();
    
    // Verify at least some patients exist
    const patientCount = await dashboardPage.getPatientCount();
    expect(patientCount).toBeGreaterThan(0);
    
    console.log(`✅ Dashboard loaded with ${patientCount} patients`);
  });

  test('should add a new patient successfully', async ({ page }) => {
    // Navigate to patients section
    await dashboardPage.clickPatientTab();
    
    // Get initial patient count
    const initialCount = await dashboardPage.getPatientCount();
    
    // Add new patient
    await patientPage.addNewPatient(testPatient);
    
    // Verify patient was added
    await patientPage.verifyPatientInList(`${testPatient.firstName} ${testPatient.lastName}`);
    
    // Verify patient count increased
    const newCount = await dashboardPage.getPatientCount();
    expect(newCount).toBe(initialCount + 1);
    
    console.log(`✅ Successfully added patient: ${testPatient.firstName} ${testPatient.lastName}`);
  });

  test('should validate patient form fields', async ({ page }) => {
    await dashboardPage.clickPatientTab();
    
    // Click add patient button
    await page.click('button:has-text("Add Patient"), button:has-text("New Patient")');
    
    // Try to submit empty form
    await page.click('button[type="submit"], button:has-text("Save")');
    
    // Verify validation errors appear
    await expect(page.locator('text=required, text=Required')).toBeVisible();
    
    // Fill required fields one by one and verify validation
    await helpers.fillField('input[name="firstName"]', testPatient.firstName);
    await helpers.fillField('input[name="lastName"]', testPatient.lastName);
    
    // Test invalid phone number
    await helpers.fillField('input[name="phoneNumber"]', '123');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=valid phone, text=Invalid phone')).toBeVisible();
    
    // Fix phone number
    await helpers.fillField('input[name="phoneNumber"]', testPatient.phoneNumber);
    
    // Test invalid date
    await helpers.fillField('input[name="dateOfBirth"]', '2030-01-01');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=future date, text=Invalid date')).toBeVisible();
    
    console.log('✅ Form validation working correctly');
  });

  test('should search and filter patients', async ({ page }) => {
    await dashboardPage.clickPatientTab();
    
    // Add a test patient first
    await patientPage.addNewPatient(testPatient);
    
    // Test search functionality
    await dashboardPage.searchPatient(testPatient.firstName);
    
    // Verify search results
    await expect(page.locator(`tr:has-text("${testPatient.firstName}")`)).toBeVisible();
    
    // Clear search and verify all patients show again
    await page.fill('input[type="search"]', '');
    await page.waitForTimeout(1000);
    
    const totalCount = await dashboardPage.getPatientCount();
    expect(totalCount).toBeGreaterThan(1);
    
    console.log('✅ Patient search functionality working');
  });

  test('should display patient details correctly', async ({ page }) => {
    await dashboardPage.clickPatientTab();
    
    // Add test patient
    await patientPage.addNewPatient(testPatient);
    
    // Get patient details from table
    const patientDetails = await patientPage.getPatientDetails(`${testPatient.firstName} ${testPatient.lastName}`);
    
    // Verify patient data is displayed correctly
    expect(patientDetails.name).toContain(testPatient.firstName);
    expect(patientDetails.name).toContain(testPatient.lastName);
    expect(patientDetails.phone).toContain(testPatient.phoneNumber);
    
    console.log('✅ Patient details displayed correctly:', patientDetails);
  });

  test('should handle patient management errors gracefully', async ({ page }) => {
    await dashboardPage.clickPatientTab();
    
    // Mock API error
    await helpers.mockApiResponse('/api/patients', { error: 'Server error' });
    
    // Try to add patient
    await page.click('button:has-text("Add Patient")');
    await helpers.fillField('input[name="firstName"]', testPatient.firstName);
    await helpers.fillField('input[name="lastName"]', testPatient.lastName);
    await helpers.fillField('input[name="phoneNumber"]', testPatient.phoneNumber);
    await helpers.fillField('input[name="dateOfBirth"]', testPatient.dateOfBirth);
    
    await page.click('button[type="submit"]');
    
    // Verify error handling
    await expect(page.locator('text=error, text=Error')).toBeVisible();
    
    console.log('✅ Error handling working correctly');
  });

  test('should verify breadcrumb navigation', async ({ page }) => {
    await dashboardPage.clickPatientTab();
    
    // Verify breadcrumb shows correct path
    await helpers.verifyBreadcrumb(['Dashboard']);
    
    console.log('✅ Breadcrumb navigation verified');
  });
});
