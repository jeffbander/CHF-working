#!/bin/bash

# HeartVoice Monitor Test Execution Script
# This script runs the voice call tests with proper environment setup

echo "🚀 HeartVoice Monitor Voice Call Test Suite"
echo "=============================================="

# Set environment variables
export TEST_URL="https://b545d6dd0331.ngrok.app"
export WS_URL="https://1cdf34f35bcc.ngrok.app"
export TEST_PHONE="6465565559"
export PWTEST_VIDEO=1
export PWTEST_SCREENSHOT=1

echo "📱 Target URL: $TEST_URL"
echo "🔌 WebSocket URL: $WS_URL"
echo "📞 Test Phone: $TEST_PHONE"
echo ""

# Create test results directory
mkdir -p test-results

echo "🔍 Step 1: Running environment check..."
echo "======================================="
npx playwright test tests/environment-check.spec.ts --project=chromium --headed --reporter=list

if [ $? -eq 0 ]; then
    echo "✅ Environment check passed!"
else
    echo "⚠️ Environment check had issues, but continuing with voice tests..."
fi

echo ""
echo "📞 Step 2: Running focused voice call tests..."
echo "=============================================="
npx playwright test tests/voice-call-focused.spec.ts --project=stagehand --headed --reporter=list

if [ $? -eq 0 ]; then
    echo "✅ Voice call tests passed!"
else
    echo "❌ Voice call tests failed, checking with comprehensive tests..."

    echo ""
    echo "🔄 Step 3: Running comprehensive Stagehand tests..."
    echo "=================================================="
    npx playwright test tests/stagehand-e2e.spec.ts --project=stagehand --headed --reporter=list
fi

echo ""
echo "📊 Test Results Summary:"
echo "========================"
echo "📁 Check test-results/ directory for:"
echo "   - Screenshots of test execution"
echo "   - Videos of failed tests"
echo "   - Detailed test reports"
echo ""
echo "🔗 Additional commands:"
echo "   npx playwright show-report   - View HTML test report"
echo "   npm run test:ui              - Open Playwright UI mode"
echo "   node run-voice-tests-continuous.js - Run continuous tests"

# Make sure the script is executable
chmod +x /mnt/c/Users/jeffr/Downloads/CHF-working/heartvoice-monitor/run-tests.sh