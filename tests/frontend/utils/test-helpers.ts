import { Page, expect } from '@playwright/test';

/**
 * Test utilities for HeartVoice Monitor frontend tests
 */

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector('body', { state: 'visible' });
  }

  /**
   * Generate unique test patient data
   */
  generateTestPatient() {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    
    return {
      firstName: `Test${randomId}`,
      lastName: `Patient${timestamp}`,
      phoneNumber: `555-${String(timestamp).slice(-7)}`,
      dateOfBirth: '1980-01-01',
      gender: 'male',
      medicalHistory: {
        heartFailureType: 'systolic',
        ejectionFraction: 35,
        nyhaClass: 'II',
        medications: ['ACE inhibitor', 'Beta blocker']
      }
    };
  }

  /**
   * Wait for API response
   */
  async waitForApiResponse(urlPattern: string, timeout = 30000) {
    return await this.page.waitForResponse(
      response => response.url().includes(urlPattern) && response.status() === 200,
      { timeout }
    );
  }

  /**
   * Take screenshot with timestamp
   */
  async takeScreenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}-${timestamp}.png`,
      fullPage: true 
    });
  }

  /**
   * Wait for element to be visible and stable
   */
  async waitForStableElement(selector: string, timeout = 10000) {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
    await this.page.waitForTimeout(500); // Wait for animations
  }

  /**
   * Fill form field with validation
   */
  async fillField(selector: string, value: string) {
    await this.page.fill(selector, value);
    await expect(this.page.locator(selector)).toHaveValue(value);
  }

  /**
   * Click button and wait for action
   */
  async clickAndWait(selector: string, waitForSelector?: string) {
    await this.page.click(selector);
    if (waitForSelector) {
      await this.waitForStableElement(waitForSelector);
    }
  }

  /**
   * Navigate to page and verify
   */
  async navigateToPage(path: string, expectedTitle?: string) {
    await this.page.goto(path);
    await this.waitForPageLoad();
    
    if (expectedTitle) {
      await expect(this.page).toHaveTitle(new RegExp(expectedTitle, 'i'));
    }
  }

  /**
   * Wait for toast notification
   */
  async waitForToast(message?: string, timeout = 10000) {
    const toastSelector = '[role="alert"], .toast, .notification';
    await this.page.waitForSelector(toastSelector, { timeout });
    
    if (message) {
      await expect(this.page.locator(toastSelector)).toContainText(message);
    }
  }

  /**
   * Mock API response
   */
  async mockApiResponse(url: string, response: any) {
    await this.page.route(url, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoadingComplete() {
    // Wait for any loading spinners to disappear
    await this.page.waitForSelector('.loading, [data-loading="true"]', { 
      state: 'hidden', 
      timeout: 30000 
    }).catch(() => {
      // Ignore if no loading indicators found
    });
  }

  /**
   * Verify breadcrumb navigation
   */
  async verifyBreadcrumb(expectedPath: string[]) {
    const breadcrumbItems = this.page.locator('[data-testid="breadcrumb"] span, nav span');
    const count = await breadcrumbItems.count();
    
    expect(count).toBeGreaterThanOrEqual(expectedPath.length);
    
    for (let i = 0; i < expectedPath.length; i++) {
      await expect(breadcrumbItems.nth(i)).toContainText(expectedPath[i]);
    }
  }

  /**
   * Wait for table to load data
   */
  async waitForTableData(tableSelector = 'table', minRows = 1) {
    await this.page.waitForSelector(tableSelector, { state: 'visible' });
    await this.page.waitForFunction(
      ({ selector, min }) => {
        const table = document.querySelector(selector);
        const rows = table?.querySelectorAll('tbody tr');
        return rows && rows.length >= min;
      },
      { selector: tableSelector, min: minRows },
      { timeout: 30000 }
    );
  }
}
