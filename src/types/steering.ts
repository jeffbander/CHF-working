export interface SteeringAction {
  id: string;
  type: 'prompt' | 'redirect' | 'escalate' | 'pause' | 'resume' | 'inject_question' | 'end_call';
  timestamp: Date;
  description: string;
  payload?: any;
}

export interface ConversationFlow {
  id: string;
  name: string;
  description: string;
  steps: ConversationStep[];
  triggers: FlowTrigger[];
  isActive: boolean;
}

export interface ConversationStep {
  id: string;
  name: string;
  prompt: string;
  expectedResponses: string[];
  nextSteps: { [response: string]: string };
  biomarkerTargets?: string[];
  duration?: number;
}

export interface FlowTrigger {
  condition: 'risk_level' | 'symptoms' | 'manual' | 'time_based';
  value: any;
  action: 'start_flow' | 'skip_step' | 'escalate';
}

export interface SteeringSession {
  id: string;
  callId: string;
  patientId: string;
  clinicianId: string;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'paused' | 'ended';
  actions: SteeringAction[];
  currentFlow?: ConversationFlow;
  currentStep?: string;
  realTimeMetrics: CallMetrics;
}

export interface CallMetrics {
  duration: number;
  voiceQuality: number;
  stressLevel: number;
  cooperationLevel: number;
  biomarkers: {
    jitter: number;
    shimmer: number;
    hnr: number;
    speechRate: number;
    pauseDuration: number;
  };
  riskIndicators: string[];
}

export interface SteeringControl {
  type: 'button' | 'slider' | 'text' | 'select';
  id: string;
  label: string;
  description: string;
  action: SteeringAction['type'];
  enabled: boolean;
  options?: string[];
  value?: any;
}

export interface SteeringTemplate {
  id: string;
  name: string;
  category: 'symptom_assessment' | 'medication_check' | 'emergency' | 'routine_followup';
  description: string;
  controls: SteeringControl[];
  flows: ConversationFlow[];
  defaultFlow: string;
}

export interface EmergencyEscalation {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  action: 'human_takeover' | 'emergency_services' | 'clinical_alert' | 'immediate_callback';
  timestamp: Date;
  resolved: boolean;
  notes?: string;
}

export interface SteeringDashboard {
  activeSessions: SteeringSession[];
  pendingEscalations: EmergencyEscalation[];
  recentActions: SteeringAction[];
  systemStatus: {
    voiceServiceStatus: 'operational' | 'degraded' | 'down';
    steeringServiceStatus: 'operational' | 'degraded' | 'down';
    lastHealthCheck: Date;
  };
}