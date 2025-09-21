import { Page, expect } from '@playwright/test';
import { TestHelpers } from './test-helpers';

/**
 * Page Object Models for HeartVoice Monitor
 */

export class DashboardPage {
  private helpers: TestHelpers;

  constructor(private page: Page) {
    this.helpers = new TestHelpers(page);
  }

  async navigate() {
    await this.helpers.navigateToPage('/', 'HeartVoice Monitor');
  }

  async waitForDashboardLoad() {
    await this.helpers.waitForStableElement('h1');
    await this.helpers.waitForLoadingComplete();
  }

  async clickPatientTab() {
    await this.page.click('[data-tab="patients"], button:has-text("All Patients")');
    await this.helpers.waitForTableData();
  }

  async clickVoiceRecordingsTab() {
    await this.page.click('[data-tab="voice-recordings"], button:has-text("Voice Recordings")');
    await this.helpers.waitForLoadingComplete();
  }

  async clickAgentControlTab() {
    await this.page.click('[data-tab="agent-control"], button:has-text("Agent Control")');
    await this.helpers.waitForLoadingComplete();
  }

  async navigateToAgentControl() {
    // Try navigation dropdown first
    await this.page.click('button:has-text("Navigation")').catch(() => {});
    await this.page.click('a[href="/agent-control"]').catch(async () => {
      // Fallback to direct navigation
      await this.page.goto('/agent-control');
    });
    await this.helpers.waitForPageLoad();
  }

  async getPatientCount() {
    await this.clickPatientTab();
    const rows = this.page.locator('tbody tr');
    return await rows.count();
  }

  async searchPatient(searchTerm: string) {
    await this.page.fill('input[placeholder*="Search"], input[type="search"]', searchTerm);
    await this.page.waitForTimeout(1000); // Wait for search debounce
  }

  async makeCallToPatient(patientName: string) {
    // Find patient row and click call button
    const patientRow = this.page.locator(`tr:has-text("${patientName}")`);
    await patientRow.locator('button:has-text("Call"), button[title*="Call"]').click();
    
    // Wait for call confirmation
    await this.helpers.waitForToast('Call initiated');
  }
}

export class PatientManagementPage {
  private helpers: TestHelpers;

  constructor(private page: Page) {
    this.helpers = new TestHelpers(page);
  }

  async addNewPatient(patientData: any) {
    // Click add patient button
    await this.page.click('button:has-text("Add Patient"), button:has-text("New Patient")');
    
    // Fill patient form
    await this.helpers.fillField('input[name="firstName"]', patientData.firstName);
    await this.helpers.fillField('input[name="lastName"]', patientData.lastName);
    await this.helpers.fillField('input[name="phoneNumber"]', patientData.phoneNumber);
    await this.helpers.fillField('input[name="dateOfBirth"]', patientData.dateOfBirth);
    
    // Select gender
    await this.page.selectOption('select[name="gender"]', patientData.gender);
    
    // Fill medical history if provided
    if (patientData.medicalHistory) {
      await this.page.selectOption('select[name="heartFailureType"]', patientData.medicalHistory.heartFailureType);
      await this.helpers.fillField('input[name="ejectionFraction"]', patientData.medicalHistory.ejectionFraction.toString());
      await this.page.selectOption('select[name="nyhaClass"]', patientData.medicalHistory.nyhaClass);
    }
    
    // Submit form
    await this.page.click('button[type="submit"], button:has-text("Save"), button:has-text("Add Patient")');
    
    // Wait for success confirmation
    await this.helpers.waitForToast('Patient added successfully');
  }

  async verifyPatientInList(patientName: string) {
    await this.helpers.waitForTableData();
    await expect(this.page.locator(`tr:has-text("${patientName}")`)).toBeVisible();
  }

  async getPatientDetails(patientName: string) {
    const patientRow = this.page.locator(`tr:has-text("${patientName}")`);
    await expect(patientRow).toBeVisible();
    
    return {
      name: await patientRow.locator('td').first().textContent(),
      phone: await patientRow.locator('td').nth(1).textContent(),
      riskLevel: await patientRow.locator('td').nth(2).textContent(),
    };
  }
}

