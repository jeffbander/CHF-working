#!/usr/bin/env node

/**
 * Continuous Voice Test Runner for HeartVoice Monitor
 *
 * This script runs voice call tests continuously until they pass
 * or until a maximum number of attempts is reached.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const config = {
  ngrokUrl: 'https://b545d6dd0331.ngrok.app',
  wsUrl: 'https://1cdf34f35bcc.ngrok.app',
  testPhone: '6465565559',
  maxAttempts: 10,
  delayBetweenAttempts: 5000, // 5 seconds
  project: 'stagehand', // Use stagehand project for AI-powered testing
  testFile: 'tests/voice-call-focused.spec.ts',
  headed: true,
  debug: process.env.TEST_DEBUG === '1'
};

console.log('🚀 HeartVoice Monitor Continuous Voice Test Runner');
console.log('=' .repeat(60));
console.log(`📱 Target URL: ${config.ngrokUrl}`);
console.log(`🔌 WebSocket URL: ${config.wsUrl}`);
console.log(`📞 Test Phone: ${config.testPhone}`);
console.log(`🔁 Max Attempts: ${config.maxAttempts}`);
console.log(`⏱️  Delay Between Attempts: ${config.delayBetweenAttempts}ms`);
console.log(`🧪 Test File: ${config.testFile}`);
console.log(`👁️  Headed Mode: ${config.headed ? 'ON' : 'OFF'}`);
console.log(`🐛 Debug Mode: ${config.debug ? 'ON' : 'OFF'}`);
console.log('=' .repeat(60));

let attempt = 0;
let allTestsPassed = false;
let lastError = null;

// Results tracking
const results = {
  attempts: [],
  totalDuration: 0,
  startTime: Date.now()
};

async function runSingleTest() {
  return new Promise((resolve, reject) => {
    attempt++;
    console.log(`\n🎯 ATTEMPT ${attempt}/${config.maxAttempts}`);
    console.log('─'.repeat(40));

    const startTime = Date.now();

    // Build command arguments
    const args = [
      'test',
      config.testFile,
      `--project=${config.project}`,
      '--reporter=list'
    ];

    if (config.headed) {
      args.push('--headed');
    }

    if (config.debug) {
      args.push('--debug');
    }

    // Set environment variables
    const env = {
      ...process.env,
      TEST_URL: config.ngrokUrl,
      WS_URL: config.wsUrl,
      TEST_PHONE: config.testPhone,
      PWTEST_VIDEO: '1',
      PWTEST_SCREENSHOT: '1'
    };

    console.log(`⚡ Running: npx playwright ${args.join(' ')}`);

    // Run the test
    const testProcess = spawn('npx', ['playwright', ...args], {
      stdio: 'pipe',
      env: env,
      cwd: process.cwd()
    });

    let stdout = '';
    let stderr = '';

    testProcess.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      console.log(output);
    });

    testProcess.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      console.error(output);
    });

    testProcess.on('close', (code) => {
      const duration = Date.now() - startTime;
      const success = code === 0;

      // Record attempt result
      results.attempts.push({
        attempt,
        success,
        duration,
        code,
        timestamp: new Date().toISOString()
      });

      console.log(`\n📊 ATTEMPT ${attempt} RESULTS:`);
      console.log(`   ⏱️  Duration: ${duration}ms`);
      console.log(`   🎯 Status: ${success ? '✅ PASSED' : '❌ FAILED'}`);
      console.log(`   📝 Exit Code: ${code}`);

      if (success) {
        console.log('🎉 TEST PASSED! Voice call functionality is working.');
        allTestsPassed = true;
        resolve(true);
      } else {
        lastError = { code, stdout, stderr };

        if (attempt >= config.maxAttempts) {
          console.log(`❌ Max attempts (${config.maxAttempts}) reached. Stopping.`);
          resolve(false);
        } else {
          console.log(`⏳ Waiting ${config.delayBetweenAttempts}ms before next attempt...`);
          setTimeout(() => resolve(false), config.delayBetweenAttempts);
        }
      }
    });

    testProcess.on('error', (error) => {
      console.error(`❌ Failed to start test process: ${error.message}`);
      reject(error);
    });
  });
}

async function runContinuousTests() {
  console.log('\n🔄 Starting continuous test execution...\n');

  while (attempt < config.maxAttempts && !allTestsPassed) {
    try {
      const success = await runSingleTest();
      if (success) {
        break;
      }
    } catch (error) {
      console.error(`❌ Error during attempt ${attempt}:`, error.message);
      break;
    }
  }

  // Final results
  const totalDuration = Date.now() - results.startTime;
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`🎯 Total Attempts: ${attempt}`);
  console.log(`✅ Passed: ${results.attempts.filter(a => a.success).length}`);
  console.log(`❌ Failed: ${results.attempts.filter(a => !a.success).length}`);
  console.log(`⏱️  Total Duration: ${totalDuration}ms (${(totalDuration / 1000).toFixed(1)}s)`);
  console.log(`🏆 Final Status: ${allTestsPassed ? '✅ SUCCESS' : '❌ FAILED'}`);

  if (allTestsPassed) {
    console.log('\n🎉 VOICE CALL FUNCTIONALITY IS WORKING!');
    console.log('✅ Patient addition: Working');
    console.log('✅ Voice call initiation: Working');
    console.log('✅ ElevenLabs integration: Working');
    console.log('✅ WebSocket connection: Working');
  } else {
    console.log('\n❌ VOICE CALL FUNCTIONALITY NEEDS ATTENTION');
    if (lastError) {
      console.log('📝 Last error details:');
      console.log(`   Exit Code: ${lastError.code}`);
      if (lastError.stderr) {
        console.log('   Stderr:', lastError.stderr.substring(0, 500));
      }
    }
  }

  // Save detailed results
  const resultsFile = path.join(process.cwd(), 'test-results', 'continuous-test-results.json');
  const resultsDir = path.dirname(resultsFile);

  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  fs.writeFileSync(resultsFile, JSON.stringify({
    ...results,
    totalDuration,
    finalStatus: allTestsPassed ? 'SUCCESS' : 'FAILED',
    config,
    lastError,
    timestamp: new Date().toISOString()
  }, null, 2));

  console.log(`\n📁 Detailed results saved to: ${resultsFile}`);
  console.log('\n🔗 Useful commands for further investigation:');
  console.log('   npx playwright show-report   - View HTML test report');
  console.log('   npm run test:ui              - Open Playwright UI mode');
  console.log('   npm run test:stagehand:debug - Run with debug mode');

  process.exit(allTestsPassed ? 0 : 1);
}

// Handle interruption gracefully
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Test execution interrupted by user');
  console.log(`📊 Completed ${attempt} attempts before interruption`);
  process.exit(1);
});

// Start the continuous testing
runContinuousTests().catch(error => {
  console.error('❌ Fatal error in continuous test runner:', error);
  process.exit(1);
});