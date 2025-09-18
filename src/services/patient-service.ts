// HeartVoice Monitor - Patient Management Service
// Handles patient data, monitoring schedules, and clinical workflows

import { Patient, CreatePatientRequest, UpdatePatientRequest, RiskLevel } from '@/types/clinical';
import fs from 'fs';
import path from 'path';

const PATIENTS_FILE = path.join(process.cwd(), 'data', 'patients.json');

export class PatientService {
  private static instance: PatientService;
  private patients: Map<string, Patient> = new Map();
  private initialized = false;

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): PatientService {
    if (!PatientService.instance) {
      PatientService.instance = new PatientService();
    }
    return PatientService.instance;
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      await this.loadPatients();
      this.initialized = true;
    }
  }

  private async loadPatients() {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(PATIENTS_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Load existing patients from file
      if (fs.existsSync(PATIENTS_FILE)) {
        const data = fs.readFileSync(PATIENTS_FILE, 'utf8');
        const patientsArray: Patient[] = JSON.parse(data);
        
        this.patients.clear();
        patientsArray.forEach(patient => {
          this.patients.set(patient.id, patient);
        });
        
        console.log(`Loaded ${patientsArray.length} patients from storage`);
        return;
      }
    } catch (error) {
      console.error('Error loading patients from file:', error);
    }

    // If no file exists or error loading, initialize with mock data
    this.initializeMockPatients();
    await this.savePatients();
  }

  private async savePatients() {
    try {
      const patientsArray = Array.from(this.patients.values());
      fs.writeFileSync(PATIENTS_FILE, JSON.stringify(patientsArray, null, 2));
      console.log(`Saved ${patientsArray.length} patients to storage`);
    } catch (error) {
      console.error('Error saving patients to file:', error);
    }
  }

  private initializeMockPatients() {
    const mockPatients: Patient[] = [
      {
        id: 'patient-001',
        demographics: {
          firstName: 'John',
          lastName: 'Martinez',
          dateOfBirth: '1965-03-15',
          mrn: 'MRN001234',
          phoneNumber: '555-0123',
          email: 'j.martinez@email.com'
        },
        clinicalInfo: {
          diagnosisDate: '2023-08-15',
          ejectionFraction: 35,
          nyhaClass: 2,
          medications: ['Lisinopril 10mg', 'Metoprolol 25mg', 'Furosemide 40mg'],
          allergies: ['Penicillin'],
          emergencyContact: {
            name: 'Maria Martinez',
            relationship: 'Spouse',
            phoneNumber: '555-0124'
          }
        },
        monitoring: {
          enrollmentDate: '2023-09-01',
          consentStatus: 'active',
          assessmentFrequency: 'daily',
          preferredCallTimes: ['09:00', '14:00'],
          timezone: 'America/New_York'
        },
        currentRisk: {
          score: 87,
          level: 'critical',
          lastUpdated: '2025-09-07T15:30:00Z',
          trend: 'deteriorating'
        }
      },
      {
        id: 'patient-002',
        demographics: {
          firstName: 'Katherine',
          lastName: 'Thompson',
          dateOfBirth: '1958-11-22',
          mrn: 'MRN001235',
          phoneNumber: '555-0125',
          email: 'k.thompson@email.com'
        },
        clinicalInfo: {
          diagnosisDate: '2022-05-10',
          ejectionFraction: 42,
          nyhaClass: 3,
          medications: ['Enalapril 5mg', 'Carvedilol 12.5mg', 'Spironolactone 25mg'],
          allergies: [],
          emergencyContact: {
            name: 'Robert Thompson',
            relationship: 'Son',
            phoneNumber: '555-0126'
          }
        },
        monitoring: {
          enrollmentDate: '2023-01-15',
          consentStatus: 'active',
          assessmentFrequency: 'weekly',
          preferredCallTimes: ['10:00', '16:00'],
          timezone: 'America/Chicago'
        },
        currentRisk: {
          score: 82,
          level: 'critical',
          lastUpdated: '2025-09-07T11:15:00Z',
          trend: 'stable'
        }
      },
      {
        id: 'patient-003',
        demographics: {
          firstName: 'Robert',
          lastName: 'Johnson',
          dateOfBirth: '1972-07-08',
          mrn: 'MRN001236',
          phoneNumber: '555-0127',
          email: 'r.johnson@email.com'
        },
        clinicalInfo: {
          diagnosisDate: '2024-01-20',
          ejectionFraction: 45,
          nyhaClass: 2,
          medications: ['Losartan 50mg', 'Metoprolol 50mg'],
          allergies: ['Sulfa drugs'],
          emergencyContact: {
            name: 'Sarah Johnson',
            relationship: 'Wife',
            phoneNumber: '555-0128'
          }
        },
        monitoring: {
          enrollmentDate: '2024-02-01',
          consentStatus: 'active',
          assessmentFrequency: 'bi-weekly',
          preferredCallTimes: ['08:00', '18:00'],
          timezone: 'America/Los_Angeles'
        },
        currentRisk: {
          score: 45,
          level: 'medium',
          lastUpdated: '2025-09-07T09:45:00Z',
          trend: 'improving'
        }
      },
      {
        id: 'patient-004',
        demographics: {
          firstName: 'Emily',
          lastName: 'Davis',
          dateOfBirth: '1980-12-03',
          mrn: 'MRN001237',
          phoneNumber: '555-0129',
          email: 'e.davis@email.com'
        },
        clinicalInfo: {
          diagnosisDate: '2024-06-12',
          ejectionFraction: 55,
          nyhaClass: 1,
          medications: ['Lisinopril 5mg'],
          allergies: [],
          emergencyContact: {
            name: 'Michael Davis',
            relationship: 'Husband',
            phoneNumber: '555-0130'
          }
        },
        monitoring: {
          enrollmentDate: '2024-07-01',
          consentStatus: 'active',
          assessmentFrequency: 'weekly',
          preferredCallTimes: ['12:00'],
          timezone: 'America/Denver'
        },
        currentRisk: {
          score: 22,
          level: 'low',
          lastUpdated: '2025-09-07T14:20:00Z',
          trend: 'stable'
        }
      }
    ];

    mockPatients.forEach(patient => {
      this.patients.set(patient.id, patient);
    });
  }

  async getAllPatients(): Promise<Patient[]> {
    await this.ensureInitialized();
    return Array.from(this.patients.values());
  }

  async getPatientById(patientId: string): Promise<Patient | null> {
    await this.ensureInitialized();
    return this.patients.get(patientId) || null;
  }

  async getPatientsByRiskLevel(riskLevel: RiskLevel): Promise<Patient[]> {
    await this.ensureInitialized();
    return Array.from(this.patients.values()).filter(
      patient => patient.currentRisk.level === riskLevel
    );
  }

  async getHighRiskPatients(): Promise<Patient[]> {
    await this.ensureInitialized();
    return Array.from(this.patients.values()).filter(
      patient => patient.currentRisk.level === 'critical' || patient.currentRisk.level === 'high'
    );
  }

  async createPatient(request: CreatePatientRequest): Promise<Patient> {
    await this.ensureInitialized();
    const patientId = `patient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newPatient: Patient = {
      id: patientId,
      demographics: request.demographics,
      clinicalInfo: request.clinicalInfo,
      monitoring: {
        ...request.monitoring,
        enrollmentDate: new Date().toISOString(),
        consentStatus: 'active'
      },
      currentRisk: {
        score: 0,
        level: 'low',
        lastUpdated: new Date().toISOString(),
        trend: 'stable'
      }
    };

    this.patients.set(patientId, newPatient);
    await this.savePatients(); // Persist to file
    return newPatient;
  }

  async updatePatient(request: UpdatePatientRequest): Promise<Patient | null> {
    await this.ensureInitialized();
    const existingPatient = this.patients.get(request.patientId);
    if (!existingPatient) {
      return null;
    }

    const updatedPatient: Patient = {
      ...existingPatient,
      ...request.updates
    };

    this.patients.set(request.patientId, updatedPatient);
    await this.savePatients(); // Persist to file
    return updatedPatient;
  }

  async updatePatientRisk(
    patientId: string, 
    riskScore: number, 
    riskLevel: RiskLevel,
    trend: 'improving' | 'stable' | 'deteriorating'
  ): Promise<Patient | null> {
    const patient = this.patients.get(patientId);
    if (!patient) {
      return null;
    }

    patient.currentRisk = {
      score: riskScore,
      level: riskLevel,
      lastUpdated: new Date().toISOString(),
      trend
    };

    this.patients.set(patientId, patient);
    await this.savePatients(); // Persist to file
    return patient;
  }

  async searchPatients(query: string): Promise<Patient[]> {
    await this.ensureInitialized();
    const lowercaseQuery = query.toLowerCase();
    
    return Array.from(this.patients.values()).filter(patient => {
      return (
        patient.demographics.firstName.toLowerCase().includes(lowercaseQuery) ||
        patient.demographics.lastName.toLowerCase().includes(lowercaseQuery) ||
        patient.demographics.mrn.toLowerCase().includes(lowercaseQuery) ||
        patient.demographics.phoneNumber.includes(query)
      );
    });
  }

  async getPatientsByAssignedClinician(clinicianId: string): Promise<Patient[]> {
    // In a real implementation, this would filter by assigned clinician
    // For now, return all patients as a mock
    return this.getAllPatients();
  }

  async getPatientsRequiringAttention(): Promise<Patient[]> {
    const now = new Date();
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

    return Array.from(this.patients.values()).filter(patient => {
      const lastUpdated = new Date(patient.currentRisk.lastUpdated);
      
      return (
        patient.currentRisk.level === 'critical' ||
        (patient.currentRisk.level === 'high' && patient.currentRisk.trend === 'deteriorating') ||
        lastUpdated < sixHoursAgo // No updates in 6+ hours
      );
    });
  }

  async getDashboardMetrics() {
    const allPatients = await this.getAllPatients();
    
    const riskDistribution = {
      low: allPatients.filter(p => p.currentRisk.level === 'low').length,
      medium: allPatients.filter(p => p.currentRisk.level === 'medium').length,
      high: allPatients.filter(p => p.currentRisk.level === 'high').length,
      critical: allPatients.filter(p => p.currentRisk.level === 'critical').length
    };

    const avgRiskScore = allPatients.reduce((sum, p) => sum + p.currentRisk.score, 0) / allPatients.length;

    return {
      totalPatients: allPatients.length,
      riskDistribution,
      avgRiskScore: Math.round(avgRiskScore),
      patientsRequiringAttention: await this.getPatientsRequiringAttention(),
      highRiskPatients: await this.getHighRiskPatients()
    };
  }

  // Consent and compliance management
  async updateConsentStatus(
    patientId: string, 
    status: 'active' | 'withdrawn' | 'expired'
  ): Promise<Patient | null> {
    const patient = this.patients.get(patientId);
    if (!patient) {
      return null;
    }

    patient.monitoring.consentStatus = status;
    this.patients.set(patientId, patient);
    await this.savePatients(); // Persist to file
    return patient;
  }

  async getActivePatients(): Promise<Patient[]> {
    return Array.from(this.patients.values()).filter(
      patient => patient.monitoring.consentStatus === 'active'
    );
  }

  async deactivatePatient(patientId: string, reason: string): Promise<boolean> {
    const patient = this.patients.get(patientId);
    if (!patient) {
      return false;
    }

    patient.monitoring.consentStatus = 'withdrawn';
    this.patients.set(patientId, patient);
    await this.savePatients(); // Persist to file
    
    // In production, would log reason and maintain audit trail
    console.log(`Patient ${patientId} deactivated. Reason: ${reason}`);
    
    return true;
  }

  // Statistics and reporting
  async getEnrollmentStats(timeframe: 'week' | 'month' | 'quarter'): Promise<{
    newEnrollments: number;
    withdrawals: number;
    activePatients: number;
    totalPatients: number;
  }> {
    const activePatients = await this.getActivePatients();
    
    return {
      newEnrollments: 4, // Mock data
      withdrawals: 1,    // Mock data
      activePatients: activePatients.length,
      totalPatients: this.patients.size
    };
  }
}