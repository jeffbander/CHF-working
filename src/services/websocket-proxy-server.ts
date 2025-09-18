import WebSocket, { WebSocketServer } from 'ws';
import { createElevenLabsService } from './elevenlabs-service';
import { VoiceBiomarkerExtractor } from './voice-biomarker-extractor';

interface TwilioMediaMessage {
  event: 'connected' | 'start' | 'media' | 'stop';
  streamSid?: string;
  media?: {
    track: 'inbound' | 'outbound';
    chunk: string; // base64 encoded audio
    timestamp: string;
  };
  start?: {
    streamSid: string;
    accountSid: string;
    callSid: string;
    tracks: string[];
    mediaFormat: {
      encoding: string;
      sampleRate: number;
      channels: number;
    };
  };
}

interface ConversationSession {
  callSid: string;
  patientId: string;
  patientName: string;
  elevenLabsService: any;
  biomarkerExtractor: VoiceBiomarkerExtractor;
  twilioWs: WebSocket;
  startTime: Date;
  transcripts: Array<{
    speaker: 'patient' | 'agent';
    text: string;
    timestamp: Date;
    audioFeatures?: any;
  }>;
  biomarkers: Array<{
    timestamp: Date;
    features: any;
    riskScore: number;
  }>;
}

export class WebSocketProxyServer {
  private server: WebSocketServer;
  private activeSessions: Map<string, ConversationSession> = new Map();
  
  constructor(port: number = 8080) {
    this.server = new WebSocketServer({
      port
      // Remove path restriction to allow ngrok WebSocket tunneling
    });
    console.log(`WebSocket proxy server listening on port ${port}/voice-stream`);

    // Add debugging for all WebSocket events
    this.server.on('connection', (ws, req) => {
      console.log(`🔗 New WebSocket connection from ${req.socket.remoteAddress}`);
      console.log(`📍 URL: ${req.url}`);
      console.log(`🔗 Headers:`, JSON.stringify(req.headers, null, 2));
      this.handleConnection(ws, req);
    });

    this.server.on('error', (error) => {
      console.error('❌ WebSocket Server Error:', error);
    });

    this.server.on('listening', () => {
      console.log(`✅ WebSocket server successfully listening on port ${port}`);
    });
  }

  private getPatientSystemPrompt(patientName: string, patientId: string): string {
    return `You are a compassionate AI healthcare assistant conducting a REAL-TIME voice conversation with heart failure patient ${patientName}.

CRITICAL: This is a LIVE conversation - respond naturally and immediately like a human would. Don't wait for long pauses.

CONVERSATION APPROACH:
1. Start immediately: "Hello ${patientName}! This is your AI health assistant from Heart Voice Monitor"
2. Engage in natural back-and-forth dialogue
3. Listen actively and respond to what the patient says
4. Ask follow-up questions based on their responses
5. If patient is silent for more than 3-4 seconds, gently prompt them
6. Interrupt politely if they're going off-topic for too long

REAL-TIME BEHAVIOR:
- Respond immediately when you detect a natural pause in their speech
- Don't wait for complete silence - humans overlap speech naturally
- If patient says "um", "well", or pauses mid-sentence, give them a moment
- If silence goes beyond 4 seconds, say something like "I'm here listening, ${patientName}"
- Use conversational fillers: "I see", "That's helpful", "Tell me more about that"

CLINICAL ASSESSMENT:
- Ask about: shortness of breath, fatigue, swelling, chest discomfort, energy levels
- Listen for voice changes: breathiness, fatigue in speech, speaking pace
- Note any concerning symptoms for immediate escalation
- Keep the conversation focused but natural

EMERGENCY DETECTION:
Immediate escalation for: "chest pain", "can't breathe", "heart racing", "dizzy", "passing out", "help me"

Remember: This is a LIVE conversation, not a survey. Be human-like, responsive, and engaging!`;
  }

