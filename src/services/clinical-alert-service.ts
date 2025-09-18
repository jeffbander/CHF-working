export interface ClinicalThresholds {
  jitter: {
    normal: number;      // <1.04%
    elevated: number;    // 1.04-2.5%
    pathological: number; // >2.5%
  };
  shimmer: {
    normal: number;      // <3.5%
    elevated: number;    // 3.5-10%
    pathological: number; // >10%
  };
  hnr: {
    excellent: number;   // >18 dB
    good: number;       // 15-18 dB
    concerning: number; // 12-15 dB
    poor: number;       // <12 dB
  };
  f0: {
    minNormal: number;  // 80 Hz
    maxNormal: number;  // 300 Hz
    variabilityThreshold: number; // >50 Hz std
  };
  prosody: {
    minSpeechRate: number;    // 100 WPM
    maxPauseRate: number;     // 30%
    minVoicedRatio: number;   // 70%
  };
  riskScore: {
    low: number;        // 0-39
    moderate: number;   // 40-59
    high: number;       // 60-79
    critical: number;   // 80-100
  };
}

export interface ClinicalAlert {
  id: string;
  patientId: string;
  patientName: string;
  alertType: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'INFO';
  category: 'VOICE_QUALITY' | 'RESPIRATORY' | 'CARDIAC' | 'COGNITIVE';
  title: string;
  description: string;
  biomarkerValues: Record<string, number>;
  riskScore: number;
  timestamp: string;
  callSid: string;
  acknowledged: boolean;
  escalated: boolean;
  clinicalRecommendations: string[];
}

export interface AlertRule {
  id: string;
  name: string;
  category: ClinicalAlert['category'];
  condition: (biomarkers: any) => boolean;
  alertType: ClinicalAlert['alertType'];
  title: string;
  description: string;
  recommendations: string[];
}

export class ClinicalAlertService {
  private static instance: ClinicalAlertService;
  private alerts: ClinicalAlert[] = [];
  private alertRules: AlertRule[] = [];
  private thresholds: ClinicalThresholds;

  constructor() {
    this.thresholds = {
      jitter: {
        normal: 0.0104,      // 1.04%
        elevated: 0.025,     // 2.5%
        pathological: 0.05   // 5%
      },
      shimmer: {
        normal: 0.035,       // 3.5%
        elevated: 0.10,      // 10%
        pathological: 0.20   // 20%
      },
      hnr: {
        excellent: 18,
        good: 15,
        concerning: 12,
        poor: 8
      },
      f0: {
        minNormal: 80,
        maxNormal: 300,
        variabilityThreshold: 50
      },
      prosody: {
        minSpeechRate: 100,
        maxPauseRate: 0.30,
        minVoicedRatio: 0.70
      },
      riskScore: {
        low: 39,
        moderate: 59,
        high: 79,
        critical: 100
      }
    };

    this.initializeAlertRules();
  }

  static getInstance(): ClinicalAlertService {
    if (!ClinicalAlertService.instance) {
      ClinicalAlertService.instance = new ClinicalAlertService();
    }
    return ClinicalAlertService.instance;
  }

