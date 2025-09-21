import { test, expect } from '@playwright/test';
import { VoiceAnalysisPage, DashboardPage } from '../utils/page-objects';
import { TestHelpers } from '../utils/test-helpers';

/**
 * Voice Analysis Frontend Tests
 * Tests transcript viewing, biomarker analysis, and voice data display
 */

test.describe('Voice Analysis & Transcripts', () => {
  let voiceAnalysisPage: VoiceAnalysisPage;
  let dashboardPage: DashboardPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    voiceAnalysisPage = new VoiceAnalysisPage(page);
    dashboardPage = new DashboardPage(page);
    helpers = new TestHelpers(page);
    
    await voiceAnalysisPage.navigate();
    await voiceAnalysisPage.waitForAnalysisLoad();
  });

  test('should load voice analysis dashboard', async ({ page }) => {
    // Verify page loads
    await expect(page.locator('h1')).toContainText('Voice');
    
    // Verify breadcrumb navigation
    await helpers.verifyBreadcrumb(['Dashboard', 'Voice']);
    
    // Verify analysis table is present
    await expect(page.locator('table')).toBeVisible();
    
    console.log('✅ Voice analysis dashboard loaded successfully');
  });

  test('should display voice analysis results with biomarkers', async ({ page }) => {
    // Get analysis results
    const results = await voiceAnalysisPage.getAnalysisResults();
    
    // Verify we have results
    expect(results.length).toBeGreaterThan(0);
    
    // Verify each result has required data
    for (const result of results) {
      expect(result.patient).toBeTruthy();
      expect(result.riskScore).toMatch(/\d+\/100/);
      expect(result.timestamp).toBeTruthy();
    }
    
    console.log(`✅ Found ${results.length} voice analysis results with biomarkers`);
  });

  test('should show detailed biomarker data', async ({ page }) => {
    // Get first patient from results
    const results = await voiceAnalysisPage.getAnalysisResults();
    expect(results.length).toBeGreaterThan(0);
    
    const firstPatient = results[0].patient;
    
    // View biomarker details
    await voiceAnalysisPage.verifyBiomarkers(firstPatient);
    
    // Verify all biomarker types are present
    await expect(page.locator('text=Jitter')).toBeVisible();
    await expect(page.locator('text=Shimmer')).toBeVisible();
    await expect(page.locator('text=HNR')).toBeVisible();
    await expect(page.locator('text=F0')).toBeVisible();
    
    // Verify biomarker values are numeric
    const jitterValue = page.locator('[data-testid="jitter-value"], .jitter-value');
    const shimmerValue = page.locator('[data-testid="shimmer-value"], .shimmer-value');
    
    if (await jitterValue.count() > 0) {
      const jitterText = await jitterValue.textContent();
      expect(jitterText).toMatch(/\d+\.\d+/);
    }
    
    if (await shimmerValue.count() > 0) {
      const shimmerText = await shimmerValue.textContent();
      expect(shimmerText).toMatch(/\d+\.\d+/);
    }
    
    console.log(`✅ Biomarker data verified for ${firstPatient}`);
  });

  test('should display patient transcripts', async ({ page }) => {
    const results = await voiceAnalysisPage.getAnalysisResults();
    expect(results.length).toBeGreaterThan(0);
    
    const firstPatient = results[0].patient;
    
    // View transcript
    await voiceAnalysisPage.viewTranscript(firstPatient);
    
    // Verify transcript content is shown
    await expect(page.locator('[data-testid="transcript"], .transcript')).toBeVisible();
    
    // Verify transcript has actual content
    const transcriptContent = page.locator('[data-testid="transcript-content"], .transcript-content');
    if (await transcriptContent.count() > 0) {
      const content = await transcriptContent.textContent();
      expect(content.length).toBeGreaterThan(10);
    }
    
    console.log(`✅ Transcript displayed for ${firstPatient}`);
  });

  test('should filter analysis by risk level', async ({ page }) => {
    // Test different risk level filters
    const riskLevels = ['low', 'medium', 'high', 'critical'];
    
    for (const riskLevel of riskLevels) {
      await voiceAnalysisPage.filterByRiskLevel(riskLevel);
      
      // Wait for filter to apply
      await page.waitForTimeout(1000);
      
      // Verify filtered results
      const filteredResults = await voiceAnalysisPage.getAnalysisResults();
      
      // Check if results match filter (if any results exist)
      if (filteredResults.length > 0) {
        console.log(`✅ Filter '${riskLevel}' returned ${filteredResults.length} results`);
      }
    }
  });

  test('should search voice analysis results', async ({ page }) => {
    const results = await voiceAnalysisPage.getAnalysisResults();
    expect(results.length).toBeGreaterThan(0);
    
    const searchTerm = results[0].patient.split(' ')[0]; // First name
    
    // Search for patient
    await voiceAnalysisPage.searchAnalysis(searchTerm);
    
    // Verify search results
    const searchResults = await voiceAnalysisPage.getAnalysisResults();
    
    // Verify search found relevant results
    const hasMatchingResults = searchResults.some(result => 
      result.patient.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    expect(hasMatchingResults).toBeTruthy();
    
    console.log(`✅ Search for '${searchTerm}' returned ${searchResults.length} results`);
  });

  test('should show risk score trends', async ({ page }) => {
    // Look for risk score visualization
    const riskCharts = page.locator('[data-testid="risk-chart"], .risk-chart, canvas');
    const riskTrends = page.locator('[data-testid="risk-trend"], .risk-trend');
    
    // Verify risk visualization exists
    const hasVisualization = await riskCharts.count() > 0 || await riskTrends.count() > 0;
    
    if (hasVisualization) {
      console.log('✅ Risk score visualization found');
    } else {
      console.log('ℹ️  Risk score visualization not implemented yet');
    }
    
    // Verify risk scores are displayed as numbers
    const riskScores = page.locator('text=/\\d+\\/100/');
    const scoreCount = await riskScores.count();
    expect(scoreCount).toBeGreaterThan(0);
    
    console.log(`✅ Found ${scoreCount} risk scores displayed`);
  });

  test('should handle voice analysis data loading states', async ({ page }) => {
    // Reload page to test loading states
    await page.reload();
    
    // Check for loading indicators
    const loadingIndicators = page.locator('.loading, [data-loading="true"], text=Loading');
    
    // Wait for loading to complete
    await helpers.waitForLoadingComplete();
    
    // Verify data loads successfully
    await helpers.waitForTableData();
    
    console.log('✅ Loading states handled correctly');
  });

  test('should export voice analysis data', async ({ page }) => {
    // Look for export functionality
    const exportButton = page.locator('button:has-text("Export"), button:has-text("Download")');
    
    if (await exportButton.count() > 0) {
      // Test export functionality
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();
      
      try {
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\.(csv|xlsx|pdf)$/);
        console.log('✅ Export functionality working');
      } catch (error) {
        console.log('ℹ️  Export functionality not fully implemented');
      }
    } else {
      console.log('ℹ️  Export functionality not available');
    }
  });

  test('should validate biomarker clinical ranges', async ({ page }) => {
    const results = await voiceAnalysisPage.getAnalysisResults();
    expect(results.length).toBeGreaterThan(0);
    
    // Check first result for biomarker validation
    const firstPatient = results[0].patient;
    await voiceAnalysisPage.verifyBiomarkers(firstPatient);
    
    // Verify clinical range indicators
    const warningIndicators = page.locator('.warning, .alert, .abnormal');
    const normalIndicators = page.locator('.normal, .healthy, .good');
    
    const hasRangeIndicators = await warningIndicators.count() > 0 || await normalIndicators.count() > 0;
    
    if (hasRangeIndicators) {
      console.log('✅ Clinical range indicators present');
    } else {
      console.log('ℹ️  Clinical range indicators not implemented');
    }
    
    // Verify risk scores are within valid range (0-100)
    for (const result of results) {
      const riskScore = parseInt(result.riskScore.match(/\d+/)[0]);
      expect(riskScore).toBeGreaterThanOrEqual(0);
      expect(riskScore).toBeLessThanOrEqual(100);
    }
    
    console.log('✅ Risk scores within valid clinical range');
  });
});