export class VoiceAnalysisPage {
  private helpers: TestHelpers;

  constructor(private page: Page) {
    this.helpers = new TestHelpers(page);
  }

  async navigate() {
    await this.helpers.navigateToPage('/voice-analysis-dashboard', 'Voice Analysis');
  }

  async waitForAnalysisLoad() {
    await this.helpers.waitForStableElement('h1:has-text("Voice")');
    await this.helpers.waitForLoadingComplete();
  }

  async getAnalysisResults() {
    await this.helpers.waitForTableData();
    const rows = this.page.locator('tbody tr');
    const count = await rows.count();
    
    const results = [];
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      results.push({
        patient: await row.locator('td').first().textContent(),
        riskScore: await row.locator('td:has-text("/100")').textContent(),
        timestamp: await row.locator('td').last().textContent(),
      });
    }
    
    return results;
  }

  async viewTranscript(patientName: string) {
    const patientRow = this.page.locator(`tr:has-text("${patientName}")`);
    await patientRow.locator('button:has-text("View"), button:has-text("Transcript")').click();
    
    // Wait for transcript modal/panel
    await this.helpers.waitForStableElement('[data-testid="transcript"], .transcript, .modal');
  }

  async verifyBiomarkers(patientName: string) {
    const patientRow = this.page.locator(`tr:has-text("${patientName}")`);
    await patientRow.locator('button:has-text("Details"), button:has-text("Biomarkers")').click();
    
    // Verify biomarker data is present
    await this.helpers.waitForStableElement('[data-testid="biomarkers"]');
    await expect(this.page.locator('text=Jitter')).toBeVisible();
    await expect(this.page.locator('text=Shimmer')).toBeVisible();
    await expect(this.page.locator('text=HNR')).toBeVisible();
    await expect(this.page.locator('text=F0')).toBeVisible();
  }

  async filterByRiskLevel(riskLevel: string) {
    await this.page.selectOption('select[name="riskLevel"]', riskLevel);
    await this.helpers.waitForLoadingComplete();
  }

  async searchAnalysis(searchTerm: string) {
    await this.page.fill('input[placeholder*="Search"]', searchTerm);
    await this.page.waitForTimeout(1000);
  }
}

export class AgentControlPage {
  private helpers: TestHelpers;

  constructor(private page: Page) {
    this.helpers = new TestHelpers(page);
  }

  async navigate() {
    await this.helpers.navigateToPage('/agent-control', 'Agent Control');
  }

  async waitForScriptsLoad() {
    await this.helpers.waitForStableElement('h1:has-text("Agent Control")');
    await this.helpers.waitForLoadingComplete();
  }

  async editGreetingScript(newScript: string) {
    // Click greeting tab
    await this.page.click('button:has-text("Greeting"), [data-tab="greeting"]');
    
    // Clear and fill script
    await this.page.fill('textarea[name="script"]', newScript);
    
    // Save changes
    await this.page.click('button:has-text("Save")');
    await this.helpers.waitForToast('Scripts updated');
  }

  async editVoiceAnalysisScript(newScript: string) {
    await this.page.click('button:has-text("Voice Analysis"), [data-tab="voice_analysis"]');
    await this.page.fill('textarea[name="script"]', newScript);
    await this.page.click('button:has-text("Save")');
    await this.helpers.waitForToast('Scripts updated');
  }

  async editConclusionScript(newScript: string) {
    await this.page.click('button:has-text("Conclusion"), [data-tab="conclusion"]');
    await this.page.fill('textarea[name="script"]', newScript);
    await this.page.click('button:has-text("Save")');
    await this.helpers.waitForToast('Scripts updated');
  }

  async resetToDefaults() {
    await this.page.click('button:has-text("Reset"), button:has-text("Default")');
    await this.helpers.waitForToast('Scripts reset');
  }

  async verifyScriptLength(expectedLength: number) {
    const characterCount = this.page.locator('[data-testid="character-count"], .character-count');
    await expect(characterCount).toContainText(expectedLength.toString());
  }
}