  private initializeAlertRules(): void {
    this.alertRules = [
      // Critical Voice Quality Alerts
      {
        id: 'critical-jitter',
        name: 'Critical Jitter Levels',
        category: 'VOICE_QUALITY',
        condition: (biomarkers) => biomarkers.jitter?.local > this.thresholds.jitter.pathological,
        alertType: 'CRITICAL',
        title: 'Severe Voice Instability Detected',
        description: 'Jitter levels indicate severe vocal cord dysfunction, potentially related to fluid retention or respiratory distress.',
        recommendations: [
          'Immediate clinical assessment recommended',
          'Check for signs of fluid overload',
          'Consider chest X-ray and BNP levels',
          'Review diuretic therapy',
          'Schedule urgent cardiology consultation'
        ]
      },
      {
        id: 'critical-shimmer',
        name: 'Critical Shimmer Levels',
        category: 'VOICE_QUALITY',
        condition: (biomarkers) => biomarkers.shimmer?.local > this.thresholds.shimmer.pathological,
        alertType: 'CRITICAL',
        title: 'Severe Amplitude Instability',
        description: 'Shimmer levels suggest significant breathing difficulties or vocal effort changes.',
        recommendations: [
          'Assess respiratory status immediately',
          'Check oxygen saturation',
          'Evaluate for pulmonary edema',
          'Consider emergency department evaluation',
          'Review heart failure medications'
        ]
      },
      {
        id: 'critical-hnr',
        name: 'Critical Voice Quality',
        category: 'RESPIRATORY',
        condition: (biomarkers) => biomarkers.hnr?.mean < this.thresholds.hnr.poor,
        alertType: 'CRITICAL',
        title: 'Severe Voice Quality Deterioration',
        description: 'Very low HNR indicates severe respiratory compromise or vocal cord dysfunction.',
        recommendations: [
          'Immediate respiratory assessment',
          'Check for acute heart failure symptoms',
          'Consider hospitalization',
          'Evaluate airway and breathing',
          'Emergency cardiology consultation'
        ]
      },

      // High Risk Alerts
      {
        id: 'high-risk-combination',
        name: 'Multiple Biomarker Elevation',
        category: 'CARDIAC',
        condition: (biomarkers) => {
          const jitterHigh = biomarkers.jitter?.local > this.thresholds.jitter.elevated;
          const shimmerHigh = biomarkers.shimmer?.local > this.thresholds.shimmer.elevated;
          const hnrLow = biomarkers.hnr?.mean < this.thresholds.hnr.concerning;
          return [jitterHigh, shimmerHigh, hnrLow].filter(Boolean).length >= 2;
        },
        alertType: 'HIGH',
        title: 'Multiple Voice Biomarkers Elevated',
        description: 'Combination of elevated voice biomarkers suggests worsening heart failure status.',
        recommendations: [
          'Schedule urgent clinical follow-up within 24-48 hours',
          'Increase monitoring frequency',
          'Review and optimize heart failure medications',
          'Check weight and fluid status',
          'Consider telehealth consultation'
        ]
      },
      {
        id: 'respiratory-distress',
        name: 'Respiratory Pattern Changes',
        category: 'RESPIRATORY',
        condition: (biomarkers) => {
          const highPauseRate = biomarkers.prosody?.pauseRate > this.thresholds.prosody.maxPauseRate;
          const lowVoicedRatio = biomarkers.prosody?.voicedRatio < this.thresholds.prosody.minVoicedRatio;
          const slowSpeech = biomarkers.prosody?.speechRate < this.thresholds.prosody.minSpeechRate;
          return [highPauseRate, lowVoicedRatio, slowSpeech].filter(Boolean).length >= 2;
        },
        alertType: 'HIGH',
        title: 'Respiratory Pattern Abnormalities',
        description: 'Speech patterns suggest breathing difficulties or increased respiratory effort.',
        recommendations: [
          'Assess for shortness of breath',
          'Check for orthopnea or PND',
          'Review fluid intake and weight',
          'Consider pulmonary function assessment',
          'Evaluate need for oxygen therapy'
        ]
      },

      // Moderate Risk Alerts
      {
        id: 'moderate-voice-changes',
        name: 'Voice Quality Changes',
        category: 'VOICE_QUALITY',
        condition: (biomarkers) => {
          const jitterElevated = biomarkers.jitter?.local > this.thresholds.jitter.normal && 
                                 biomarkers.jitter?.local <= this.thresholds.jitter.elevated;
          const shimmerElevated = biomarkers.shimmer?.local > this.thresholds.shimmer.normal && 
                                 biomarkers.shimmer?.local <= this.thresholds.shimmer.elevated;
          return jitterElevated || shimmerElevated;
        },
        alertType: 'MODERATE',
        title: 'Voice Quality Changes Detected',
        description: 'Mild to moderate changes in voice stability may indicate early heart failure progression.',
        recommendations: [
          'Monitor trends over next few assessments',
          'Review patient symptoms',
          'Check medication adherence',
          'Consider routine follow-up within 1 week',
          'Patient education on symptom monitoring'
        ]
      },
      {
        id: 'cognitive-load',
        name: 'Cognitive Load Indicators',
        category: 'COGNITIVE',
        condition: (biomarkers) => {
          const highVariability = biomarkers.f0?.std > this.thresholds.f0.variabilityThreshold;
          const slowSpeech = biomarkers.prosody?.speechRate < this.thresholds.prosody.minSpeechRate;
          return highVariability && slowSpeech;
        },
        alertType: 'MODERATE',
        title: 'Cognitive Load Indicators',
        description: 'Speech patterns suggest increased cognitive effort or fatigue.',
        recommendations: [
          'Assess for fatigue and cognitive symptoms',
          'Review sleep quality',
          'Check for medication side effects',
          'Consider cognitive assessment if persistent',
          'Evaluate overall functional status'
        ]
      }
    ];
  }

