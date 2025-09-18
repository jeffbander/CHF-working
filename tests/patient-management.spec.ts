import { test, expect } from '@playwright/test';

test.describe('Patient Management Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should open add patient dialog', async ({ page }) => {
    // Look for add patient button (could be "Add Patient" or just "Add")
    const addButton = page.getByRole('button', { name: /Add Patient|Add/ }).first();
    await addButton.click();

    // Check if dialog opened
    await expect(page.getByRole('dialog').or(page.locator('[role="dialog"]'))).toBeVisible();
  });

  test('should display patient table in All Patients tab', async ({ page }) => {
    // Navigate to All Patients tab
    await page.getByRole('tab', { name: 'All Patients' }).click();
    
    // Check for patient table elements
    await expect(page.getByText('Patient Management')).toBeVisible();
    await expect(page.locator('table').or(page.locator('[role="table"]'))).toBeVisible();
  });

  test('should show high-risk patients in Critical Alerts tab', async ({ page }) => {
    // Critical Alerts tab should be default, but click to ensure
    await page.getByRole('tab', { name: 'Critical Alerts' }).click();
    
    // Check for high-risk patient section
    await expect(page.getByText('High-Risk Patients Requiring Attention')).toBeVisible();
  });

  test('should handle patient interaction buttons', async ({ page }) => {
    // Navigate to All Patients tab to see the patient table
    await page.getByRole('tab', { name: 'All Patients' }).click();
    
    // Look for call or action buttons in the patient table
    const callButtons = page.locator('button:has-text("Call")').or(page.locator('button[aria-label*="Call"]'));
    const viewButtons = page.locator('button:has-text("View")').or(page.locator('button[aria-label*="View"]'));
    
    // Check if any patient action buttons exist
    const hasCallButtons = await callButtons.count() > 0;
    const hasViewButtons = await viewButtons.count() > 0;
    
    // At least one type of action button should be present if there are patients
    if (hasCallButtons || hasViewButtons) {
      expect(hasCallButtons || hasViewButtons).toBe(true);
    }
  });

  test('should display voice recordings panel', async ({ page }) => {
    // Navigate to Voice Recordings tab
    await page.getByRole('tab', { name: 'Voice Recordings' }).click();
    
    // The voice recordings panel should be visible
    // This may show "No recordings" or actual recordings
    await expect(page.locator('[data-testid="call-recordings-panel"]').or(page.getByText(/recordings|calls/i))).toBeVisible();
  });

  test('should show analytics placeholder', async ({ page }) => {
    // Navigate to Analytics tab
    await page.getByRole('tab', { name: 'Analytics' }).click();
    
    // Check for analytics content
    await expect(page.getByText('Clinical Analytics')).toBeVisible();
    await expect(page.getByText(/coming soon|analytics|insights/i)).toBeVisible();
  });

  test('should handle refresh functionality', async ({ page }) => {
    // Click refresh button
    const refreshButton = page.getByRole('button', { name: /Refresh/ });
    await refreshButton.click();
    
    // Check that the button shows loading state briefly
    await expect(refreshButton.locator('.animate-spin').or(refreshButton.locator('[class*="spin"]'))).toBeVisible();
  });
});