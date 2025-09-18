import { NextRequest, NextResponse } from 'next/server';
import { EmergencyEscalation } from '@/types/steering';

// Mock storage for development - in production this would use a database
const escalations = new Map<string, EmergencyEscalation>();

export async function GET() {
  try {
    const allEscalations = Array.from(escalations.values());
    
    // Filter for pending escalations
    const pendingEscalations = allEscalations.filter(e => !e.resolved);
    
    // Sort by severity and timestamp
    pendingEscalations.sort((a, b) => {
      const severityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
    
    return NextResponse.json({
      success: true,
      escalations: pendingEscalations,
      count: pendingEscalations.length,
      total: allEscalations.length
    });
  } catch (error) {
    console.error('Error fetching escalations:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch escalations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { severity, reason, action, sessionId, notes } = body;

    if (!severity || !reason || !action) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: severity, reason, or action' 
        },
        { status: 400 }
      );
    }

    // Validate severity level
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    if (!validSeverities.includes(severity)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid severity level. Must be one of: ${validSeverities.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Validate action type
    const validActions = ['human_takeover', 'emergency_services', 'clinical_alert', 'immediate_callback'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid action type. Must be one of: ${validActions.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Create escalation
    const escalation: EmergencyEscalation = {
      id: `escalation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      severity,
      reason,
      action,
      timestamp: new Date(),
      resolved: false,
      notes
    };

    escalations.set(escalation.id, escalation);

    // Simulate immediate actions based on severity
    const immediateActions = await handleImmediateEscalation(escalation, sessionId);

    return NextResponse.json({
      success: true,
      escalation,
      immediateActions,
      message: `Escalation created with severity: ${severity}`
    });
  } catch (error) {
    console.error('Error creating escalation:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create escalation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { escalationId, resolved, notes, resolutionAction } = body;

    if (!escalationId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required field: escalationId' 
        },
        { status: 400 }
      );
    }

    const escalation = escalations.get(escalationId);
    if (!escalation) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Escalation ${escalationId} not found` 
        },
        { status: 404 }
      );
    }

    // Update escalation
    if (resolved !== undefined) {
      escalation.resolved = resolved;
    }
    if (notes !== undefined) {
      escalation.notes = notes;
    }

    escalations.set(escalationId, escalation);

    return NextResponse.json({
      success: true,
      escalation,
      message: `Escalation ${resolved ? 'resolved' : 'updated'} successfully`
    });
  } catch (error) {
    console.error('Error updating escalation:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update escalation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function handleImmediateEscalation(escalation: EmergencyEscalation, sessionId?: string) {
  const actions = [];

  switch (escalation.severity) {
    case 'critical':
      actions.push('Emergency services notified');
      actions.push('On-call physician paged');
      actions.push('Patient emergency contact called');
      break;
    
    case 'high':
      actions.push('Clinical supervisor notified');
      actions.push('Immediate callback scheduled');
      actions.push('Patient file flagged for urgent review');
      break;
    
    case 'medium':
      actions.push('Clinical alert sent to care team');
      actions.push('Follow-up appointment scheduled');
      break;
    
    case 'low':
      actions.push('Case note added to patient record');
      actions.push('Routine follow-up scheduled');
      break;
  }

  switch (escalation.action) {
    case 'emergency_services':
      actions.push('911 dispatch initiated');
      actions.push('EMS en route notification sent');
      break;
    
    case 'human_takeover':
      actions.push('Call transferred to clinician');
      actions.push('AI agent paused');
      break;
    
    case 'clinical_alert':
      actions.push('Alert sent to clinical dashboard');
      actions.push('SMS notification sent to care team');
      break;
    
    case 'immediate_callback':
      actions.push('Priority callback queue updated');
      actions.push('Next available clinician assigned');
      break;
  }

  // Log escalation handling
  console.log(`Escalation ${escalation.id} handled:`, {
    severity: escalation.severity,
    action: escalation.action,
    immediateActions: actions,
    sessionId
  });

  return actions;
}