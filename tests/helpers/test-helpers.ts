import { Page, Locator } from '@playwright/test';
import { Stagehand } from '@browserbasehq/stagehand';

/**
 * Test Helper Utilities for HeartVoice Monitor E2E Tests
 *
 * These utilities provide robust, hybrid AI + data-testid strategies
 * for reliable element interaction in the clinical interface.
 */

export class TestHelpers {
  constructor(
    private page: Page,
    private stagehand: Stagehand
  ) {}

  /**
   * Robust click that tries multiple strategies
   */
  async robustClick(
    selectors: string[],
    aiDescription: string,
    options: { timeout?: number; maxRetries?: number } = {}
  ): Promise<void> {
    const { timeout = 5000, maxRetries = 3 } = options;
    let lastError: Error | null = null;

    // Strategy 1: Try data-testid and standard selectors
    for (const selector of selectors) {
      try {
        const element = this.page.locator(selector);
        if (await element.isVisible({ timeout: 1000 })) {
          await element.click({ timeout });
          return;
        }
      } catch (error) {
        lastError = error as Error;
        continue;
      }
    }

    // Strategy 2: Use Stagehand AI with retries
    for (let retry = 0; retry < maxRetries; retry++) {
      try {
        await this.stagehand.act(aiDescription);
        return;
      } catch (error) {
        lastError = error as Error;
        if (retry < maxRetries - 1) {
          await this.page.waitForTimeout(1000);
        }
      }
    }

    throw new Error(`Failed to click element. Last error: ${lastError?.message}`);
  }

  /**
   * Robust form filling with multiple fallback strategies
   */
  async robustFill(
    selectors: string[],
    value: string,
    fieldName: string,
    options: { timeout?: number; clear?: boolean } = {}
  ): Promise<void> {
    const { timeout = 5000, clear = true } = options;

    // Strategy 1: Try direct selectors
    for (const selector of selectors) {
      try {
        const element = this.page.locator(selector);
        if (await element.isVisible({ timeout: 1000 })) {
          if (clear) {
            await element.clear();
          }
          await element.fill(value);
          return;
        }
      } catch (error) {
        continue;
      }
    }

    // Strategy 2: Use Stagehand AI
    try {
      await this.stagehand.act(`Fill in the ${fieldName} field with "${value}"`);
    } catch (error) {
      throw new Error(`Failed to fill ${fieldName} field with value: ${value}`);
    }
  }

  /**
   * Wait for dialog to appear with multiple strategies
   */
  async waitForDialog(expectedTitle?: string, timeout = 10000): Promise<void> {
    const dialogSelectors = [
      '[role="dialog"]',
      '.dialog-content',
      '[data-testid="dialog"]',
      '.modal'
    ];

    let dialogFound = false;

    for (const selector of dialogSelectors) {
      try {
        await this.page.waitForSelector(selector, { timeout: 2000 });
        dialogFound = true;
        break;
      } catch (error) {
        continue;
      }
    }

    if (!dialogFound) {
      throw new Error('Dialog did not appear within timeout');
    }

    // If expected title provided, verify it
    if (expectedTitle) {
      const titleLocator = this.page.locator(`text="${expectedTitle}"`);
      await titleLocator.waitFor({ timeout: 3000 });
    }
  }

  /**
   * Navigate to a specific tab with fallback strategies
   */
  async navigateToTab(tabName: string): Promise<void> {
    const tabSelectors = [
      `[data-testid="${tabName.toLowerCase()}-tab"]`,
      `[role="tab"]:has-text("${tabName}")`,
      `text="${tabName}"`,
      `button:has-text("${tabName}")`
    ];

    await this.robustClick(
      tabSelectors,
      `Click on the "${tabName}" tab`,
      { timeout: 5000 }
    );

    // Wait for tab content to load
    await this.page.waitForTimeout(1000);
  }

  /**
   * Create a test patient with minimal required fields
   */
  async createTestPatient(patientData: Partial<TestPatient>): Promise<string> {
    const defaultData: TestPatient = {
      firstName: 'Test',
      lastName: 'Patient',
      dateOfBirth: '1980-01-01',
      mrn: 'TEST-' + Date.now().toString().slice(-6),
      phoneNumber: '6465565559',
      diagnosisDate: '2024-01-01',
      emergencyContactName: 'Emergency Contact',
      emergencyContactRelationship: 'Family',
      emergencyContactPhone: '5555551234',
      ...patientData
    };

    // Open add patient dialog
    await this.robustClick(
      ['[data-testid="add-patient-button"]', 'button:has-text("Add Patient")'],
      'Click the Add Patient button'
    );

    await this.waitForDialog('Add New Patient');

    // Fill required fields
    const fieldMappings = [
      { selectors: ['#firstName', '[name="firstName"]'], value: defaultData.firstName, name: 'First Name' },
      { selectors: ['#lastName', '[name="lastName"]'], value: defaultData.lastName, name: 'Last Name' },
      { selectors: ['#dateOfBirth', '[name="dateOfBirth"]'], value: defaultData.dateOfBirth, name: 'Date of Birth' },
      { selectors: ['#mrn', '[name="mrn"]'], value: defaultData.mrn, name: 'MRN' },
      { selectors: ['#phoneNumber', '[name="phoneNumber"]'], value: defaultData.phoneNumber, name: 'Phone Number' },
      { selectors: ['#diagnosisDate', '[name="diagnosisDate"]'], value: defaultData.diagnosisDate, name: 'Diagnosis Date' },
      { selectors: ['#emergencyContactName', '[name="emergencyContactName"]'], value: defaultData.emergencyContactName, name: 'Emergency Contact Name' },
      { selectors: ['#emergencyContactRelationship', '[name="emergencyContactRelationship"]'], value: defaultData.emergencyContactRelationship, name: 'Emergency Contact Relationship' },
      { selectors: ['#emergencyContactPhone', '[name="emergencyContactPhone"]'], value: defaultData.emergencyContactPhone, name: 'Emergency Contact Phone' }
    ];

    for (const field of fieldMappings) {
      await this.robustFill(field.selectors, field.value, field.name);
    }

    // Submit the form
    await this.robustClick(
      ['button[type="submit"]:has-text("Add Patient")', '[data-testid="submit-patient"]'],
      'Click the Add Patient submit button'
    );

    // Wait for dialog to close
    await this.page.waitForSelector('[role="dialog"]', { state: 'detached', timeout: 10000 });

    return defaultData.mrn;
  }

