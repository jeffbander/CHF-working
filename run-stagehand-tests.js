#!/usr/bin/env node

/**
 * HeartVoice Monitor Stagehand E2E Test Runner
 *
 * This script runs comprehensive E2E tests using Stagehand for AI-powered
 * element discovery and interaction testing.
 */

const { spawn } = require('child_process');
const path = require('path');

// Configuration
const config = {
  ngrokUrl: process.env.TEST_URL || 'https://b545d6dd0331.ngrok.app',
  websocketUrl: process.env.WS_URL || 'https://1cdf34f35bcc.ngrok.app',
  project: process.env.TEST_PROJECT || 'chromium',
  headed: process.env.TEST_HEADED !== 'false',
  debug: process.env.TEST_DEBUG === '1',
  testPattern: process.env.TEST_PATTERN || '**/stagehand-*.spec.ts'
};

console.log('🤖 HeartVoice Monitor Stagehand E2E Test Runner');
console.log('=' .repeat(60));
console.log(`🌐 App URL: ${config.ngrokUrl}`);
console.log(`🔌 WebSocket URL: ${config.websocketUrl}`);
console.log(`🧪 Test Pattern: ${config.testPattern}`);
console.log(`🖥️  Browser: ${config.project}`);
console.log(`👁️  Headed Mode: ${config.headed ? 'ON' : 'OFF'}`);
console.log(`🐛 Debug Mode: ${config.debug ? 'ON' : 'OFF'}`);
console.log('=' .repeat(60));

// Build the command arguments
const args = [
  'test',
  config.testPattern,
  `--project=${config.project}`,
  '--reporter=list',
  '--reporter=html',
  '--reporter=json:test-results/stagehand-results.json'
];

// Add headed mode if specified
if (config.headed) {
  args.push('--headed');
}

// Add debug mode if specified
if (config.debug) {
  args.push('--debug');
}

// Add timeout for AI-powered tests
args.push('--timeout=120000'); // 2 minutes per test

// Set environment variables
const env = {
  ...process.env,
  TEST_URL: config.ngrokUrl,
  WS_URL: config.websocketUrl,
  PWTEST_VIDEO: '1',
  PWTEST_SCREENSHOT: '1',
  STAGEHAND_DEBUG: config.debug ? '1' : '0'
};

console.log('🚀 Starting Stagehand E2E tests...');
console.log(`Command: npx playwright ${args.join(' ')}`);
console.log('');

// Run the test
const testProcess = spawn('npx', ['playwright', ...args], {
  stdio: 'inherit',
  env: env,
  cwd: process.cwd()
});

testProcess.on('close', (code) => {
  console.log('');
  console.log('=' .repeat(60));

  if (code === 0) {
    console.log('✅ All Stagehand E2E tests completed successfully!');
    console.log('');
    console.log('📊 Test Results:');
    console.log('  - HTML Report: test-results/index.html');
    console.log('  - JSON Report: test-results/stagehand-results.json');
    console.log('  - Videos & Screenshots: test-results/');
    console.log('');
    console.log('🎯 Key Features Tested:');
    console.log('  ✓ Patient creation with hybrid AI + data-testid strategy');
    console.log('  ✓ Voice calls to 6465565559');
    console.log('  ✓ ElevenLabs conversation integration');
    console.log('  ✓ Real-time status monitoring');
    console.log('  ✓ Error handling and recovery');
  } else {
    console.log(`❌ Stagehand E2E tests failed with exit code ${code}`);
    console.log('');
    console.log('🔍 Debugging Information:');
    console.log('  - Check test-results/ for detailed error reports');
    console.log('  - Videos and screenshots available for failed tests');
    console.log('  - Enable debug mode: TEST_DEBUG=1 npm run test:stagehand:debug');
    console.log('');
    console.log('🛠️  Common Issues:');
    console.log('  - Ensure ngrok URLs are accessible');
    console.log('  - Check if ElevenLabs API keys are configured');
    console.log('  - Verify WebSocket server is running');
  }

  console.log('');
  console.log('📝 Available Test Commands:');
  console.log('  npm run test:stagehand           - Run all Stagehand tests');
  console.log('  npm run test:stagehand:debug     - Run with debug mode');
  console.log('  TEST_PATTERN="**/voice-call*" npm run test:stagehand  - Run specific tests');
  console.log('  npx playwright show-report       - View detailed HTML report');
  console.log('=' .repeat(60));

  process.exit(code);
});

testProcess.on('error', (error) => {
  console.error('❌ Failed to start Stagehand test process:', error.message);
  console.error('');
  console.error('🔧 Prerequisites:');
  console.error('  npm install                    - Install dependencies');
  console.error('  npx playwright install         - Install browser binaries');
  console.error('  npm install @stagehand/core    - Install Stagehand (if not already)');
  console.error('');
  console.error('🌐 Environment Setup:');
  console.error('  export TEST_URL="https://your-ngrok-url.ngrok.app"');
  console.error('  export WS_URL="https://your-websocket-ngrok-url.ngrok.app"');
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Test execution interrupted by user');
  testProcess.kill('SIGTERM');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Test execution terminated');
  testProcess.kill('SIGTERM');
});