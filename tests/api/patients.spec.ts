import { test, expect } from '@playwright/test';

test.describe('Patients API', () => {
  test('should return patients list', async ({ request }) => {
    const response = await request.get('/api/patients');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('patients');
    expect(Array.isArray(data.patients)).toBe(true);
  });

  test('should filter patients by risk level', async ({ request }) => {
    const response = await request.get('/api/patients?riskLevel=high');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('patients');
    
    // If patients exist, they should all have high risk level
    if (data.patients.length > 0) {
      data.patients.forEach((patient: any) => {
        expect(patient.currentRisk.level).toBe('high');
      });
    }
  });

  test('should search patients by query', async ({ request }) => {
    const response = await request.get('/api/patients?q=test');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('patients');
    expect(Array.isArray(data.patients)).toBe(true);
  });

  test('should create a new patient with valid data', async ({ request }) => {
    const newPatient = {
      demographics: {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890',
        dateOfBirth: '1980-01-01',
        gender: 'male',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345'
        }
      },
      medicalHistory: {
        heartFailureType: 'HFrEF',
        ejectionFraction: 35,
        nyhaClass: 'II',
        medications: [],
        comorbidities: [],
        lastHospitalization: null
      },
      assignedClinician: 'clinician-001'
    };

    const response = await request.post('/api/patients', {
      data: newPatient
    });

    expect(response.status()).toBe(201);
    
    const data = await response.json();
    expect(data).toHaveProperty('patient');
    expect(data.patient.demographics.firstName).toBe('John');
    expect(data.patient.demographics.lastName).toBe('Doe');
  });

  test('should reject patient creation without required fields', async ({ request }) => {
    const invalidPatient = {
      demographics: {
        firstName: 'John'
        // Missing lastName and phoneNumber
      }
    };

    const response = await request.post('/api/patients', {
      data: invalidPatient
    });

    expect(response.status()).toBe(400);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('should reject patient creation without phone number', async ({ request }) => {
    const invalidPatient = {
      demographics: {
        firstName: 'John',
        lastName: 'Doe'
        // Missing phoneNumber
      }
    };

    const response = await request.post('/api/patients', {
      data: invalidPatient
    });

    expect(response.status()).toBe(400);
    
    const data = await response.json();
    expect(data.error).toContain('Phone number is required');
  });
});