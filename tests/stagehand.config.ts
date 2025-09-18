import { StagehandConfig } from '@browserbasehq/stagehand';

/**
 * Stagehand Configuration for HeartVoice Monitor E2E Tests
 *
 * This configuration optimizes Stagehand for the clinical interface
 * and ensures reliable element discovery and interaction.
 */

export const stagehandConfig: StagehandConfig = {
  // Enable caching for better performance
  enableCaching: true,

  // Debug mode controlled by environment variable
  debugMode: process.env.TEST_DEBUG === '1',

  // DOM settle timeout - important for React app hydration
  domSettleTimeoutMs: 3000,

  // Enable comprehensive logging
  enableLogs: true,

  // Vision settings for AI element discovery
  vision: {
    // Use higher quality screenshots for better element recognition
    screenshotOptions: {
      quality: 90,
      type: 'png'
    },

    // Optimize for clinical interfaces with tables and forms
    elementDetection: {
      // Focus on interactive elements
      includeInvisible: false,
      includeTextNodes: true,

      // Clinical interface specific selectors
      prioritySelectors: [
        // Patient management elements
        '[data-testid*="patient"]',
        '[data-testid*="call"]',
        '[data-testid*="add"]',
        '[data-testid*="voice"]',
        '[data-testid*="recording"]',

        // Form elements
        'input[type="text"]',
        'input[type="tel"]',
        'input[type="email"]',
        'input[type="date"]',
        'select',
        'textarea',
        'button[type="submit"]',

        // Navigation elements
        '[role="tab"]',
        '[role="tabpanel"]',
        '[role="dialog"]',
        'button',

        // Table elements
        'table',
        'tbody tr',
        'td',
        'th',

        // Clinical specific patterns
        '.patient-row',
        '.call-button',
        '.voice-controls',
        '.clinical-header',
        '.dashboard-overview'
      ]
    }
  },

  // Network settings for API testing
  network: {
    // Wait for network idle before interactions
    waitForNetworkIdle: true,
    networkIdleTimeout: 2000,

    // API endpoint testing
    apiEndpoints: [
      '/api/patients',
      '/api/voice-calls',
      '/api/dashboard'
    ]
  },

  // Action settings
  actions: {
    // Slower actions for better reliability in clinical interface
    defaultActionDelay: 500,

    // Retry settings for network-dependent actions
    maxRetries: 3,
    retryDelay: 1000,

    // Scroll settings for long forms
    scrollBehavior: 'smooth',
    scrollIntoView: true
  },

  // Fallback strategies
  fallbackStrategy: {
    // Use multiple strategies for element discovery
    strategies: [
      'data-testid',
      'accessibility',
      'text-content',
      'visual-ai'
    ],

    // Timeout for each strategy
    strategyTimeout: 5000
  }
};

// Environment-specific overrides
if (process.env.CI) {
  // CI environment optimizations
  stagehandConfig.debugMode = false;
  stagehandConfig.domSettleTimeoutMs = 5000;
  stagehandConfig.actions!.maxRetries = 5;
}

if (process.env.TEST_URL?.includes('ngrok')) {
  // Ngrok-specific optimizations
  stagehandConfig.network!.networkIdleTimeout = 3000;
  stagehandConfig.actions!.defaultActionDelay = 750;
}

export default stagehandConfig;