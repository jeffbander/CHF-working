import { test, expect } from '@playwright/test';

test.describe('HeartVoice Monitor Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the clinical dashboard header', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Clinical Dashboard');
    await expect(page.getByText('Dr. Sarah Chen')).toBeVisible();
    await expect(page.getByText('Cardiologist')).toBeVisible();
  });

  test('should show loading state initially', async ({ page }) => {
    await expect(page.getByText('Loading clinical dashboard...')).toBeVisible();
  });

  test('should display dashboard overview cards after loading', async ({ page }) => {
    // Wait for dashboard to load
    await page.waitForLoadState('networkidle');
    
    // Check that overview cards are visible
    await expect(page.locator('[data-testid="dashboard-overview"]').or(page.locator('.space-y-8'))).toBeVisible();
  });

  test('should have functional tab navigation', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check all tabs are present
    await expect(page.getByRole('tab', { name: 'Critical Alerts' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'All Patients' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Voice Recordings' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Analytics' })).toBeVisible();

    // Test tab switching
    await page.getByRole('tab', { name: 'All Patients' }).click();
    await expect(page.getByText('Patient Management')).toBeVisible();

    await page.getByRole('tab', { name: 'Analytics' }).click();
    await expect(page.getByText('Clinical Analytics')).toBeVisible();
  });

  test('should display refresh button and timestamp', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByRole('button', { name: /Refresh/ })).toBeVisible();
    await expect(page.getByText(/Last updated:/)).toBeVisible();
  });

  test('should show add patient button', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByRole('button', { name: /Add Patient/ }).or(page.locator('button:has-text("Add")'))).toBeVisible();
  });
});