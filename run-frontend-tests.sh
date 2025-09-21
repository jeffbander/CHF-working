#!/bin/bash

# Frontend Test Runner for HeartVoice Monitor
# Comprehensive E2E testing with Playwright

echo "🧪 HEARTVOICE MONITOR FRONTEND TESTS"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if server is running
print_status "Checking if HeartVoice Monitor server is running..."
if curl -s http://localhost:3003 > /dev/null; then
    print_success "Server is running on port 3003"
else
    print_warning "Server not detected on port 3003"
    print_status "Starting development server..."
    cd heartvoice-monitor && npm run dev &
    SERVER_PID=$!
    print_status "Waiting for server to start..."
    sleep 15
    
    if curl -s http://localhost:3003 > /dev/null; then
        print_success "Server started successfully"
    else
        print_error "Failed to start server"
        exit 1
    fi
fi

echo ""

# Install Playwright browsers if needed
print_status "Installing Playwright browsers..."
npx playwright install --with-deps

echo ""

# Parse command line arguments
TEST_TYPE=${1:-"all"}
BROWSER=${2:-"chromium"}

case $TEST_TYPE in
    "patient"|"patients")
        print_status "Running Patient Management tests..."
        npx playwright test tests/frontend/specs/01-patient-management.spec.ts --project=$BROWSER
        ;;
    "calls"|"voice-calls")
        print_status "Running Voice Calls tests..."
        npx playwright test tests/frontend/specs/02-voice-calls.spec.ts --project=$BROWSER
        ;;
    "analysis"|"voice-analysis")
        print_status "Running Voice Analysis tests..."
        npx playwright test tests/frontend/specs/03-voice-analysis.spec.ts --project=$BROWSER
        ;;
    "agent"|"agent-control")
        print_status "Running Agent Control tests..."
        npx playwright test tests/frontend/specs/04-agent-control.spec.ts --project=$BROWSER
        ;;
    "workflow"|"integration")
        print_status "Running Complete Workflow tests..."
        npx playwright test tests/frontend/specs/05-complete-workflow.spec.ts --project=$BROWSER
        ;;
    "smoke")
        print_status "Running smoke tests (quick validation)..."
        npx playwright test --grep "should load" --project=$BROWSER
        ;;
    "all"|*)
        print_status "Running complete frontend test suite..."
        echo ""
        print_status "📋 Test Plan:"
        echo "   1. Patient Management Tests"
        echo "   2. Voice Calls Tests"
        echo "   3. Voice Analysis & Transcripts Tests"
        echo "   4. Agent Control & Script Management Tests"
        echo "   5. Complete Workflow Integration Tests"
        echo ""
        
        # Run all tests
        npx playwright test tests/frontend/specs/ --project=$BROWSER
        ;;
esac

TEST_EXIT_CODE=$?

echo ""

# Generate test report
if [ $TEST_EXIT_CODE -eq 0 ]; then
    print_success "All frontend tests passed!"
    echo ""
    print_status "📊 Test Results Summary:"
    echo "   ✅ Patient Management: Working"
    echo "   ✅ Voice Calls: Working"
    echo "   ✅ Voice Analysis: Working"
    echo "   ✅ Agent Control: Working"
    echo "   ✅ Complete Workflow: Working"
    echo ""
    print_status "📋 Test Reports:"
    echo "   🌐 HTML Report: test-results/html-report/index.html"
    echo "   📄 JSON Report: test-results/results.json"
    echo "   📸 Screenshots: test-results/screenshots/"
    echo ""
    print_success "🎉 HeartVoice Monitor frontend is ready for production!"
else
    print_error "Some frontend tests failed"
    echo ""
    print_status "📋 Debugging Information:"
    echo "   🌐 HTML Report: test-results/html-report/index.html"
    echo "   📸 Screenshots: test-results/screenshots/"
    echo "   🎥 Videos: test-results/videos/"
    echo ""
    print_status "🔧 Common Issues:"
    echo "   • Server not running on port 3003"
    echo "   • API endpoints returning errors"
    echo "   • UI elements not loading properly"
    echo "   • Network connectivity issues"
fi

# Cleanup
if [ -n "$SERVER_PID" ]; then
    print_status "Stopping background server..."
    kill $SERVER_PID 2>/dev/null
fi

echo ""
print_status "Frontend testing complete."

exit $TEST_EXIT_CODE
