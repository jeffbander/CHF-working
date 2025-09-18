'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  SteeringSession, 
  SteeringAction, 
  CallMetrics, 
  EmergencyEscalation,
  ConversationFlow 
} from '@/types/steering';
import { 
  Play, 
  Pause, 
  Square, 
  AlertTriangle, 
  Phone, 
  PhoneOff, 
  MessageCircle, 
  Navigation,
  Activity,
  Heart,
  Volume2,
  Clock,
  User,
  Settings,
  SkipForward,
  RotateCcw
} from 'lucide-react';

interface SteeringControlPanelProps {
  session: SteeringSession | null;
  onAction: (action: SteeringAction) => void;
  onEscalate: (escalation: EmergencyEscalation) => void;
  onFlowChange: (flowId: string) => void;
}

export function SteeringControlPanel({ 
  session, 
  onAction, 
  onEscalate, 
  onFlowChange 
}: SteeringControlPanelProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<string>('');

  useEffect(() => {
    if (session?.currentFlow) {
      setSelectedFlow(session.currentFlow.id);
    }
  }, [session?.currentFlow]);

  const handleSteeringAction = (type: SteeringAction['type'], description: string, payload?: any) => {
    if (!session) return;

    const action: SteeringAction = {
      id: `action-${Date.now()}`,
      type,
      timestamp: new Date(),
      description,
      payload
    };

    onAction(action);
  };

  const handleEmergencyEscalation = (severity: EmergencyEscalation['severity'], reason: string) => {
    if (!session) return;

    const escalation: EmergencyEscalation = {
      id: `escalation-${Date.now()}`,
      severity,
      reason,
      action: severity === 'critical' ? 'emergency_services' : 'clinical_alert',
      timestamp: new Date(),
      resolved: false
    };

    onEscalate(escalation);
  };

  const getRiskLevelColor = (level: number) => {
    if (level >= 80) return 'bg-red-500';
    if (level >= 60) return 'bg-orange-500';
    if (level >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!session) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Call Steering Control
          </CardTitle>
          <CardDescription>
            No active call session. Steering controls will appear when a call is in progress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Waiting for active call session...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Call Steering Control
                <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                  {session.status}
                </Badge>
              </CardTitle>
              <CardDescription>
                Patient: {session.patientId} | Duration: {formatDuration(session.realTimeMetrics.duration)}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Live
              </Badge>
              <Button
                variant={session.status === 'active' ? 'destructive' : 'default'}
                size="sm"
                onClick={() => handleSteeringAction(
                  session.status === 'active' ? 'pause' : 'resume',
                  session.status === 'active' ? 'Call paused by clinician' : 'Call resumed by clinician'
                )}
              >
                {session.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleSteeringAction('end_call', 'Call ended by clinician')}
              >
                <PhoneOff className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="controls" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="controls">Steering Controls</TabsTrigger>
          <TabsTrigger value="metrics">Live Metrics</TabsTrigger>
          <TabsTrigger value="flows">Conversation Flows</TabsTrigger>
          <TabsTrigger value="escalation">Emergency</TabsTrigger>
        </TabsList>

        {/* Steering Controls Tab */}
        <TabsContent value="controls" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => handleSteeringAction('inject_question', 'Injected symptom assessment question')}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Ask About Symptoms
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => handleSteeringAction('inject_question', 'Injected medication compliance question')}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Check Medications
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => handleSteeringAction('redirect', 'Redirected to breathing assessment')}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Breathing Assessment
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => handleSteeringAction('redirect', 'Redirected to wrap up conversation')}
                >
                  <SkipForward className="h-4 w-4 mr-2" />
                  Skip to Summary
                </Button>
              </CardContent>
            </Card>

            {/* Real-time Prompts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Real-time Prompts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start"
                  variant="secondary"
                  onClick={() => handleSteeringAction('prompt', 'Prompted agent to speak slower and clearer')}
                >
                  <Volume2 className="h-4 w-4 mr-2" />
                  Speak Slower
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="secondary"
                  onClick={() => handleSteeringAction('prompt', 'Prompted agent to be more empathetic')}
                >
                  <User className="h-4 w-4 mr-2" />
                  Be More Empathetic
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="secondary"
                  onClick={() => handleSteeringAction('prompt', 'Prompted agent to repeat last question')}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Repeat Question
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="secondary"
                  onClick={() => handleSteeringAction('prompt', 'Prompted agent to allow more time for response')}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Wait Longer
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Current Flow Status */}
          {session.currentFlow && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Conversation Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{session.currentFlow.name}</h4>
                      <p className="text-sm text-muted-foreground">{session.currentFlow.description}</p>
                    </div>
                    <Badge variant="outline">{session.currentStep || 'Starting'}</Badge>
                  </div>
                  <Progress value={33} className="w-full" />
                  <p className="text-xs text-muted-foreground">Step 2 of 6 - Symptom Assessment</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Live Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Voice Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {Math.round(session.realTimeMetrics.voiceQuality * 100)}%
                    </span>
                    <Badge variant={session.realTimeMetrics.voiceQuality > 0.8 ? 'default' : 'destructive'}>
                      {session.realTimeMetrics.voiceQuality > 0.8 ? 'Good' : 'Poor'}
                    </Badge>
                  </div>
                  <Progress value={session.realTimeMetrics.voiceQuality * 100} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Stress Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {Math.round(session.realTimeMetrics.stressLevel * 100)}%
                    </span>
                    <Badge variant={session.realTimeMetrics.stressLevel < 0.5 ? 'default' : 'destructive'}>
                      {session.realTimeMetrics.stressLevel < 0.5 ? 'Low' : 'High'}
                    </Badge>
                  </div>
                  <Progress value={session.realTimeMetrics.stressLevel * 100} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Cooperation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {Math.round(session.realTimeMetrics.cooperationLevel * 100)}%
                    </span>
                    <Badge variant={session.realTimeMetrics.cooperationLevel > 0.7 ? 'default' : 'secondary'}>
                      {session.realTimeMetrics.cooperationLevel > 0.7 ? 'Good' : 'Poor'}
                    </Badge>
                  </div>
                  <Progress value={session.realTimeMetrics.cooperationLevel * 100} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Biomarkers */}
          <Card>
            <CardHeader>
              <CardTitle>Voice Biomarkers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{session.realTimeMetrics.biomarkers.jitter.toFixed(3)}</div>
                  <div className="text-xs text-muted-foreground">Jitter (ms)</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{session.realTimeMetrics.biomarkers.shimmer.toFixed(3)}</div>
                  <div className="text-xs text-muted-foreground">Shimmer (%)</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{session.realTimeMetrics.biomarkers.hnr.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">HNR (dB)</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{session.realTimeMetrics.biomarkers.speechRate.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">Speech Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{session.realTimeMetrics.biomarkers.pauseDuration.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">Pause (s)</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Indicators */}
          {session.realTimeMetrics.riskIndicators.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Risk Indicators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {session.realTimeMetrics.riskIndicators.map((indicator, index) => (
                    <Badge key={index} variant="destructive">
                      {indicator}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Conversation Flows Tab */}
        <TabsContent value="flows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Conversation Flows</CardTitle>
              <CardDescription>
                Switch to different conversation paths based on patient responses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start"
                variant={selectedFlow === 'symptom-assessment' ? 'default' : 'outline'}
                onClick={() => onFlowChange('symptom-assessment')}
              >
                <Activity className="h-4 w-4 mr-2" />
                Detailed Symptom Assessment
              </Button>
              <Button
                className="w-full justify-start"
                variant={selectedFlow === 'medication-review' ? 'default' : 'outline'}
                onClick={() => onFlowChange('medication-review')}
              >
                <Heart className="h-4 w-4 mr-2" />
                Medication Review
              </Button>
              <Button
                className="w-full justify-start"
                variant={selectedFlow === 'emergency-protocol' ? 'default' : 'outline'}
                onClick={() => onFlowChange('emergency-protocol')}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Emergency Assessment
              </Button>
              <Button
                className="w-full justify-start"
                variant={selectedFlow === 'routine-followup' ? 'default' : 'outline'}
                onClick={() => onFlowChange('routine-followup')}
              >
                <User className="h-4 w-4 mr-2" />
                Routine Follow-up
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emergency Escalation Tab */}
        <TabsContent value="escalation" className="space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Use emergency escalation only when immediate intervention is required.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Emergency Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start"
                  variant="destructive"
                  onClick={() => handleEmergencyEscalation('critical', 'Patient reporting severe symptoms')}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Emergency Services
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="destructive"
                  onClick={() => handleEmergencyEscalation('high', 'Immediate clinician intervention needed')}
                >
                  <User className="h-4 w-4 mr-2" />
                  Human Takeover
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => handleEmergencyEscalation('medium', 'Clinical alert triggered')}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Send Clinical Alert
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full h-32 p-3 border rounded-md resize-none"
                  placeholder="Add notes about the current call situation..."
                />
                <Button className="w-full mt-2" variant="outline">
                  Save Notes
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}