  /**
   * Find a patient row by phone number or name
   */
  async findPatientRow(identifier: string): Promise<Locator> {
    const patientRow = this.page.locator(`tr:has-text("${identifier}")`);

    if (!(await patientRow.isVisible({ timeout: 3000 }))) {
      throw new Error(`Patient with identifier "${identifier}" not found`);
    }

    return patientRow;
  }

  /**
   * Initiate a voice call to a patient
   */
  async initiateVoiceCall(patientIdentifier: string): Promise<string> {
    // Navigate to patients tab
    await this.navigateToTab('All Patients');

    // Find the patient
    const patientRow = await this.findPatientRow(patientIdentifier);

    // Set up dialog handler for call status
    let callMessage = '';
    this.page.on('dialog', async dialog => {
      callMessage = dialog.message();
      console.log(`📞 Call status: ${callMessage}`);
      await dialog.accept();
    });

    // Click the call button
    await this.robustClick(
      ['button:has-text("Call")', '[data-testid="call-patient"]'],
      `Click the call button for patient ${patientIdentifier}`,
    );

    // Wait for call response
    await this.page.waitForTimeout(3000);

    return callMessage;
  }

  /**
   * Verify call appears in recordings
   */
  async verifyCallInRecordings(phoneNumber: string): Promise<boolean> {
    await this.navigateToTab('Voice Recordings');

    const callRecord = this.page.locator(`text="${phoneNumber}"`);
    return await callRecord.isVisible({ timeout: 5000 });
  }

  /**
   * Check for ElevenLabs integration status
   */
  async checkElevenLabsIntegration(): Promise<boolean> {
    const statusIndicators = [
      'text*="ElevenLabs"',
      'text*="Voice AI"',
      'text*="Connected"',
      '[data-testid*="voice-status"]',
      '[data-testid*="ai-status"]'
    ];

    for (const indicator of statusIndicators) {
      if (await this.page.locator(indicator).isVisible({ timeout: 2000 })) {
        return true;
      }
    }

    return false;
  }

  /**
   * Monitor for WebSocket connections
   */
  async monitorWebSocketConnections(timeout = 5000): Promise<boolean> {
    return new Promise((resolve) => {
      let wsDetected = false;

      const timeoutId = setTimeout(() => {
        if (!wsDetected) {
          resolve(false);
        }
      }, timeout);

      this.page.on('websocket', ws => {
        wsDetected = true;
        clearTimeout(timeoutId);
        resolve(true);

        ws.on('framereceived', event => {
          console.log('📡 WebSocket data received:', event.payload?.slice(0, 100));
        });
      });
    });
  }

  /**
   * Test API endpoint accessibility
   */
  async testApiEndpoint(endpoint: string): Promise<boolean> {
    try {
      const response = await this.page.request.get(endpoint);
      return response.ok();
    } catch (error) {
      console.error(`API test failed for ${endpoint}:`, error);
      return false;
    }
  }

  /**
   * Wait for page to be fully loaded and stable
   */
  async waitForPageStability(timeout = 10000): Promise<void> {
    // Wait for network idle
    await this.page.waitForLoadState('networkidle', { timeout });

    // Wait for any pending React updates
    await this.page.waitForTimeout(1000);

    // Verify critical elements are present
    const criticalSelectors = [
      '[data-testid="clinical-header"]',
      'h1:has-text("Clinical Dashboard")',
      '[data-testid="dashboard-overview"]'
    ];

    for (const selector of criticalSelectors) {
      try {
        await this.page.waitForSelector(selector, { timeout: 3000 });
        break;
      } catch (error) {
        continue;
      }
    }
  }
}

export interface TestPatient {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  mrn: string;
  phoneNumber: string;
  diagnosisDate: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  email?: string;
  ejectionFraction?: string;
  nyhaClass?: string;
  medications?: string;
  allergies?: string;
}

/**
 * Create a configured TestHelpers instance
 */
export function createTestHelpers(page: Page, stagehand: Stagehand): TestHelpers {
  return new TestHelpers(page, stagehand);
}