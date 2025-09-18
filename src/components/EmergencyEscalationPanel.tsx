'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  Phone, 
  MessageSquare, 
  Clock, 
  User, 
  Heart, 
  CheckCircle2,
  XCircle,
  PlayCircle,
  PauseCircle,
  ArrowRight,
  Shield,
  PhoneCall,
  Mail,
  Building2,
  Stethoscope,
  Calendar,
  Zap
} from 'lucide-react';

interface EmergencyAlert {
  id: string;
  type: 'cardiac_emergency' | 'respiratory_distress' | 'fall_risk' | 'medication_crisis' | 'mental_health';
  severity: 'low' | 'medium' | 'high' | 'critical';
  patientId: string;
  patientName: string;
  phoneNumber: string;
  callSid: string;
  timestamp: Date;
  triggers: string[];
  voiceBiomarkers?: {
    riskScore: number;
    respiratoryRate: number;
    speechClarity: number;
    stressLevel: number;
  };
  escalationStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  escalationSteps: EscalationStep[];
  assignedTo?: string;
  notes: string;
}

interface EscalationStep {
  id: string;
  type: 'clinical_review' | 'contact_family' | 'emergency_services' | 'hospital_admission' | 'medication_adjustment';
  title: string;
  description: string;
  priority: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
  assignedTo?: string;
  estimatedDuration: number; // minutes
  actualDuration?: number;
  completedAt?: Date;
  notes?: string;
  contactInfo?: string;
  nextStepTrigger?: string;
}

interface EmergencyEscalationPanelProps {
  alerts: EmergencyAlert[];
  onUpdateAlert: (alertId: string, updates: Partial<EmergencyAlert>) => void;
  onCompleteStep: (alertId: string, stepId: string, notes?: string) => void;
  onEscalateToEmergency: (alertId: string) => void;
  currentClinician: {
    name: string;
    title: string;
    id: string;
  };
  className?: string;
}

const ESCALATION_PROTOCOLS: Record<string, EscalationStep[]> = {
  cardiac_emergency: [
    {
      id: 'step-1',
      type: 'clinical_review',
      title: 'Immediate Clinical Review',
      description: 'Review patient history, current medications, and voice biomarkers',
      priority: 1,
      status: 'pending',
      estimatedDuration: 5
    },
    {
      id: 'step-2', 
      type: 'contact_family',
      title: 'Contact Emergency Contact',
      description: 'Notify family member or emergency contact immediately',
      priority: 2,
      status: 'pending',
      estimatedDuration: 10,
      contactInfo: 'Emergency contact from patient record'
    },
    {
      id: 'step-3',
      type: 'emergency_services',
      title: 'Dispatch Emergency Services',
      description: 'Call 911 for immediate medical response',
      priority: 1,
      status: 'pending', 
      estimatedDuration: 2,
      nextStepTrigger: 'If symptoms suggest acute cardiac event'
    },
    {
      id: 'step-4',
      type: 'hospital_admission',
      title: 'Hospital Admission Coordination',
      description: 'Coordinate with receiving hospital for cardiac emergency admission',
      priority: 1,
      status: 'pending',
      estimatedDuration: 15
    }
  ],
  
  respiratory_distress: [
    {
      id: 'step-1',
      type: 'clinical_review',
      title: 'Assess Respiratory Status',
      description: 'Review breathing patterns, oxygen levels if available, and voice analysis',
      priority: 1,
      status: 'pending',
      estimatedDuration: 3
    },
    {
      id: 'step-2',
      type: 'contact_family',
      title: 'Contact Patient/Family',
      description: 'Direct call to patient to assess current breathing status',
      priority: 1,
      status: 'pending',
      estimatedDuration: 5
    },
    {
      id: 'step-3',
      type: 'medication_adjustment',
      title: 'Medication Review & Adjustment',
      description: 'Review diuretics and bronchodilators, adjust as needed',
      priority: 2,
      status: 'pending',
      estimatedDuration: 10
    },
    {
      id: 'step-4',
      type: 'emergency_services',
      title: 'Emergency Services (if severe)',
      description: 'Call 911 if respiratory distress is severe or worsening',
      priority: 1,
      status: 'pending',
      estimatedDuration: 2,
      nextStepTrigger: 'If breathing difficulty is severe'
    }
  ]
};