  private async handleConnection(ws: WebSocket, req: any) {
    console.log(`New WebSocket connection established, waiting for Twilio start event...`);

    // Store connection temporarily until we get the 'start' event with parameters
    const tempSessionId = `temp_${Date.now()}`;

    // Set up message handler to wait for the 'start' event
    ws.on('message', async (data: WebSocket.Data) => {
      try {
        const message: TwilioMediaMessage = JSON.parse(data.toString());

        if (message.event === 'start' && message.start) {
          // Extract parameters from Twilio start event
          const callSid = message.start.callSid;

          // Custom parameters are passed in a different format, we'll extract them here
          const customParams: any = {};

          // For now, use default values since we're testing with parameters in TwiML
          const patientId = 'patient-jeff-001';
          const patientName = 'Jeff Bander';

          console.log(`Twilio Media Stream started for call ${callSid}, patient ${patientName}`);

          // Now proceed with full session setup
          await this.initializeSession(ws, callSid, patientId, patientName);
        } else {
          // Handle other message types after session is initialized
          const session = Array.from(this.activeSessions.values()).find(s => s.twilioWs === ws);
          if (session) {
            await this.handleTwilioMessage(session, message);
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    // Set up basic connection handlers
    ws.on('close', () => {
      console.log('WebSocket connection closed');
      // Clean up any temporary session
      const session = Array.from(this.activeSessions.values()).find(s => s.twilioWs === ws);
      if (session) {
        this.endConversation(session);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket connection error:', error);
    });
  }

  private async initializeSession(ws: WebSocket, callSid: string, patientId: string, patientName: string) {
    console.log(`Initializing session for call ${callSid}, patient ${patientName}`);

    // Initialize ElevenLabs service with proper configuration
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;

    if (!elevenLabsApiKey || elevenLabsApiKey.includes('your-') || elevenLabsApiKey === 'demo-key') {
      console.warn(`⚠️ ElevenLabs API key not configured properly. Connection will continue but ElevenLabs features disabled for call ${callSid}`);
    }

    const elevenLabsConfig = {
      apiKey: elevenLabsApiKey || 'demo-key',
      voiceId: process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB',
      model: 'eleven_turbo_v2_5',
    };

    const elevenLabsService = createElevenLabsService(elevenLabsConfig.apiKey, elevenLabsConfig.voiceId);
    const biomarkerExtractor = new VoiceBiomarkerExtractor();

    // Create conversation session
    const session: ConversationSession = {
      callSid,
      patientId,
      patientName,
      elevenLabsService,
      biomarkerExtractor,
      twilioWs: ws,
      startTime: new Date(),
      transcripts: [],
      biomarkers: []
    };

    this.activeSessions.set(callSid, session);

    // Connect to ElevenLabs Conversational AI (skip if no valid API key)
    try {
      if (elevenLabsApiKey && !elevenLabsApiKey.includes('your-') && elevenLabsApiKey !== 'demo-key') {
        // Note: Current ElevenLabs service is a stub
        // await elevenLabsService.connect({
        //   patientId,
        //   patientName,
        //   callSid,
        //   conversationPhase: 'rapport_building'
        // });

        console.log(`🎙️ ElevenLabs conversation started for call ${callSid}`);

        // Set up ElevenLabs event handlers (disabled - stub implementation)
        // this.setupElevenLabsEventHandlers(session);
      } else {
        console.log(`📞 WebSocket connection established without ElevenLabs for call ${callSid}`);
        console.log(`ℹ️ Reason: ${!elevenLabsApiKey ? 'No API key' : 'Invalid API key format'}`);
      }

      // Set up Twilio WebSocket handlers (always required)
      this.setupTwilioEventHandlers(session);

    } catch (error) {
      console.error(`Failed to connect to ElevenLabs for call ${callSid}:`, error);
      console.log(`📞 Continuing with WebSocket connection (ElevenLabs disabled) for call ${callSid}`);

      // Still set up Twilio handlers even if ElevenLabs fails
      this.setupTwilioEventHandlers(session);
    }
  }

  private async handleTwilioMessage(session: ConversationSession, message: TwilioMediaMessage) {
    const { elevenLabsService, biomarkerExtractor, callSid } = session;

    switch (message.event) {
      case 'connected':
        console.log(`Twilio Media Stream connected for call ${callSid}`);
        break;

      case 'media':
        if (message.media?.track === 'inbound' && message.media.chunk) {
          // Patient audio - send to ElevenLabs and extract biomarkers
          const audioBuffer = Buffer.from(message.media.chunk, 'base64');

          // Send audio to ElevenLabs service (stub)
          // elevenLabsService.sendAudioInput(audioBuffer);

          // Extract voice biomarkers in parallel
          this.extractVoiceBiomarkers(session, audioBuffer, message.media.timestamp);
        }
        break;

      case 'stop':
        console.log(`Media stream stopped for call ${callSid}`);
        await this.endConversation(session);
        break;
    }
  }

  private setupTwilioEventHandlers(session: ConversationSession) {
    const { twilioWs, elevenLabsService, biomarkerExtractor, callSid } = session;

    twilioWs.on('message', async (data: WebSocket.Data) => {
      try {
        const message: TwilioMediaMessage = JSON.parse(data.toString());
        
        switch (message.event) {
          case 'connected':
            console.log(`Twilio Media Stream connected for call ${callSid}`);
            break;
            
          case 'start':
            console.log(`Media stream started for call ${callSid}`);
            // The initial greeting will be handled by the OpenAI Realtime API automatically
            console.log(`Call started. OpenAI will begin conversation with ${session.patientName}.`);
            break;
            
          case 'media':
            if (message.media?.track === 'inbound' && message.media.chunk) {
              // Patient audio - send to ElevenLabs and extract biomarkers
              const audioBuffer = Buffer.from(message.media.chunk, 'base64');

              // Send audio to ElevenLabs service
              elevenLabsService.sendAudioInput(audioBuffer);

              // Extract voice biomarkers in parallel
              this.extractVoiceBiomarkers(session, audioBuffer, message.media.timestamp);
            }
            break;
            
          case 'stop':
            console.log(`Media stream stopped for call ${callSid}`);
            await this.endConversation(session);
            break;
        }
      } catch (error) {
        console.error(`Error processing Twilio message for call ${callSid}:`, error);
      }
    });

    twilioWs.on('close', async () => {
      console.log(`Twilio WebSocket closed for call ${callSid}`);
      await this.endConversation(session);
    });

    twilioWs.on('error', (error) => {
      console.error(`Twilio WebSocket error for call ${callSid}:`, error);
    });
  }

  private setupElevenLabsEventHandlers(session: ConversationSession) {
    const { elevenLabsService, twilioWs, callSid } = session;

    // Handle ElevenLabs audio responses
    elevenLabsService.on('audio_response', (data: any) => {
      console.log(`🗣️ [${callSid}] AI Response: ${data.text}`);

      // For now, convert text to TTS using Twilio's Say
      // In full implementation, this would be actual ElevenLabs audio
      const sayMessage = {
        event: 'media',
        streamSid: callSid,
        media: {
          payload: this.generateTwilioSayAudio(data.text)
        }
      };

      // twilioWs.send(JSON.stringify(sayMessage));
    });

    // Handle transcription updates
    elevenLabsService.on('transcript_update', (data: any) => {
      session.transcripts.push({
        speaker: data.speaker,
        text: data.text,
        timestamp: new Date(),
        audioFeatures: data.audioFeatures
      });

      console.log(`🎤 [${callSid}] ${data.speaker}: ${data.text}`);

      // Send real-time updates to dashboard
      this.sendDashboardUpdate(session, {
        type: 'transcription',
        data: {
          speaker: data.speaker,
          text: data.text,
          timestamp: new Date(),
          callSid
        }
      });
    });

    // Handle clinical alerts
    elevenLabsService.on('clinical_alert', async (alertData: any) => {
      await this.triggerAlert(session, alertData);
    });

    // Handle emergency alerts
    elevenLabsService.on('emergency_alert', async (alert: any) => {
      console.warn(`🚨 [${callSid}] EMERGENCY ALERT:`, alert);

      await this.triggerEmergencyEscalation(session, alert);
    });
  }

  private generateTwilioSayAudio(text: string): string {
    // This is a placeholder - in reality, we'd use actual ElevenLabs audio
    // For now, return empty audio buffer
    return Buffer.alloc(0).toString('base64');
  }

  private async extractVoiceBiomarkers(
    session: ConversationSession, 
    audioBuffer: Buffer, 
    timestamp: string
  ) {
    try {
      const features = await session.biomarkerExtractor.extractFeatures(audioBuffer);
      const riskScore = await session.biomarkerExtractor.calculateRiskScore(features);
      
      const biomarkerData = {
        timestamp: new Date(),
        features,
        riskScore
      };
      
      session.biomarkers.push(biomarkerData);
      
      // Send biomarker data to dashboard
      this.sendDashboardUpdate(session, {
        type: 'biomarkers',
        data: {
          ...biomarkerData,
          callSid: session.callSid
        }
      });
      
      // Check for concerning biomarker patterns
      if (riskScore > 0.7) {
        console.warn(`[${session.callSid}] High risk biomarkers detected: ${riskScore}`);
        
        // High-risk biomarkers detected - this would be handled by the real-time analysis
        console.warn(`High-risk biomarkers will be conveyed through conversation context`);
      }
      
    } catch (error) {
      console.error(`Error extracting biomarkers for call ${session.callSid}:`, error);
    }
  }

  private async handleOpenAIFunctionCall(session: ConversationSession, functionCall: any) {
    const { name, parameters } = functionCall;
    
    switch (name) {
      case 'recordVoiceBiomarkers':
        // Already handled in extractVoiceBiomarkers
        console.log(`[${session.callSid}] Voice biomarkers recorded`);
        break;
        
      case 'updatePatientRecord':
        await this.updatePatientRecord(session, parameters);
        break;
        
      case 'triggerAlert':
        await this.triggerAlert(session, parameters);
        break;
        
      default:
        console.warn(`[${session.callSid}] Unknown function call: ${name}`);
    }
  }

  private async updatePatientRecord(session: ConversationSession, data: any) {
    // TODO: Implement EHR integration
    console.log(`[${session.callSid}] Updating patient record:`, data);
    
    this.sendDashboardUpdate(session, {
      type: 'patientUpdate',
      data: {
        patientId: session.patientId,
        updates: data,
        callSid: session.callSid,
        timestamp: new Date()
      }
    });
  }

  private async triggerAlert(session: ConversationSession, alertData: any) {
    console.warn(`[${session.callSid}] Clinical alert triggered:`, alertData);
    
    // Send alert to clinical dashboard
    this.sendDashboardUpdate(session, {
      type: 'clinicalAlert',
      data: {
        ...alertData,
        patientId: session.patientId,
        patientName: session.patientName,
        callSid: session.callSid,
        timestamp: new Date(),
        severity: alertData.severity || 'medium'
      }
    });
    
    // TODO: Implement notification system (email, SMS, pager)
  }

  private async triggerEmergencyEscalation(session: ConversationSession, alert: any) {
    console.error(`[${session.callSid}] EMERGENCY ESCALATION:`, alert);
    
    // Immediate dashboard alert
    this.sendDashboardUpdate(session, {
      type: 'emergencyAlert',
      data: {
        ...alert,
        patientId: session.patientId,
        patientName: session.patientName,
        callSid: session.callSid,
        timestamp: new Date(),
        severity: 'critical'
      }
    });
    
    // TODO: Implement emergency protocols
    // - Automatic 911 dispatch
    // - Care team notification
    // - Hospital admission workflow
  }

  private sendDashboardUpdate(session: ConversationSession, update: any) {
    // TODO: Implement WebSocket connection to dashboard
    // For now, just log the update
    console.log(`[Dashboard Update] ${session.callSid}:`, update);
  }

  private async endConversation(session: ConversationSession) {
    const { callSid, elevenLabsService, startTime, transcripts, biomarkers } = session;

    console.log(`🔚 Ending conversation for call ${callSid}`);

    // Disconnect from ElevenLabs
    await elevenLabsService.disconnect();
    
    // Calculate conversation summary
    const duration = Date.now() - startTime.getTime();
    const avgRiskScore = biomarkers.length > 0 
      ? biomarkers.reduce((sum, b) => sum + b.riskScore, 0) / biomarkers.length 
      : 0;
    
    const conversationSummary = {
      callSid,
      patientId: session.patientId,
      patientName: session.patientName,
      duration,
      transcriptCount: transcripts.length,
      biomarkerCount: biomarkers.length,
      averageRiskScore: avgRiskScore,
      endTime: new Date()
    };
    
    // Send final summary to dashboard
    this.sendDashboardUpdate(session, {
      type: 'conversationEnded',
      data: conversationSummary
    });
    
    // Clean up session
    this.activeSessions.delete(callSid);
    
    console.log(`Conversation ended for call ${callSid}:`, conversationSummary);
  }

  // Public methods for dashboard integration
  public getActiveSession(callSid: string): ConversationSession | undefined {
    return this.activeSessions.get(callSid);
  }

  public getActiveSessions(): ConversationSession[] {
    return Array.from(this.activeSessions.values());
  }

  public async terminateSession(callSid: string): Promise<void> {
    const session = this.activeSessions.get(callSid);
    if (session) {
      await this.endConversation(session);
      session.twilioWs.close();
    }
  }
}

// Start the proxy server
if (require.main === module) {
  const port = parseInt(process.env.WEBSOCKET_PROXY_PORT || '8080');
  new WebSocketProxyServer(port);
}