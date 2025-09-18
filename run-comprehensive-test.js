#!/usr/bin/env node

/**
 * HeartVoice Monitor Comprehensive Test Runner
 *
 * This script runs the comprehensive Playwright test against the ngrok URL
 * with proper configuration for headed mode and debugging.
 */

const { spawn } = require('child_process');
const path = require('path');

// Configuration
const config = {
  ngrokUrl: 'https://b545d6dd0331.ngrok.app',
  project: 'chromium', // Use headed chromium by default
  testFile: 'tests/heartvoice-comprehensive.spec.ts',
  headed: true,
  debug: false
};

console.log('🚀 HeartVoice Monitor Comprehensive Test Runner');
console.log('=' .repeat(50));
console.log(`📱 Target URL: ${config.ngrokUrl}`);
console.log(`🧪 Test File: ${config.testFile}`);
console.log(`🔍 Browser: ${config.project}`);
console.log(`👁️  Headed Mode: ${config.headed ? 'ON' : 'OFF'}`);
console.log('=' .repeat(50));

// Build the command arguments
const args = [
  'test',
  config.testFile,
  `--project=${config.project}`,
  '--reporter=list',
];

// Add headed mode if specified
if (config.headed) {
  args.push('--headed');
}

// Add debug mode if specified
if (config.debug) {
  args.push('--debug');
}

// Set environment variables
const env = {
  ...process.env,
  TEST_URL: config.ngrokUrl,
  PWTEST_VIDEO: '1',
  PWTEST_SCREENSHOT: '1'
};

console.log('⚡ Starting Playwright test...');
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
  console.log('=' .repeat(50));

  if (code === 0) {
    console.log('✅ Test completed successfully!');
    console.log('📊 Check test-results/ directory for detailed reports');
    console.log('🎥 Videos and screenshots are available for failed tests');
  } else {
    console.log(`❌ Test failed with exit code ${code}`);
    console.log('📊 Check test-results/ directory for error details');
    console.log('🎥 Videos and screenshots should be available for debugging');
  }

  console.log('');
  console.log('Available commands for further testing:');
  console.log('  npm run test:headed          - Run all tests in headed mode');
  console.log('  npm run test:ui              - Open Playwright UI mode');
  console.log('  npx playwright show-report   - View HTML test report');
  console.log('=' .repeat(50));

  process.exit(code);
});

testProcess.on('error', (error) => {
  console.error('❌ Failed to start test process:', error.message);
  console.error('');
  console.error('Make sure Playwright is installed:');
  console.error('  npm install');
  console.error('  npx playwright install');
  process.exit(1);
});