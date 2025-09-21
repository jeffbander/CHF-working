// HeartVoice Monitor - Patients API Routes
import { NextRequest, NextResponse } from 'next/server';
import { PatientService } from '@/services/patient-service';
import { CreatePatientRequest } from '@/types/clinical';

const patientService = new PatientService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const riskLevel = searchParams.get('riskLevel');
    const clinicianId = searchParams.get('clinicianId');
    const query = searchParams.get('q');

    let patients;

    if (query) {
      patients = await patientService.searchPatients(query);
    } else if (riskLevel && ['low', 'medium', 'high', 'critical'].includes(riskLevel)) {
      patients = await patientService.getPatientsByRiskLevel(riskLevel as 'low' | 'medium' | 'high' | 'critical');
    } else if (clinicianId) {
      patients = await patientService.getPatientsByAssignedClinician(clinicianId);
    } else {
      patients = await patientService.getAllPatients();
    }

    return NextResponse.json({ patients }, { status: 200 });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePatientRequest = await request.json();
    
    // Validate required fields
    if (!body.demographics?.firstName || !body.demographics?.lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    if (!body.demographics?.phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const patient = await patientService.createPatient(body);
    
    return NextResponse.json({ patient }, { status: 201 });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { error: 'Failed to create patient' },
      { status: 500 }
    );
  }
}