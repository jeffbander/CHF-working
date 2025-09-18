import { NextRequest, NextResponse } from 'next/server';
import { SteeringAction, SteeringSession } from '@/types/steering';

// Mock storage for development - in production this would use a database
const sessions = new Map<string, SteeringSession>();
const actions = new Map<string, SteeringAction[]>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, action } = body;

    if (!sessionId || !action) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: sessionId or action' 
        },
        { status: 400 }
      );
    }

    // Validate action structure
    if (!action.type || !action.description) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid action structure: missing type or description' 
        },
        { status: 400 }
      );
    }

    // Get session
    const session = sessions.get(sessionId);
    if (!session) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Session ${sessionId} not found` 
        },
        { status: 404 }
      );
    }

    // Create complete action object
    const steeringAction: SteeringAction = {
      id: action.id || `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: action.type,
      timestamp: new Date(action.timestamp || Date.now()),
      description: action.description,
      payload: action.payload
    };

    // Add action to session
    session.actions.push(steeringAction);

    // Store action globally
    const sessionActions = actions.get(sessionId) || [];
    sessionActions.push(steeringAction);
    actions.set(sessionId, sessionActions);

    // Handle action effects on session state
    handleActionEffects(session, steeringAction);

    // Update session in storage
    sessions.set(sessionId, session);

    return NextResponse.json({
      success: true,
      action: steeringAction,
      session,
      message: `Steering action '${steeringAction.type}' executed successfully`
    });
  } catch (error) {
    console.error('Error executing steering action:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to execute steering action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      // Get actions for specific session
      const sessionActions = actions.get(sessionId) || [];
      return NextResponse.json({
        success: true,
        actions: sessionActions,
        sessionId,
        count: sessionActions.length
      });
    } else {
      // Get all recent actions across all sessions
      const allActions: SteeringAction[] = [];
      for (const sessionActions of actions.values()) {
        allActions.push(...sessionActions);
      }
      
      // Sort by timestamp, most recent first
      allActions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      // Return last 50 actions
      const recentActions = allActions.slice(0, 50);
      
      return NextResponse.json({
        success: true,
        actions: recentActions,
        count: recentActions.length
      });
    }
  } catch (error) {
    console.error('Error fetching steering actions:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch steering actions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function handleActionEffects(session: SteeringSession, action: SteeringAction) {
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
    
    case 'prompt':
      // Update cooperation level based on prompt effectiveness
      session.realTimeMetrics.cooperationLevel = Math.min(
        0.95, 
        session.realTimeMetrics.cooperationLevel + 0.05
      );
      break;
    
    case 'redirect':
      // Update stress level when redirecting conversation
      session.realTimeMetrics.stressLevel = Math.max(
        0.1,
        session.realTimeMetrics.stressLevel - 0.1
      );
      break;
    
    case 'inject_question':
      // Update cooperation and voice quality
      session.realTimeMetrics.cooperationLevel = Math.min(
        0.95,
        session.realTimeMetrics.cooperationLevel + 0.03
      );
      session.realTimeMetrics.voiceQuality = Math.min(
        0.95,
        session.realTimeMetrics.voiceQuality + 0.02
      );
      break;
    
    case 'escalate':
      // Mark as requiring attention
      session.realTimeMetrics.riskIndicators.push('Manual Escalation');
      session.realTimeMetrics.stressLevel = Math.min(
        0.9,
        session.realTimeMetrics.stressLevel + 0.2
      );
      break;
  }
  
  // Update duration (simulate time passing)
  session.realTimeMetrics.duration += Math.floor(Math.random() * 30) + 10;
}