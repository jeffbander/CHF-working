'use client';

import { useEffect, useState } from 'react';
import { ClinicalHeader } from '@/components/clinical/clinical-header';
import { DashboardOverview } from '@/components/clinical/dashboard-overview';
import { CriticalAlertsPanel } from '@/components/clinical/critical-alerts-panel';
import { PatientTable } from '@/components/clinical/patient-table';
import { AddPatientDialog } from '@/components/clinical/add-patient-dialog';
import { PatientDetailDialog } from '@/components/clinical/patient-detail-dialog';
import { CallRecordingsPanel } from '@/components/clinical/call-recordings-panel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Patient, PatientDashboard } from '@/types/clinical';
import { RefreshCw, Plus } from 'lucide-react';

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<PatientDashboard | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientDetailOpen, setPatientDetailOpen] = useState(false);

  // Mock clinician data
  const currentClinician = {
    name: "Dr. Sarah Chen",
    title: "Cardiologist",
    id: "clinician-001"
  };

  useEffect(() => {
    loadDashboardData();
    loadPatients();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const data = await response.json();
        setDashboard(data.dashboard);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const loadPatients = async () => {
    try {
      const response = await fetch('/api/patients');
      if (response.ok) {
        const data = await response.json();
        setPatients(data.patients || []);
      }
    } catch (error) {
      console.error('Failed to load patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshData = async () => {
    setLoading(true);
    await Promise.all([loadDashboardData(), loadPatients()]);
    setLoading(false);
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setPatientDetailOpen(true);
  };

  const handleCallPatient = async (patient: Patient) => {
    try {
      // Show loading state
      const loadingMessage = `Initiating call to ${patient.demographics.firstName} ${patient.demographics.lastName}...`;
      alert(loadingMessage);

      // Make actual API call to initiate Twilio voice call
      const response = await fetch('/api/voice-calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: patient.id,
          phoneNumber: patient.demographics.phoneNumber,
          patientName: `${patient.demographics.firstName} ${patient.demographics.lastName}`
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`✅ ${result.message}\nCall SID: ${result.callSid}\nStatus: ${result.status}`);
        console.log('Call initiated successfully:', result);
        
        // Refresh data to show updated call status
        loadDashboardData();
      } else {
        alert(`❌ Failed to initiate call: ${result.error}\n${result.details || ''}`);
        console.error('Call failed:', result);
      }
    } catch (error) {
      alert(`❌ Error initiating call: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Error calling patient:', error);
    }
  };

  const handleContactPatient = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      handleCallPatient(patient);
    }
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    // Simulate acknowledging alert
    alert(`Alert ${alertId} has been acknowledged and marked as reviewed.`);
    console.log('Acknowledging alert:', alertId);
  };

  const handlePatientAdded = () => {
    // Refresh data when a new patient is added
    loadPatients();
    loadDashboardData();
  };

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen bg-background">
        <ClinicalHeader 
          clinicianName={currentClinician.name}
          clinicianTitle={currentClinician.title}
          alertCount={0}
        />
        <main className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading clinical dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ClinicalHeader 
        clinicianName={currentClinician.name}
        clinicianTitle={currentClinician.title}
        alertCount={dashboard?.criticalAlerts?.length || 0}
      />

      <main className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Clinical Dashboard</h1>
              <p className="text-muted-foreground">
                Monitor patient risk levels and voice biomarker assessments
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshData}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <AddPatientDialog onPatientAdded={handlePatientAdded} />
            </div>
          </div>

          {/* Dashboard overview cards */}
          {dashboard && (
            <DashboardOverview dashboard={dashboard} />
          )}

          {/* Main content tabs */}
          <Tabs defaultValue="alerts" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="alerts">Critical Alerts</TabsTrigger>
              <TabsTrigger value="patients">All Patients</TabsTrigger>
              <TabsTrigger value="recordings">Voice Recordings</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Critical Alerts Tab */}
            <TabsContent value="alerts" className="space-y-6">
              {dashboard?.criticalAlerts && (
                <CriticalAlertsPanel
                  alerts={dashboard.criticalAlerts}
                  onAcknowledgeAlert={handleAcknowledgeAlert}
                  onContactPatient={handleContactPatient}
                />
              )}

              {/* High-risk patients quick view */}
              <Card>
                <CardHeader>
                  <CardTitle>High-Risk Patients Requiring Attention</CardTitle>
                  <CardDescription>
                    Patients with critical or high risk levels needing immediate review
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PatientTable
                    patients={patients.filter(p => 
                      p.currentRisk.level === 'critical' || p.currentRisk.level === 'high'
                    )}
                    onPatientSelect={handlePatientSelect}
                    onCallPatient={handleCallPatient}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* All Patients Tab */}
            <TabsContent value="patients" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Patient Management</CardTitle>
                  <CardDescription>
                    Complete patient roster with risk assessments and monitoring status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PatientTable
                    patients={patients}
                    onPatientSelect={handlePatientSelect}
                    onCallPatient={handleCallPatient}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Voice Recordings Tab */}
            <TabsContent value="recordings" className="space-y-6">
              <CallRecordingsPanel />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Clinical Analytics</CardTitle>
                  <CardDescription>
                    Population health insights and biomarker trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-lg">Advanced analytics coming soon</p>
                    <p className="text-sm">
                      Population health metrics, biomarker trending, and outcome analysis
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Patient Detail Dialog */}
          <PatientDetailDialog
            patient={selectedPatient}
            open={patientDetailOpen}
            onOpenChange={setPatientDetailOpen}
            onCallPatient={handleCallPatient}
          />
        </div>
      </main>
    </div>
  );
}
