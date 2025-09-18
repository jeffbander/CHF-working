import { NextRequest, NextResponse } from 'next/server';
import { SteeringSession, CallMetrics } from '@/types/steering';

// Mock storage for development - in production this would use a database
const sessions = new Map<string, SteeringSession>();

export async function GET() {
  try {
    const allSessions = Array.from(sessions.values());
    
    return NextResponse.json({
      success: true,
      sessions: allSessions,
      count: allSessions.length
    });
  } catch (error) {
    console.error('Error fetching steering sessions:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch steering sessions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { callId, patientId, clinicianId } = body;

    if (!callId || !patientId || !clinicianId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: callId, patientId, or clinicianId' 
        },
        { status: 400 }
      );
    }

    // Create new steering session
    const session: SteeringSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      callId,
      patientId,
      clinicianId,
      startTime: new Date(),
      status: 'active',
      actions: [],
      realTimeMetrics: createInitialMetrics()
    };

    sessions.set(session.id, session);

    return NextResponse.json({
      success: true,
      session,
      message: 'Steering session created successfully'
    });
  } catch (error) {
    console.error('Error creating steering session:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create steering session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function createInitialMetrics(): CallMetrics {
  return {
    duration: 0,
    voiceQuality: 0.85 + Math.random() * 0.1, // 0.85-0.95
    stressLevel: 0.2 + Math.random() * 0.3, // 0.2-0.5
    cooperationLevel: 0.7 + Math.random() * 0.2, // 0.7-0.9
    biomarkers: {
      jitter: 0.003 + Math.random() * 0.004, // 0.003-0.007
      shimmer: 0.02 + Math.random() * 0.02, // 0.02-0.04
      hnr: 12 + Math.random() * 8, // 12-20 dB
      speechRate: 100 + Math.random() * 40, // 100-140 words/min
      pauseDuration: 0.5 + Math.random() * 1.0 // 0.5-1.5 seconds
    },
    riskIndicators: []
  };
}