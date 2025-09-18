// HeartVoice Monitor - Individual Patient API Routes
import { NextRequest, NextResponse } from 'next/server';
import { PatientService } from '@/services/patient-service';
import { UpdatePatientRequest } from '@/types/clinical';

const patientService = PatientService.getInstance();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const patient = await patientService.getPatientById(id);
    
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ patient }, { status: 200 });
  } catch (error) {
    console.error('Error fetching patient:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patient' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();
    
    const updateRequest: UpdatePatientRequest = {
      patientId: id,
      updates
    };

    const patient = await patientService.updatePatient(updateRequest);
    
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ patient }, { status: 200 });
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json(
      { error: 'Failed to update patient' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const reason = searchParams.get('reason') || 'No reason provided';
    
    const success = await patientService.deactivatePatient(id, reason);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Patient deactivated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deactivating patient:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate patient' },
      { status: 500 }
    );
  }
}