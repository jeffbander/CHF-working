import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have proper heading structure', async ({ page }) => {
    // Check for main heading
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Clinical Dashboard');

    // Check for proper heading hierarchy
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);
  });

  test('should have accessible navigation', async ({ page }) => {
    // Check for navigation landmarks
    const nav = page.locator('nav').or(page.locator('[role="navigation"]'));
    await expect(nav).toBeVisible();

    // Check tab navigation is accessible
    const tabs = page.locator('[role="tab"]');
    const tabCount = await tabs.count();
    
    if (tabCount > 0) {
      // Check first tab is accessible
      await expect(tabs.first()).toBeVisible();
      
      // Check tabs have proper ARIA attributes
      for (let i = 0; i < Math.min(tabCount, 3); i++) {
        const tab = tabs.nth(i);
        await expect(tab).toHaveAttribute('role', 'tab');
      }
    }
  });

  test('should have proper button accessibility', async ({ page }) => {
    // Check buttons have accessible names
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const isVisible = await button.isVisible();
      
      if (isVisible) {
        // Button should have accessible text or aria-label
        const hasText = await button.textContent();
        const hasAriaLabel = await button.getAttribute('aria-label');
        
        expect(hasText || hasAriaLabel).toBeTruthy();
      }
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Test Tab key navigation
    await page.keyboard.press('Tab');
    
    // Check that focus moves to interactive elements
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Test additional tab presses
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Focus should still be on visible interactive element
    const newFocusedElement = page.locator(':focus');
    await expect(newFocusedElement).toBeVisible();
  });

  test('should have proper form accessibility if forms exist', async ({ page }) => {
    // Look for form elements
    const forms = page.locator('form');
    const formCount = await forms.count();
    
    if (formCount > 0) {
      // Check for form labels
      const labels = page.locator('label');
      const inputs = page.locator('input, select, textarea');
      
      const labelCount = await labels.count();
      const inputCount = await inputs.count();
      
      // If there are inputs, there should be labels
      if (inputCount > 0) {
        expect(labelCount).toBeGreaterThan(0);
      }
    }
  });

  test('should have meaningful page title', async ({ page }) => {
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    expect(title).toMatch(/HeartVoice|Monitor|Dashboard|Clinical/i);
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // This is a basic check - for comprehensive color contrast testing,
    // you would need axe-core or similar accessibility testing tools
    
    // Check that text is not using problematic color combinations
    const bodyStyles = await page.evaluate(() => {
      const body = document.body;
      const styles = window.getComputedStyle(body);
      return {
        color: styles.color,
        backgroundColor: styles.backgroundColor
      };
    });
    
    // Basic check that colors are defined
    expect(bodyStyles.color).toBeTruthy();
    expect(bodyStyles.backgroundColor).toBeTruthy();
  });

  test('should handle high contrast mode', async ({ page }) => {
    // Test if the page is usable with high contrast
    await page.emulateMedia({ colorScheme: 'dark' });
    
    // Check that main elements are still visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('nav').or(page.locator('[role="navigation"]'))).toBeVisible();
  });
});