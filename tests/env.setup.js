/**
 * TestSprite Environment Setup
 * Sets up environment variables for testing
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.TWILIO_ACCOUNT_SID = 'test_account_sid';
process.env.TWILIO_AUTH_TOKEN = 'test_auth_token';
process.env.TWILIO_PHONE_NUMBER = '+18445551234';
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3002';

// Add fetch polyfill for Node.js
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}
