// HeartVoice Monitor - OpenAI Realtime API Service
// Implementation based on design specifications for conversational AI healthcare interactions

import { WebSocket } from 'ws';
import { VoiceBiomarkers } from '@/types/clinical';

export interface OpenAIRealtimeConfig {
  apiKey: string;
  model: string;
  sessionConfig: {
    modalities: ['text', 'audio'];
    instructions: string;
    voice: string;
    input_audio_format: 'pcm16';
    output_audio_format: 'pcm16';
    input_audio_transcription?: {
      model: 'whisper-1';
    };
    turn_detection?: {
      type: 'server_vad';
      threshold: number;
      prefix_padding_ms: number;
      silence_duration_ms: number;
    };
    tools?: Array<{
      type: 'function';
      name: string;
      description: string;
      parameters: object;
    }>;
  };
}

export interface ConversationState {
  sessionId: string;
  patientId: string;
  status: 'connecting' | 'active' | 'listening' | 'speaking' | 'analyzing' | 'ended';
  startTime: Date;
  transcript: ConversationMessage[];
  voiceBiomarkers: VoiceBiomarkers[];
  riskFlags: RiskFlag[];
  emergencyDetected: boolean;
}

export interface ConversationMessage {
  timestamp: Date;
  speaker: 'patient' | 'agent';
  content: string;
  audioBuffer?: ArrayBuffer;
  confidence?: number;
}

export interface RiskFlag {
  type: 'clinical' | 'biomarker' | 'emergency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  requiresIntervention: boolean;
}

export class OpenAIRealtimeService {
  private ws: WebSocket | null = null;
  private config: OpenAIRealtimeConfig;
  private conversationState: ConversationState | null = null;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(config: OpenAIRealtimeConfig) {
    this.config = config;
  }

  // Healthcare-specific system prompt from design specifications
  private getHealthcareSystemPrompt(patientInfo: any): string {
    return `You are a compassionate AI healthcare assistant conducting a voice assessment for heart failure patients. Your goal is to have a natural, empathetic conversation while gathering clinical information.

CONVERSATION APPROACH:
1. Start with warm, personalized greeting using the patient's name
2. Begin with general topics (weather, how they're feeling today) to build rapport
3. Gradually transition to health-related questions naturally within conversation
4. Use active listening and show empathy for patient concerns
5. Maintain conversation memory throughout the call

CLINICAL OBJECTIVES:
- Assess current symptoms (shortness of breath, fatigue, swelling, chest pain)
- Monitor medication adherence and side effects
- Evaluate daily activity levels and quality of life
- Detect voice biomarkers (breathing patterns, vocal strain, speaking pace)
- Identify emergency symptoms requiring immediate attention

EMERGENCY KEYWORDS (immediate escalation):
- "chest pain", "can't breathe", "heart racing", "dizzy", "passing out"
- "suicidal thoughts", "want to die", "end it all"
- Any indication of acute distress or crisis

CONVERSATION STYLE:
- Warm, empathetic, and non-clinical language
- Ask open-ended questions that encourage natural speech
- Show genuine interest in patient's well-being
- Validate patient concerns and emotions
- Keep questions conversational, not interrogative

PATIENT CONTEXT:
Name: ${patientInfo.name}
Age: ${patientInfo.age}
Diagnosis: Heart Failure
Current Medications: ${patientInfo.medications?.join(', ') || 'Not specified'}
Last Assessment: ${patientInfo.lastAssessment || 'First call'}

Remember: This is a therapeutic conversation, not a medical exam. Build trust while naturally gathering clinical insights.`;
  }

