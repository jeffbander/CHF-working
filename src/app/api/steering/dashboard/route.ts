import { NextRequest, NextResponse } from 'next/server';
import { SteeringDashboard, SteeringSession, EmergencyEscalation, SteeringAction } from '@/types/steering';

// Mock storage for development - in production this would use a database
const sessions = new Map<string, SteeringSession>();
const escalations = new Map<string, EmergencyEscalation>();
const actions = new Map<string, SteeringAction[]>();

export async function GET() {
  try {
    // Get all active sessions
    const allSessions = Array.from(sessions.values());
    const activeSessions = allSessions.filter(s => s.status === 'active' || s.status === 'paused');

    // Get pending escalations
    const allEscalations = Array.from(escalations.values());
    const pendingEscalations = allEscalations.filter(e => !e.resolved);

    // Get recent actions (last 50)
    const allActions: SteeringAction[] = [];
    for (const sessionActions of actions.values()) {
      allActions.push(...sessionActions);
    }
    allActions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    const recentActions = allActions.slice(0, 50);

    // Determine system status
    const systemStatus = {
      voiceServiceStatus: getServiceStatus('voice'),
      steeringServiceStatus: getServiceStatus('steering'),
      lastHealthCheck: new Date()
    };

    const dashboard: SteeringDashboard = {
      activeSessions,
      pendingEscalations,
      recentActions,
      systemStatus
    };

    return NextResponse.json({
      success: true,
      dashboard,
      summary: {
        activeSessionsCount: activeSessions.length,
        pendingEscalationsCount: pendingEscalations.length,
        recentActionsCount: recentActions.length,
        criticalEscalations: pendingEscalations.filter(e => e.severity === 'critical').length,
        highRiskSessions: activeSessions.filter(s => 
          s.realTimeMetrics.riskIndicators.length > 0 || 
          s.realTimeMetrics.stressLevel > 0.7
        ).length
      }
    });
  } catch (error) {
    console.error('Error fetching steering dashboard:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch steering dashboard',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sessionId } = body;

    switch (action) {
      case 'refresh':
        // Simulate updating metrics for all active sessions
        const activeSessions = Array.from(sessions.values()).filter(s => s.status === 'active');
        for (const session of activeSessions) {
          updateSessionMetrics(session);
          sessions.set(session.id, session);
        }
        break;

      case 'healthCheck':
        // Perform system health check
        const healthResults = await performHealthCheck();
        return NextResponse.json({
          success: true,
          healthResults,
          timestamp: new Date()
        });

      case 'createDemoSession':
        // Create a demo session for testing
        const demoSession = createDemoSession();
        sessions.set(demoSession.id, demoSession);
        return NextResponse.json({
          success: true,
          session: demoSession,
          message: 'Demo session created'
        });

      default:
        return NextResponse.json(
          { 
            success: false, 
            error: `Unknown action: ${action}` 
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Action '${action}' completed successfully`
    });
  } catch (error) {
    console.error('Error handling dashboard action:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to handle dashboard action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getServiceStatus(service: 'voice' | 'steering'): 'operational' | 'degraded' | 'down' {
  // Simulate service status - in production this would check actual service health
  const random = Math.random();
  
  if (random > 0.9) return 'down';
  if (random > 0.8) return 'degraded';
  return 'operational';
}

function updateSessionMetrics(session: SteeringSession) {
  // Simulate real-time metric updates
  const metrics = session.realTimeMetrics;
  
  // Update duration
  metrics.duration += Math.floor(Math.random() * 30) + 10;
  
  // Simulate voice quality fluctuations
  metrics.voiceQuality += (Math.random() - 0.5) * 0.1;
  metrics.voiceQuality = Math.max(0.3, Math.min(0.98, metrics.voiceQuality));
  
  // Simulate stress level changes
  metrics.stressLevel += (Math.random() - 0.5) * 0.2;
  metrics.stressLevel = Math.max(0.1, Math.min(0.9, metrics.stressLevel));
  
  // Simulate cooperation level changes
  metrics.cooperationLevel += (Math.random() - 0.5) * 0.1;
  metrics.cooperationLevel = Math.max(0.3, Math.min(0.95, metrics.cooperationLevel));
  
  // Update biomarkers with small variations
  metrics.biomarkers.jitter += (Math.random() - 0.5) * 0.001;
  metrics.biomarkers.jitter = Math.max(0.001, Math.min(0.01, metrics.biomarkers.jitter));
  
  metrics.biomarkers.shimmer += (Math.random() - 0.5) * 0.01;
  metrics.biomarkers.shimmer = Math.max(0.01, Math.min(0.08, metrics.biomarkers.shimmer));
  
  metrics.biomarkers.hnr += (Math.random() - 0.5) * 2;
  metrics.biomarkers.hnr = Math.max(8, Math.min(25, metrics.biomarkers.hnr));
  
  metrics.biomarkers.speechRate += (Math.random() - 0.5) * 10;
  metrics.biomarkers.speechRate = Math.max(80, Math.min(180, metrics.biomarkers.speechRate));
  
  metrics.biomarkers.pauseDuration += (Math.random() - 0.5) * 0.3;
  metrics.biomarkers.pauseDuration = Math.max(0.2, Math.min(2.0, metrics.biomarkers.pauseDuration));
  
  // Add risk indicators based on thresholds
  metrics.riskIndicators = [];
  if (metrics.stressLevel > 0.7) {
    metrics.riskIndicators.push('High Stress Detected');
  }
  if (metrics.voiceQuality < 0.5) {
    metrics.riskIndicators.push('Poor Voice Quality');
  }
  if (metrics.cooperationLevel < 0.4) {
    metrics.riskIndicators.push('Low Cooperation');
  }
  if (metrics.biomarkers.jitter > 0.008) {
    metrics.riskIndicators.push('Elevated Jitter');
  }
  if (metrics.biomarkers.hnr < 12) {
    metrics.riskIndicators.push('Low HNR');
  }
}

function createDemoSession(): SteeringSession {
  const sessionId = `demo-session-${Date.now()}`;
  
  return {
    id: sessionId,
    callId: `demo-call-${Date.now()}`,
    patientId: 'DEMO-PATIENT-001',
    clinicianId: 'clinician-001',
    startTime: new Date(Date.now() - Math.random() * 300000), // Started up to 5 minutes ago
    status: 'active',
    actions: [],
    realTimeMetrics: {
      duration: Math.floor(Math.random() * 300) + 60, // 1-6 minutes
      voiceQuality: 0.7 + Math.random() * 0.2, // 0.7-0.9
      stressLevel: 0.2 + Math.random() * 0.4, // 0.2-0.6
      cooperationLevel: 0.6 + Math.random() * 0.3, // 0.6-0.9
      biomarkers: {
        jitter: 0.003 + Math.random() * 0.005, // 0.003-0.008
        shimmer: 0.02 + Math.random() * 0.03, // 0.02-0.05
        hnr: 10 + Math.random() * 12, // 10-22 dB
        speechRate: 90 + Math.random() * 60, // 90-150 words/min
        pauseDuration: 0.4 + Math.random() * 1.2 // 0.4-1.6 seconds
      },
      riskIndicators: Math.random() > 0.7 ? ['Demo Risk Indicator'] : []
    }
  };
}

async function performHealthCheck() {
  // Simulate health check for various services
  return {
    voiceService: {
      status: getServiceStatus('voice'),
      responseTime: Math.floor(Math.random() * 100) + 50, // 50-150ms
      lastCheck: new Date()
    },
    steeringService: {
      status: getServiceStatus('steering'),
      responseTime: Math.floor(Math.random() * 50) + 20, // 20-70ms
      lastCheck: new Date()
    },
    database: {
      status: 'operational' as const,
      responseTime: Math.floor(Math.random() * 30) + 10, // 10-40ms
      lastCheck: new Date()
    },
    websocket: {
      status: 'operational' as const,
      activeConnections: Math.floor(Math.random() * 20) + 5, // 5-25 connections
      lastCheck: new Date()
    }
  };
}