export function EmergencyEscalationPanel({
  alerts,
  onUpdateAlert,
  onCompleteStep,
  onEscalateToEmergency,
  currentClinician,
  className = ""
}: EmergencyEscalationPanelProps) {
  const [selectedAlert, setSelectedAlert] = useState<EmergencyAlert | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh alerts every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      // In production, this would fetch updated alerts from the API
      console.log('Refreshing emergency alerts...');
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
  const activeAlerts = alerts.filter(alert => alert.escalationStatus === 'in_progress');
  const pendingAlerts = alerts.filter(alert => alert.escalationStatus === 'pending');

  const handleStartEscalation = (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;

    const escalationSteps = ESCALATION_PROTOCOLS[alert.type] || [];
    
    onUpdateAlert(alertId, {
      escalationStatus: 'in_progress',
      assignedTo: currentClinician.id,
      escalationSteps: escalationSteps.map(step => ({
        ...step,
        assignedTo: currentClinician.id
      }))
    });
    
    setSelectedAlert({ ...alert, escalationStatus: 'in_progress', escalationSteps });
  };

  const handleCompleteStep = (stepId: string, notes?: string) => {
    if (!selectedAlert) return;
    
    const updatedSteps = selectedAlert.escalationSteps.map(step =>
      step.id === stepId
        ? {
            ...step,
            status: 'completed' as const,
            completedAt: new Date(),
            actualDuration: step.estimatedDuration, // Mock actual duration
            notes: notes || `Completed by ${currentClinician.name}`
          }
        : step
    );

    const updatedAlert = {
      ...selectedAlert,
      escalationSteps: updatedSteps
    };

    // Check if all critical steps are completed
    const allCriticalCompleted = updatedSteps
      .filter(step => step.priority === 1)
      .every(step => step.status === 'completed');

    if (allCriticalCompleted) {
      updatedAlert.escalationStatus = 'completed';
    }

    onUpdateAlert(selectedAlert.id, updatedAlert);
    setSelectedAlert(updatedAlert);
    onCompleteStep(selectedAlert.id, stepId, notes);
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'cardiac_emergency': return 'Cardiac Emergency';
      case 'respiratory_distress': return 'Respiratory Distress';
      case 'fall_risk': return 'Fall Risk';
      case 'medication_crisis': return 'Medication Crisis';
      case 'mental_health': return 'Mental Health Crisis';
      default: return 'Unknown Emergency';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'cardiac_emergency': return <Heart className="w-4 h-4 text-red-500" />;
      case 'respiratory_distress': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'clinical_review': return <Stethoscope className="w-4 h-4" />;
      case 'contact_family': return <Phone className="w-4 h-4" />;
      case 'emergency_services': return <PhoneCall className="w-4 h-4" />;
      case 'hospital_admission': return <Building2 className="w-4 h-4" />;
      case 'medication_adjustment': return <Calendar className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'in_progress': return <PlayCircle className="w-4 h-4 text-blue-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-gray-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  if (alerts.length === 0) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-green-500" />
            <span>Emergency Escalation Center</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Shield className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-50" />
            <p className="text-gray-600">No active emergency alerts</p>
            <p className="text-sm text-gray-500 mt-1">System monitoring for critical situations</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Emergency Status Overview */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              <span>Emergency Escalation Active</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center space-x-1 ${autoRefresh ? 'bg-green-100' : ''}`}
              >
                {autoRefresh ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                <span>{autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-red-600">{criticalAlerts.length}</div>
              <div className="text-xs text-gray-600">Critical Alerts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{activeAlerts.length}</div>
              <div className="text-xs text-gray-600">Active Escalations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{pendingAlerts.length}</div>
              <div className="text-xs text-gray-600">Pending Review</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{currentClinician.name.split(' ')[0]}</div>
              <div className="text-xs text-gray-600">On-Call Clinician</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Active Alerts ({alerts.length})</h3>
          
          {alerts.map((alert) => (
            <Card 
              key={alert.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedAlert?.id === alert.id ? 'ring-2 ring-blue-500' : ''
              } ${alert.severity === 'critical' ? 'border-red-300' : ''}`}
              onClick={() => setSelectedAlert(alert)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getAlertIcon(alert.type)}
                    <div>
                      <div className="font-medium">{alert.patientName}</div>
                      <div className="text-sm text-gray-600">{alert.phoneNumber}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">
                      {alert.escalationStatus.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Type:</span> {getAlertTypeLabel(alert.type)}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Triggers:</span> {alert.triggers.join(', ')}
                  </div>
                  <div className="text-sm text-gray-500">
                    {alert.timestamp.toLocaleString()}
                  </div>
                  
                  {alert.voiceBiomarkers && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-xs space-y-1">
                      <div>Risk Score: <span className="font-medium text-red-600">{Math.round(alert.voiceBiomarkers.riskScore * 100)}%</span></div>
                      <div>Respiratory Rate: <span className="font-medium">{alert.voiceBiomarkers.respiratoryRate} bpm</span></div>
                      <div>Stress Level: <span className="font-medium">{Math.round(alert.voiceBiomarkers.stressLevel * 100)}%</span></div>
                    </div>
                  )}
                  
                  {alert.escalationStatus === 'pending' && (
                    <Button
                      size="sm"
                      className="w-full mt-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEscalation(alert.id);
                      }}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Start Escalation Protocol
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Escalation Protocol Detail */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            {selectedAlert ? `Escalation Protocol - ${selectedAlert.patientName}` : 'Select Alert'}
          </h3>
          
          {selectedAlert ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    {getAlertIcon(selectedAlert.type)}
                    <span>{getAlertTypeLabel(selectedAlert.type)}</span>
                  </span>
                  <Badge className={getSeverityColor(selectedAlert.severity)}>
                    {selectedAlert.severity.toUpperCase()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Patient Info */}
                <div className="p-3 bg-blue-50 rounded">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="font-medium">Patient:</span> {selectedAlert.patientName}</div>
                    <div><span className="font-medium">Phone:</span> {selectedAlert.phoneNumber}</div>
                    <div><span className="font-medium">Call ID:</span> {selectedAlert.callSid.substring(0, 8)}...</div>
                    <div><span className="font-medium">Assigned:</span> {currentClinician.name}</div>
                  </div>
                </div>

                {/* Progress Overview */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Protocol Progress</span>
                    <span className="text-xs text-gray-500">
                      {selectedAlert.escalationSteps.filter(s => s.status === 'completed').length} / {selectedAlert.escalationSteps.length} completed
                    </span>
                  </div>
                  <Progress 
                    value={
                      (selectedAlert.escalationSteps.filter(s => s.status === 'completed').length / 
                      selectedAlert.escalationSteps.length) * 100
                    }
                    className="h-2"
                  />
                </div>

                {/* Escalation Steps */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Escalation Steps</h4>
                  {selectedAlert.escalationSteps.map((step, index) => (
                    <div 
                      key={step.id}
                      className={`p-3 border rounded-lg ${
                        step.status === 'completed' ? 'bg-green-50 border-green-200' :
                        step.status === 'in_progress' ? 'bg-blue-50 border-blue-200' :
                        step.priority === 1 ? 'bg-red-50 border-red-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 flex items-center space-x-2">
                          {getStepIcon(step.type)}
                          {getStatusIcon(step.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium">{step.title}</span>
                            {step.priority === 1 && (
                              <Badge variant="destructive" className="text-xs">URGENT</Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              ~{step.estimatedDuration}m
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                          
                          {step.contactInfo && (
                            <p className="text-xs text-blue-600 mb-2">{step.contactInfo}</p>
                          )}
                          
                          {step.nextStepTrigger && (
                            <p className="text-xs text-orange-600 mb-2">
                              <span className="font-medium">Trigger:</span> {step.nextStepTrigger}
                            </p>
                          )}
                          
                          {step.status === 'pending' && selectedAlert.escalationStatus === 'in_progress' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2"
                              onClick={() => handleCompleteStep(step.id)}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Mark Complete
                            </Button>
                          )}
                          
                          {step.status === 'completed' && step.completedAt && (
                            <div className="mt-2 text-xs text-gray-500">
                              Completed at {step.completedAt.toLocaleTimeString()}
                              {step.notes && <div>Notes: {step.notes}</div>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Emergency Override */}
                {selectedAlert.severity === 'critical' && (
                  <Card className="border-red-300 bg-red-50">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-red-800">Emergency Override</div>
                          <div className="text-xs text-red-600">For life-threatening situations</div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onEscalateToEmergency(selectedAlert.id)}
                        >
                          <PhoneCall className="w-4 h-4 mr-1" />
                          Call 911 Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Select an alert to view escalation protocol</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}