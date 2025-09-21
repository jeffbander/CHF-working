/**
 * TestSprite Simple Jest Configuration
 * Minimal configuration for immediate testing
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],
  
  // Verbose output
  verbose: true,
  
  // Test timeout
  testTimeout: 30000,
  
  // Clear mocks
  clearMocks: true,
  
  // Setup files
  setupFiles: ['<rootDir>/tests/env.setup.js']
};
