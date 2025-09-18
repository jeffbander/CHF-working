// HeartVoice Monitor - Dashboard API Route
import { NextRequest, NextResponse } from 'next/server';
import { PatientService } from '@/services/patient-service';
import { PatientDashboard, ClinicalAlert } from '@/types/clinical';

const patientService = PatientService.getInstance();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicianId = searchParams.get('clinicianId');
    const timeframe = searchParams.get('timeframe') || 'today';

    // Get dashboard metrics
    const metrics = await patientService.getDashboardMetrics();
    
    // Mock recent assessments and alerts for development
    const mockRecentAssessments = [
      {
        id: 'assessment-001',
        patientId: 'patient-001',
        sessionId: 'session-001',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        callDuration: 185,
        callStatus: 'completed' as const,
        biomarkers: {
          jitter: 2.1,
          shimmer: 6.2,
          hnr: 9.5,
          f0: 145.2,
          spectralSlope: -8.7,
          voiceIntensity: 48.3
        },
        qualityMetrics: {
          audioQuality: 87,
          backgroundNoise: 12,
          completeness: 95
        },
        riskScore: 87,
        alertGenerated: true
      },
      {
        id: 'assessment-002',
        patientId: 'patient-002',
        sessionId: 'session-002',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        callDuration: 203,
        callStatus: 'completed' as const,
        biomarkers: {
          jitter: 1.8,
          shimmer: 5.9,
          hnr: 11.2,
          f0: 152.1,
          spectralSlope: -9.2,
          voiceIntensity: 52.1
        },
        qualityMetrics: {
          audioQuality: 92,
          backgroundNoise: 8,
          completeness: 98
        },
        riskScore: 82,
        alertGenerated: true
      }
    ];

    const mockCriticalAlerts: ClinicalAlert[] = [
      {
        id: 'alert-001',
        patientId: 'patient-001',
        assessmentId: 'assessment-001',
        type: 'critical',
        priority: 'immediate',
        message: 'Critical risk score increase detected',
        detailedDescription: 'Patient John Martinez shows significant deterioration in voice biomarkers with risk score of 87. Immediate clinical attention recommended.',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        escalationLevel: 2,
        requiredActions: [
          'Contact patient immediately',
          'Schedule urgent clinical assessment',
          'Review medication compliance',
          'Consider hospitalization if symptoms worsen'
        ]
      },
      {
        id: 'alert-002',
        patientId: 'patient-002',
        assessmentId: 'assessment-002',
        type: 'critical',
        priority: 'urgent',
        message: 'Sustained high risk score',
        detailedDescription: 'Patient Katherine Thompson maintains critical risk level. Clinical review needed within 2 hours.',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        escalationLevel: 1,
        requiredActions: [
          'Clinical assessment within 2 hours',
          'Verify emergency contact information',
          'Review current medications'
        ]
      }
    ];

    // Build dashboard response
    const dashboard: PatientDashboard = {
      totalPatients: metrics.totalPatients,
      riskDistribution: metrics.riskDistribution,
      todaysMetrics: {
        callsCompleted: 156,
        callsScheduled: 180,
        successRate: 87,
        avgRiskScore: metrics.avgRiskScore,
        alertsGenerated: 8
      },
      criticalAlerts: mockCriticalAlerts,
      recentAssessments: mockRecentAssessments
    };

    return NextResponse.json({
      dashboard,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}