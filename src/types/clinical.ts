// HeartVoice Monitor - Core Clinical Types
// Based on design specifications for clinical voice biomarker platform

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Patient {
  id: string;
  demographics: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    mrn: string; // Medical Record Number
    phoneNumber: string;
    email?: string;
  };
  clinicalInfo: {
    diagnosisDate: string;
    ejectionFraction?: number;
    nyhaClass: 1 | 2 | 3 | 4; // NYHA Heart Failure Classification
    medications: string[];
    allergies: string[];
    emergencyContact: {
      name: string;
      relationship: string;
      phoneNumber: string;
    };
  };
  monitoring: {
    enrollmentDate: string;
    consentStatus: 'active' | 'withdrawn' | 'expired';
    assessmentFrequency: 'daily' | 'weekly' | 'bi-weekly';
    preferredCallTimes: string[];
    timezone: string;
  };
  currentRisk: {
    score: number; // 0-100
    level: RiskLevel;
    lastUpdated: string;
    trend: 'improving' | 'stable' | 'deteriorating';
  };
}

export interface VoiceBiomarkers {
  jitter: number; // Cycle-to-cycle variation in fundamental frequency (%)
  shimmer: number; // Cycle-to-cycle variation in amplitude (%)
  hnr: number; // Harmonics-to-Noise Ratio (dB)
  f0: number; // Fundamental frequency (Hz)
  spectralSlope: number; // Spectral characteristics
  voiceIntensity: number; // Average voice intensity (dB)
}

export interface VoiceAssessment {
  id: string;
  patientId: string;
  sessionId: string;
  timestamp: string;
  callDuration: number; // seconds
  callStatus: 'completed' | 'partial' | 'failed' | 'no-answer';
  biomarkers?: VoiceBiomarkers;
  qualityMetrics: {
    audioQuality: number; // 0-100
    backgroundNoise: number; // 0-100
    completeness: number; // 0-100
  };
  clinicalAnalysis?: {
    riskIndicators: {
      anxiety: number; // 0-100
      breathlessness: number; // 0-100
      confusion: number; // 0-100
      fatigue: number; // 0-100
    };
    conversationQuality: {
      coherence: number; // 0-100
      engagement: number; // 0-100
      completeness: number; // 0-100
    };
    clinicalSummary: string;
    recommendedActions: string[];
    confidence: number; // 0-100
  };
  riskScore: number; // 0-100
  alertGenerated: boolean;
}

export interface ClinicalAlert {
  id: string;
  patientId: string;
  assessmentId: string;
  type: 'critical' | 'high' | 'medium' | 'low';
  priority: 'immediate' | 'urgent' | 'routine';
  message: string;
  detailedDescription: string;
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  status: 'active' | 'acknowledged' | 'resolved';
  escalationLevel: number; // 0-3
  requiredActions: string[];
}

export interface PatientDashboard {
  totalPatients: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  todaysMetrics: {
    callsCompleted: number;
    callsScheduled: number;
    successRate: number;
    avgRiskScore: number;
    alertsGenerated: number;
  };
  criticalAlerts: ClinicalAlert[];
  recentAssessments: VoiceAssessment[];
}

export interface ClinicalUser {
  id: string;
  type: 'cardiologist' | 'nurse' | 'care_coordinator' | 'administrator';
  name: string;
  title: string;
  department: string;
  permissions: string[];
  patients: string[]; // Patient IDs assigned to this user
  contactInfo: {
    email: string;
    phone: string;
    pager?: string;
  };
  preferences: {
    alertMethods: ('email' | 'sms' | 'pager' | 'in-app')[];
    dashboardLayout: string;
    timezone: string;
  };
}

// API Request/Response types
export interface CreatePatientRequest {
  demographics: Patient['demographics'];
  clinicalInfo: Omit<Patient['clinicalInfo'], 'emergencyContact'> & {
    emergencyContact: Patient['clinicalInfo']['emergencyContact'];
  };
  monitoring: Omit<Patient['monitoring'], 'enrollmentDate' | 'consentStatus'>;
}

export interface UpdatePatientRequest {
  patientId: string;
  updates: Partial<Patient>;
}

export interface ScheduleAssessmentRequest {
  patientId: string;
  scheduledFor: string;
  assessmentType: 'routine' | 'follow_up' | 'urgent';
  notes?: string;
}

export interface GetDashboardResponse {
  dashboard: PatientDashboard;
  lastUpdated: string;
}

// HIPAA-compliant data types (no PHI)
export interface SafeVoiceAnalysisRequest {
  sessionId: string; // Pseudonymized ID
  deidentifiedTranscript: string; // PHI removed
  conversationFlow: string[]; // Structured responses only
  clinicalContext: 'heart_failure_monitoring' | 'routine_check' | 'symptoms_assessment';
  timestamp: string; // For caching, no patient correlation
}