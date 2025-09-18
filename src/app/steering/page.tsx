'use client';

import { useState, useEffect } from 'react';
import { SteeringDashboard } from '@/components/steering/SteeringDashboard';
import { SteeringControlPanel } from '@/components/steering/SteeringControlPanel';
import { ClinicalHeader } from '@/components/clinical/clinical-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  SteeringDashboard as SteeringDashboardType,
  SteeringSession,
  SteeringAction,
  EmergencyEscalation,
  ConversationFlow
} from '@/types/steering';
import steeringService from '@/services/steering-service';
import { 
  Navigation, 
  AlertTriangle, 
  Settings, 
  RefreshCw,
  Phone,
  Activity
} from 'lucide-react';

export default function SteeringPage() {
  const [dashboard, setDashboard] = useState<SteeringDashboardType | null>(null);
  const [selectedSession, setSelectedSession] = useState<SteeringSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock clinician data
  const currentClinician = {
    name: "Dr. Sarah Chen",
    title: "Cardiologist",
    id: "clinician-001"
  };

  useEffect(() => {
    // Initialize steering service and load initial data
    initializeSteeringData();

    // Set up event listeners
    const unsubscribeConnected = steeringService.on('connected', setConnected);
    const unsubscribeSessionCreated = steeringService.on('session_created', handleSessionCreated);
    const unsubscribeSessionUpdated = steeringService.on('session_updated', handleSessionUpdated);
    const unsubscribeActionExecuted = steeringService.on('action_executed', handleActionExecuted);
    const unsubscribeEscalationAdded = steeringService.on('escalation_added', handleEscalationAdded);
    const unsubscribeMetricsUpdated = steeringService.on('metrics_updated', handleMetricsUpdated);

    // Cleanup function
    return () => {
      unsubscribeConnected();
      unsubscribeSessionCreated();
      unsubscribeSessionUpdated();
      unsubscribeActionExecuted();
      unsubscribeEscalationAdded();
      unsubscribeMetricsUpdated();
    };
  }, []);

  const initializeSteeringData = async () => {
    try {
      setLoading(true);
      
      // Load initial dashboard data
      const dashboardData = steeringService.getDashboard();
      setDashboard(dashboardData);

      // Create a demo session for development/testing
      if (process.env.NODE_ENV === 'development' && dashboardData.activeSessions.length === 0) {
        await createDemoSession();
      }
    } catch (error) {
      console.error('Failed to initialize steering data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDemoSession = async () => {
    try {
      const demoSession = await steeringService.createSession(
        'demo-call-123',
        'patient-456',
        currentClinician.id
      );
      
      // Set a demo conversation flow
      const templates = steeringService.getConversationFlowTemplates();
      if (templates.length > 0 && templates[0].flows.length > 0) {
        await steeringService.setConversationFlow(demoSession.id, templates[0].flows[0]);
      }

      // Refresh dashboard
      refreshDashboard();
    } catch (error) {
      console.error('Failed to create demo session:', error);
    }
  };

  const refreshDashboard = () => {
    const dashboardData = steeringService.getDashboard();
    setDashboard(dashboardData);
  };

  const handleSessionCreated = (session: SteeringSession) => {
    refreshDashboard();
  };

  const handleSessionUpdated = (session: SteeringSession) => {
    refreshDashboard();
    if (selectedSession?.id === session.id) {
      setSelectedSession(session);
    }
  };

  const handleActionExecuted = ({ sessionId, action }: { sessionId: string; action: SteeringAction }) => {
    refreshDashboard();
    console.log(`Action executed for session ${sessionId}:`, action);
  };

  const handleEscalationAdded = (escalation: EmergencyEscalation) => {
    refreshDashboard();
    // Show notification or alert about new escalation
    console.log('New escalation:', escalation);
  };

  const handleMetricsUpdated = ({ sessionId, metrics }: { sessionId: string; metrics: any }) => {
    refreshDashboard();
    if (selectedSession?.id === sessionId) {
      const updatedSession = steeringService.getSession(sessionId);
      if (updatedSession) {
        setSelectedSession(updatedSession);
      }
    }
  };

  const handleSessionSelect = (session: SteeringSession) => {
    setSelectedSession(session);
    setActiveTab('control-panel');
  };

  const handleSteeringAction = async (action: SteeringAction) => {
    if (!selectedSession) return;

    try {
      await steeringService.executeAction(selectedSession.id, action);
    } catch (error) {
      console.error('Failed to execute steering action:', error);
      alert(`Failed to execute action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEscalation = async (escalation: EmergencyEscalation) => {
    if (!selectedSession) return;

    try {
      await steeringService.triggerEscalation(selectedSession, {
        id: `action-${Date.now()}`,
        type: 'escalate',
        timestamp: new Date(),
        description: `Emergency escalation: ${escalation.reason}`,
        payload: {
          severity: escalation.severity,
          escalationAction: escalation.action,
          notes: escalation.notes
        }
      });
    } catch (error) {
      console.error('Failed to trigger escalation:', error);
      alert(`Failed to escalate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleFlowChange = async (flowId: string) => {
    if (!selectedSession) return;

    try {
      const templates = steeringService.getConversationFlowTemplates();
      const template = templates.find(t => t.flows.some(f => f.id === flowId));
      const flow = template?.flows.find(f => f.id === flowId);
      
      if (flow) {
        await steeringService.setConversationFlow(selectedSession.id, flow);
      }
    } catch (error) {
      console.error('Failed to change conversation flow:', error);
      alert(`Failed to change flow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEscalationResolve = async (escalationId: string) => {
    try {
      await steeringService.resolveEscalation(escalationId, 'Resolved by clinician');
    } catch (error) {
      console.error('Failed to resolve escalation:', error);
      alert(`Failed to resolve escalation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSystemAction = (action: string) => {
    switch (action) {
      case 'refresh':
        refreshDashboard();
        break;
      default:
        console.log('System action:', action);
    }
  };

  const createNewSession = async () => {
    try {
      const patientId = prompt('Enter Patient ID:');
      if (patientId) {
        const session = await steeringService.createSession(
          `call-${Date.now()}`,
          patientId,
          currentClinician.id
        );
        setSelectedSession(session);
        setActiveTab('control-panel');
      }
    } catch (error) {
      console.error('Failed to create session:', error);
      alert(`Failed to create session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (loading) {
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
              <p className="text-muted-foreground">Loading steering control center...</p>
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
        alertCount={dashboard?.pendingEscalations?.length || 0}
      />

      <main className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Navigation className="h-8 w-8" />
                Call Steering Control Center
              </h1>
              <p className="text-muted-foreground">
                Monitor and guide voice call interactions in real-time
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-muted-foreground">
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={refreshDashboard}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={createNewSession}>
                <Phone className="h-4 w-4 mr-2" />
                New Session
              </Button>
            </div>
          </div>

          {/* Connection Status Alert */}
          {!connected && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Steering service is not connected. Real-time features may be limited.
              </AlertDescription>
            </Alert>
          )}

          {/* Emergency Escalations Quick View */}
          {dashboard && dashboard.pendingEscalations.length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 flex items-center justify-between">
                <span>
                  <strong>{dashboard.pendingEscalations.length} pending emergency escalation{dashboard.pendingEscalations.length !== 1 ? 's' : ''}</strong> requiring immediate attention
                </span>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => setActiveTab('dashboard')}
                >
                  View Escalations
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dashboard">
                <Activity className="h-4 w-4 mr-2" />
                Steering Dashboard
              </TabsTrigger>
              <TabsTrigger value="control-panel">
                <Navigation className="h-4 w-4 mr-2" />
                Control Panel
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Configuration
              </TabsTrigger>
            </TabsList>

            {/* Steering Dashboard Tab */}
            <TabsContent value="dashboard">
              {dashboard && (
                <SteeringDashboard
                  dashboard={dashboard}
                  onSessionSelect={handleSessionSelect}
                  onEscalationResolve={handleEscalationResolve}
                  onSystemAction={handleSystemAction}
                />
              )}
            </TabsContent>

            {/* Control Panel Tab */}
            <TabsContent value="control-panel">
              <SteeringControlPanel
                session={selectedSession}
                onAction={handleSteeringAction}
                onEscalate={handleEscalation}
                onFlowChange={handleFlowChange}
              />
            </TabsContent>

            {/* Configuration Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Steering Configuration</CardTitle>
                  <CardDescription>
                    Configure steering settings and conversation flow templates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Configuration panel coming soon</p>
                    <p className="text-sm">
                      Customize conversation flows, steering templates, and system settings
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}