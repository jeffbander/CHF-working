#!/bin/bash

cd /mnt/c/Users/jeffr/Downloads/CHF-working/heartvoice-monitor

echo "🚀 Running HeartVoice Monitor Voice Call Tests"
echo "=============================================="

# Set environment variables
export TEST_URL="https://b545d6dd0331.ngrok.app"
export WS_URL="https://1cdf34f35bcc.ngrok.app"
export TEST_PHONE="6465565559"
export PWTEST_VIDEO=1
export PWTEST_SCREENSHOT=1

# Create test results directory
mkdir -p test-results

echo "📞 Running Voice Call Tests..."
echo "==============================="

# Run the voice call focused test
npm run test:voice

echo ""
echo "📊 Test execution completed!"
echo "Check test-results/ directory for screenshots and videos."