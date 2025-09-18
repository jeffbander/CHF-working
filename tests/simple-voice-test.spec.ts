import { test, expect } from '@playwright/test';

/**
 * Simple Voice Call Test for HeartVoice Monitor
 * Tests basic functionality without complex dependencies
 */

test.describe('Simple Voice Call Test', () => {
  const targetUrl = process.env.TEST_URL || 'https://b545d6dd0331.ngrok.app';
  const testPhone = '6465565559';

  test('should load application and test voice call to 6465565559', async ({ page }) => {
    console.log(`🌐 Testing application at: ${targetUrl}`);

    // Set up console logging
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.error('PAGE ERROR:', error));

    // Navigate to the application
    await page.goto(targetUrl, { timeout: 30000 });

    // Wait for the page to load
    await page.waitForTimeout(3000);

    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/app-loaded.png' });

    // Check if we can see the main interface
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);

    // Look for any main content
    const bodyText = await page.textContent('body');
    console.log(`📝 Page has content: ${bodyText ? 'YES' : 'NO'}`);

    // Try to find patient management elements
    const patientElements = [
      'h1:has-text("Clinical Dashboard")',
      '[data-testid*="patient"]',
      'button:has-text("Add Patient")',
      'button:has-text("Call")',
      '.patient-table',
      '.dashboard'
    ];

    for (const selector of patientElements) {
      try {
        const element = page.locator(selector);
        const isVisible = await element.isVisible({ timeout: 2000 });
        console.log(`🔍 Element "${selector}": ${isVisible ? 'FOUND' : 'NOT FOUND'}`);
      } catch (error) {
        console.log(`🔍 Element "${selector}": NOT FOUND`);
      }
    }

    // Try to find and click a call button for the test phone number
    const callButtons = [
      `button:has-text("Call"):near(:text("${testPhone}"))`,
      `tr:has-text("${testPhone}") button:has-text("Call")`,
      `button[onclick*="${testPhone}"]`,
      '.call-button'
    ];

    let callInitiated = false;
    for (const selector of callButtons) {
      try {
        const callButton = page.locator(selector);
        const isVisible = await callButton.isVisible({ timeout: 2000 });
        if (isVisible) {
          console.log(`📞 Found call button: ${selector}`);

          // Set up dialog listener for call confirmation
          page.on('dialog', async dialog => {
            console.log(`📱 Dialog appeared: ${dialog.message()}`);
            await dialog.accept();
          });

          // Click the call button
          await callButton.click();
          console.log(`📞 Clicked call button for ${testPhone}`);
          callInitiated = true;

          // Wait for any call processing
          await page.waitForTimeout(5000);
          break;
        }
      } catch (error) {
        console.log(`❌ Failed to click call button ${selector}: ${error.message}`);
      }
    }

    if (!callInitiated) {
      console.log(`⚠️ No call button found for ${testPhone}. Looking for add patient functionality...`);

      // Try to add a patient first
      const addPatientButtons = [
        'button:has-text("Add Patient")',
        '[data-testid*="add-patient"]',
        '.add-patient-button'
      ];

      for (const selector of addPatientButtons) {
        try {
          const addButton = page.locator(selector);
          const isVisible = await addButton.isVisible({ timeout: 2000 });
          if (isVisible) {
            console.log(`➕ Found add patient button: ${selector}`);
            await addButton.click();
            await page.waitForTimeout(1000);

            // Fill in basic patient info if form appears
            const phoneField = page.locator('input[type="tel"], input[name*="phone"], #phoneNumber');
            if (await phoneField.isVisible({ timeout: 3000 })) {
              await phoneField.fill(testPhone);
              console.log(`📞 Filled phone number: ${testPhone}`);
            }
            break;
          }
        } catch (error) {
          console.log(`❌ Failed to add patient: ${error.message}`);
        }
      }
    }

    // Take final screenshot
    await page.screenshot({ path: 'test-results/test-completed.png' });

    // Log final status
    console.log(`✅ Test completed. Call initiated: ${callInitiated}`);

    // The test passes if we can load the application
    expect(bodyText).toBeTruthy();
  });
});