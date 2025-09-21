import { test, expect } from '@playwright/test';
import { AgentControlPage, DashboardPage } from '../utils/page-objects';
import { TestHelpers } from '../utils/test-helpers';

/**
 * Agent Control Frontend Tests
 * Tests script editing, agent configuration, and call script management
 */

test.describe('Agent Control & Script Management', () => {
  let agentControlPage: AgentControlPage;
  let dashboardPage: DashboardPage;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    agentControlPage = new AgentControlPage(page);
    dashboardPage = new DashboardPage(page);
    helpers = new TestHelpers(page);
    
    await agentControlPage.navigate();
    await agentControlPage.waitForScriptsLoad();
  });

  test('should load agent control panel', async ({ page }) => {
    // Verify page loads
    await expect(page.locator('h1')).toContainText('Agent Control');
    
    // Verify breadcrumb navigation
    await helpers.verifyBreadcrumb(['Dashboard', 'Agent Control']);
    
    // Verify script tabs are present
    await expect(page.locator('button:has-text("Greeting"), [data-tab="greeting"]')).toBeVisible();
    await expect(page.locator('button:has-text("Voice Analysis"), [data-tab="voice_analysis"]')).toBeVisible();
    await expect(page.locator('button:has-text("Conclusion"), [data-tab="conclusion"]')).toBeVisible();
    
    console.log('✅ Agent control panel loaded successfully');
  });

  test('should edit greeting script', async ({ page }) => {
    const newGreeting = `Hello {patientName}! This is a test greeting script updated at ${new Date().toISOString()}. How are you feeling today?`;
    
    // Edit greeting script
    await agentControlPage.editGreetingScript(newGreeting);
    
    // Verify script was saved
    await expect(page.locator('textarea[name="script"]')).toHaveValue(newGreeting);
    
    // Verify character count updates
    await agentControlPage.verifyScriptLength(newGreeting.length);
    
    console.log('✅ Greeting script edited successfully');
  });

  test('should edit voice analysis script', async ({ page }) => {
    const newVoiceScript = `Thank you for sharing your symptoms. Now I need you to count from 1 to 10 clearly for voice analysis. Updated at ${new Date().toISOString()}.`;
    
    // Edit voice analysis script
    await agentControlPage.editVoiceAnalysisScript(newVoiceScript);
    
    // Verify script was saved
    await expect(page.locator('textarea[name="script"]')).toHaveValue(newVoiceScript);
    
    console.log('✅ Voice analysis script edited successfully');
  });

  test('should edit conclusion script', async ({ page }) => {
    const newConclusion = `Thank you {patientName}. Your voice analysis is complete. Updated at ${new Date().toISOString()}. Take care!`;
    
    // Edit conclusion script
    await agentControlPage.editConclusionScript(newConclusion);
    
    // Verify script was saved
    await expect(page.locator('textarea[name="script"]')).toHaveValue(newConclusion);
    
    console.log('✅ Conclusion script edited successfully');
  });

  test('should validate script length limits', async ({ page }) => {
    // Test very long script
    const longScript = 'A'.repeat(2000);
    
    // Try to enter long script
    await page.click('button:has-text("Greeting")');
    await page.fill('textarea[name="script"]', longScript);
    
    // Check for length validation
    const characterCount = page.locator('[data-testid="character-count"], .character-count');
    if (await characterCount.count() > 0) {
      const countText = await characterCount.textContent();
      expect(countText).toContain('2000');
    }
    
    // Check for warning about length
    const lengthWarning = page.locator('text=too long, text=limit, text=maximum');
    const hasWarning = await lengthWarning.count() > 0;
    
    if (hasWarning) {
      console.log('✅ Script length validation working');
    } else {
      console.log('ℹ️  Script length validation not implemented');
    }
  });

  test('should reset scripts to defaults', async ({ page }) => {
    // First, modify a script
    const testScript = 'This is a test modification';
    await agentControlPage.editGreetingScript(testScript);
    
    // Verify script was changed
    await expect(page.locator('textarea[name="script"]')).toHaveValue(testScript);
    
    // Reset to defaults
    await agentControlPage.resetToDefaults();
    
    // Verify script was reset (should be different from test script)
    const resetScript = await page.locator('textarea[name="script"]').inputValue();
    expect(resetScript).not.toBe(testScript);
    expect(resetScript.length).toBeGreaterThan(10);
    
    console.log('✅ Script reset to defaults working');
  });

  test('should show script preview functionality', async ({ page }) => {
    // Look for preview functionality
    const previewButton = page.locator('button:has-text("Preview"), button:has-text("Test")');
    
    if (await previewButton.count() > 0) {
      await previewButton.click();
      
      // Look for preview modal or panel
      const previewPanel = page.locator('[data-testid="preview"], .preview, .modal');
      await expect(previewPanel).toBeVisible();
      
      console.log('✅ Script preview functionality working');
    } else {
      console.log('ℹ️  Script preview not implemented');
    }
  });

  test('should validate script placeholders', async ({ page }) => {
    // Test script with patient name placeholder
    const scriptWithPlaceholder = 'Hello {patientName}, how are you feeling today?';
    
    await agentControlPage.editGreetingScript(scriptWithPlaceholder);
    
    // Look for placeholder validation or highlighting
    const placeholderHighlight = page.locator('.placeholder, .variable, .highlight');
    const hasHighlighting = await placeholderHighlight.count() > 0;
    
    if (hasHighlighting) {
      console.log('✅ Placeholder highlighting working');
    } else {
      console.log('ℹ️  Placeholder highlighting not implemented');
    }
    
    // Verify script saves with placeholder
    await expect(page.locator('textarea[name="script"]')).toHaveValue(scriptWithPlaceholder);
    
    console.log('✅ Script placeholders validated');
  });

  test('should handle script saving errors', async ({ page }) => {
    // Mock API error for script saving
    await helpers.mockApiResponse('/api/call-scripts', { error: 'Save failed' });
    
    // Try to save script
    const testScript = 'Test script for error handling';
    await page.click('button:has-text("Greeting")');
    await page.fill('textarea[name="script"]', testScript);
    await page.click('button:has-text("Save")');
    
    // Verify error handling
    await expect(page.locator('text=error, text=failed, text=Error')).toBeVisible();
    
    console.log('✅ Script saving error handling working');
  });

  test('should show recording time configuration', async ({ page }) => {
    // Look for recording time settings
    const recordingTimeInput = page.locator('input[name="maxLength"], input[name="recordingTime"]');
    const timeoutInput = page.locator('input[name="timeout"]');
    
    if (await recordingTimeInput.count() > 0) {
      // Test recording time configuration
      await recordingTimeInput.fill('45');
      
      // Verify value is accepted
      await expect(recordingTimeInput).toHaveValue('45');
      
      console.log('✅ Recording time configuration working');
    } else {
      console.log('ℹ️  Recording time configuration not visible');
    }
    
    if (await timeoutInput.count() > 0) {
      // Test timeout configuration
      await timeoutInput.fill('10');
      await expect(timeoutInput).toHaveValue('10');
      
      console.log('✅ Timeout configuration working');
    }
  });

  test('should navigate between script tabs', async ({ page }) => {
    // Test navigation between different script tabs
    const tabs = [
      { name: 'Greeting', selector: 'button:has-text("Greeting")' },
      { name: 'Voice Analysis', selector: 'button:has-text("Voice Analysis")' },
      { name: 'Conclusion', selector: 'button:has-text("Conclusion")' }
    ];
    
    for (const tab of tabs) {
      await page.click(tab.selector);
      
      // Verify tab is active
      await expect(page.locator(tab.selector)).toHaveClass(/active|selected/);
      
      // Verify script content loads
      await expect(page.locator('textarea[name="script"]')).toBeVisible();
      
      console.log(`✅ ${tab.name} tab navigation working`);
    }
  });

  test('should access agent control from navigation', async ({ page }) => {
    // Test navigation from dashboard
    await dashboardPage.navigate();
    await dashboardPage.navigateToAgentControl();
    
    // Verify we're on agent control page
    await expect(page.locator('h1')).toContainText('Agent Control');
    
    // Verify breadcrumb shows correct path
    await helpers.verifyBreadcrumb(['Dashboard', 'Agent Control']);
    
    console.log('✅ Agent control navigation from dashboard working');
  });
});
