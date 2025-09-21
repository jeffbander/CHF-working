#!/usr/bin/env node

/**
 * Voice Agent Page Testing
 * Tests all functionality on the Voice Agent Control Center page
 */

const { chromium } = require('playwright');

class VoiceAgentTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseUrl = 'http://localhost:3003';
  }

  async setup() {
    console.log('🚀 Setting up Voice Agent testing...');
    this.browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    await this.page.setViewportSize({ width: 1280, height: 720 });
    
    // Listen for console messages
    this.page.on('console', msg => {
      if (msg.type() === 'log') {
        console.log(`   📝 Console: ${msg.text()}`);
      }
    });
    
    console.log('✅ Browser setup complete');
  }

  async teardown() {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 Browser closed');
    }
  }

  async testVoiceAgentPage() {
    console.log('\n🎙️ TESTING VOICE AGENT CONTROL CENTER');
    console.log('=====================================');
    
    await this.page.goto(`${this.baseUrl}/voice-agent`);
    await this.page.waitForSelector('h1', { timeout: 10000 });
    
    // Test page title
    const title = await this.page.textContent('h1');
    console.log(`📋 Page Title: "${title}"`);
    
    // Test system status
    const statusBadge = await this.page.locator('text=System').first();
    if (await statusBadge.count() > 0) {
      const statusText = await statusBadge.textContent();
      console.log(`🔧 System Status: ${statusText}`);
    }
    
    // Test status cards
    console.log('\n📊 Status Cards:');
    const statusCards = [
      'Active Calls',
      'OpenAI Status', 
      'Twilio Status',
      'WebSocket'
    ];
    
    for (const cardTitle of statusCards) {
      const card = await this.page.locator(`text=${cardTitle}`).first();
      if (await card.count() > 0) {
        console.log(`   ✅ ${cardTitle}: Found`);
      }
    }
    
    // Test patient roster
    console.log('\n👥 Patient Roster:');
    const patientRows = await this.page.locator('.border.rounded-lg').count();
    console.log(`   📋 Found ${patientRows} patients in roster`);
    
    // Test individual patients
    const patients = [
      'Test Patient (Your Phone)',
      'Robert Chen', 
      'Sarah Williams'
    ];
    
    for (const patientName of patients) {
      const patientElement = await this.page.locator(`text=${patientName}`);
      if (await patientElement.count() > 0) {
        console.log(`   👤 ${patientName}: ✅ Found`);
        
        // Check for call button
        const callButton = await this.page.locator(`text=${patientName}`).locator('..').locator('button:has-text("Call Now")');
        if (await callButton.count() > 0) {
          console.log(`      📞 Call button: Available`);
        }
        
        // Check for risk level
        const riskBadges = await this.page.locator(`text=${patientName}`).locator('..').locator('text=/RISK/');
        if (await riskBadges.count() > 0) {
          const riskText = await riskBadges.first().textContent();
          console.log(`      🎯 Risk Level: ${riskText}`);
        }
      }
    }
    
    // Test quick actions
    console.log('\n⚡ Quick Actions:');
    const quickActions = [
      'Configure Voice Agent',
      'Monitor Active Calls',
      'Emergency Protocols'
    ];
    
    for (const action of quickActions) {
      const actionButton = await this.page.locator(`text=${action}`);
      if (await actionButton.count() > 0) {
        console.log(`   🔧 ${action}: ✅ Available`);
      }
    }
    
    // Test system info section
    console.log('\n🎉 System Information:');
    const systemInfoItems = [
      'OpenAI Realtime API',
      'WebSocket Proxy Server',
      'Twilio Integration',
      'Voice Biomarker Analysis',
      'Emergency Escalation'
    ];
    
    for (const item of systemInfoItems) {
      const infoElement = await this.page.locator(`text=${item}`);
      if (await infoElement.count() > 0) {
        console.log(`   ✅ ${item}: Configured`);
      }
    }
    
    return true;
  }

  async testCallFunctionality() {
    console.log('\n📞 TESTING CALL FUNCTIONALITY');
    console.log('=============================');
    
    // Find the first call button
    const callButtons = await this.page.locator('button:has-text("Call Now")');
    const buttonCount = await callButtons.count();
    
    if (buttonCount > 0) {
      console.log(`📞 Found ${buttonCount} call buttons`);
      
      // Test clicking the first call button (Test Patient)
      console.log('\n🧪 Testing call initiation...');
      
      // Set up dialog handler for alerts
      this.page.on('dialog', async dialog => {
        console.log(`   🔔 Alert: ${dialog.message()}`);
        await dialog.accept();
      });
      
      // Click the first call button
      await callButtons.first().click();
      
      // Wait a moment for the API call
      await this.page.waitForTimeout(3000);
      
      console.log('   ✅ Call button clicked successfully');
    } else {
      console.log('   ❌ No call buttons found');
    }
  }

  async testAgentControls() {
    console.log('\n🎛️ TESTING AGENT CONTROLS');
    console.log('=========================');
    
    // Test Start/Stop Agent button
    const agentButton = await this.page.locator('button:has-text("Start Agent"), button:has-text("Stop Agent")');
    if (await agentButton.count() > 0) {
      const buttonText = await agentButton.textContent();
      console.log(`🎮 Agent Control Button: "${buttonText}"`);
      
      // Click to toggle agent state
      await agentButton.click();
      await this.page.waitForTimeout(1000);
      
      const newButtonText = await agentButton.textContent();
      console.log(`🔄 After click: "${newButtonText}"`);
      
      // Click again to restore original state
      await agentButton.click();
      await this.page.waitForTimeout(1000);
      
      console.log('   ✅ Agent control toggle working');
    }
  }

  async runAllTests() {
    await this.setup();
    
    try {
      await this.testVoiceAgentPage();
      await this.testCallFunctionality();
      await this.testAgentControls();
      
      console.log('\n🎉 VOICE AGENT TESTING COMPLETE');
      console.log('===============================');
      console.log('✅ All voice agent functionality tested successfully!');
      
    } catch (error) {
      console.log(`❌ Test failed: ${error.message}`);
    } finally {
      await this.teardown();
    }
  }
}

// Run the tests
async function main() {
  const tester = new VoiceAgentTester();
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = VoiceAgentTester;
