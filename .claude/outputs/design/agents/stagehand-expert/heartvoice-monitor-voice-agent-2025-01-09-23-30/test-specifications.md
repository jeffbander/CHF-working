# HeartVoice Monitor Voice Agent E2E Test Specifications

**Project**: HeartVoice Monitor Voice Agent Upgrade  
**Framework**: Stagehand (Playwright-based AI Testing)  
**Date**: 2025-01-09  
**Version**: 1.0  
**Testing Approach**: TDD for Conversational AI Healthcare Interactions  

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Test Architecture](#test-architecture)
3. [Core Test Scenarios](#core-test-scenarios)
4. [Voice Agent Conversation Tests](#voice-agent-conversation-tests)
5. [Real-Time Monitoring Tests](#real-time-monitoring-tests)
6. [Voice Biomarker Validation Tests](#voice-biomarker-validation-tests)
7. [Emergency Escalation Tests](#emergency-escalation-tests)
8. [HIPAA Compliance Tests](#hipaa-compliance-tests)
9. [Performance and Load Tests](#performance-and-load-tests)
10. [Accessibility Tests](#accessibility-tests)
11. [Test Data and Mocks](#test-data-and-mocks)

## Executive Summary

This document provides comprehensive E2E test specifications for the HeartVoice Monitor voice agent upgrade from Twilio TwiML to OpenAI Realtime API. Tests focus on conversational AI healthcare interactions, voice biomarker extraction, clinical workflow validation, and HIPAA compliance using Stagehand's AI-powered testing capabilities.

### Testing Objectives
- Validate natural conversation flow between AI agent and patients
- Ensure accurate voice biomarker extraction during real speech
- Test emergency escalation triggers and clinical workflows
- Verify HIPAA-compliant data handling and audit trails
- Validate real-time WebSocket communication with OpenAI Realtime API
- Ensure clinical safety and patient engagement metrics

### Test Strategy
- **Hybrid AI + data-testid approach** for reliable element discovery
- **Mock WebSocket connections** for OpenAI Realtime API testing
- **Conversation flow validation** with NLP processing
- **Clinical threshold validation** for voice biomarkers
- **Multi-user concurrent testing** for healthcare team workflows

## Test Architecture

### Stagehand Configuration

```typescript
// stagehand.config.ts
import { defineConfig } from '@stagehand/core';

export default defineConfig({
  testDir: './tests',
  use: {
    // AI-powered element detection
    elementDetection: 'hybrid', // AI + data-testid
    // Healthcare-specific timeouts
    actionTimeout: 10000, // WebSocket connections may be slower
    navigationTimeout: 15000,
    // Voice processing timeouts
    assertionTimeout: 30000, // Voice analysis takes time
    // Mock external services
    mockMode: 'development',
    // HIPAA compliance
    videoRecording: 'retain-on-failure',
    screenshotMode: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  projects: [
    {
      name: 'voice-agent-core',
      testMatch: /voice-agent-.*\.spec\.ts/,
      use: {
        mockWebSockets: true,
        simulateVoiceInput: true
      }
    },
    {
      name: 'clinical-workflows',
      testMatch: /clinical-.*\.spec\.ts/,
      use: {
        multiUser: true,
        roleBasedAccess: true
      }
    },
    {
      name: 'compliance-security',
      testMatch: /hipaa-.*\.spec\.ts/,
      use: {
        auditMode: true,
        dataEncryption: true
      }
    }
  ]
});
```

### Mock Services Setup

```typescript
// mocks/openai-realtime-mock.ts
export class OpenAIRealtimeMock {
  private wsServer: WebSocketServer;
  private conversations: Map<string, ConversationState> = new Map();

  async startMockServer() {
    this.wsServer = new WebSocketServer({ port: 8080 });
    
    this.wsServer.on('connection', (ws, req) => {
      const conversationId = this.extractConversationId(req.url);
      
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        this.handleOpenAIMessage(conversationId, message, ws);
      });
    });
  }

  private handleOpenAIMessage(conversationId: string, message: any, ws: WebSocket) {
    switch (message.type) {
      case 'conversation.item.create':
        this.simulateAIResponse(conversationId, message.item.content, ws);
        break;
      case 'input_audio_buffer.append':
        this.simulateVoiceProcessing(conversationId, message.audio, ws);
        break;
    }
  }

  private simulateAIResponse(conversationId: string, content: string, ws: WebSocket) {
    // Simulate natural AI response with clinical context
    const response = this.generateClinicalResponse(content);
    
    ws.send(JSON.stringify({
      type: 'conversation.item.created',
      item: {
        role: 'assistant',
        content: response
      }
    }));
  }

  private simulateVoiceProcessing(conversationId: string, audioData: string, ws: WebSocket) {
    // Simulate voice biomarker extraction
    const biomarkers = this.generateMockBiomarkers();
    
    ws.send(JSON.stringify({
      type: 'voice.biomarkers.extracted',
      biomarkers
    }));
  }
}
```

## Core Test Scenarios

### Test Scenario 1: Patient Call Initiation and OpenAI Connection

```typescript
// tests/voice-agent-initiation.spec.ts
import { test, expect } from '@stagehand/test';
import { OpenAIRealtimeMock } from '../mocks/openai-realtime-mock';

test.describe('Voice Agent Call Initiation', () => {
  let mockOpenAI: OpenAIRealtimeMock;

  test.beforeAll(async () => {
    mockOpenAI = new OpenAIRealtimeMock();
    await mockOpenAI.startMockServer();
  });

  test('should initiate patient call with OpenAI Realtime API connection', async ({ stagehand }) => {
    // Navigate to patient dashboard
    await stagehand.page.goto('/dashboard/patients');
    
    // Select patient for call
    await stagehand.act({
      action: "click on patient 'Mary Johnson' call button",
      modelName: "gpt-4o"
    });

    // Verify call initiation modal
    await stagehand.expect({
      assertion: "modal shows 'Initiating Call to Mary Johnson'",
      modelName: "gpt-4o"
    });

    // Start the call
    await stagehand.act({
      action: "click the 'Start Call' button",
      modelName: "gpt-4o"
    });

    // Verify WebSocket connection to OpenAI
    const wsConnections = await stagehand.page.evaluate(() => {
      return window.performance.getEntriesByType('resource')
        .filter(entry => entry.name.includes('openai') && entry.name.includes('realtime'));
    });
    
    expect(wsConnections.length).toBeGreaterThan(0);

    // Verify call status updates
    await stagehand.expect({
      assertion: "call status shows 'Connected - AI Agent Active'",
      modelName: "gpt-4o"
    });

    // Verify conversation interface appears
    await stagehand.expect({
      assertion: "conversation transcript panel is visible",
      modelName: "gpt-4o"
    });

    await stagehand.expect({
      assertion: "voice biomarker panel is visible with live indicators",
      modelName: "gpt-4o"
    });
  });

  test('should handle connection failures gracefully', async ({ stagehand }) => {
    // Simulate OpenAI API failure
    await mockOpenAI.simulateConnectionFailure();

    await stagehand.page.goto('/dashboard/patients');
    
    await stagehand.act({
      action: "click on patient 'John Doe' call button",
      modelName: "gpt-4o"
    });

    await stagehand.act({
      action: "click the 'Start Call' button",
      modelName: "gpt-4o"
    });

    // Should show fallback options
    await stagehand.expect({
      assertion: "error message shows 'OpenAI connection failed. Switching to backup system.'",
      modelName: "gpt-4o"
    });

    await stagehand.expect({
      assertion: "fallback options include 'Retry OpenAI', 'Use ElevenLabs', or 'Basic TwiML'",
      modelName: "gpt-4o"
    });
  });
});
```

### Test Scenario 2: Natural Conversation Flow Validation

```typescript
// tests/voice-agent-conversation-flow.spec.ts
import { test, expect } from '@stagehand/test';
import { ConversationFlowValidator } from '../utils/conversation-validator';

test.describe('Natural Conversation Flow', () => {
  let conversationValidator: ConversationFlowValidator;

  test.beforeEach(async () => {
    conversationValidator = new ConversationFlowValidator();
  });

  test('should conduct natural conversation with context switching', async ({ stagehand }) => {
    await stagehand.page.goto('/dashboard/live-calls');

    // Start monitoring active call
    await stagehand.act({
      action: "click on active call for 'Mary Johnson'",
      modelName: "gpt-4o"
    });

    // Simulate patient response about weather
    await conversationValidator.simulatePatientInput(
      "It's a lovely day today, quite sunny!"
    );

    // Verify AI responds naturally to general topic
    await stagehand.expect({
      assertion: "AI response acknowledges weather and transitions naturally",
      modelName: "gpt-4o"
    });

    // Verify transcript shows natural response
    const transcriptMessages = await stagehand.page.locator('[data-testid="transcript-message"]').all();
    const latestMessage = await transcriptMessages[transcriptMessages.length - 1].textContent();
    
    expect(latestMessage).toMatch(/weather|sunny|day/i);
    expect(latestMessage).toMatch(/how.*feel/i); // Should transition to health

    // Simulate health topic transition
    await conversationValidator.simulatePatientInput(
      "I've been feeling a bit short of breath lately"
    );

    // Verify AI recognizes clinical significance
    await stagehand.expect({
      assertion: "AI response shows clinical concern and asks follow-up questions",
      modelName: "gpt-4o"
    });

    // Check for clinical alert
    await stagehand.expect({
      assertion: "alert indicator shows 'Dyspnea mentioned - clinical significance detected'",
      modelName: "gpt-4o"
    });

    // Verify conversation quality scoring
    const qualityScore = await stagehand.page.locator('[data-testid="conversation-quality-score"]').textContent();
    expect(parseInt(qualityScore)).toBeGreaterThan(70);
  });

  test('should maintain conversation memory throughout call', async ({ stagehand }) => {
    await stagehand.page.goto('/dashboard/live-calls');
    
    await stagehand.act({
      action: "click on active call for 'Robert Wilson'",
      modelName: "gpt-4o"
    });

    // Establish context early in conversation
    await conversationValidator.simulatePatientInput(
      "My daughter visited me yesterday, she lives in Seattle"
    );

    // Continue conversation with other topics
    await conversationValidator.simulatePatientInput(
      "I took my medications this morning as usual"
    );

    await conversationValidator.simulatePatientInput(
      "My appetite has been good"
    );

    // Test memory recall - reference earlier mentioned information
    await conversationValidator.simulatePatientInput(
      "I might visit her soon"
    );

    // Verify AI remembers context about daughter in Seattle
    await stagehand.expect({
      assertion: "AI response references daughter in Seattle from earlier conversation",
      modelName: "gpt-4o"
    });

    // Verify conversation memory indicators in UI
    await stagehand.expect({
      assertion: "conversation memory panel shows key context points",
      modelName: "gpt-4o"
    });
  });
});
```

### Test Scenario 3: Voice Biomarker Extraction During Natural Speech

```typescript
// tests/voice-biomarker-extraction.spec.ts
import { test, expect } from '@stagehand/test';
import { VoiceBiomarkerValidator } from '../utils/biomarker-validator';

test.describe('Voice Biomarker Extraction', () => {
  let biomarkerValidator: VoiceBiomarkerValidator;

  test.beforeEach(async () => {
    biomarkerValidator = new VoiceBiomarkerValidator();
  });

  test('should extract jitter, shimmer, and HNR during natural conversation', async ({ stagehand }) => {
    await stagehand.page.goto('/dashboard/live-calls');
    
    await stagehand.act({
      action: "click on active call for 'Sarah Mitchell'",
      modelName: "gpt-4o"
    });

    // Simulate patient speech with known voice characteristics
    await biomarkerValidator.simulateVoiceInput({
      text: "I've been feeling quite tired lately, and sometimes I get short of breath",
      voiceCharacteristics: {
        jitter: 0.8, // Slightly elevated
        shimmer: 1.2, // Normal range
        hnr: 14.5 // Good
      },
      duration: 8000 // 8 second speech sample
    });

    // Verify real-time biomarker display updates
    await stagehand.expect({
      assertion: "jitter indicator shows approximately 0.8% with green status",
      modelName: "gpt-4o"
    });

    await stagehand.expect({
      assertion: "shimmer indicator shows approximately 1.2% with green status",
      modelName: "gpt-4o"
    });

    await stagehand.expect({
      assertion: "HNR indicator shows approximately 14.5 dB with good status",
      modelName: "gpt-4o"
    });

    // Verify live waveform display
    await stagehand.expect({
      assertion: "waveform display shows voice activity during patient speech",
      modelName: "gpt-4o"
    });

    // Check biomarker trend chart updates
    const chartData = await stagehand.page.locator('[data-testid="biomarker-chart"]').getAttribute('data-points');
    const dataPoints = JSON.parse(chartData);
    
    expect(dataPoints.length).toBeGreaterThan(0);
    expect(dataPoints[dataPoints.length - 1].jitter).toBeCloseTo(0.8, 1);
  });

  test('should trigger alerts for abnormal biomarker values', async ({ stagehand }) => {
    await stagehand.page.goto('/dashboard/live-calls');
    
    await stagehand.act({
      action: "click on active call for 'Thomas Anderson'",
      modelName: "gpt-4o"
    });

    // Simulate speech with concerning biomarkers
    await biomarkerValidator.simulateVoiceInput({
      text: "I feel okay today, just the usual",
      voiceCharacteristics: {
        jitter: 2.1, // Critical level
        shimmer: 3.8, // Critical level  
        hnr: 8.2 // Low - concerning
      },
      duration: 6000
    });

    // Verify critical alerts appear
    await stagehand.expect({
      assertion: "critical alert banner shows 'Voice biomarkers indicate potential decompensation'",
      modelName: "gpt-4o"
    });

    // Verify individual biomarker alerts
    await stagehand.expect({
      assertion: "jitter indicator shows red critical status with 2.1%",
      modelName: "gpt-4o"
    });

    await stagehand.expect({
      assertion: "shimmer indicator shows red critical status with 3.8%",
      modelName: "gpt-4o"
    });

    // Verify clinical correlation display
    await stagehand.expect({
      assertion: "clinical correlation panel shows 'High correlation with elevated BNP'",
      modelName: "gpt-4o"
    });

    // Verify escalation options appear
    await stagehand.expect({
      assertion: "escalation panel shows options to 'Alert Clinician' and 'Schedule Urgent Follow-up'",
      modelName: "gpt-4o"
    });
  });

  test('should correlate biomarkers with clinical data', async ({ stagehand }) => {
    await stagehand.page.goto('/dashboard/analytics/voice-biomarkers');

    // Navigate to patient with historical data
    await stagehand.act({
      action: "select patient 'Margaret Thompson' from dropdown",
      modelName: "gpt-4o"
    });

    // Verify biomarker trend analysis
    await stagehand.expect({
      assertion: "jitter trend chart shows increasing trend over past 30 days",
      modelName: "gpt-4o"
    });

    // Verify clinical correlation charts
    await stagehand.expect({
      assertion: "BNP correlation chart shows strong positive correlation (r > 0.7)",
      modelName: "gpt-4o"
    });

    await stagehand.expect({
      assertion: "NYHA class prediction shows 'Class III' with 85% confidence",
      modelName: "gpt-4o"
    });

    // Verify risk assessment
    await stagehand.expect({
      assertion: "readmission risk shows 34% with 'High Risk' classification",
      modelName: "gpt-4o"
    });
  });
});
```

### Test Scenario 4: Emergency Escalation Workflows

```typescript
// tests/emergency-escalation.spec.ts
import { test, expect } from '@stagehand/test';
import { EmergencyScenarioSimulator } from '../utils/emergency-simulator';

test.describe('Emergency Escalation', () => {
  let emergencySimulator: EmergencyScenarioSimulator;

  test.beforeEach(async () => {
    emergencySimulator = new EmergencyScenarioSimulator();
  });

  test('should detect and escalate suicide risk keywords', async ({ stagehand }) => {
    await stagehand.page.goto('/dashboard/live-calls');
    
    await stagehand.act({
      action: "click on active call for 'David Martinez'",
      modelName: "gpt-4o"
    });

    // Simulate patient expressing suicidal ideation
    await emergencySimulator.simulatePatientInput(
      "I just don't want to be here anymore, sometimes I think everyone would be better off without me"
    );

    // Verify immediate emergency alert
    await stagehand.expect({
      assertion: "critical emergency alert appears with 'SUICIDE RISK DETECTED' message",
      modelName: "gpt-4o"
    });

    // Verify AI response switches to crisis mode
    await stagehand.expect({
      assertion: "AI response shows empathy and asks direct safety assessment questions",
      modelName: "gpt-4o"
    });

    // Verify escalation panel activates
    await stagehand.expect({
      assertion: "emergency escalation panel shows options including 'Call 988', 'Alert Crisis Team', 'Connect Clinician'",
      modelName: "gpt-4o"
    });

    // Test immediate clinician notification
    await stagehand.act({
      action: "click 'Alert Crisis Team' button",
      modelName: "gpt-4o"
    });

    // Verify notification sent
    await stagehand.expect({
      assertion: "confirmation shows 'Crisis team notified - Response time: < 2 minutes'",
      modelName: "gpt-4o"
    });

    // Verify audit trail created
    await stagehand.expect({
      assertion: "audit log shows 'EMERGENCY: Suicide risk protocol activated' with timestamp",
      modelName: "gpt-4o"
    });
  });

  test('should escalate critical cardiac symptoms', async ({ stagehand }) => {
    await stagehand.page.goto('/dashboard/live-calls');
    
    await stagehand.act({
      action: "click on active call for 'Eleanor Washington'",
      modelName: "gpt-4o"
    });

    // Simulate acute heart failure symptoms
    await emergencySimulator.simulatePatientInput(
      "I'm having severe chest pain and I can't breathe, I'm so dizzy I can barely stand"
    );

    // Verify immediate cardiac emergency detection
    await stagehand.expect({
      assertion: "cardiac emergency alert shows 'ACUTE SYMPTOMS - POSSIBLE HEART ATTACK'",
      modelName: "gpt-4o"
    });

    // Verify AI switches to emergency protocol
    await stagehand.expect({
      assertion: "AI response includes 'I'm connecting you to emergency services right now'",
      modelName: "gpt-4o"
    });

    // Verify 911 call initiation option
    await stagehand.expect({
      assertion: "emergency panel shows prominent '911' button with 'Connect Emergency Services'",
      modelName: "gpt-4o"
    });

    // Test emergency services connection
    await stagehand.act({
      action: "click '911' emergency button",
      modelName: "gpt-4o"
    });

    // Verify emergency call initiated
    await stagehand.expect({
      assertion: "status shows 'Connecting to 911 Emergency Services'",
      modelName: "gpt-4o"
    });

    // Verify patient information prepared for handoff
    await stagehand.expect({
      assertion: "emergency summary shows patient details, symptoms, and medical history",
      modelName: "gpt-4o"
    });
  });

  test('should handle multiple escalation levels', async ({ stagehand }) => {
    await stagehand.page.goto('/dashboard/live-calls');
    
    await stagehand.act({
      action: "click on active call for 'Michael Chen'",
      modelName: "gpt-4o"
    });

    // Simulate concerning but not emergency symptoms
    await emergencySimulator.simulatePatientInput(
      "I've been having more swelling in my legs and I'm more short of breath than usual"
    );

    // Verify moderate alert (not emergency)
    await stagehand.expect({
      assertion: "alert level shows 'CLINICAL CONCERN' with yellow warning indicator",
      modelName: "gpt-4o"
    });

    // Verify escalation options offered
    await stagehand.expect({
      assertion: "escalation options include 'Schedule Same-Day Appointment', 'Alert Nurse', 'Continue Monitoring'",
      modelName: "gpt-4o"
    });

    // Test nurse alert escalation
    await stagehand.act({
      action: "click 'Alert Nurse' option",
      modelName: "gpt-4o"
    });

    // Verify nurse notification sent
    await stagehand.expect({
      assertion: "confirmation shows 'Nurse practitioner notified - Expected response: 30 minutes'",
      modelName: "gpt-4o"
    });

    // Simulate worsening symptoms
    await emergencySimulator.simulatePatientInput(
      "Actually, the chest pain is getting worse and I feel nauseous"
    );

    // Verify escalation level increases
    await stagehand.expect({
      assertion: "alert level escalates to 'HIGH PRIORITY' with orange indicator",
      modelName: "gpt-4o"
    });

    // Verify additional escalation options
    await stagehand.expect({
      assertion: "new options include 'Alert Cardiologist', 'Recommend ER Visit'",
      modelName: "gpt-4o"
    });
  });
});
```

### Test Scenario 5: Real-Time WebSocket Communication

```typescript
// tests/realtime-websocket-communication.spec.ts
import { test, expect } from '@stagehand/test';
import { WebSocketTester } from '../utils/websocket-tester';

test.describe('Real-Time WebSocket Communication', () => {
  let wsTester: WebSocketTester;

  test.beforeEach(async () => {
    wsTester = new WebSocketTester();
  });

  test('should maintain stable WebSocket connection with OpenAI Realtime API', async ({ stagehand }) => {
    await stagehand.page.goto('/dashboard/live-calls');
    
    // Monitor WebSocket connections
    await wsTester.startMonitoring(stagehand.page);

    await stagehand.act({
      action: "click on active call for 'Jennifer Brooks'",
      modelName: "gpt-4o"
    });

    // Verify WebSocket connection established
    const wsConnections = await wsTester.getActiveConnections();
    expect(wsConnections.filter(conn => conn.url.includes('openai')).length).toBe(1);

    // Verify connection stability over time
    await stagehand.page.waitForTimeout(30000); // Wait 30 seconds

    const connectionStatus = await wsTester.getConnectionStatus();
    expect(connectionStatus.disconnections).toBe(0);
    expect(connectionStatus.reconnections).toBeLessThanOrEqual(1);

    // Test message flow
    await wsTester.simulateAudioMessage({
      type: 'input_audio_buffer.append',
      audio: 'base64_encoded_audio_data'
    });

    // Verify response received
    const responses = await wsTester.getReceivedMessages();
    const audioResponse = responses.find(msg => msg.type === 'conversation.item.created');
    expect(audioResponse).toBeDefined();
  });

  test('should handle WebSocket reconnection gracefully', async ({ stagehand }) => {
    await stagehand.page.goto('/dashboard/live-calls');
    
    await stagehand.act({
      action: "click on active call for 'Patricia Davis'",
      modelName: "gpt-4o"
    });

    // Monitor initial connection
    await wsTester.startMonitoring(stagehand.page);

    // Simulate connection loss
    await wsTester.simulateConnectionLoss();

    // Verify reconnection indicator appears
    await stagehand.expect({
      assertion: "connection status shows 'Reconnecting...' with loading indicator",
      modelName: "gpt-4o"
    });

    // Wait for automatic reconnection
    await stagehand.expect({
      assertion: "connection status returns to 'Connected' within 5 seconds",
      modelName: "gpt-4o"
    });

    // Verify conversation continues seamlessly
    await stagehand.expect({
      assertion: "conversation transcript shows no interruption messages",
      modelName: "gpt-4o"
    });

    // Verify buffered messages are sent
    const connectionStats = await wsTester.getConnectionStats();
    expect(connectionStats.bufferedMessages).toBe(0);
  });

  test('should handle concurrent WebSocket connections', async ({ stagehand }) => {
    await stagehand.page.goto('/dashboard/live-calls');

    // Start multiple concurrent calls
    const callButtons = await stagehand.page.locator('[data-testid="start-call-button"]').all();
    
    // Click first 3 call buttons
    for (let i = 0; i < Math.min(3, callButtons.length); i++) {
      await callButtons[i].click();
      await stagehand.page.waitForTimeout(1000); // Stagger starts
    }

    // Monitor all WebSocket connections
    await wsTester.startMonitoring(stagehand.page);

    // Verify multiple stable connections
    const connections = await wsTester.getActiveConnections();
    expect(connections.length).toBe(3);

    // Verify each connection is unique
    const uniqueUrls = new Set(connections.map(conn => conn.url));
    expect(uniqueUrls.size).toBe(3);

    // Test message routing to correct connections
    for (let i = 0; i < 3; i++) {
      await wsTester.sendMessageToConnection(i, {
        type: 'test_message',
        callId: connections[i].callId
      });
    }

    // Verify messages route correctly
    const messageStats = await wsTester.getMessageRoutingStats();
    expect(messageStats.correctlyRouted).toBe(3);
    expect(messageStats.misrouted).toBe(0);
  });
});
```

### Test Scenario 6: HIPAA Compliance and Audit Trails

```typescript
// tests/hipaa-compliance.spec.ts
import { test, expect } from '@stagehand/test';
import { AuditTrailValidator } from '../utils/audit-validator';
import { PHIDataValidator } from '../utils/phi-validator';

test.describe('HIPAA Compliance', () => {
  let auditValidator: AuditTrailValidator;
  let phiValidator: PHIDataValidator;

  test.beforeEach(async () => {
    auditValidator = new AuditTrailValidator();
    phiValidator = new PHIDataValidator();
  });

  test('should create comprehensive audit trails for all PHI access', async ({ stagehand }) => {
    await stagehand.page.goto('/dashboard/patients');

    // Track all PHI access from start
    await auditValidator.startTracking(stagehand.page);

    // Access patient record
    await stagehand.act({
      action: "click on patient 'Mary Johnson' to view details",
      modelName: "gpt-4o"
    });

    // Verify audit entry created
    const auditEntries = await auditValidator.getAuditEntries();
    expect(auditEntries).toContainEqual(expect.objectContaining({
      action: 'PHI_ACCESS',
      resourceType: 'PATIENT_RECORD',
      patientId: 'mary-johnson-id',
      userId: 'current-user-id',
      timestamp: expect.any(String),
      ipAddress: expect.any(String)
    }));

    // Start a call
    await stagehand.act({
      action: "click 'Start Call' button",
      modelName: "gpt-4o"
    });

    // Verify call initiation audit
    const callAuditEntry = await auditValidator.getLatestEntry();
    expect(callAuditEntry.action).toBe('VOICE_CALL_INITIATED');
    expect(callAuditEntry.metadata).toHaveProperty('openaiSessionId');
    expect(callAuditEntry.metadata).toHaveProperty('encryptionStatus', 'ACTIVE');

    // Monitor conversation
    await stagehand.act({
      action: "monitor the active call conversation",
      modelName: "gpt-4o"
    });

    // Verify conversation monitoring audit
    const monitoringAudit = await auditValidator.getEntriesByAction('CONVERSATION_MONITORED');
    expect(monitoringAudit.length).toBeGreaterThan(0);
    expect(monitoringAudit[0].metadata).toHaveProperty('biomarkersRecorded');
    expect(monitoringAudit[0].metadata).toHaveProperty('transcriptLength');
  });

  test('should ensure PHI data encryption and secure handling', async ({ stagehand }) => {
    await stagehand.page.goto('/dashboard/live-calls');

    // Monitor network traffic for PHI
    await phiValidator.startNetworkMonitoring(stagehand.page);

    await stagehand.act({
      action: "click on active call for 'Robert Wilson'",
      modelName: "gpt-4o"
    });

    // Verify all network requests are encrypted
    const networkRequests = await phiValidator.getNetworkRequests();
    const phiRequests = networkRequests.filter(req => 
      req.url.includes('patient') || req.url.includes('conversation')
    );

    for (const request of phiRequests) {
      expect(request.protocol).toBe('https');
      expect(request.headers).toHaveProperty('encryption', 'AES-256');
    }

    // Verify WebSocket connections are secure
    const wsConnections = await phiValidator.getWebSocketConnections();
    for (const connection of wsConnections) {
      expect(connection.protocol).toBe('wss');
      expect(connection.headers).toHaveProperty('x-encryption-status', 'ACTIVE');
    }

    // Verify local storage doesn't contain plain text PHI
    const localStorage = await stagehand.page.evaluate(() => {
      const storage = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        storage[key] = window.localStorage.getItem(key);
      }
      return storage;
    });

    const phiInStorage = await phiValidator.scanForPHI(localStorage);
    expect(phiInStorage.plainTextPHI).toHaveLength(0);
    expect(phiInStorage.encryptedPHI).toBeGreaterThan(0);
  });

  test('should handle data retention and deletion policies', async ({ stagehand }) => {
    await stagehand.page.goto('/dashboard/settings/data-retention');

    // Verify data retention policy display
    await stagehand.expect({
      assertion: "data retention policy shows 'Voice recordings: Auto-delete after analysis'",
      modelName: "gpt-4o"
    });

    await stagehand.expect({
      assertion: "transcript retention shows 'Encrypted storage for 7 years as required by law'",
      modelName: "gpt-4o"
    });

    // Test manual data deletion for patient
    await stagehand.page.goto('/dashboard/patients');

    await stagehand.act({
      action: "click on patient 'Test Patient' options menu",
      modelName: "gpt-4o"
    });

    await stagehand.act({
      action: "click 'Delete Patient Data' option",
      modelName: "gpt-4o"
    });

    // Verify confirmation dialog with legal warnings
    await stagehand.expect({
      assertion: "confirmation dialog warns about legal and clinical implications",
      modelName: "gpt-4o"
    });

    await stagehand.expect({
      assertion: "dialog requires typing 'DELETE PATIENT DATA' to confirm",
      modelName: "gpt-4o"
    });

    // Complete deletion
    await stagehand.page.fill('[data-testid="deletion-confirmation"]', 'DELETE PATIENT DATA');
    
    await stagehand.act({
      action: "click 'Confirm Deletion' button",
      modelName: "gpt-4o"
    });

    // Verify audit trail for deletion
    const deletionAudit = await auditValidator.getEntriesByAction('PATIENT_DATA_DELETED');
    expect(deletionAudit.length).toBe(1);
    expect(deletionAudit[0].metadata).toHaveProperty('legalJustification');
    expect(deletionAudit[0].metadata).toHaveProperty('authorizedBy');
  });
});
```

### Test Scenario 7: Clinical Workflow Integration

```typescript
// tests/clinical-workflow-integration.spec.ts
import { test, expect } from '@stagehand/test';
import { ClinicalWorkflowValidator } from '../utils/clinical-validator';

test.describe('Clinical Workflow Integration', () => {
  let clinicalValidator: ClinicalWorkflowValidator;

  test.beforeEach(async () => {
    clinicalValidator = new ClinicalWorkflowValidator();
  });

  test('should support multi-user clinical team workflows', async ({ stagehand }) => {
    // Test with multiple browser contexts for different roles
    const nurseContext = await stagehand.browser.newContext();
    const doctorContext = await stagehand.browser.newContext();

    const nursePage = await nurseContext.newPage();
    const doctorPage = await doctorContext.newPage();

    // Login as nurse
    await nursePage.goto('/login');
    await nursePage.fill('[data-testid="username"]', 'nurse@heartvoice.com');
    await nursePage.fill('[data-testid="password"]', 'test_password');
    await nursePage.click('[data-testid="login-button"]');

    // Login as doctor
    await doctorPage.goto('/login');
    await doctorPage.fill('[data-testid="username"]', 'doctor@heartvoice.com');
    await doctorPage.fill('[data-testid="password"]', 'test_password');
    await doctorPage.click('[data-testid="login-button"]');

    // Nurse starts monitoring call
    await nursePage.goto('/dashboard/live-calls');
    await nursePage.click('[data-testid="monitor-call-patient-123"]');

    // Verify nurse sees appropriate interface
    await nursePage.waitForSelector('[data-testid="nurse-monitoring-panel"]');
    
    // Simulate escalation need
    await nursePage.click('[data-testid="escalate-to-doctor"]');

    // Verify doctor receives notification
    await doctorPage.waitForSelector('[data-testid="escalation-notification"]', { timeout: 5000 });

    const notification = await doctorPage.locator('[data-testid="escalation-notification"]').textContent();
    expect(notification).toContain('Patient 123');
    expect(notification).toContain('escalation from nurse');

    // Doctor reviews case
    await doctorPage.click('[data-testid="review-escalation"]');

    // Verify doctor sees enhanced interface with clinical decision tools
    await doctorPage.waitForSelector('[data-testid="clinical-decision-panel"]');
    await doctorPage.waitForSelector('[data-testid="patient-history-summary"]');

    // Doctor makes clinical decision
    await doctorPage.click('[data-testid="prescribe-medication"]');
    await doctorPage.fill('[data-testid="prescription-details"]', 'Increase furosemide to 40mg daily');
    await doctorPage.click('[data-testid="confirm-prescription"]');

    // Verify nurse receives update
    await nursePage.waitForSelector('[data-testid="prescription-notification"]');
    
    const prescriptionUpdate = await nursePage.locator('[data-testid="prescription-notification"]').textContent();
    expect(prescriptionUpdate).toContain('furosemide');
    expect(prescriptionUpdate).toContain('40mg daily');

    await nurseContext.close();
    await doctorContext.close();
  });

  test('should integrate with EHR systems for clinical documentation', async ({ stagehand }) => {
    await stagehand.page.goto('/dashboard/live-calls');
    
    // Start call monitoring
    await stagehand.act({
      action: "click on active call for 'Helen Rodriguez'",
      modelName: "gpt-4o"
    });

    // Wait for conversation to generate clinical data
    await stagehand.page.waitForTimeout(5000);

    // Access EHR integration panel
    await stagehand.act({
      action: "click 'Update EHR' button in the patient panel",
      modelName: "gpt-4o"
    });

    // Verify EHR integration interface
    await stagehand.expect({
      assertion: "EHR integration panel shows 'Connected to Epic MyChart'",
      modelName: "gpt-4o"
    });

    // Verify clinical data prepared for EHR
    await stagehand.expect({
      assertion: "clinical summary includes voice biomarker findings and conversation highlights",
      modelName: "gpt-4o"
    });

    // Test EHR data sync
    await stagehand.act({
      action: "click 'Sync to EHR' button",
      modelName: "gpt-4o"
    });

    // Verify sync confirmation
    await stagehand.expect({
      assertion: "confirmation shows 'Data successfully synced to Epic at 14:23:45'",
      modelName: "gpt-4o"
    });

    // Verify clinical note generation
    await stagehand.expect({
      assertion: "generated clinical note includes structured data with ICD-10 codes",
      modelName: "gpt-4o"
    });
  });

  test('should support clinical decision support workflows', async ({ stagehand }) => {
    await stagehand.page.goto('/dashboard/analytics/clinical-insights');

    // Select patient with concerning trends
    await stagehand.act({
      action: "select patient 'William Thompson' with trending voice biomarkers",
      modelName: "gpt-4o"
    });

    // Verify clinical decision support recommendations
    await stagehand.expect({
      assertion: "recommendations panel shows evidence-based treatment suggestions",
      modelName: "gpt-4o"
    });

    await stagehand.expect({
      assertion: "medication adjustment recommendations based on biomarker trends",
      modelName: "gpt-4o"
    });

    // Test clinical guideline integration
    await stagehand.expect({
      assertion: "guidelines panel shows relevant AHA/ESC heart failure guidelines",
      modelName: "gpt-4o"
    });

    // Access patient risk stratification
    await stagehand.act({
      action: "click 'Risk Stratification' tab",
      modelName: "gpt-4o"
    });

    // Verify risk scoring
    await stagehand.expect({
      assertion: "risk score shows 'High Risk (23%)' with contributing factors",
      modelName: "gpt-4o"
    });

    // Test intervention recommendations
    await stagehand.act({
      action: "click 'Generate Intervention Plan'",
      modelName: "gpt-4o"
    });

    await stagehand.expect({
      assertion: "intervention plan includes specific clinical actions and timelines",
      modelName: "gpt-4o"
    });
  });
});
```

### Test Scenario 8: Performance and Load Testing

```typescript
// tests/performance-load-testing.spec.ts
import { test, expect } from '@stagehand/test';
import { PerformanceMonitor } from '../utils/performance-monitor';
import { LoadTestManager } from '../utils/load-test-manager';

test.describe('Performance and Load Testing', () => {
  let performanceMonitor: PerformanceMonitor;
  let loadTestManager: LoadTestManager;

  test.beforeAll(async () => {
    performanceMonitor = new PerformanceMonitor();
    loadTestManager = new LoadTestManager();
  });

  test('should handle 100+ concurrent voice conversations', async ({ stagehand }) => {
    // Start performance monitoring
    await performanceMonitor.startMonitoring();

    // Create load test scenario
    const loadTest = await loadTestManager.createLoadTest({
      concurrentCalls: 100,
      callDuration: 300000, // 5 minutes
      rampUpTime: 60000 // 1 minute ramp up
    });

    await stagehand.page.goto('/dashboard/system-monitoring');

    // Start load test
    await loadTest.start();

    // Monitor system during load test
    await stagehand.expect({
      assertion: "active calls counter shows 100+ concurrent calls",
      modelName: "gpt-4o",
      timeout: 120000
    });

    // Verify WebSocket connection stability
    const wsMetrics = await performanceMonitor.getWebSocketMetrics();
    expect(wsMetrics.connectionFailures).toBeLessThan(5); // < 5% failure rate
    expect(wsMetrics.averageLatency).toBeLessThan(500); // < 500ms average

    // Verify voice processing performance
    await stagehand.expect({
      assertion: "voice processing queue shows < 2 second average processing time",
      modelName: "gpt-4o"
    });

    // Verify database performance
    const dbMetrics = await performanceMonitor.getDatabaseMetrics();
    expect(dbMetrics.averageQueryTime).toBeLessThan(100); // < 100ms

    // Verify memory usage stability
    const memoryUsage = await performanceMonitor.getMemoryMetrics();
    expect(memoryUsage.heapUsedMB).toBeLessThan(2000); // < 2GB
    expect(memoryUsage.memoryLeaks).toBe(0);

    await loadTest.stop();
  });

  test('should maintain response times under high load', async ({ stagehand }) => {
    await stagehand.page.goto('/dashboard/live-calls');

    // Start performance monitoring for page interactions
    await performanceMonitor.startPageMonitoring(stagehand.page);

    // Simulate high system load
    await loadTestManager.simulateHighLoad();

    // Test page load performance
    const startTime = Date.now();
    await stagehand.page.reload();
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000); // < 3 seconds under load

    // Test real-time updates performance
    const updateStartTime = Date.now();
    await stagehand.act({
      action: "click on active call for 'Performance Test Patient'",
      modelName: "gpt-4o"
    });
    const updateTime = Date.now() - updateStartTime;

    expect(updateTime).toBeLessThan(1000); // < 1 second for UI updates

    // Test chart rendering performance
    await stagehand.act({
      action: "navigate to voice biomarker analytics",
      modelName: "gpt-4o"
    });

    const chartMetrics = await performanceMonitor.getChartRenderingMetrics();
    expect(chartMetrics.averageRenderTime).toBeLessThan(800); // < 800ms for complex charts
  });

  test('should handle memory efficiently during long-running sessions', async ({ stagehand }) => {
    await stagehand.page.goto('/dashboard/live-calls');

    // Start long-running session monitoring
    await performanceMonitor.startMemoryLeakDetection(stagehand.page);

    // Simulate 8-hour clinical shift
    const testDuration = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
    const checkInterval = 30 * 60 * 1000; // Check every 30 minutes

    const startTime = Date.now();
    const memoryChecks = [];

    while (Date.now() - startTime < testDuration) {
      // Simulate typical clinical activities
      await stagehand.act({
        action: "review patient list and start monitoring calls",
        modelName: "gpt-4o"
      });

      await stagehand.page.waitForTimeout(checkInterval);

      // Check memory usage
      const memoryUsage = await stagehand.page.evaluate(() => {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          timestamp: Date.now()
        };
      });

      memoryChecks.push(memoryUsage);

      // Verify memory usage isn't continuously growing
      if (memoryChecks.length > 2) {
        const currentMemory = memoryChecks[memoryChecks.length - 1].usedJSHeapSize;
        const previousMemory = memoryChecks[memoryChecks.length - 3].usedJSHeapSize;
        const memoryGrowth = (currentMemory - previousMemory) / previousMemory;
        
        expect(memoryGrowth).toBeLessThan(0.1); // Less than 10% growth per hour
      }

      // Simulate switching between patients
      await stagehand.act({
        action: "switch to different patient monitoring view",
        modelName: "gpt-4o"
      });
    }

    // Final memory leak check
    const memoryLeaks = await performanceMonitor.detectMemoryLeaks();
    expect(memoryLeaks.length).toBe(0);
  });
});
```

## Test Data and Mocks

### Mock Patient Data

```typescript
// mocks/patient-data.ts
export const mockPatients = {
  maryJohnson: {
    id: 'patient-mary-johnson-001',
    name: 'Mary Johnson',
    dateOfBirth: '1952-03-15',
    medicalRecordNumber: 'MRN-789456',
    heartFailureClass: 'NYHA Class II',
    medications: ['Lisinopril 10mg', 'Metoprolol 25mg', 'Furosemide 20mg'],
    baselineBiomarkers: {
      jitter: 0.35,
      shimmer: 1.1,
      hnr: 16.2
    },
    riskFactors: ['Diabetes', 'Hypertension', 'Previous MI'],
    lastBNP: 245,
    phone: '+1-555-0123'
  },
  
  robertWilson: {
    id: 'patient-robert-wilson-002',
    name: 'Robert Wilson',
    dateOfBirth: '1948-11-22',
    medicalRecordNumber: 'MRN-654321',
    heartFailureClass: 'NYHA Class III',
    medications: ['Enalapril 5mg', 'Carvedilol 12.5mg', 'Furosemide 40mg', 'Spironolactone 25mg'],
    baselineBiomarkers: {
      jitter: 0.8,
      shimmer: 2.1,
      hnr: 12.5
    },
    riskFactors: ['Hypertension', 'Atrial Fibrillation', 'COPD'],
    lastBNP: 890,
    phone: '+1-555-0124'
  }
};

export const mockConversationTemplates = {
  routineCheckIn: [
    "Good morning! This is your HeartVoice assistant. How are you feeling today?",
    "Have you been taking your medications as prescribed?",
    "How has your energy level been this week?",
    "Have you noticed any swelling in your legs or feet?",
    "How well have you been sleeping?"
  ],
  
  symptomAssessment: [
    "I understand you're experiencing some symptoms. Can you tell me more about that?",
    "When did you first notice these symptoms?",
    "On a scale of 1 to 10, how would you rate your discomfort?",
    "Have you taken any medications for this today?",
    "Would you like me to connect you with a nurse?"
  ],
  
  emergencyScenarios: [
    "I'm having severe chest pain and can't breathe",
    "I feel like I want to hurt myself",
    "I'm so dizzy I can't stand up",
    "My heart is racing and won't slow down"
  ]
};
```

### Mock Voice Biomarker Generator

```typescript
// utils/biomarker-generator.ts
export class VoiceBiomarkerGenerator {
  generateRealisticBiomarkers(scenario: 'normal' | 'concerning' | 'critical'): VoiceBiomarkers {
    const baseValues = {
      normal: { jitter: 0.4, shimmer: 1.2, hnr: 15.8 },
      concerning: { jitter: 1.2, shimmer: 2.8, hnr: 11.2 },
      critical: { jitter: 2.1, shimmer: 3.8, hnr: 8.5 }
    };

    const base = baseValues[scenario];
    const variance = scenario === 'normal' ? 0.1 : 0.3;

    return {
      jitter: this.addNoise(base.jitter, variance),
      shimmer: this.addNoise(base.shimmer, variance),
      hnr: this.addNoise(base.hnr, variance),
      timestamp: new Date().toISOString(),
      confidence: Math.random() * 0.2 + 0.8 // 80-100% confidence
    };
  }

  private addNoise(value: number, variance: number): number {
    const noise = (Math.random() - 0.5) * variance * 2;
    return Math.max(0, value + noise);
  }

  generateTimeSeriesData(duration: number, scenario: 'normal' | 'concerning' | 'critical'): VoiceBiomarkers[] {
    const dataPoints = [];
    const interval = 1000; // 1 second intervals
    
    for (let i = 0; i < duration; i += interval) {
      dataPoints.push({
        ...this.generateRealisticBiomarkers(scenario),
        timestamp: new Date(Date.now() + i).toISOString()
      });
    }
    
    return dataPoints;
  }
}
```

## Test Execution Commands

```bash
# Install Stagehand dependencies
npm install @stagehand/core @stagehand/test

# Run all voice agent tests
npx stagehand test tests/voice-agent-*.spec.ts

# Run specific test suites
npx stagehand test tests/voice-agent-conversation-flow.spec.ts
npx stagehand test tests/emergency-escalation.spec.ts
npx stagehand test tests/hipaa-compliance.spec.ts

# Run tests with real-time monitoring
npx stagehand test --headed --debug tests/realtime-websocket-communication.spec.ts

# Run performance tests
npx stagehand test --timeout 600000 tests/performance-load-testing.spec.ts

# Generate test reports
npx stagehand test --reporter=html tests/

# Run tests in parallel
npx stagehand test --workers=4 tests/

# Run tests with mock services
MOCK_OPENAI=true MOCK_TWILIO=true npx stagehand test tests/
```

## Success Criteria

### Functional Test Coverage
- **Conversation Flow**: 95% of conversation scenarios pass
- **Voice Biomarkers**: 90% accuracy in biomarker detection
- **Emergency Escalation**: 100% of critical scenarios trigger appropriate responses
- **WebSocket Communication**: 99.5% connection reliability
- **HIPAA Compliance**: 100% compliance with audit and encryption requirements

### Performance Benchmarks
- **Page Load Time**: < 2 seconds for dashboard pages
- **WebSocket Latency**: < 300ms for real-time updates
- **Concurrent Users**: Support 100+ simultaneous calls
- **Memory Usage**: Stable memory usage over 8-hour sessions
- **Database Response**: < 100ms for patient data queries

### Clinical Workflow Metrics
- **Task Completion**: 95% success rate for clinical workflows
- **Escalation Response**: < 30 seconds from alert to clinical action
- **EHR Integration**: 99% data sync success rate
- **Multi-user Collaboration**: Seamless handoffs between clinical roles

### Accessibility and Compliance
- **WCAG AA**: 100% compliance with accessibility standards
- **Keyboard Navigation**: Full functionality via keyboard
- **Screen Reader**: Complete compatibility with assistive technologies
- **HIPAA Audit**: 100% of PHI access logged and encrypted

## Continuous Integration Integration

```yaml
# .github/workflows/stagehand-tests.yml
name: HeartVoice Monitor E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  voice-agent-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 60
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Start mock services
        run: |
          npm run start:mock-openai &
          npm run start:mock-twilio &
          
      - name: Run Stagehand tests
        run: npx stagehand test
        env:
          MOCK_OPENAI: true
          MOCK_TWILIO: true
          
      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: stagehand-test-results
          path: test-results/
          
      - name: Upload screenshots
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: stagehand-screenshots
          path: test-results/screenshots/
```

This comprehensive test specification provides complete coverage for the HeartVoice Monitor voice agent upgrade, ensuring robust testing of conversational AI interactions, clinical workflows, and HIPAA compliance requirements using Stagehand's AI-powered testing capabilities.