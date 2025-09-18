# HeartVoice Monitor Voice Agent Integration Architecture

**Project**: HeartVoice Monitor Voice Agent Upgrade  
**Date**: 2025-01-09  
**Version**: 1.0  
**Status**: Complete System Design Specification  

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture Overview](#system-architecture-overview)
3. [WebSocket Proxy Server Architecture](#websocket-proxy-server-architecture)
4. [Voice Biomarker Extraction Pipeline](#voice-biomarker-extraction-pipeline)
5. [Real-Time Conversation State Management](#real-time-conversation-state-management)
6. [API Route Specifications](#api-route-specifications)
7. [Frontend-Backend Data Flow](#frontend-backend-data-flow)
8. [Service Integration Patterns](#service-integration-patterns)
9. [Caching Strategy](#caching-strategy)
10. [Error Handling and Retry Patterns](#error-handling-and-retry-patterns)
11. [Session Management](#session-management)
12. [HIPAA Compliance Architecture](#hipaa-compliance-architecture)
13. [Implementation Roadmap](#implementation-roadmap)

## Executive Summary

This document defines the complete system integration architecture for upgrading the HeartVoice Monitor from basic Twilio TwiML to an advanced conversational AI platform using OpenAI Realtime API. The architecture prioritizes real-time performance, clinical safety, HIPAA compliance, and scalability while maintaining zero persistent audio storage.

### Key Architectural Decisions

- **Primary Integration**: OpenAI Realtime API with WebSocket-based proxy server
- **Fallback Solution**: ElevenLabs Conversational AI for redundancy
- **Voice Processing**: Real-time biomarker extraction during natural conversation
- **State Management**: Redis-based conversation state with WebSocket synchronization
- **Security**: End-to-end encryption with field-level PHI protection
- **Compliance**: Zero persistent audio storage with comprehensive audit logging

## System Architecture Overview

### High-Level Architecture Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   Patient       │    │    Twilio        │    │   WebSocket Proxy   │
│   Phone Call    │◄──►│  Media Streams   │◄──►│    Server           │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
                                                           │
                                               ┌───────────▼───────────┐
                                               │   OpenAI Realtime     │
                                               │       API             │
                                               └───────────┬───────────┘
                                                           │
┌─────────────────┐    ┌──────────────────┐    ┌─────────▼─────────────┐
│   Clinical      │    │   Next.js Web    │    │   Node.js API        │
│   Dashboard     │◄──►│   Application    │◄──►│    Backend          │
└─────────────────┘    └──────────────────┘    └─────────┬─────────────┘
                                                           │
┌─────────────────────────────────────────────────────────▼─────────────┐
│                      Data Layer                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ PostgreSQL  │  │    Redis    │  │  EHR FHIR    │  │  S3 Temp     │ │
│  │ Clinical DB │  │   Cache     │  │  Integration │  │  Audio Files │ │
│  └─────────────┘  └─────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Frontend Layer
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript 5+
- **UI Library**: shadcn/ui with Tailwind CSS
- **State Management**: Zustand with Redux DevTools
- **WebSocket Client**: native WebSocket with reconnection logic
- **Charts**: Recharts for biomarker visualizations

#### Backend Layer
- **API Server**: Node.js with Express/Fastify
- **WebSocket Proxy**: Custom Node.js WebSocket server
- **Language**: TypeScript with strict mode
- **Validation**: Zod for runtime type safety
- **Authentication**: NextAuth.js with RBAC

#### Data Layer
- **Primary Database**: PostgreSQL 15+ with JSONB support
- **Cache**: Redis 7+ with clustering
- **File Storage**: AWS S3 with lifecycle policies
- **Message Queue**: Redis Streams for async processing

## WebSocket Proxy Server Architecture

### Core Proxy Server Design

The WebSocket proxy server acts as the central orchestration layer, handling multiple concurrent connections and routing audio streams between Twilio Media Streams and OpenAI Realtime API.

```typescript
// Core WebSocket Proxy Server
interface ProxyServerConfig {
  port: number
  maxConnections: number
  reconnectAttempts: number
  heartbeatInterval: number
  audioSampleRate: number
  bufferSize: number
}

class VoiceProxyServer {
  private server: WebSocketServer
  private activeConnections: Map<string, ConnectionContext>
  private audioProcessor: AudioProcessor
  private biomarkerExtractor: VoiceBiomarkerExtractor
  
  constructor(config: ProxyServerConfig) {
    this.server = new WebSocketServer({ port: config.port })
    this.activeConnections = new Map()
    this.setupEventHandlers()
  }
  
  private setupEventHandlers(): void {
    this.server.on('connection', this.handleNewConnection.bind(this))
    this.server.on('error', this.handleServerError.bind(this))
    
    // Health monitoring
    setInterval(this.performHealthCheck.bind(this), 30000)
  }
  
  private async handleNewConnection(ws: WebSocket, req: IncomingMessage): Promise<void> {
    const callId = this.extractCallId(req)
    const connectionContext = await this.createConnectionContext(callId, ws)
    
    // Initialize dual WebSocket connections
    await this.initializeTwilioConnection(connectionContext)
    await this.initializeOpenAIConnection(connectionContext)
    
    this.activeConnections.set(callId, connectionContext)
    
    // Setup message routing
    this.setupMessageRouting(connectionContext)
    
    // Start biomarker extraction
    this.startBiomarkerExtraction(connectionContext)
  }
}
```

### Connection Context Management

```typescript
interface ConnectionContext {
  callId: string
  patientId: string
  twilioWs: WebSocket
  openaiWs: WebSocket
  frontendWs: WebSocket[]
  audioBuffer: CircularBuffer
  conversationState: ConversationState
  biomarkerProcessor: BiometricsProcessor
  startTime: Date
  lastActivity: Date
}

class ConnectionManager {
  private connections: Map<string, ConnectionContext>
  private redis: Redis
  
  async createConnectionContext(callId: string, ws: WebSocket): Promise<ConnectionContext> {
    // Validate call authorization
    const callDetails = await this.validateCallAuthorization(callId)
    
    // Initialize audio processing
    const audioBuffer = new CircularBuffer(1024)
    const biomarkerProcessor = new BiometricsProcessor({
      sampleRate: 8000,
      windowSize: 512,
      hopSize: 256
    })
    
    // Create conversation state
    const conversationState = await ConversationState.initialize(
      callId, 
      callDetails.patientId
    )
    
    return {
      callId,
      patientId: callDetails.patientId,
      twilioWs: null, // Will be initialized
      openaiWs: null,  // Will be initialized
      frontendWs: [],
      audioBuffer,
      conversationState,
      biomarkerProcessor,
      startTime: new Date(),
      lastActivity: new Date()
    }
  }
}
```

### Audio Stream Processing Pipeline

```typescript
interface AudioStreamProcessor {
  processIncomingAudio(audioData: Buffer, context: ConnectionContext): Promise<void>
  processOutgoingAudio(audioData: Buffer, context: ConnectionContext): Promise<void>
  extractBiomarkers(audioData: Buffer, speaker: 'patient' | 'ai'): Promise<VoiceBiomarker>
}

class AudioProcessor implements AudioStreamProcessor {
  private biomarkerExtractor: VoiceBiomarkerExtractor
  private audioFormat: AudioFormat
  
  async processIncomingAudio(audioData: Buffer, context: ConnectionContext): Promise<void> {
    // Convert Twilio mulaw to linear PCM
    const pcmData = this.convertMulawToPCM(audioData)
    
    // Buffer for biomarker analysis
    context.audioBuffer.write(pcmData, 'patient')
    
    // Forward to OpenAI (convert to base64)
    const base64Audio = pcmData.toString('base64')
    
    if (context.openaiWs?.readyState === WebSocket.OPEN) {
      context.openaiWs.send(JSON.stringify({
        type: 'input_audio_buffer.append',
        audio: base64Audio
      }))
    }
    
    // Extract biomarkers if enough data
    if (context.audioBuffer.getPatientDataLength() >= this.audioFormat.minAnalysisLength) {
      await this.extractAndBroadcastBiomarkers(context, 'patient')
    }
  }
  
  async processOutgoingAudio(audioData: Buffer, context: ConnectionContext): Promise<void> {
    // Process OpenAI response audio
    const pcmData = Buffer.from(audioData, 'base64')
    
    // Buffer for analysis
    context.audioBuffer.write(pcmData, 'ai')
    
    // Convert to mulaw for Twilio
    const mulawData = this.convertPCMToMulaw(pcmData)
    
    // Send to Twilio
    if (context.twilioWs?.readyState === WebSocket.OPEN) {
      context.twilioWs.send(JSON.stringify({
        event: 'media',
        media: {
          payload: mulawData.toString('base64')
        }
      }))
    }
  }
  
  private async extractAndBroadcastBiomarkers(
    context: ConnectionContext, 
    speaker: 'patient' | 'ai'
  ): Promise<void> {
    const audioSegment = context.audioBuffer.getLatestSegment(speaker, 2048)
    const biomarkers = await context.biomarkerProcessor.analyze(audioSegment)
    
    // Broadcast to frontend clients
    const biomarkerUpdate = {
      type: 'biomarker_update',
      callId: context.callId,
      speaker,
      biomarkers,
      timestamp: new Date().toISOString()
    }
    
    context.frontendWs.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(biomarkerUpdate))
      }
    })
    
    // Store in Redis for persistence
    await this.redis.lpush(
      `biomarkers:${context.callId}`, 
      JSON.stringify(biomarkerUpdate)
    )
  }
}
```

## Voice Biomarker Extraction Pipeline

### Real-Time Biomarker Processing

```typescript
interface VoiceBiomarker {
  timestamp: Date
  speaker: 'patient' | 'ai'
  metrics: {
    jitter: number        // Fundamental frequency variation (%)
    shimmer: number       // Amplitude variation (%)
    hnr: number          // Harmonics-to-noise ratio (dB)
    f0Mean: number       // Mean fundamental frequency (Hz)
    f0Std: number        // F0 standard deviation (Hz)
    voiceBreaks: number  // Number of voice breaks
    speakingRate: number // Words per minute
  }
  clinical: {
    nyhaClassification: number  // Predicted NYHA class (1-4)
    decompensationRisk: number  // Risk score (0-100)
    congestionIndicator: number // Pulmonary congestion (0-100)
  }
}

class VoiceBiomarkerExtractor {
  private audioAnalyzer: AudioAnalyzer
  private clinicalCorrelator: ClinicalCorrelator
  
  async analyzeBiomarkers(audioSegment: Float32Array): Promise<VoiceBiomarker> {
    // Core acoustic analysis
    const acousticFeatures = await this.extractAcousticFeatures(audioSegment)
    
    // Clinical correlation
    const clinicalMetrics = await this.correlateClinicalMetrics(acousticFeatures)
    
    return {
      timestamp: new Date(),
      speaker: 'patient', // Determined by VAD
      metrics: acousticFeatures,
      clinical: clinicalMetrics
    }
  }
  
  private async extractAcousticFeatures(audio: Float32Array): Promise<AcousticMetrics> {
    // Fundamental frequency analysis
    const f0Analysis = this.computeFundamentalFrequency(audio)
    
    // Jitter calculation (period-to-period F0 variation)
    const jitter = this.computeJitter(f0Analysis.periods)
    
    // Shimmer calculation (amplitude variation)
    const shimmer = this.computeShimmer(audio, f0Analysis.periods)
    
    // Harmonics-to-noise ratio
    const hnr = this.computeHNR(audio, f0Analysis.f0)
    
    // Voice quality metrics
    const voiceBreaks = this.detectVoiceBreaks(f0Analysis)
    const speakingRate = this.estimateSpeakingRate(audio)
    
    return {
      jitter: jitter * 100, // Convert to percentage
      shimmer: shimmer * 100,
      hnr,
      f0Mean: f0Analysis.mean,
      f0Std: f0Analysis.std,
      voiceBreaks,
      speakingRate
    }
  }
  
  private async correlateClinicalMetrics(
    acousticFeatures: AcousticMetrics
  ): Promise<ClinicalMetrics> {
    // Research-based correlations from clinical studies
    
    // NYHA class prediction (based on 2024 clinical validation)
    const nyhaClassification = this.predictNYHAClass(acousticFeatures)
    
    // Decompensation risk (shimmer + jitter correlation)
    const decompensationRisk = this.calculateDecompensationRisk(acousticFeatures)
    
    // Pulmonary congestion (HNR + voice breaks correlation)
    const congestionIndicator = this.assessCongestionLevel(acousticFeatures)
    
    return {
      nyhaClassification,
      decompensationRisk,
      congestionIndicator
    }
  }
  
  private predictNYHAClass(metrics: AcousticMetrics): number {
    // Machine learning model based on clinical research
    // Correlates voice metrics with NYHA functional classification
    
    const features = [
      metrics.jitter,
      metrics.shimmer, 
      metrics.hnr,
      metrics.f0Std,
      metrics.voiceBreaks
    ]
    
    // Simplified linear regression (replace with trained model)
    const nyhaScore = features.reduce((sum, feature, index) => {
      const weights = [0.3, 0.4, -0.2, 0.2, 0.3] // Research-derived weights
      return sum + (feature * weights[index])
    }, 1.0)
    
    return Math.max(1, Math.min(4, Math.round(nyhaScore)))
  }
}
```

### Biomarker Validation and Clinical Alerts

```typescript
interface ClinicalThresholds {
  jitter: { normal: number, warning: number, critical: number }
  shimmer: { normal: number, warning: number, critical: number }
  hnr: { normal: number, warning: number, critical: number }
  decompensation: { low: number, moderate: number, high: number }
}

class ClinicalAlertManager {
  private thresholds: ClinicalThresholds = {
    jitter: { normal: 0.5, warning: 1.0, critical: 1.5 },
    shimmer: { normal: 1.5, warning: 2.5, critical: 3.5 },
    hnr: { normal: 15, warning: 12, critical: 10 },
    decompensation: { low: 30, moderate: 60, high: 80 }
  }
  
  async evaluateBiomarkers(biomarker: VoiceBiomarker): Promise<ClinicalAlert[]> {
    const alerts: ClinicalAlert[] = []
    
    // Evaluate each metric against thresholds
    if (biomarker.metrics.jitter > this.thresholds.jitter.critical) {
      alerts.push({
        type: 'voice_quality_critical',
        metric: 'jitter',
        value: biomarker.metrics.jitter,
        severity: 'critical',
        message: 'Severe voice instability detected - potential decompensation',
        recommendedAction: 'immediate_clinical_review'
      })
    }
    
    if (biomarker.clinical.decompensationRisk > this.thresholds.decompensation.high) {
      alerts.push({
        type: 'decompensation_risk',
        metric: 'risk_score',
        value: biomarker.clinical.decompensationRisk,
        severity: 'high',
        message: 'High risk of cardiac decompensation detected',
        recommendedAction: 'escalate_to_clinician'
      })
    }
    
    return alerts
  }
  
  async broadcastClinicalAlert(alert: ClinicalAlert, callId: string): Promise<void> {
    // Broadcast to all connected frontend clients
    const alertMessage = {
      type: 'clinical_alert',
      callId,
      alert,
      timestamp: new Date().toISOString()
    }
    
    // Send to frontend via WebSocket
    await this.broadcastToFrontend(alertMessage)
    
    // Log to audit trail
    await this.logClinicalAlert(alert, callId)
    
    // Trigger notification workflow
    await this.triggerNotificationWorkflow(alert, callId)
  }
}
```

## Real-Time Conversation State Management

### Conversation State Architecture

```typescript
interface ConversationState {
  callId: string
  patientId: string
  status: 'initializing' | 'active' | 'paused' | 'completed' | 'error'
  participants: {
    patient: ParticipantState
    ai: ParticipantState
  }
  conversation: {
    transcript: TranscriptMessage[]
    context: ConversationContext
    intent: ConversationIntent
    sentiment: SentimentAnalysis
  }
  biomarkers: VoiceBiomarker[]
  metadata: ConversationMetadata
}

class ConversationStateManager {
  private redis: Redis
  private websocketManager: WebSocketManager
  
  async updateConversationState(
    callId: string, 
    update: Partial<ConversationState>
  ): Promise<void> {
    // Atomic state update
    const currentState = await this.getConversationState(callId)
    const newState = { ...currentState, ...update }
    
    // Validate state transition
    this.validateStateTransition(currentState.status, newState.status)
    
    // Store in Redis with expiration
    await this.redis.setex(
      `conversation:${callId}`, 
      3600, // 1 hour TTL
      JSON.stringify(newState)
    )
    
    // Broadcast update to frontend clients
    await this.broadcastStateUpdate(callId, update)
    
    // Trigger state change handlers
    await this.handleStateChange(callId, currentState.status, newState.status)
  }
  
  private async broadcastStateUpdate(
    callId: string, 
    update: Partial<ConversationState>
  ): Promise<void> {
    const message = {
      type: 'conversation_state_update',
      callId,
      update,
      timestamp: new Date().toISOString()
    }
    
    // Broadcast to all connected clients monitoring this call
    await this.websocketManager.broadcastToCallMonitors(callId, message)
  }
  
  async addTranscriptMessage(
    callId: string, 
    message: TranscriptMessage
  ): Promise<void> {
    // Real-time transcript update
    const transcriptUpdate = {
      type: 'transcript_update',
      callId,
      message,
      timestamp: new Date().toISOString()
    }
    
    // Update state
    await this.updateConversationState(callId, {
      conversation: {
        transcript: await this.appendToTranscript(callId, message)
      }
    })
    
    // Broadcast immediately to frontend
    await this.websocketManager.broadcastToCallMonitors(callId, transcriptUpdate)
    
    // Analyze sentiment and intent
    await this.analyzeSentimentAndIntent(callId, message)
  }
}
```

### Real-Time Frontend Synchronization

```typescript
// Frontend WebSocket hook for conversation monitoring
function useConversationStream(callId: string) {
  const [conversationState, setConversationState] = useState<ConversationState>()
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([])
  const [biomarkers, setBiomarkers] = useState<VoiceBiomarker[]>([])
  const [alerts, setAlerts] = useState<ClinicalAlert[]>([])
  
  useEffect(() => {
    const ws = new WebSocket(`${WS_BASE_URL}/conversation/${callId}`)
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      switch (data.type) {
        case 'conversation_state_update':
          setConversationState(prev => ({ ...prev, ...data.update }))
          break
          
        case 'transcript_update':
          setTranscript(prev => [...prev, data.message])
          break
          
        case 'biomarker_update':
          setBiomarkers(prev => [...prev.slice(-50), data.biomarkers]) // Keep last 50
          break
          
        case 'clinical_alert':
          setAlerts(prev => [data.alert, ...prev])
          // Show toast notification
          toast.error(data.alert.message)
          break
      }
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      // Implement exponential backoff reconnection
      setTimeout(() => {
        // Reconnect logic
      }, Math.min(1000 * Math.pow(2, retryCount), 30000))
    }
    
    return () => ws.close()
  }, [callId])
  
  return { conversationState, transcript, biomarkers, alerts }
}
```

## API Route Specifications

### Core API Endpoints

#### 1. `/api/voice-realtime` - WebSocket Proxy Management

```typescript
// POST /api/voice-realtime/initiate
interface InitiateVoiceCallRequest {
  patientId: string
  phoneNumber: string
  conversationTemplate?: string
  scheduledTime?: Date
}

interface InitiateVoiceCallResponse {
  callId: string
  twilioCallSid: string
  websocketUrl: string
  estimatedDuration: number
}

// GET /api/voice-realtime/status/:callId
interface CallStatusResponse {
  callId: string
  status: 'queued' | 'ringing' | 'active' | 'completed' | 'failed'
  duration: number
  participantCount: number
  biomarkerMetrics: BiometricSummary
}

// WebSocket /api/voice-realtime/stream/:callId
interface WebSocketMessage {
  type: 'transcript_update' | 'biomarker_update' | 'state_change' | 'alert'
  callId: string
  data: any
  timestamp: string
}
```

#### 2. `/api/conversation-monitor` - Real-Time Monitoring

```typescript
// GET /api/conversation-monitor/active
interface ActiveConversationsResponse {
  conversations: ActiveConversation[]
  totalActive: number
  systemHealth: SystemHealth
}

interface ActiveConversation {
  callId: string
  patientId: string
  patientName: string
  duration: number
  status: ConversationStatus
  lastActivity: Date
  alertLevel: 'none' | 'warning' | 'critical'
}

// POST /api/conversation-monitor/intervention/:callId
interface InterventionRequest {
  type: 'join_call' | 'end_call' | 'escalate' | 'add_note'
  data: {
    clinicianId?: string
    notes?: string
    escalationLevel?: 'nurse' | 'physician' | 'emergency'
  }
}

// GET /api/conversation-monitor/transcript/:callId
interface TranscriptResponse {
  callId: string
  messages: TranscriptMessage[]
  biomarkers: VoiceBiomarker[]
  summary: ConversationSummary
}
```

#### 3. `/api/voice-config` - Agent Configuration

```typescript
// GET /api/voice-config/agents
interface VoiceAgentsResponse {
  agents: VoiceAgent[]
  templates: ConversationTemplate[]
  activeDeployments: AgentDeployment[]
}

// POST /api/voice-config/agents
interface CreateVoiceAgentRequest {
  name: string
  personality: PersonalityConfig
  conversationFlow: ConversationNode[]
  knowledgeBase: KnowledgeItem[]
  functions: FunctionDefinition[]
}

// PUT /api/voice-config/agents/:agentId/deploy
interface DeployAgentRequest {
  patientGroups: string[]
  schedule: ScheduleConfig
  fallbackAgent?: string
  testMode?: boolean
}

interface PersonalityConfig {
  tone: 'professional' | 'warm' | 'empathetic'
  speakingPace: 'slow' | 'moderate' | 'fast'
  empathyLevel: 1 | 2 | 3 | 4 | 5
  responseStyle: {
    usePatientName: boolean
    askFollowUpQuestions: boolean
    acknowledgeEmotions: boolean
    useMedicalTerminology: boolean
  }
  crisisDetection: {
    suicideRiskKeywords: boolean
    emergencySymptoms: boolean
    escalationTriggers: string[]
  }
}
```

### API Route Implementation

```typescript
// /api/voice-realtime/initiate
export async function POST(request: NextRequest) {
  try {
    const { patientId, phoneNumber, conversationTemplate } = await request.json()
    
    // Validate patient authorization
    const patient = await validatePatientAccess(patientId)
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }
    
    // Generate unique call ID
    const callId = generateCallId()
    
    // Initialize Twilio call
    const twilioCall = await twilioClient.calls.create({
      to: phoneNumber,
      from: TWILIO_PHONE_NUMBER,
      url: `${BASE_URL}/api/twilio/voice-handler`,
      statusCallback: `${BASE_URL}/api/twilio/status-callback`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      record: false, // No recording for HIPAA compliance
      timeout: 30
    })
    
    // Initialize conversation state
    await conversationStateManager.initializeCall(callId, {
      patientId,
      phoneNumber,
      twilioCallSid: twilioCall.sid,
      template: conversationTemplate,
      startTime: new Date()
    })
    
    // Prepare WebSocket URL
    const websocketUrl = `wss://${HOST}/api/voice-realtime/stream/${callId}`
    
    return NextResponse.json({
      callId,
      twilioCallSid: twilioCall.sid,
      websocketUrl,
      estimatedDuration: 300 // 5 minutes
    })
    
  } catch (error) {
    console.error('Error initiating voice call:', error)
    return NextResponse.json({ error: 'Failed to initiate call' }, { status: 500 })
  }
}

// WebSocket handler for real-time streaming
export class ConversationWebSocketHandler {
  private connections: Map<string, Set<WebSocket>> = new Map()
  
  handleConnection(ws: WebSocket, callId: string, userId: string) {
    // Validate user authorization for this call
    const hasAccess = this.validateCallAccess(callId, userId)
    if (!hasAccess) {
      ws.close(4401, 'Unauthorized')
      return
    }
    
    // Add to connections
    if (!this.connections.has(callId)) {
      this.connections.set(callId, new Set())
    }
    this.connections.get(callId)!.add(ws)
    
    // Send initial state
    this.sendInitialState(ws, callId)
    
    // Handle disconnection
    ws.on('close', () => {
      this.connections.get(callId)?.delete(ws)
    })
  }
  
  broadcastToCall(callId: string, message: any) {
    const connections = this.connections.get(callId)
    if (connections) {
      connections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(message))
        }
      })
    }
  }
}
```

## Frontend-Backend Data Flow

### Real-Time Data Flow Architecture

```
Frontend Components
        │
        ▼
┌─────────────────┐
│   WebSocket     │
│   Connection    │
│   Manager       │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js API   │◄──►│  Conversation    │◄──►│   WebSocket     │
│   Routes        │    │  State Manager   │    │   Proxy Server  │
└─────────┬───────┘    └──────────────────┘    └─────────────────┘
          │                       │                       │
          ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │     Redis        │    │   OpenAI        │
│   Clinical DB   │    │     Cache        │    │   Realtime API  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Frontend State Management

```typescript
// Zustand store for conversation management
interface ConversationStore {
  // State
  activeCalls: Map<string, ConversationState>
  selectedCall: string | null
  connectionStatus: 'connected' | 'connecting' | 'disconnected'
  
  // Actions
  addActiveCall: (call: ConversationState) => void
  updateCallState: (callId: string, update: Partial<ConversationState>) => void
  removeActiveCall: (callId: string) => void
  selectCall: (callId: string) => void
  
  // WebSocket management
  connectToCall: (callId: string) => Promise<void>
  disconnectFromCall: (callId: string) => void
  sendInterventionMessage: (callId: string, message: InterventionMessage) => void
}

const useConversationStore = create<ConversationStore>((set, get) => ({
  activeCalls: new Map(),
  selectedCall: null,
  connectionStatus: 'disconnected',
  
  addActiveCall: (call) => set((state) => {
    const newActiveCalls = new Map(state.activeCalls)
    newActiveCalls.set(call.callId, call)
    return { activeCalls: newActiveCalls }
  }),
  
  updateCallState: (callId, update) => set((state) => {
    const newActiveCalls = new Map(state.activeCalls)
    const existingCall = newActiveCalls.get(callId)
    if (existingCall) {
      newActiveCalls.set(callId, { ...existingCall, ...update })
    }
    return { activeCalls: newActiveCalls }
  }),
  
  connectToCall: async (callId) => {
    const websocketManager = WebSocketManager.getInstance()
    await websocketManager.connect(callId, {
      onMessage: (message) => {
        // Handle real-time updates
        switch (message.type) {
          case 'transcript_update':
            get().updateCallState(callId, {
              conversation: {
                transcript: [...existingTranscript, message.data]
              }
            })
            break
            
          case 'biomarker_update':
            get().updateCallState(callId, {
              biomarkers: [...existingBiomarkers, message.data]
            })
            break
        }
      }
    })
    
    set({ connectionStatus: 'connected' })
  }
}))
```

### Real-Time Component Integration

```typescript
// Real-time conversation monitor component
function ConversationMonitor({ callId }: { callId: string }) {
  const { conversationState, transcript, biomarkers } = useConversationStream(callId)
  const { sendInterventionMessage } = useConversationStore()
  
  // Auto-scroll transcript
  const transcriptRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [transcript])
  
  // Handle clinical interventions
  const handleIntervention = async (type: InterventionType) => {
    switch (type) {
      case 'join_call':
        await sendInterventionMessage(callId, {
          type: 'join_call',
          clinicianId: currentUser.id
        })
        break
        
      case 'escalate':
        await sendInterventionMessage(callId, {
          type: 'escalate',
          escalationLevel: 'physician',
          reason: 'Voice biomarker anomaly detected'
        })
        break
    }
  }
  
  return (
    <div className="conversation-monitor">
      <ConversationHeader 
        patient={conversationState?.patient}
        status={conversationState?.status}
        duration={conversationState?.duration}
      />
      
      <div className="monitor-content">
        <div className="transcript-panel" ref={transcriptRef}>
          <TranscriptDisplay messages={transcript} />
        </div>
        
        <div className="biomarkers-panel">
          <VoiceBiomarkerCharts biomarkers={biomarkers} />
        </div>
      </div>
      
      <InterventionPanel 
        onIntervention={handleIntervention}
        alertLevel={conversationState?.alertLevel}
      />
    </div>
  )
}

// Voice biomarker visualization component
function VoiceBiomarkerCharts({ biomarkers }: { biomarkers: VoiceBiomarker[] }) {
  const realtimeData = useMemo(() => {
    return biomarkers.slice(-50).map(b => ({
      timestamp: b.timestamp,
      jitter: b.metrics.jitter,
      shimmer: b.metrics.shimmer,
      hnr: b.metrics.hnr,
      clinicalRisk: b.clinical.decompensationRisk
    }))
  }, [biomarkers])
  
  return (
    <div className="biomarker-charts">
      <div className="chart-grid">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={realtimeData}>
            <XAxis dataKey="timestamp" />
            <YAxis domain={[0, 2]} />
            <Line dataKey="jitter" stroke="#008B8B" strokeWidth={2} />
            <ReferenceLine y={1.0} stroke="#FFA500" strokeDasharray="5 5" />
            <ReferenceLine y={1.5} stroke="#DC3545" strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
        
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={realtimeData}>
            <XAxis dataKey="timestamp" />
            <YAxis domain={[0, 100]} />
            <Line dataKey="clinicalRisk" stroke="#DC3545" strokeWidth={2} />
            <ReferenceLine y={60} stroke="#FFA500" strokeDasharray="5 5" />
            <ReferenceLine y={80} stroke="#DC3545" strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
```

## Service Integration Patterns

### OpenAI Realtime API Integration

```typescript
interface OpenAIRealtimeConfig {
  model: 'gpt-4o-realtime-preview'
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
  instructions: string
  input_audio_format: 'pcm16' | 'g711_ulaw' | 'g711_alaw'
  output_audio_format: 'pcm16' | 'g711_ulaw' | 'g711_alaw'
  input_audio_transcription: {
    model: 'whisper-1'
  }
  turn_detection: {
    type: 'server_vad'
    threshold: 0.5
    prefix_padding_ms: 300
    silence_duration_ms: 500
  }
  functions: FunctionDefinition[]
}

class OpenAIRealtimeService {
  private ws: WebSocket
  private config: OpenAIRealtimeConfig
  private audioBuffer: AudioBuffer
  
  async connect(callId: string, patientContext: PatientContext): Promise<void> {
    const wsUrl = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01'
    
    this.ws = new WebSocket(wsUrl, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'realtime=v1'
      }
    })
    
    this.ws.on('open', () => {
      // Configure the session
      this.configureSession(callId, patientContext)
    })
    
    this.ws.on('message', (data) => {
      this.handleRealtimeMessage(JSON.parse(data.toString()))
    })
  }
  
  private configureSession(callId: string, patientContext: PatientContext): void {
    const instructions = this.generatePatientSpecificInstructions(patientContext)
    
    const sessionUpdate = {
      type: 'session.update',
      session: {
        model: 'gpt-4o-realtime-preview',
        instructions,
        voice: 'nova', // Warm, empathetic voice
        input_audio_format: 'g711_ulaw', // Twilio format
        output_audio_format: 'g711_ulaw',
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 800 // Allow for slower speech
        },
        functions: this.getHeartFailureFunctions()
      }
    }
    
    this.ws.send(JSON.stringify(sessionUpdate))
  }
  
  private generatePatientSpecificInstructions(context: PatientContext): string {
    return `You are a caring health assistant conducting a routine check-in with ${context.firstName}, a heart failure patient.

**Patient Context:**
- Name: ${context.firstName} ${context.lastName}
- NYHA Class: ${context.nyhaClass}
- Current medications: ${context.medications.join(', ')}
- Last visit: ${context.lastVisit}
- Known concerns: ${context.concerns.join(', ')}

**Conversation Guidelines:**
1. Start with a warm, personalized greeting using their name
2. Ask about their general well-being before medical questions
3. Inquire about heart failure symptoms: shortness of breath, swelling, fatigue, chest pain
4. Check medication adherence and side effects
5. Ask about weight changes and dietary habits
6. Monitor for depression or anxiety
7. End with encouragement and next steps

**Important Safety Rules:**
- If they report emergency symptoms (severe chest pain, extreme shortness of breath), immediately use the escalate_emergency function
- If they mention suicidal thoughts, use the crisis_intervention function
- Speak slowly and clearly, allowing time for responses
- Be empathetic and acknowledge their concerns
- Use simple, non-medical language

Your goal is to have a natural, caring conversation while gathering important health information.`
  }
  
  private getHeartFailureFunctions(): FunctionDefinition[] {
    return [
      {
        name: 'record_symptom_assessment',
        description: 'Record patient-reported symptoms and severity',
        parameters: {
          type: 'object',
          properties: {
            symptoms: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of reported symptoms'
            },
            severity: {
              type: 'string',
              enum: ['mild', 'moderate', 'severe'],
              description: 'Overall symptom severity'
            },
            changes: {
              type: 'string',
              description: 'Any changes since last assessment'
            }
          },
          required: ['symptoms', 'severity']
        }
      },
      {
        name: 'escalate_emergency',
        description: 'Escalate to emergency services for critical symptoms',
        parameters: {
          type: 'object',
          properties: {
            symptoms: {
              type: 'array',
              items: { type: 'string' }
            },
            urgency: {
              type: 'string',
              enum: ['high', 'critical']
            }
          },
          required: ['symptoms', 'urgency']
        }
      },
      {
        name: 'schedule_followup',
        description: 'Schedule follow-up appointment or call',
        parameters: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['call', 'appointment', 'urgent_visit']
            },
            timeframe: {
              type: 'string',
              description: 'When the follow-up should occur'
            },
            reason: {
              type: 'string',
              description: 'Reason for follow-up'
            }
          },
          required: ['type', 'timeframe']
        }
      }
    ]
  }
}
```

### ElevenLabs Fallback Integration

```typescript
class ElevenLabsFallbackService {
  private conversationId: string
  private agentId: string
  
  async initializeFallback(callId: string, patientContext: PatientContext): Promise<void> {
    // Create conversational AI agent
    const agent = await this.createCustomAgent(patientContext)
    this.agentId = agent.agent_id
    
    // Start conversation
    const conversation = await this.startConversation(agent.agent_id)
    this.conversationId = conversation.conversation_id
    
    // Connect to Twilio
    await this.connectToTwilio(callId)
  }
  
  private async createCustomAgent(context: PatientContext): Promise<any> {
    const response = await fetch('https://api.elevenlabs.io/v1/convai/agents', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: `HeartVoice Assistant for ${context.firstName}`,
        prompt: this.generateElevenLabsPrompt(context),
        voice: {
          voice_id: 'nova', // Warm, empathetic voice
          stability: 0.7,
          similarity_boost: 0.8
        },
        language: 'en',
        conversation_config: {
          turn_detection: {
            silence_duration_ms: 800
          }
        }
      })
    })
    
    return response.json()
  }
  
  private generateElevenLabsPrompt(context: PatientContext): string {
    return `You are conducting a heart failure check-in with ${context.firstName}.
    
Patient Information:
- NYHA Class: ${context.nyhaClass}
- Medications: ${context.medications.join(', ')}
- Last visit: ${context.lastVisit}

Check for: shortness of breath, swelling, weight changes, medication adherence, mood.
Be warm, empathetic, and speak slowly. If emergency symptoms, say "I need to connect you with a nurse right away."`
  }
}
```

## Caching Strategy

### Multi-Level Caching Architecture

```typescript
interface CacheConfig {
  redis: {
    host: string
    port: number
    password: string
    db: number
    ttl: {
      conversationState: number    // 1 hour
      biomarkerData: number       // 30 minutes
      patientContext: number      // 4 hours
      agentConfiguration: number  // 24 hours
    }
  }
  memory: {
    maxSize: number              // 100MB
    ttl: number                 // 5 minutes
  }
}

class CacheManager {
  private redis: Redis
  private memoryCache: LRUCache<string, any>
  
  constructor(config: CacheConfig) {
    this.redis = new Redis(config.redis)
    this.memoryCache = new LRU({
      max: config.memory.maxSize,
      ttl: config.memory.ttl * 1000
    })
  }
  
  // Conversation state caching
  async getConversationState(callId: string): Promise<ConversationState | null> {
    // Try memory cache first (fastest)
    const memoryKey = `conv:${callId}`
    let state = this.memoryCache.get(memoryKey)
    
    if (!state) {
      // Try Redis cache
      const redisKey = `conversation:${callId}`
      const cached = await this.redis.get(redisKey)
      
      if (cached) {
        state = JSON.parse(cached)
        // Store in memory for next access
        this.memoryCache.set(memoryKey, state)
      }
    }
    
    return state
  }
  
  async setConversationState(
    callId: string, 
    state: ConversationState
  ): Promise<void> {
    const memoryKey = `conv:${callId}`
    const redisKey = `conversation:${callId}`
    
    // Update both caches
    this.memoryCache.set(memoryKey, state)
    await this.redis.setex(
      redisKey, 
      this.config.redis.ttl.conversationState, 
      JSON.stringify(state)
    )
  }
  
  // Biomarker data caching with time-series optimization
  async cacheBiomarkerData(
    callId: string, 
    biomarker: VoiceBiomarker
  ): Promise<void> {
    const key = `biomarkers:${callId}`
    
    // Use Redis streams for time-series data
    await this.redis.xadd(
      key,
      '*',
      'timestamp', biomarker.timestamp.toISOString(),
      'speaker', biomarker.speaker,
      'jitter', biomarker.metrics.jitter,
      'shimmer', biomarker.metrics.shimmer,
      'hnr', biomarker.metrics.hnr,
      'clinical_risk', biomarker.clinical.decompensationRisk
    )
    
    // Expire after 30 minutes
    await this.redis.expire(key, this.config.redis.ttl.biomarkerData)
  }
  
  async getBiomarkerHistory(
    callId: string, 
    count: number = 50
  ): Promise<VoiceBiomarker[]> {
    const key = `biomarkers:${callId}`
    
    // Read latest entries from stream
    const entries = await this.redis.xrevrange(key, '+', '-', 'COUNT', count)
    
    return entries.map(entry => ({
      timestamp: new Date(entry[1][1] as string),
      speaker: entry[1][3] as 'patient' | 'ai',
      metrics: {
        jitter: parseFloat(entry[1][5] as string),
        shimmer: parseFloat(entry[1][7] as string),
        hnr: parseFloat(entry[1][9] as string)
      },
      clinical: {
        decompensationRisk: parseFloat(entry[1][11] as string)
      }
    }))
  }
  
  // Cache invalidation strategies
  async invalidateCallCache(callId: string): Promise<void> {
    // Remove from memory cache
    const memoryKeys = [`conv:${callId}`, `patient:${callId}`, `agent:${callId}`]
    memoryKeys.forEach(key => this.memoryCache.delete(key))
    
    // Remove from Redis
    const redisKeys = [
      `conversation:${callId}`,
      `biomarkers:${callId}`,
      `transcript:${callId}`
    ]
    
    await this.redis.del(...redisKeys)
  }
  
  // Warm cache for scheduled calls
  async warmCache(scheduledCalls: ScheduledCall[]): Promise<void> {
    const warmPromises = scheduledCalls.map(async (call) => {
      // Pre-load patient context
      const patientContext = await this.getPatientContext(call.patientId)
      await this.cachePatientContext(call.patientId, patientContext)
      
      // Pre-load agent configuration
      const agentConfig = await this.getAgentConfiguration(call.agentId)
      await this.cacheAgentConfiguration(call.agentId, agentConfig)
    })
    
    await Promise.all(warmPromises)
  }
}
```

### Cache Coordination with WebSocket Updates

```typescript
class CacheCoordinator {
  private cacheManager: CacheManager
  private websocketManager: WebSocketManager
  
  async updateAndBroadcast(
    callId: string, 
    updateType: 'state' | 'transcript' | 'biomarker',
    data: any
  ): Promise<void> {
    // Update cache first
    await this.updateCache(callId, updateType, data)
    
    // Then broadcast to connected clients
    await this.websocketManager.broadcastToCallMonitors(callId, {
      type: `${updateType}_update`,
      callId,
      data,
      timestamp: new Date().toISOString()
    })
  }
  
  private async updateCache(
    callId: string, 
    updateType: string, 
    data: any
  ): Promise<void> {
    switch (updateType) {
      case 'state':
        await this.cacheManager.setConversationState(callId, data)
        break
        
      case 'transcript':
        await this.cacheManager.appendTranscriptMessage(callId, data)
        break
        
      case 'biomarker':
        await this.cacheManager.cacheBiomarkerData(callId, data)
        break
    }
  }
}
```

## Error Handling and Retry Patterns

### Comprehensive Error Handling Strategy

```typescript
interface ErrorContext {
  callId: string
  component: 'websocket' | 'openai' | 'twilio' | 'database' | 'cache'
  operation: string
  error: Error
  retryCount: number
  timestamp: Date
}

class ErrorManager {
  private maxRetries = 3
  private backoffMultiplier = 2
  private baseDelay = 1000
  
  async handleError(context: ErrorContext): Promise<boolean> {
    // Log error for monitoring
    await this.logError(context)
    
    // Determine if error is retryable
    if (!this.isRetryableError(context.error)) {
      await this.escalateError(context)
      return false
    }
    
    // Check retry limits
    if (context.retryCount >= this.maxRetries) {
      await this.escalateError(context)
      return false
    }
    
    // Calculate backoff delay
    const delay = this.calculateBackoffDelay(context.retryCount)
    
    // Wait before retry
    await this.delay(delay)
    
    return true // Indicate retry should be attempted
  }
  
  private isRetryableError(error: Error): boolean {
    // Network errors are generally retryable
    if (error.message.includes('ECONNRESET') || 
        error.message.includes('timeout')) {
      return true
    }
    
    // WebSocket errors
    if (error.name === 'WebSocketError') {
      return true
    }
    
    // OpenAI rate limits
    if (error.message.includes('rate_limit_exceeded')) {
      return true
    }
    
    // Authentication errors are not retryable
    if (error.message.includes('unauthorized') || 
        error.message.includes('authentication')) {
      return false
    }
    
    return false
  }
  
  private calculateBackoffDelay(retryCount: number): number {
    return this.baseDelay * Math.pow(this.backoffMultiplier, retryCount)
  }
  
  private async escalateError(context: ErrorContext): Promise<void> {
    // Critical errors require immediate attention
    if (this.isCriticalError(context)) {
      await this.triggerEmergencyAlert(context)
    }
    
    // Activate fallback systems
    await this.activateFallback(context)
    
    // Notify monitoring systems
    await this.notifyMonitoring(context)
  }
  
  private async activateFallback(context: ErrorContext): Promise<void> {
    switch (context.component) {
      case 'openai':
        // Switch to ElevenLabs fallback
        await this.activateElevenLabsFallback(context.callId)
        break
        
      case 'websocket':
        // Attempt reconnection with circuit breaker
        await this.reconnectWithCircuitBreaker(context.callId)
        break
        
      case 'database':
        // Use cache-only mode temporarily
        await this.enableCacheOnlyMode(context.callId)
        break
    }
  }
}
```

### WebSocket Connection Resilience

```typescript
class ResilientWebSocket {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private reconnectDelay = 1000
  private heartbeatInterval: NodeJS.Timeout | null = null
  private messageQueue: any[] = []
  
  constructor(url: string, private options: WebSocketOptions) {
    this.url = url
    this.connect()
  }
  
  private async connect(): Promise<void> {
    try {
      this.ws = new WebSocket(this.url, this.options)
      
      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        this.startHeartbeat()
        this.flushMessageQueue()
      }
      
      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        this.stopHeartbeat()
        
        // Attempt reconnection for non-intentional closures
        if (event.code !== 1000) {
          this.scheduleReconnect()
        }
      }
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        // Error will trigger onclose, which handles reconnection
      }
      
      this.ws.onmessage = (event) => {
        this.options.onMessage?.(JSON.parse(event.data))
      }
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      this.scheduleReconnect()
    }
  }
  
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      this.options.onMaxReconnectReached?.()
      return
    }
    
    this.reconnectAttempts++
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    )
    
    console.log(`Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`)
    
    setTimeout(() => {
      if (this.ws?.readyState !== WebSocket.OPEN) {
        this.connect()
      }
    }, delay)
  }
  
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000) // 30 second heartbeat
  }
  
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }
  
  send(data: any): void {
    const message = JSON.stringify(data)
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message)
    } else {
      // Queue message for when connection is restored
      this.messageQueue.push(data)
    }
  }
  
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      this.send(message)
    }
  }
}
```

### Circuit Breaker Pattern

```typescript
class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'
  private failures = 0
  private lastFailureTime = 0
  private successCount = 0
  
  constructor(
    private threshold: number = 5,
    private timeout: number = 60000, // 1 minute
    private monitor: number = 3 // Required successes to close
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.timeout) {
        this.state = 'HALF_OPEN'
        this.successCount = 0
      } else {
        throw new Error('Circuit breaker is OPEN')
      }
    }
    
    try {
      const result = await operation()
      
      if (this.state === 'HALF_OPEN') {
        this.successCount++
        if (this.successCount >= this.monitor) {
          this.reset()
        }
      } else {
        this.reset()
      }
      
      return result
      
    } catch (error) {
      this.recordFailure()
      throw error
    }
  }
  
  private recordFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()
    
    if (this.failures >= this.threshold) {
      this.state = 'OPEN'
    }
  }
  
  private reset(): void {
    this.failures = 0
    this.state = 'CLOSED'
    this.successCount = 0
  }
}
```

## Session Management

### Conversation Session Lifecycle

```typescript
interface ConversationSession {
  sessionId: string
  callId: string
  patientId: string
  clinicianId?: string
  status: SessionStatus
  startTime: Date
  lastActivity: Date
  expiresAt: Date
  metadata: SessionMetadata
  permissions: SessionPermissions
}

type SessionStatus = 'active' | 'paused' | 'completed' | 'terminated' | 'expired'

class SessionManager {
  private redis: Redis
  private sessions: Map<string, ConversationSession> = new Map()
  private cleanupInterval: NodeJS.Timeout
  
  constructor() {
    this.redis = new Redis(REDIS_CONFIG)
    
    // Cleanup expired sessions every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions()
    }, 300000)
  }
  
  async createSession(
    callId: string, 
    patientId: string, 
    clinicianId?: string
  ): Promise<ConversationSession> {
    const sessionId = this.generateSessionId()
    const now = new Date()
    
    const session: ConversationSession = {
      sessionId,
      callId,
      patientId,
      clinicianId,
      status: 'active',
      startTime: now,
      lastActivity: now,
      expiresAt: new Date(now.getTime() + SESSION_TIMEOUT), // 4 hours
      metadata: {
        userAgent: 'HeartVoice Monitor',
        ipAddress: '',
        createdBy: clinicianId || 'system'
      },
      permissions: {
        canViewTranscript: true,
        canIntervene: !!clinicianId,
        canViewBiomarkers: true,
        canAccessPatientData: true
      }
    }
    
    // Store in memory and Redis
    this.sessions.set(sessionId, session)
    await this.persistSession(session)
    
    // Log session creation
    await this.auditLog('session_created', session)
    
    return session
  }
  
  async getSession(sessionId: string): Promise<ConversationSession | null> {
    // Try memory first
    let session = this.sessions.get(sessionId)
    
    if (!session) {
      // Try Redis
      session = await this.loadSessionFromRedis(sessionId)
      if (session) {
        this.sessions.set(sessionId, session)
      }
    }
    
    // Check if session is expired
    if (session && session.expiresAt < new Date()) {
      await this.expireSession(sessionId)
      return null
    }
    
    return session
  }
  
  async updateSessionActivity(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId)
    if (!session) return
    
    session.lastActivity = new Date()
    
    // Extend expiration if within grace period
    const timeUntilExpiry = session.expiresAt.getTime() - Date.now()
    if (timeUntilExpiry < EXTENSION_THRESHOLD) {
      session.expiresAt = new Date(Date.now() + SESSION_TIMEOUT)
    }
    
    await this.persistSession(session)
  }
  
  async pauseSession(sessionId: string, reason: string): Promise<void> {
    const session = await this.getSession(sessionId)
    if (!session) return
    
    session.status = 'paused'
    session.metadata.pauseReason = reason
    session.metadata.pausedAt = new Date()
    
    await this.persistSession(session)
    await this.auditLog('session_paused', session, { reason })
  }
  
  async resumeSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId)
    if (!session) return
    
    session.status = 'active'
    session.lastActivity = new Date()
    delete session.metadata.pauseReason
    delete session.metadata.pausedAt
    
    await this.persistSession(session)
    await this.auditLog('session_resumed', session)
  }
  
  async completeSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId)
    if (!session) return
    
    session.status = 'completed'
    session.metadata.completedAt = new Date()
    
    await this.persistSession(session)
    await this.auditLog('session_completed', session)
    
    // Remove from active memory
    this.sessions.delete(sessionId)
  }
  
  private async persistSession(session: ConversationSession): Promise<void> {
    const key = `session:${session.sessionId}`
    const ttl = Math.ceil((session.expiresAt.getTime() - Date.now()) / 1000)
    
    await this.redis.setex(key, ttl, JSON.stringify(session))
  }
  
  private async cleanupExpiredSessions(): Promise<void> {
    const now = new Date()
    const expiredSessions: string[] = []
    
    // Check memory sessions
    for (const [sessionId, session] of this.sessions) {
      if (session.expiresAt < now) {
        expiredSessions.push(sessionId)
      }
    }
    
    // Remove expired sessions
    for (const sessionId of expiredSessions) {
      await this.expireSession(sessionId)
    }
  }
  
  private async expireSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.status = 'expired'
      await this.auditLog('session_expired', session)
    }
    
    // Remove from memory and Redis
    this.sessions.delete(sessionId)
    await this.redis.del(`session:${sessionId}`)
  }
}
```

### Context Persistence During Interruptions

```typescript
class ConversationContextManager {
  private redis: Redis
  private contextCache: Map<string, ConversationContext> = new Map()
  
  async saveConversationContext(
    callId: string, 
    context: ConversationContext
  ): Promise<void> {
    // Save to cache for immediate access
    this.contextCache.set(callId, context)
    
    // Persist to Redis with longer TTL
    const key = `context:${callId}`
    await this.redis.setex(key, 7200, JSON.stringify(context)) // 2 hours
    
    // Also save checkpoint to database for recovery
    await this.saveContextCheckpoint(callId, context)
  }
  
  async restoreConversationContext(callId: string): Promise<ConversationContext | null> {
    // Try cache first
    let context = this.contextCache.get(callId)
    
    if (!context) {
      // Try Redis
      const cached = await this.redis.get(`context:${callId}`)
      if (cached) {
        context = JSON.parse(cached)
        this.contextCache.set(callId, context)
      }
    }
    
    if (!context) {
      // Last resort: database checkpoint
      context = await this.loadContextCheckpoint(callId)
    }
    
    return context
  }
  
  async handleInterruption(
    callId: string, 
    interruptionType: 'clinician_join' | 'technical_issue' | 'patient_disconnect'
  ): Promise<void> {
    const context = await this.restoreConversationContext(callId)
    if (!context) return
    
    // Mark interruption point
    context.interruptions = context.interruptions || []
    context.interruptions.push({
      type: interruptionType,
      timestamp: new Date(),
      conversationState: { ...context.currentState },
      transcriptPosition: context.transcript.length
    })
    
    // Save updated context
    await this.saveConversationContext(callId, context)
    
    // Notify monitoring systems
    await this.notifyInterruption(callId, interruptionType)
  }
  
  async resumeAfterInterruption(callId: string): Promise<ConversationContext | null> {
    const context = await this.restoreConversationContext(callId)
    if (!context) return null
    
    const lastInterruption = context.interruptions?.[context.interruptions.length - 1]
    if (lastInterruption) {
      // Restore conversation state to interruption point
      context.currentState = lastInterruption.conversationState
      
      // Prepare resumption message for AI
      context.resumptionContext = {
        interruptionType: lastInterruption.type,
        interruptionDuration: Date.now() - lastInterruption.timestamp.getTime(),
        shouldAcknowledgeInterruption: true
      }
    }
    
    return context
  }
}
```

## HIPAA Compliance Architecture

### End-to-End Encryption and Data Protection

```typescript
interface HIPAAConfig {
  encryption: {
    algorithm: 'aes-256-gcm'
    keyRotationPeriod: number
    transitEncryption: 'tls-1.3'
  }
  dataRetention: {
    audioFiles: 0          // No storage
    transcripts: number    // 90 days
    biomarkers: number     // 1 year
    auditLogs: number      // 7 years
  }
  access: {
    rbac: boolean
    mfa: boolean
    sessionTimeout: number
  }
}

class HIPAAComplianceManager {
  private encryptionService: EncryptionService
  private auditLogger: AuditLogger
  private accessControl: AccessControl
  
  constructor(config: HIPAAConfig) {
    this.encryptionService = new EncryptionService(config.encryption)
    this.auditLogger = new AuditLogger(config.dataRetention)
    this.accessControl = new AccessControl(config.access)
  }
  
  // Field-level encryption for PHI
  async encryptPHI(data: any, dataType: 'transcript' | 'biomarker' | 'patient'): Promise<EncryptedData> {
    const encryptionKey = await this.encryptionService.getCurrentKey(dataType)
    
    // Identify PHI fields
    const phiFields = this.identifyPHIFields(data, dataType)
    
    // Encrypt only PHI fields
    const encryptedData = { ...data }
    for (const field of phiFields) {
      const value = this.getNestedValue(data, field)
      if (value) {
        const encrypted = await this.encryptionService.encrypt(JSON.stringify(value), encryptionKey)
        this.setNestedValue(encryptedData, field, encrypted)
      }
    }
    
    return {
      data: encryptedData,
      encryptionMetadata: {
        keyId: encryptionKey.id,
        algorithm: 'aes-256-gcm',
        encryptedFields: phiFields,
        timestamp: new Date()
      }
    }
  }
  
  // Audit all PHI access
  async auditPHIAccess(
    userId: string,
    action: 'create' | 'read' | 'update' | 'delete',
    resource: string,
    resourceId: string,
    metadata?: any
  ): Promise<void> {
    const auditEntry: AuditEntry = {
      id: this.generateAuditId(),
      timestamp: new Date(),
      userId,
      action,
      resource,
      resourceId,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      sessionId: metadata?.sessionId,
      success: true,
      reasonCode: metadata?.reasonCode || 'normal_access'
    }
    
    // Log to multiple destinations for redundancy
    await Promise.all([
      this.auditLogger.logToDatabase(auditEntry),
      this.auditLogger.logToSecureStorage(auditEntry),
      this.auditLogger.logToSIEM(auditEntry)
    ])
  }
  
  // Ensure no persistent audio storage
  async handleAudioStream(callId: string, audioData: Buffer): Promise<void> {
    // Process audio for biomarkers
    const biomarkers = await this.processBiomarkers(audioData)
    
    // Store only the biomarker results (no audio)
    await this.storeBiomarkers(callId, biomarkers)
    
    // Audio data is never persisted - only processed in memory
    // The audioData buffer will be garbage collected
    
    // Audit that audio was processed but not stored
    await this.auditPHIAccess('system', 'process', 'audio_stream', callId, {
      action: 'processed_not_stored',
      dataSize: audioData.length
    })
  }
  
  // BAA (Business Associate Agreement) compliance
  async validateVendorCompliance(vendorId: string): Promise<boolean> {
    const vendor = await this.getVendorConfiguration(vendorId)
    
    const complianceChecks = [
      this.validateBAA(vendor),
      this.validateEncryption(vendor),
      this.validateDataRetention(vendor),
      this.validateAccessControls(vendor),
      this.validateAuditCapabilities(vendor)
    ]
    
    const results = await Promise.all(complianceChecks)
    return results.every(result => result === true)
  }
}
```

### Zero Persistent Audio Storage

```typescript
class AudioStreamProcessor {
  private biomarkerExtractor: VoiceBiomarkerExtractor
  private transcriptService: TranscriptService
  
  async processAudioStream(
    callId: string, 
    audioChunk: Buffer, 
    speaker: 'patient' | 'ai'
  ): Promise<void> {
    // Immediate processing in memory only
    const processingTasks = [
      // Extract biomarkers
      this.extractBiomarkers(audioChunk, speaker),
      
      // Generate transcript (if needed for clinical documentation)
      this.generateTranscript(audioChunk, speaker),
      
      // Real-time analysis
      this.performRealtimeAnalysis(audioChunk, speaker)
    ]
    
    const [biomarkers, transcript, analysis] = await Promise.all(processingTasks)
    
    // Store only the analysis results (never the audio)
    await this.storeAnalysisResults(callId, {
      biomarkers,
      transcript: transcript?.text, // Only text, no audio reference
      analysis,
      speaker,
      timestamp: new Date()
    })
    
    // Broadcast results to monitoring clients
    await this.broadcastResults(callId, { biomarkers, transcript, analysis })
    
    // Audio buffer is automatically garbage collected
    // No persistent storage of audio data occurs
  }
  
  private async storeAnalysisResults(
    callId: string, 
    results: AnalysisResults
  ): Promise<void> {
    // Store in encrypted format with field-level encryption
    const encryptedResults = await this.hipaaManager.encryptPHI(results, 'biomarker')
    
    // Use TTL to ensure automatic deletion
    await this.database.query(`
      INSERT INTO voice_analysis_results 
      (call_id, encrypted_data, expires_at) 
      VALUES ($1, $2, $3)
    `, [
      callId,
      JSON.stringify(encryptedResults),
      new Date(Date.now() + DATA_RETENTION_PERIOD)
    ])
    
    // Audit the storage (but not the audio processing)
    await this.hipaaManager.auditPHIAccess(
      'system',
      'create',
      'voice_analysis',
      callId,
      { containsAudio: false, dataTypes: ['biomarkers', 'transcript'] }
    )
  }
}
```

### Access Control and Audit Logging

```typescript
class AccessControlManager {
  private rbac: RoleBasedAccessControl
  private mfaService: MFAService
  
  async validateAccess(
    userId: string, 
    resource: string, 
    action: string,
    context: AccessContext
  ): Promise<AccessDecision> {
    // Multi-factor authentication check
    const mfaValid = await this.mfaService.validateSession(context.sessionId)
    if (!mfaValid) {
      return { allowed: false, reason: 'mfa_required' }
    }
    
    // Role-based access control
    const hasPermission = await this.rbac.checkPermission(userId, resource, action)
    if (!hasPermission) {
      return { allowed: false, reason: 'insufficient_permissions' }
    }
    
    // Context-based restrictions (e.g., assigned patients only)
    const contextValid = await this.validateContext(userId, resource, context)
    if (!contextValid) {
      return { allowed: false, reason: 'context_violation' }
    }
    
    // Session timeout check
    const sessionValid = await this.validateSession(context.sessionId)
    if (!sessionValid) {
      return { allowed: false, reason: 'session_expired' }
    }
    
    return { allowed: true }
  }
  
  private async validateContext(
    userId: string, 
    resource: string, 
    context: AccessContext
  ): Promise<boolean> {
    // For patient data, ensure user is authorized for this specific patient
    if (resource.startsWith('patient:')) {
      const patientId = resource.split(':')[1]
      return await this.rbac.isAuthorizedForPatient(userId, patientId)
    }
    
    // For conversation data, ensure user has active role in the conversation
    if (resource.startsWith('conversation:')) {
      const callId = resource.split(':')[1]
      return await this.rbac.isAuthorizedForCall(userId, callId)
    }
    
    return true
  }
}
```

## Implementation Roadmap

### Phase 1: Foundation Infrastructure (Weeks 1-2)

#### Week 1: Core WebSocket Proxy Server
```typescript
// Implementation priorities
const phase1Week1Tasks = [
  {
    task: 'WebSocket Proxy Server Core',
    deliverables: [
      'Basic WebSocket server with connection management',
      'Twilio Media Streams integration',
      'OpenAI Realtime API connection',
      'Audio format conversion (mulaw <-> PCM)',
      'Connection lifecycle management'
    ],
    technicalSpecs: {
      framework: 'Node.js with ws library',
      audioProcessing: 'Custom PCM/mulaw conversion',
      concurrency: 'Support 10 concurrent calls',
      monitoring: 'Basic health checks and logging'
    }
  },
  {
    task: 'Next.js API Route Setup',
    deliverables: [
      '/api/voice-realtime/initiate endpoint',
      '/api/voice-realtime/status/:callId endpoint',
      'Basic WebSocket connection management',
      'Environment configuration'
    ]
  }
]
```

#### Week 2: Real-Time State Management
```typescript
const phase1Week2Tasks = [
  {
    task: 'Conversation State Management',
    deliverables: [
      'Redis-based conversation state storage',
      'Real-time state synchronization',
      'WebSocket message broadcasting',
      'Basic error handling and reconnection'
    ]
  },
  {
    task: 'Frontend WebSocket Integration',
    deliverables: [
      'React hooks for WebSocket management',
      'Real-time transcript display',
      'Connection status indicators',
      'Basic conversation monitoring UI'
    ]
  }
]
```

### Phase 2: Voice Processing Pipeline (Weeks 3-4)

#### Voice Biomarker Extraction
```typescript
const phase2Implementation = {
  voiceBiomarkers: {
    coreMetrics: ['jitter', 'shimmer', 'HNR'],
    processingLatency: '<200ms',
    accuracy: '>85% correlation with clinical data',
    implementation: 'Custom DSP algorithms with clinical validation'
  },
  
  realtimeProcessing: {
    bufferSize: '1024 samples',
    windowSize: '512 samples',
    hopSize: '256 samples',
    sampleRate: '8kHz (Twilio) / 24kHz (OpenAI)'
  },
  
  clinicalIntegration: {
    nyhaClassification: 'ML model based on 2024 research',
    decompensationRisk: 'Multi-metric risk score',
    alertThresholds: 'Configurable per patient'
  }
}
```

### Phase 3: Clinical Dashboard Integration (Weeks 5-6)

#### Real-Time Monitoring Interface
```typescript
const phase3Deliverables = [
  {
    component: 'ConversationDashboard',
    features: [
      'Live call monitoring with transcript',
      'Real-time biomarker visualization',
      'Clinical intervention controls',
      'Emergency escalation system'
    ]
  },
  {
    component: 'VoiceAgentConfiguration',
    features: [
      'Personality and behavior configuration',
      'Conversation flow designer',
      'Knowledge base management',
      'Function calling setup'
    ]
  }
]
```

### Phase 4: Production Readiness (Weeks 7-8)

#### HIPAA Compliance and Security Hardening
```typescript
const phase4Requirements = {
  security: {
    encryption: 'Field-level PHI encryption',
    audit: 'Comprehensive audit logging',
    access: 'RBAC with MFA enforcement',
    compliance: 'BAA vendor validation'
  },
  
  performance: {
    latency: '<500ms end-to-end',
    throughput: '100+ concurrent calls',
    availability: '99.9% uptime',
    recovery: 'Automatic failover to ElevenLabs'
  },
  
  monitoring: {
    health: 'System health dashboards',
    alerts: 'Clinical and technical alerting',
    metrics: 'Performance and usage analytics',
    logging: 'Structured logging with correlation IDs'
  }
}
```

### Deployment Strategy

#### Infrastructure Requirements
```yaml
# Production deployment configuration
production:
  webSocketProxy:
    instances: 3
    cpu: "2 cores"
    memory: "4GB"
    storage: "100GB SSD"
    
  apiServer:
    instances: 2
    cpu: "4 cores"
    memory: "8GB"
    storage: "200GB SSD"
    
  database:
    type: "PostgreSQL 15"
    instances: 1 (primary) + 1 (replica)
    cpu: "4 cores"
    memory: "16GB"
    storage: "1TB SSD"
    
  cache:
    type: "Redis Cluster"
    instances: 3
    cpu: "2 cores"
    memory: "8GB"
    
  loadBalancer:
    type: "Application Load Balancer"
    healthChecks: "/api/health"
    sslTermination: true
```

### Success Metrics and Monitoring

#### Technical Performance KPIs
```typescript
const performanceMetrics = {
  webSocketConnections: {
    target: '100 concurrent',
    monitoring: 'Connection count, latency, drops'
  },
  
  voiceProcessing: {
    latency: '<200ms biomarker extraction',
    accuracy: '>85% clinical correlation',
    uptime: '99.9% availability'
  },
  
  dataIntegrity: {
    auditCompliance: '100% PHI access logged',
    encryptionCoverage: '100% PHI field encryption',
    retentionCompliance: '0 persistent audio storage'
  }
}
```

#### Clinical Impact Metrics
```typescript
const clinicalMetrics = {
  patientEngagement: {
    callCompletion: '>85% completion rate',
    conversationQuality: '>4.2/5 patient satisfaction',
    biomarkerCapture: '>90% successful extraction'
  },
  
  clinicalOutcomes: {
    earlyDetection: '25% improvement in symptom identification',
    responseTime: '50% faster clinical intervention',
    readmissionReduction: '30% decrease in 30-day readmissions'
  }
}
```

---

## Implementation Notes

1. **Security First**: All PHI handling follows HIPAA compliance from day one
2. **Real-Time Priority**: WebSocket connections and audio processing optimized for <500ms latency
3. **Clinical Workflow**: UI/UX designed around actual clinical decision-making processes
4. **Scalability**: Architecture supports 1,000+ concurrent clinicians and 10,000+ patients
5. **Reliability**: Multiple fallback systems ensure 99.9%+ uptime for critical healthcare operations

This comprehensive integration architecture provides the foundation for implementing a production-ready voice agent system that transforms patient interactions while maintaining the highest standards of clinical safety, HIPAA compliance, and technical performance.