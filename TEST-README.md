# HeartVoice Monitor - Comprehensive Test Suite

This document explains how to run the comprehensive Playwright test for the HeartVoice Monitor application.

## Test Overview

The comprehensive test (`tests/heartvoice-comprehensive.spec.ts`) performs the following actions:

1. **Navigation**: Loads the HeartVoice Monitor application at the specified URL
2. **Patient Management**: Adds a new patient with name "Test Patient" and phone "6465565559"
3. **Voice Call**: Initiates a test voice call to the patient
4. **Verification**: Confirms the call was initiated successfully
5. **Error Handling**: Tests edge cases and duplicate patient scenarios

## Features

- 🎯 **AI Element Discovery**: Uses semantic selectors to find UI elements intelligently
- 🔄 **Fallback Strategy**: Falls back to data-testid attributes when AI discovery fails
- ⚡ **Retry Logic**: Automatically retries failed actions and handles network delays
- 👁️ **Headed Mode**: Runs in headed mode so you can see the test execution
- 📊 **Comprehensive Reporting**: Generates detailed test reports with screenshots/videos
- 🛡️ **Error Handling**: Robust error handling for network issues and UI state changes

## Quick Start

### Run the Comprehensive Test

```bash
# Using the custom test runner (recommended)
npm run test:comprehensive

# Or run directly with Playwright
npx playwright test tests/heartvoice-comprehensive.spec.ts --headed --project=chromium
```

### Alternative Methods

```bash
# Run with debug mode for step-by-step execution
npm run test:comprehensive:debug

# Run all tests in headed mode
npm run test:headed

# Open Playwright UI for interactive testing
npm run test:ui

# View test reports after running
npx playwright show-report
```

## Configuration

### Target URL
The test is pre-configured to run against: `https://b545d6dd0331.ngrok.app`

To change the target URL, modify the `TEST_CONFIG.baseURL` in:
`/mnt/c/Users/jeffr/Downloads/CHF-working/heartvoice-monitor/tests/heartvoice-comprehensive.spec.ts`

### Test Data
Default test patient:
- **Name**: "Test Patient"
- **Phone**: "6465565559"

### Browser Settings
- **Default Browser**: Chromium (Chrome)
- **Viewport**: 1280x720
- **Slow Motion**: 500ms (for better visibility)
- **Timeout**: 60 seconds per test

## Test Structure

### ElementHelper Class
The test uses a custom `ElementHelper` class that provides:

- **Smart Element Discovery**: Tries multiple selectors for each element
- **Semantic Fallbacks**: Uses text content and ARIA labels when selectors fail
- **Input Validation**: Verifies form inputs are filled correctly
- **Network Waiting**: Waits for network activity to settle

### Test Steps

1. **Navigation & Verification**
   - Load the application
   - Verify title and main navigation

2. **Patient Management Navigation**
   - Find and click patient management section
   - Handle different navigation patterns

3. **Add New Patient**
   - Click "Add Patient" button (with multiple fallback selectors)
   - Fill patient name and phone number
   - Submit the form

4. **Patient Verification**
   - Confirm patient appears in the patient list
   - Verify data accuracy

5. **Voice Call Initiation**
   - Find and click call button for the patient
   - Handle both patient-specific and general call buttons

6. **Call Verification**
   - Check for call status indicators
   - Monitor call progress
   - Verify call initiation success

7. **Error Handling Test**
   - Test duplicate patient prevention
   - Verify error message display

## Output & Debugging

### Test Results Location
- **Screenshots**: `/mnt/c/Users/jeffr/Downloads/CHF-working/heartvoice-monitor/test-results/`
- **Videos**: Available for failed tests
- **HTML Report**: Generated automatically

### Console Output
The test provides detailed console logging:
- ✅ Success indicators
- ⚠️ Warnings for fallback actions
- 📊 Status updates during execution
- 🔍 Element discovery details

## Troubleshooting

### Common Issues

1. **Timeout Errors**
   - Increase timeout in test configuration
   - Check network connectivity to ngrok URL

2. **Element Not Found**
   - The test uses multiple fallback selectors
   - Check browser developer tools for actual element selectors

3. **Call Verification Failed**
   - Voice call functionality may require specific backend setup
   - Test will log attempts even if full verification fails

### Debug Mode

Enable debug mode for step-by-step execution:
```bash
npx playwright test tests/heartvoice-comprehensive.spec.ts --debug
```

### Modify Selectors

If elements are not being found, add new selectors to the arrays in the test file:
```typescript
const addPatientSelectors = [
  '[data-testid="add-patient-button"]',
  'button:has-text("Add Patient")',
  // Add your custom selector here
];
```

## Extending the Test

### Adding New Test Cases
Create new test cases in the same describe block:
```typescript
test('New test case name', async ({ page }) => {
  // Your test logic here
});
```

### Modifying Test Data
Update the `TEST_CONFIG` object at the top of the test file:
```typescript
const TEST_CONFIG = {
  baseURL: 'your-url-here',
  patient: {
    name: 'Different Patient Name',
    phone: '1234567890'
  }
};
```

## Best Practices

- **Always run in headed mode** during development to see what's happening
- **Use the custom test runner** for consistent configuration
- **Check test results** in the output directory after each run
- **Update selectors** if the UI changes significantly
- **Monitor console output** for detailed execution information

## Support

For issues with the test suite:
1. Check the console output for specific error messages
2. Review the generated HTML report
3. Examine screenshots/videos in the test-results directory
4. Use debug mode for step-by-step troubleshooting