  // Initialize WebSocket connection to OpenAI Realtime API
  async connect(sessionConfig: Partial<ConversationState>): Promise<string> {
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Initialize conversation state
      this.conversationState = {
        sessionId,
        patientId: sessionConfig.patientId || '',
        status: 'connecting',
        startTime: new Date(),
        transcript: [],
        voiceBiomarkers: [],
        riskFlags: [],
        emergencyDetected: false
      };

      // Create WebSocket connection
      const wsUrl = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17';
      this.ws = new WebSocket(wsUrl, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'OpenAI-Beta': 'realtime=v1'
        }
      });

      return new Promise((resolve, reject) => {
        if (!this.ws) {
          reject(new Error('WebSocket connection failed'));
          return;
        }

        this.ws.onopen = () => {
          console.log(`[OpenAI Realtime] Connected - Session: ${sessionId}`);
          this.updateConversationStatus('active');
          
          // Send session configuration
          this.sendSessionUpdate();
          resolve(sessionId);
        };

        this.ws.onmessage = (event) => {
          this.handleRealtimeEvent(JSON.parse(event.data.toString()));
        };

        this.ws.onclose = () => {
          console.log(`[OpenAI Realtime] Connection closed - Session: ${sessionId}`);
          this.updateConversationStatus('ended');
          this.emit('connection_closed', { sessionId });
        };

        this.ws.onerror = (error) => {
          console.error(`[OpenAI Realtime] WebSocket error:`, error);
          reject(error);
        };

        // Timeout after 30 seconds
        setTimeout(() => {
          if (this.conversationState?.status === 'connecting') {
            reject(new Error('Connection timeout'));
          }
        }, 30000);
      });

    } catch (error) {
      console.error('[OpenAI Realtime] Connection failed:', error);
      throw error;
    }
  }

  // Send session configuration with healthcare-specific settings
  private sendSessionUpdate(): void {
    if (!this.ws || !this.conversationState) return;

    const sessionUpdate = {
      type: 'session.update',
      session: {
        modalities: this.config.sessionConfig.modalities,
        instructions: this.config.sessionConfig.instructions,
        voice: this.config.sessionConfig.voice,
        input_audio_format: this.config.sessionConfig.input_audio_format,
        output_audio_format: this.config.sessionConfig.output_audio_format,
        input_audio_transcription: this.config.sessionConfig.input_audio_transcription,
        turn_detection: this.config.sessionConfig.turn_detection,
        tools: this.getHealthcareFunctionCalls(),
        temperature: 0.8, // Balanced between creativity and consistency
        max_response_output_tokens: 4096
      }
    };

    this.ws.send(JSON.stringify(sessionUpdate));
  }

  // Healthcare-specific function calls from design specifications
  private getHealthcareFunctionCalls() {
    return [
      {
        type: 'function',
        name: 'recordVoiceBiomarkers',
        description: 'Record voice biomarkers extracted during natural conversation',
        parameters: {
          type: 'object',
          properties: {
            jitter: { type: 'number', description: 'Voice jitter percentage' },
            shimmer: { type: 'number', description: 'Voice shimmer percentage' },
            hnr: { type: 'number', description: 'Harmonics-to-noise ratio in dB' },
            breathingRate: { type: 'number', description: 'Breathing rate per minute' },
            voiceStrain: { type: 'boolean', description: 'Indicates vocal strain or fatigue' }
          },
          required: ['jitter', 'shimmer', 'hnr']
        }
      },
      {
        type: 'function',
        name: 'updatePatientRecord',
        description: 'Update patient clinical record with conversation insights',
        parameters: {
          type: 'object',
          properties: {
            symptoms: { type: 'array', items: { type: 'string' } },
            medicationAdherence: { type: 'boolean' },
            activityLevel: { type: 'string', enum: ['low', 'moderate', 'high'] },
            qualityOfLife: { type: 'number', minimum: 1, maximum: 10 },
            clinicalNotes: { type: 'string' }
          }
        }
      },
      {
        type: 'function',
        name: 'triggerAlert',
        description: 'Trigger clinical alert for emergency or concerning symptoms',
        parameters: {
          type: 'object',
          properties: {
            alertType: { type: 'string', enum: ['emergency', 'urgent', 'routine'] },
            symptoms: { type: 'array', items: { type: 'string' } },
            riskLevel: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            requiresImmediate: { type: 'boolean' }
          },
          required: ['alertType', 'symptoms', 'riskLevel']
        }
      }
    ];
  }

  // Handle incoming events from OpenAI Realtime API
  private handleRealtimeEvent(event: any): void {
    switch (event.type) {
      case 'session.created':
        console.log('[OpenAI Realtime] Session created:', event.session.id);
        break;

      case 'conversation.item.created':
        this.handleConversationItem(event.item);
        break;

      case 'response.audio.delta':
        this.handleAudioDelta(event);
        break;

      case 'response.audio_transcript.done':
        this.handleTranscriptComplete(event);
        break;

      case 'response.function_call_arguments.done':
        this.handleFunctionCall(event);
        break;

      case 'error':
        console.error('[OpenAI Realtime] Error:', event.error);
        this.emit('error', event.error);
        break;

      default:
        // console.log('[OpenAI Realtime] Unhandled event:', event.type);
        break;
    }
  }

  // Handle conversation items (messages)
  private handleConversationItem(item: any): void {
    if (!this.conversationState) return;

    const message: ConversationMessage = {
      timestamp: new Date(),
      speaker: item.role === 'user' ? 'patient' : 'agent',
      content: item.content?.[0]?.transcript || '',
      confidence: item.content?.[0]?.confidence
    };

    this.conversationState.transcript.push(message);
    this.emit('transcript_update', { 
      sessionId: this.conversationState.sessionId,
      message 
    });
  }

  // Handle audio streaming
  private handleAudioDelta(event: any): void {
    if (!this.conversationState) return;

    this.updateConversationStatus('speaking');
    
    // Emit audio data for real-time playback and biomarker analysis
    this.emit('audio_delta', {
      sessionId: this.conversationState.sessionId,
      audioData: event.delta,
      speaker: 'agent'
    });
  }

  // Handle completed transcript
  private handleTranscriptComplete(event: any): void {
    if (!this.conversationState) return;

    const message: ConversationMessage = {
      timestamp: new Date(),
      speaker: 'agent',
      content: event.transcript,
      confidence: 1.0
    };

    // Update transcript
    this.conversationState.transcript.push(message);
    
    // Check for emergency keywords
    this.checkEmergencyKeywords(event.transcript);

    this.emit('transcript_complete', {
      sessionId: this.conversationState.sessionId,
      message
    });
  }

  // Handle function calls from OpenAI
  private async handleFunctionCall(event: any): Promise<void> {
    if (!this.conversationState) return;

    const { name, arguments: args } = event.call;

    try {
      let result;
      
      switch (name) {
        case 'recordVoiceBiomarkers':
          result = await this.processVoiceBiomarkers(JSON.parse(args));
          break;
        case 'updatePatientRecord':
          result = await this.updatePatientRecord(JSON.parse(args));
          break;
        case 'triggerAlert':
          result = await this.triggerClinicalAlert(JSON.parse(args));
          break;
        default:
          result = { error: `Unknown function: ${name}` };
      }

      // Send function response back to OpenAI
      this.sendFunctionResponse(event.call_id, result);

    } catch (error) {
      console.error(`[Function Call] Error executing ${name}:`, error);
      this.sendFunctionResponse(event.call_id, { 
        error: error instanceof Error ? error.message : 'Function execution failed' 
      });
    }
  }

  // Process voice biomarkers
  private async processVoiceBiomarkers(biomarkers: any): Promise<object> {
    if (!this.conversationState) return { error: 'No active session' };

    const voiceBiomarker: VoiceBiomarkers = {
      jitter: biomarkers.jitter || 0,
      shimmer: biomarkers.shimmer || 0,
      hnr: biomarkers.hnr || 0,
      f0: biomarkers.f0 || 0,
      spectralSlope: biomarkers.spectralSlope || 0,
      voiceIntensity: biomarkers.voiceIntensity || 0
    };

    this.conversationState.voiceBiomarkers.push(voiceBiomarker);

    this.emit('biomarkers_update', {
      sessionId: this.conversationState.sessionId,
      biomarkers: voiceBiomarker
    });

    return { success: true, message: 'Voice biomarkers recorded' };
  }

  // Update patient record
  private async updatePatientRecord(data: any): Promise<object> {
    // This would integrate with the existing patient service
    this.emit('patient_update', {
      sessionId: this.conversationState?.sessionId,
      patientId: this.conversationState?.patientId,
      updates: data
    });

    return { success: true, message: 'Patient record updated' };
  }

  // Trigger clinical alert
  private async triggerClinicalAlert(alertData: any): Promise<object> {
    if (!this.conversationState) return { error: 'No active session' };

    const riskFlag: RiskFlag = {
      type: alertData.alertType === 'emergency' ? 'emergency' : 'clinical',
      severity: alertData.riskLevel,
      message: `Symptoms detected: ${alertData.symptoms.join(', ')}`,
      timestamp: new Date(),
      requiresIntervention: alertData.requiresImmediate || alertData.riskLevel === 'critical'
    };

    this.conversationState.riskFlags.push(riskFlag);

    if (alertData.alertType === 'emergency' || alertData.riskLevel === 'critical') {
      this.conversationState.emergencyDetected = true;
    }

    this.emit('clinical_alert', {
      sessionId: this.conversationState.sessionId,
      patientId: this.conversationState.patientId,
      alert: riskFlag
    });

    return { success: true, message: 'Clinical alert triggered' };
  }

  // Check for emergency keywords in transcript
  private checkEmergencyKeywords(transcript: string): void {
    const emergencyKeywords = [
      'chest pain', 'can\'t breathe', 'heart racing', 'dizzy', 'passing out',
      'suicidal thoughts', 'want to die', 'end it all', 'kill myself',
      'severe pain', 'can\'t stand', 'emergency', 'help me'
    ];

    const lowerTranscript = transcript.toLowerCase();
    const detectedKeywords = emergencyKeywords.filter(keyword => 
      lowerTranscript.includes(keyword)
    );

    if (detectedKeywords.length > 0 && this.conversationState) {
      this.conversationState.emergencyDetected = true;
      this.triggerClinicalAlert({
        alertType: 'emergency',
        symptoms: detectedKeywords,
        riskLevel: 'critical',
        requiresImmediate: true
      });
    }
  }

  // Send function response back to OpenAI
  private sendFunctionResponse(callId: string, result: object): void {
    if (!this.ws) return;

    const response = {
      type: 'conversation.item.create',
      item: {
        type: 'function_call_output',
        call_id: callId,
        output: JSON.stringify(result)
      }
    };

    this.ws.send(JSON.stringify(response));
  }

  // Send audio input to OpenAI
  sendAudioInput(audioData: ArrayBuffer): void {
    if (!this.ws || this.conversationState?.status !== 'active') return;

    this.updateConversationStatus('listening');

    const audioEvent = {
      type: 'input_audio_buffer.append',
      audio: this.arrayBufferToBase64(audioData)
    };

    this.ws.send(JSON.stringify(audioEvent));
  }

  // Commit audio input
  commitAudioInput(): void {
    if (!this.ws) return;

    const commitEvent = {
      type: 'input_audio_buffer.commit'
    };

    this.ws.send(JSON.stringify(commitEvent));
  }

  // Update conversation status
  private updateConversationStatus(status: ConversationState['status']): void {
    if (!this.conversationState) return;

    this.conversationState.status = status;
    this.emit('status_update', {
      sessionId: this.conversationState.sessionId,
      status
    });
  }

  // Event listener management
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(callback => callback(data));
  }

  // Utility methods
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Get conversation state
  getConversationState(): ConversationState | null {
    return this.conversationState;
  }

  // Disconnect and cleanup
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    if (this.conversationState) {
      this.conversationState.status = 'ended';
    }

    this.eventListeners.clear();
  }
}