  public evaluateBiomarkers(
    patientId: string,
    patientName: string,
    callSid: string,
    biomarkers: any,
    riskScore: number
  ): ClinicalAlert[] {
    const newAlerts: ClinicalAlert[] = [];

    // Evaluate each alert rule
    for (const rule of this.alertRules) {
      if (rule.condition(biomarkers)) {
        const alert: ClinicalAlert = {
          id: `${rule.id}-${callSid}-${Date.now()}`,
          patientId,
          patientName,
          alertType: rule.alertType,
          category: rule.category,
          title: rule.title,
          description: rule.description,
          biomarkerValues: this.extractRelevantBiomarkers(biomarkers, rule.category),
          riskScore,
          timestamp: new Date().toISOString(),
          callSid,
          acknowledged: false,
          escalated: false,
          clinicalRecommendations: rule.recommendations
        };

        newAlerts.push(alert);
        this.alerts.push(alert);
      }
    }

    // Add overall risk score alert if critical
    if (riskScore >= this.thresholds.riskScore.critical) {
      const criticalRiskAlert: ClinicalAlert = {
        id: `critical-risk-${callSid}-${Date.now()}`,
        patientId,
        patientName,
        alertType: 'CRITICAL',
        category: 'CARDIAC',
        title: 'Critical Heart Failure Risk Score',
        description: `Overall risk score of ${riskScore} indicates high probability of heart failure decompensation.`,
        biomarkerValues: biomarkers,
        riskScore,
        timestamp: new Date().toISOString(),
        callSid,
        acknowledged: false,
        escalated: false,
        clinicalRecommendations: [
          'Immediate clinical evaluation required',
          'Consider emergency department assessment',
          'Review all heart failure medications',
          'Check vital signs and weight',
          'Urgent cardiology consultation',
          'Consider hospitalization if clinically indicated'
        ]
      };

      newAlerts.push(criticalRiskAlert);
      this.alerts.push(criticalRiskAlert);
    }

    // Log alerts for monitoring
    if (newAlerts.length > 0) {
      console.log(`🚨 Generated ${newAlerts.length} clinical alerts for patient ${patientName}:`, 
        newAlerts.map(a => `${a.alertType}: ${a.title}`));
    }

    return newAlerts;
  }

  private extractRelevantBiomarkers(biomarkers: any, category: ClinicalAlert['category']): Record<string, number> {
    switch (category) {
      case 'VOICE_QUALITY':
        return {
          jitter: biomarkers.jitter?.local || 0,
          shimmer: biomarkers.shimmer?.local || 0,
          hnr: biomarkers.hnr?.mean || 0
        };
      case 'RESPIRATORY':
        return {
          hnr: biomarkers.hnr?.mean || 0,
          pauseRate: biomarkers.prosody?.pauseRate || 0,
          voicedRatio: biomarkers.prosody?.voicedRatio || 0
        };
      case 'CARDIAC':
        return {
          jitter: biomarkers.jitter?.local || 0,
          shimmer: biomarkers.shimmer?.local || 0,
          hnr: biomarkers.hnr?.mean || 0,
          f0Variability: biomarkers.f0?.std || 0
        };
      case 'COGNITIVE':
        return {
          speechRate: biomarkers.prosody?.speechRate || 0,
          f0Variability: biomarkers.f0?.std || 0,
          pauseRate: biomarkers.prosody?.pauseRate || 0
        };
      default:
        return biomarkers;
    }
  }

  public getActiveAlerts(patientId?: string): ClinicalAlert[] {
    let alerts = this.alerts.filter(alert => !alert.acknowledged);
    
    if (patientId) {
      alerts = alerts.filter(alert => alert.patientId === patientId);
    }

    return alerts.sort((a, b) => {
      // Sort by alert type priority, then by timestamp
      const priorityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MODERATE': 2, 'INFO': 3 };
      const aPriority = priorityOrder[a.alertType];
      const bPriority = priorityOrder[b.alertType];
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }

  public acknowledgeAlert(alertId: string, clinicianId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      console.log(`✅ Alert ${alertId} acknowledged by ${clinicianId}`);
      return true;
    }
    return false;
  }

  public escalateAlert(alertId: string, escalationReason: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.escalated = true;
      console.log(`🚨 Alert ${alertId} escalated: ${escalationReason}`);
      // In production, this would trigger notifications to senior clinicians
      return true;
    }
    return false;
  }

  public getThresholds(): ClinicalThresholds {
    return this.thresholds;
  }

  public updateThresholds(newThresholds: Partial<ClinicalThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    console.log('📊 Clinical thresholds updated');
  }
}
