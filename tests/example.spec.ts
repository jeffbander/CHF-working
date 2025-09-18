import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/HeartVoice Monitor/);
});

test('navigation menu is visible', async ({ page }) => {
  await page.goto('/');

  // Check if main navigation elements are present
  await expect(page.locator('nav')).toBeVisible();
});

test('homepage loads without errors', async ({ page }) => {
  // Listen for console errors
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  await page.goto('/');
  
  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle');
  
  // Check that no console errors occurred
  expect(errors).toHaveLength(0);
});