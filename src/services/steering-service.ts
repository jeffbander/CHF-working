import { 
  SteeringSession, 
  SteeringAction, 
  ConversationFlow, 
  EmergencyEscalation,
  SteeringDashboard,
  CallMetrics,
  SteeringTemplate
} from '@/types/steering';

class SteeringService {
  private activeSessions: Map<string, SteeringSession> = new Map();
  private pendingEscalations: EmergencyEscalation[] = [];
  private recentActions: SteeringAction[] = [];
  private websocketConnection: WebSocket | null = null;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeWebSocket();
  }

  private initializeWebSocket() {
    try {
      this.websocketConnection = new WebSocket(
        process.env.NODE_ENV === 'development' 
          ? 'ws://localhost:3001' 
          : 'wss://your-production-websocket-url'
      );

      this.websocketConnection.onopen = () => {
        console.log('Steering WebSocket connected');
        this.emit('connected', true);
      };

      this.websocketConnection.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleWebSocketMessage(data);
      };

      this.websocketConnection.onclose = () => {
        console.log('Steering WebSocket disconnected');
        this.emit('connected', false);
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this.initializeWebSocket(), 5000);
      };

      this.websocketConnection.onerror = (error) => {
        console.error('Steering WebSocket error:', error);
        this.emit('error', error);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }

  private handleWebSocketMessage(data: any) {
    switch (data.type) {
      case 'session_update':
        this.updateSession(data.session);
        break;
      case 'metrics_update':
        this.updateSessionMetrics(data.sessionId, data.metrics);
        break;
      case 'escalation_triggered':
        this.addEscalation(data.escalation);
        break;
      case 'action_completed':
        this.recordAction(data.action);
        break;
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => listener(data));
  }

  public on(event: string, listener: Function) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.push(listener);
    this.eventListeners.set(event, listeners);

    // Return unsubscribe function
    return () => {
      const currentListeners = this.eventListeners.get(event) || [];
      const index = currentListeners.indexOf(listener);
      if (index > -1) {
        currentListeners.splice(index, 1);
        this.eventListeners.set(event, currentListeners);
      }
    };
  }

  public async createSession(
    callId: string, 
    patientId: string, 
    clinicianId: string
  ): Promise<SteeringSession> {
    const session: SteeringSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      callId,
      patientId,
      clinicianId,
      startTime: new Date(),
      status: 'active',
      actions: [],
      realTimeMetrics: this.createInitialMetrics()
    };

    this.activeSessions.set(session.id, session);
    this.emit('session_created', session);

    // Send to backend via WebSocket
    if (this.websocketConnection?.readyState === WebSocket.OPEN) {
      this.websocketConnection.send(JSON.stringify({
        type: 'create_session',
        session
      }));
    }

    return session;
  }

  public async executeAction(sessionId: string, action: SteeringAction): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Add action to session
    session.actions.push(action);
    this.recentActions.unshift(action);
    
    // Keep only last 50 recent actions
    if (this.recentActions.length > 50) {
      this.recentActions = this.recentActions.slice(0, 50);
    }

    // Update session
    this.activeSessions.set(sessionId, session);
    this.emit('action_executed', { sessionId, action });

    // Send to backend via WebSocket
    if (this.websocketConnection?.readyState === WebSocket.OPEN) {
      this.websocketConnection.send(JSON.stringify({
        type: 'execute_action',
        sessionId,
        action
      }));
    }

    // Handle specific action types
    await this.handleActionExecution(session, action);
  }

  private async handleActionExecution(session: SteeringSession, action: SteeringAction) {
    switch (action.type) {
      case 'pause':
        session.status = 'paused';
        break;
      case 'resume':
        session.status = 'active';
        break;
      case 'end_call':
        session.status = 'ended';
        session.endTime = new Date();
        break;
      case 'escalate':
        await this.triggerEscalation(session, action);
        break;
    }
    
    this.activeSessions.set(session.id, session);
    this.emit('session_updated', session);
  }

  public async setConversationFlow(sessionId: string, flow: ConversationFlow): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.currentFlow = flow;
    session.currentStep = flow.steps[0]?.id;
    
    this.activeSessions.set(sessionId, session);
    this.emit('flow_changed', { sessionId, flow });

    // Send to backend via WebSocket
    if (this.websocketConnection?.readyState === WebSocket.OPEN) {
      this.websocketConnection.send(JSON.stringify({
        type: 'set_conversation_flow',
        sessionId,
        flow
      }));
    }
  }

  public async triggerEscalation(session: SteeringSession, action: SteeringAction): Promise<void> {
    const escalation: EmergencyEscalation = {
      id: `escalation-${Date.now()}`,
      severity: action.payload?.severity || 'medium',
      reason: action.description,
      action: action.payload?.escalationAction || 'clinical_alert',
      timestamp: new Date(),
      resolved: false,
      notes: action.payload?.notes
    };

    this.addEscalation(escalation);
  }

  private addEscalation(escalation: EmergencyEscalation) {
    this.pendingEscalations.unshift(escalation);
    this.emit('escalation_added', escalation);

    // Send to backend for immediate handling
    if (this.websocketConnection?.readyState === WebSocket.OPEN) {
      this.websocketConnection.send(JSON.stringify({
        type: 'trigger_escalation',
        escalation
      }));
    }
  }

  public async resolveEscalation(escalationId: string, notes?: string): Promise<void> {
    const escalation = this.pendingEscalations.find(e => e.id === escalationId);
    if (!escalation) {
      throw new Error(`Escalation ${escalationId} not found`);
    }

    escalation.resolved = true;
    escalation.notes = notes;

    // Remove from pending list
    this.pendingEscalations = this.pendingEscalations.filter(e => e.id !== escalationId);
    this.emit('escalation_resolved', escalation);

    // Notify backend
    if (this.websocketConnection?.readyState === WebSocket.OPEN) {
      this.websocketConnection.send(JSON.stringify({
        type: 'resolve_escalation',
        escalationId,
        notes
      }));
    }
  }

  private updateSession(session: SteeringSession) {
    this.activeSessions.set(session.id, session);
    this.emit('session_updated', session);
  }

  private updateSessionMetrics(sessionId: string, metrics: CallMetrics) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.realTimeMetrics = metrics;
      this.activeSessions.set(sessionId, session);
      this.emit('metrics_updated', { sessionId, metrics });
    }
  }

  private recordAction(action: SteeringAction) {
    this.recentActions.unshift(action);
    if (this.recentActions.length > 50) {
      this.recentActions = this.recentActions.slice(0, 50);
    }
    this.emit('action_recorded', action);
  }

  public getSession(sessionId: string): SteeringSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  public getAllSessions(): SteeringSession[] {
    return Array.from(this.activeSessions.values());
  }

  public getDashboard(): SteeringDashboard {
    return {
      activeSessions: this.getAllSessions(),
      pendingEscalations: this.pendingEscalations,
      recentActions: this.recentActions,
      systemStatus: {
        voiceServiceStatus: 'operational', // This would come from actual health checks
        steeringServiceStatus: this.websocketConnection?.readyState === WebSocket.OPEN 
          ? 'operational' 
          : 'down',
        lastHealthCheck: new Date()
      }
    };
  }

  public getConversationFlowTemplates(): SteeringTemplate[] {
    return [
      {
        id: 'symptom-assessment',
        name: 'Symptom Assessment',
        category: 'symptom_assessment',
        description: 'Comprehensive symptom evaluation for heart failure patients',
        controls: [],
        flows: [this.createSymptomAssessmentFlow()],
        defaultFlow: 'symptom-assessment-flow'
      },
      {
        id: 'medication-review',
        name: 'Medication Review',
        category: 'medication_check',
        description: 'Review current medications and adherence',
        controls: [],
        flows: [this.createMedicationReviewFlow()],
        defaultFlow: 'medication-review-flow'
      },
      {
        id: 'emergency-protocol',
        name: 'Emergency Assessment',
        category: 'emergency',
        description: 'Rapid assessment for emergency situations',
        controls: [],
        flows: [this.createEmergencyProtocolFlow()],
        defaultFlow: 'emergency-protocol-flow'
      }
    ];
  }

  private createInitialMetrics(): CallMetrics {
    return {
      duration: 0,
      voiceQuality: 0.85,
      stressLevel: 0.3,
      cooperationLevel: 0.8,
      biomarkers: {
        jitter: 0.005,
        shimmer: 0.03,
        hnr: 15.2,
        speechRate: 120,
        pauseDuration: 0.8
      },
      riskIndicators: []
    };
  }

  private createSymptomAssessmentFlow(): ConversationFlow {
    return {
      id: 'symptom-assessment-flow',
      name: 'Comprehensive Symptom Assessment',
      description: 'Detailed evaluation of heart failure symptoms',
      isActive: true,
      steps: [
        {
          id: 'greeting',
          name: 'Greeting',
          prompt: 'Hello, this is your routine heart health check. How are you feeling today?',
          expectedResponses: ['good', 'bad', 'okay', 'tired'],
          nextSteps: { 'good': 'breathing', 'bad': 'detailed_symptoms', 'okay': 'breathing', 'tired': 'fatigue_assessment' },
          duration: 30
        },
        {
          id: 'breathing',
          name: 'Breathing Assessment',
          prompt: 'Have you noticed any changes in your breathing or shortness of breath?',
          expectedResponses: ['yes', 'no', 'sometimes'],
          nextSteps: { 'yes': 'breathing_details', 'no': 'swelling', 'sometimes': 'breathing_details' },
          biomarkerTargets: ['breathing_pattern', 'speech_effort'],
          duration: 45
        },
        {
          id: 'swelling',
          name: 'Swelling Check',
          prompt: 'Have you noticed any swelling in your legs, ankles, or feet?',
          expectedResponses: ['yes', 'no', 'a_little'],
          nextSteps: { 'yes': 'swelling_details', 'no': 'weight_check', 'a_little': 'swelling_details' },
          duration: 30
        }
      ],
      triggers: [
        {
          condition: 'symptoms',
          value: 'severe',
          action: 'escalate'
        }
      ]
    };
  }

  private createMedicationReviewFlow(): ConversationFlow {
    return {
      id: 'medication-review-flow',
      name: 'Medication Adherence Review',
      description: 'Check medication compliance and side effects',
      isActive: true,
      steps: [
        {
          id: 'medication_greeting',
          name: 'Medication Check Greeting',
          prompt: 'Let\'s review your heart medications. Are you taking them as prescribed?',
          expectedResponses: ['yes', 'no', 'sometimes', 'forgot'],
          nextSteps: { 'yes': 'side_effects', 'no': 'medication_issues', 'sometimes': 'medication_issues', 'forgot': 'adherence_support' },
          duration: 30
        }
      ],
      triggers: []
    };
  }

  private createEmergencyProtocolFlow(): ConversationFlow {
    return {
      id: 'emergency-protocol-flow',
      name: 'Emergency Assessment Protocol',
      description: 'Rapid assessment for potential emergency situations',
      isActive: true,
      steps: [
        {
          id: 'emergency_check',
          name: 'Emergency Symptoms Check',
          prompt: 'Are you experiencing severe chest pain, extreme shortness of breath, or any other emergency symptoms right now?',
          expectedResponses: ['yes', 'no'],
          nextSteps: { 'yes': 'immediate_escalation', 'no': 'symptom_severity' },
          duration: 20
        }
      ],
      triggers: [
        {
          condition: 'symptoms',
          value: 'emergency',
          action: 'escalate'
        }
      ]
    };
  }

  public disconnect() {
    if (this.websocketConnection) {
      this.websocketConnection.close();
      this.websocketConnection = null;
    }
    this.eventListeners.clear();
  }
}

// Singleton instance
export const steeringService = new SteeringService();
export default steeringService;