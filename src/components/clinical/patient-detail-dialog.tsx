'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RiskBadge } from './risk-badge';
import { Patient, VoiceAssessment } from '@/types/clinical';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Heart, 
  Activity, 
  AlertTriangle, 
  Clock,
  FileText,
  Pill
} from 'lucide-react';

interface PatientDetailDialogProps {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCallPatient?: (patient: Patient) => void;
}

export function PatientDetailDialog({ 
  patient, 
  open, 
  onOpenChange, 
  onCallPatient 
}: PatientDetailDialogProps) {
  const [recentAssessments, setRecentAssessments] = useState<VoiceAssessment[]>([]);

  useEffect(() => {
    if (patient && open) {
      // Mock recent assessments - in real app would fetch from API
      setRecentAssessments([
        {
          id: `assessment-${patient.id}-1`,
          patientId: patient.id,
          sessionId: `session-${patient.id}-1`,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          callDuration: 185,
          callStatus: 'completed',
          biomarkers: {
            jitter: 2.1,
            shimmer: 6.2,
            hnr: 9.5,
            f0: 145.2,
            spectralSlope: -8.7,
            voiceIntensity: 48.3
          },
          qualityMetrics: {
            audioQuality: 87,
            backgroundNoise: 12,
            completeness: 95
          },
          riskScore: patient.currentRisk.score,
          alertGenerated: patient.currentRisk.level === 'critical' || patient.currentRisk.level === 'high'
        },
        {
          id: `assessment-${patient.id}-2`,
          patientId: patient.id,
          sessionId: `session-${patient.id}-2`,
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          callDuration: 203,
          callStatus: 'completed',
          biomarkers: {
            jitter: 1.8,
            shimmer: 5.9,
            hnr: 11.2,
            f0: 152.1,
            spectralSlope: -9.2,
            voiceIntensity: 52.1
          },
          qualityMetrics: {
            audioQuality: 92,
            backgroundNoise: 8,
            completeness: 98
          },
          riskScore: Math.max(0, patient.currentRisk.score - 10),
          alertGenerated: false
        }
      ]);
    }
  }, [patient, open]);

  if (!patient) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {patient.demographics.firstName} {patient.demographics.lastName}
          </DialogTitle>
          <DialogDescription>
            Patient details, clinical information, and voice assessment history
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Header */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
                {patient.demographics.firstName[0]}{patient.demographics.lastName[0]}
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {patient.demographics.firstName} {patient.demographics.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  MRN: {patient.demographics.mrn} | DOB: {formatDate(patient.demographics.dateOfBirth)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <RiskBadge 
                    level={patient.currentRisk.level}
                    score={patient.currentRisk.score}
                    size="sm"
                  />
                  <Badge variant="outline" className="text-xs">
                    {patient.currentRisk.trend}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCallPatient?.(patient)}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Patient
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="clinical">Clinical</TabsTrigger>
              <TabsTrigger value="assessments">Voice Data</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{patient.demographics.phoneNumber}</span>
                    </div>
                    {patient.demographics.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{patient.demographics.email}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium">Emergency Contact:</p>
                      <p className="text-sm text-muted-foreground">
                        {patient.clinicalInfo.emergencyContact.name} ({patient.clinicalInfo.emergencyContact.relationship})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {patient.clinicalInfo.emergencyContact.phoneNumber}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Current Risk Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Current Score:</span>
                      <RiskBadge 
                        level={patient.currentRisk.level}
                        score={patient.currentRisk.score}
                        size="sm"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Trend:</span>
                      <Badge variant="outline" className="text-xs">
                        {patient.currentRisk.trend}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Last Updated:</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(patient.currentRisk.lastUpdated)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Clinical Tab */}
            <TabsContent value="clinical" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Heart Failure Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Heart className="h-4 w-4" />
                      Heart Failure Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Diagnosis Date:</span>
                      <span className="text-sm">{formatDate(patient.clinicalInfo.diagnosisDate)}</span>
                    </div>
                    {patient.clinicalInfo.ejectionFraction && (
                      <div className="flex justify-between">
                        <span className="text-sm">Ejection Fraction:</span>
                        <span className="text-sm">{patient.clinicalInfo.ejectionFraction}%</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm">NYHA Class:</span>
                      <Badge variant="outline">Class {patient.clinicalInfo.nyhaClass}</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Medications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Pill className="h-4 w-4" />
                      Current Medications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {patient.clinicalInfo.medications.length > 0 ? (
                      <ul className="space-y-1">
                        {patient.clinicalInfo.medications.map((med, index) => (
                          <li key={index} className="text-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            {med}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No medications listed</p>
                    )}
                    
                    {patient.clinicalInfo.allergies.length > 0 && (
                      <div className="pt-3 mt-3 border-t">
                        <p className="text-sm font-medium text-red-800 mb-1">Allergies:</p>
                        <div className="flex flex-wrap gap-1">
                          {patient.clinicalInfo.allergies.map((allergy, index) => (
                            <Badge key={index} variant="destructive" className="text-xs">
                              {allergy}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Voice Assessments Tab */}
            <TabsContent value="assessments" className="space-y-4">
              <div className="space-y-3">
                {recentAssessments.map((assessment) => (
                  <Card key={assessment.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">
                          Voice Assessment - {formatTime(assessment.timestamp)}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={assessment.callStatus === 'completed' ? 'default' : 'secondary'}>
                            {assessment.callStatus}
                          </Badge>
                          <RiskBadge level={assessment.riskScore >= 80 ? 'critical' : assessment.riskScore >= 60 ? 'high' : assessment.riskScore >= 35 ? 'medium' : 'low'} score={assessment.riskScore} size="sm" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {assessment.biomarkers && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Jitter:</span> {assessment.biomarkers.jitter}%
                          </div>
                          <div>
                            <span className="font-medium">Shimmer:</span> {assessment.biomarkers.shimmer}%
                          </div>
                          <div>
                            <span className="font-medium">HNR:</span> {assessment.biomarkers.hnr} dB
                          </div>
                          <div>
                            <span className="font-medium">F0:</span> {assessment.biomarkers.f0} Hz
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span> {Math.floor(assessment.callDuration / 60)}m {assessment.callDuration % 60}s
                          </div>
                          <div>
                            <span className="font-medium">Quality:</span> {assessment.qualityMetrics.audioQuality}%
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Monitoring Tab */}
            <TabsContent value="monitoring" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Monitoring Schedule */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      Monitoring Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Frequency:</span>
                      <Badge variant="outline">{patient.monitoring.assessmentFrequency}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Timezone:</span>
                      <span className="text-sm">{patient.monitoring.timezone}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-1">Preferred Call Times:</p>
                      <div className="flex flex-wrap gap-1">
                        {patient.monitoring.preferredCallTimes.map((time, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {time}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Program Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4" />
                      Program Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Enrollment Date:</span>
                      <span className="text-sm">{formatDate(patient.monitoring.enrollmentDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Consent Status:</span>
                      <Badge variant={patient.monitoring.consentStatus === 'active' ? 'default' : 'secondary'}>
                        {patient.monitoring.consentStatus}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Days Enrolled:</span>
                      <span className="text-sm">
                        {Math.floor((Date.now() - new Date(patient.monitoring.enrollmentDate).getTime()) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}