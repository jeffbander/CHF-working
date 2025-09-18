#!/bin/bash

# HeartVoice Monitor Test Execution Script
echo "🚀 Starting HeartVoice Monitor Comprehensive Test"
echo "=================================================="

# Navigate to the project directory
cd "/mnt/c/Users/jeffr/Downloads/CHF-working/heartvoice-monitor"

# Make sure we have the latest dependencies
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Install Playwright browsers if needed
echo "🌐 Installing Playwright browsers..."
npx playwright install chromium

# Create test-results directory if it doesn't exist
mkdir -p test-results

# Run the comprehensive test
echo "🧪 Running comprehensive test in headed mode..."
echo "Target URL: https://b545d6dd0331.ngrok.app"
echo "Test File: tests/heartvoice-comprehensive.spec.ts"
echo ""

# Execute the test with proper environment variables
TEST_URL="https://b545d6dd0331.ngrok.app" \
PWTEST_VIDEO=1 \
PWTEST_SCREENSHOT=1 \
npx playwright test tests/heartvoice-comprehensive.spec.ts \
    --project=chromium \
    --headed \
    --reporter=list \
    --workers=1

# Check exit code
exit_code=$?

echo ""
echo "=================================================="
if [ $exit_code -eq 0 ]; then
    echo "✅ Test completed successfully!"
    echo "📊 Check test-results/ directory for detailed reports"
else
    echo "❌ Test failed with exit code $exit_code"
    echo "📊 Check test-results/ directory for error details"
fi

echo ""
echo "Available commands for further testing:"
echo "  npm run test:comprehensive       - Run with custom runner"
echo "  npm run test:headed             - Run all tests in headed mode"
echo "  npm run test:ui                 - Open Playwright UI mode"
echo "  npx playwright show-report      - View HTML test report"
echo "=================================================="

exit $exit_code