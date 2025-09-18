# HeartVoice Monitor E2E Tests

This directory contains comprehensive end-to-end tests for the HeartVoice Monitor application using **Stagehand** for AI-powered element discovery and interaction.

## Overview

The test suite validates:
- ✅ **Patient Management**: Adding patients with complete clinical data
- ✅ **Voice Calling**: Making calls to specific phone numbers (6465565559)
- ✅ **ElevenLabs Integration**: Verifying AI voice conversation flows
- ✅ **Real-time Monitoring**: WebSocket connections and status updates
- ✅ **Error Handling**: Graceful failure handling and recovery

## Test Strategy

We use a **hybrid AI + data-testid** approach for maximum reliability:

1. **Primary Strategy**: Target elements using `data-testid` attributes
2. **Fallback Strategy**: Use Stagehand AI for visual element discovery
3. **Recovery Strategy**: Multiple selector attempts with intelligent retries

## Test Files

### Core Test Suites

- **`stagehand-e2e.spec.ts`** - Complete end-to-end workflow tests
- **`voice-call-e2e.spec.ts`** - Focused voice calling functionality tests

### Helper Modules

- **`helpers/test-helpers.ts`** - Robust interaction utilities
- **`helpers/global-setup.ts`** - Environment setup and validation
- **`stagehand.config.ts`** - Stagehand AI configuration

### Test Runners

- **`run-stagehand-tests.js`** - Custom test runner with environment setup

## Prerequisites

### 1. Install Dependencies

```bash
npm install
npm install @stagehand/core
npx playwright install
```

### 2. Environment Setup

Set your environment variables:

```bash
export TEST_URL="https://b545d6dd0331.ngrok.app"
export WS_URL="https://1cdf34f35bcc.ngrok.app"
export TEST_DEBUG="1"  # Optional: Enable debug mode
```

### 3. Application Requirements

- Next.js application running on the specified URL
- WebSocket server for real-time updates
- ElevenLabs integration configured
- Twilio voice calling setup

## Running Tests

### Quick Start

```bash
# Run all Stagehand tests
npm run test:stagehand

# Run with debug mode (slower, more verbose)
npm run test:stagehand:debug

# Run specific test pattern
TEST_PATTERN="**/voice-call*" npm run test:stagehand
```

### Advanced Usage

```bash
# Use custom test runner with full configuration
node run-stagehand-tests.js

# Run individual test files
npx playwright test tests/stagehand-e2e.spec.ts --headed

# Run voice tests specifically
npx playwright test --project=voice-tests
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `TEST_URL` | Application URL | `http://localhost:3000` |
| `WS_URL` | WebSocket server URL | `https://1cdf34f35bcc.ngrok.app` |
| `TEST_DEBUG` | Enable debug mode | `false` |
| `TEST_HEADED` | Run in headed mode | `true` |
| `TEST_PROJECT` | Browser project | `chromium` |
| `TEST_PATTERN` | Test file pattern | `**/stagehand-*.spec.ts` |

## Test Features

### 1. Patient Addition Test

```typescript
test('should successfully add a new patient to the system', async ({ page }) => {
  // Creates a complete patient record with:
  // - Demographics (name, DOB, MRN, phone)
  // - Clinical info (diagnosis, NYHA class, medications)
  // - Emergency contacts
  // - Monitoring configuration
});
```

### 2. Voice Calling Test

```typescript
test('should make voice call to 6465565559', async ({ page }) => {
  // Tests voice calling functionality:
  // - Finds patient with target phone number
  // - Initiates Twilio voice call
  // - Verifies call status and recording
});
```

### 3. ElevenLabs Integration Test

```typescript
test('should verify ElevenLabs conversation flow', async ({ page }) => {
  // Validates AI voice integration:
  // - Checks connection status
  // - Tests API endpoints
  // - Monitors WebSocket communications
});
```

### 4. Complete Workflow Test

```typescript
test('should complete full patient workflow end-to-end', async ({ page }) => {
  // End-to-end patient journey:
  // - Add patient → View in list → Make call → Check recordings
});
```

