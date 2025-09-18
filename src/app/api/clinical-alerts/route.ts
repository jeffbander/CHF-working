import { NextRequest, NextResponse } from 'next/server';
import { ClinicalAlertService } from '../../../services/clinical-alert-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');
    const includeAcknowledged = searchParams.get('includeAcknowledged') === 'true';

    const alertService = ClinicalAlertService.getInstance();
    
    let alerts;
    if (includeAcknowledged) {
      // Get all alerts for the patient
      alerts = alertService.getActiveAlerts(patientId || undefined);
    } else {
      // Get only unacknowledged alerts
      alerts = alertService.getActiveAlerts(patientId || undefined);
    }

    // Add summary statistics
    const summary = {
      total: alerts.length,
      critical: alerts.filter(a => a.alertType === 'CRITICAL').length,
      high: alerts.filter(a => a.alertType === 'HIGH').length,
      moderate: alerts.filter(a => a.alertType === 'MODERATE').length,
      info: alerts.filter(a => a.alertType === 'INFO').length,
      unacknowledged: alerts.filter(a => !a.acknowledged).length,
      escalated: alerts.filter(a => a.escalated).length
    };

    return NextResponse.json({
      success: true,
      alerts,
      summary,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching clinical alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clinical alerts' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, alertId, clinicianId, escalationReason } = await req.json();
    const alertService = ClinicalAlertService.getInstance();

    let result = false;
    let message = '';

    switch (action) {
      case 'acknowledge':
        result = alertService.acknowledgeAlert(alertId, clinicianId);
        message = result ? 'Alert acknowledged successfully' : 'Alert not found';
        break;

      case 'escalate':
        result = alertService.escalateAlert(alertId, escalationReason);
        message = result ? 'Alert escalated successfully' : 'Alert not found';
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "acknowledge" or "escalate"' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: result,
      message,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error processing alert action:', error);
    return NextResponse.json(
      { error: 'Failed to process alert action' },
      { status: 500 }
    );
  }
}

// GET clinical thresholds
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    const alertService = ClinicalAlertService.getInstance();

    if (action === 'thresholds') {
      const thresholds = alertService.getThresholds();
      return NextResponse.json({
        success: true,
        thresholds,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error fetching thresholds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch thresholds' },
      { status: 500 }
    );
  }
}