## Robust Element Discovery

The test suite uses a sophisticated element discovery strategy:

### TestHelpers Utility

```typescript
// Robust clicking with multiple fallback strategies
await testHelpers.robustClick(
  ['[data-testid="add-patient"]', 'button:has-text("Add Patient")'],
  'Click the Add Patient button'
);

// Intelligent form filling
await testHelpers.robustFill(
  ['#phoneNumber', '[name="phoneNumber"]'],
  '6465565559',
  'Phone Number'
);
```

### AI-Powered Fallbacks

When standard selectors fail, Stagehand AI takes over:

```typescript
// If data-testid fails, AI describes the action
await stagehand.act("Click the call button for patient John Doe");
await stagehand.act("Fill in the phone number field with 6465565559");
```

## Configuration

### Playwright Projects

- **`chromium`** - Standard Chrome testing
- **`stagehand`** - AI-optimized Chrome setup
- **`voice-tests`** - Voice calling with media permissions
- **`chromium-headless`** - CI/CD headless testing

### Stagehand Settings

```typescript
{
  enableCaching: true,
  debugMode: process.env.TEST_DEBUG === '1',
  domSettleTimeoutMs: 3000,
  enableLogs: true,
  vision: {
    elementDetection: {
      prioritySelectors: [
        '[data-testid*="patient"]',
        '[data-testid*="call"]',
        'input[type="tel"]',
        'button[type="submit"]'
      ]
    }
  }
}
```

## Debugging

### Debug Mode

Enable verbose logging and slower execution:

```bash
TEST_DEBUG=1 npm run test:stagehand:debug
```

### Visual Debugging

- **Screenshots**: Captured on failures
- **Videos**: Full test execution recordings
- **Traces**: Detailed interaction logs
- **HTML Reports**: Comprehensive test results

### Common Issues

1. **Element Not Found**
   - Check if data-testid attributes exist
   - Verify page loading and React hydration
   - Use debug mode to see AI element discovery

2. **Timeout Errors**
   - Increase timeouts for slow networks
   - Verify ngrok URLs are accessible
   - Check WebSocket connectivity

3. **Voice Call Failures**
   - Confirm ElevenLabs API keys
   - Verify Twilio configuration
   - Check phone number format

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run Stagehand E2E Tests
  run: |
    export TEST_URL="${{ secrets.NGROK_URL }}"
    export WS_URL="${{ secrets.WS_URL }}"
    npm run test:stagehand
  env:
    PLAYWRIGHT_BROWSERS_PATH: 0
```

### Test Reports

- **HTML Report**: `test-results/index.html`
- **JSON Results**: `test-results/stagehand-results.json`
- **Videos/Screenshots**: `test-results/`

## Best Practices

### 1. Element Targeting

```typescript
// ✅ Good: Multiple selectors with fallback
const selectors = [
  '[data-testid="call-patient"]',
  'button:has-text("Call")',
  '.call-button'
];

// ❌ Avoid: Single brittle selector
const selector = 'div > button:nth-child(3)';
```

### 2. Test Data Management

```typescript
// ✅ Good: Generate unique test data
const testPatient = {
  mrn: 'TEST-' + Date.now().toString().slice(-6),
  phoneNumber: '6465565559',
  // ...
};
```

### 3. Error Handling

```typescript
// ✅ Good: Graceful error handling
try {
  await page.click('[data-testid="call-button"]');
} catch (error) {
  await stagehand.act("Click the call button");
}
```

## Support

For issues with:
- **Stagehand**: Check the [Stagehand documentation](https://docs.stagehand.dev)
- **Playwright**: Review [Playwright guides](https://playwright.dev/docs)
- **Application**: Contact the HeartVoice Monitor development team

## Contributing

When adding new tests:

1. Use the hybrid AI + data-testid strategy
2. Add appropriate `data-testid` attributes to components
3. Include both positive and negative test cases
4. Add comprehensive error handling
5. Update this documentation

---

**Last Updated**: 2025-01-16
**Stagehand Version**: 2.3.0
**Playwright Version**: 1.55.0