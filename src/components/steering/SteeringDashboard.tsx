'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  SteeringDashboard as SteeringDashboardType,
  SteeringSession,
  EmergencyEscalation,
  SteeringAction 
} from '@/types/steering';
import { 
  Navigation, 
  Phone, 
  PhoneOff, 
  AlertTriangle, 
  Activity, 
  Clock, 
  User,
  TrendingUp,
  TrendingDown,
  Minus,
  Play,
  Pause,
  Square,
  Eye,
  Settings
} from 'lucide-react';

interface SteeringDashboardProps {
  dashboard: SteeringDashboardType;
  onSessionSelect: (session: SteeringSession) => void;
  onEscalationResolve: (escalationId: string) => void;
  onSystemAction: (action: string) => void;
}

export function SteeringDashboard({ 
  dashboard, 
  onSessionSelect, 
  onEscalationResolve, 
  onSystemAction 
}: SteeringDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('active-sessions');

  const getStatusIcon = (status: SteeringSession['status']) => {
    switch (status) {
      case 'active':
        return <Play className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'ended':
        return <Square className="h-4 w-4 text-gray-500" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: EmergencyEscalation['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-black';
      case 'low':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m ${seconds % 60}s`;
  };

  const getSystemStatusBadge = (status: 'operational' | 'degraded' | 'down') => {
    const colors = {
      operational: 'bg-green-500 text-white',
      degraded: 'bg-yellow-500 text-black',
      down: 'bg-red-500 text-white'
    };
    return <Badge className={colors[status]}>{status.toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header with System Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Steering Control Center
              </CardTitle>
              <CardDescription>
                Monitor and manage all active voice call steering sessions
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right text-sm">
                <div className="flex items-center gap-2">
                  <span>Voice Service:</span>
                  {getSystemStatusBadge(dashboard.systemStatus.voiceServiceStatus)}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span>Steering Service:</span>
                  {getSystemStatusBadge(dashboard.systemStatus.steeringServiceStatus)}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => onSystemAction('refresh')}>
                <Activity className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold">{dashboard.activeSessions.length}</p>
              </div>
              <Phone className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Escalations</p>
                <p className="text-2xl font-bold">{dashboard.pendingEscalations.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recent Actions</p>
                <p className="text-2xl font-bold">{dashboard.recentActions.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Call Duration</p>
                <p className="text-2xl font-bold">
                  {dashboard.activeSessions.length > 0
                    ? formatDuration(
                        dashboard.activeSessions.reduce((sum, s) => sum + s.realTimeMetrics.duration, 0) /
                        dashboard.activeSessions.length
                      )
                    : '0m'
                  }
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active-sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="escalations">Emergency Escalations</TabsTrigger>
          <TabsTrigger value="recent-actions">Recent Actions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Active Sessions Tab */}
        <TabsContent value="active-sessions">
          <Card>
            <CardHeader>
              <CardTitle>Active Steering Sessions</CardTitle>
              <CardDescription>
                {dashboard.activeSessions.length} active call{dashboard.activeSessions.length !== 1 ? 's' : ''} in progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard.activeSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <PhoneOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active steering sessions</p>
                  <p className="text-sm">Sessions will appear here when calls are in progress</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Clinician</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Flow</TableHead>
                      <TableHead>Quality</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboard.activeSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(session.status)}
                            <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                              {session.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{session.patientId}</TableCell>
                        <TableCell>{session.clinicianId}</TableCell>
                        <TableCell>{formatDuration(session.realTimeMetrics.duration)}</TableCell>
                        <TableCell>
                          {session.currentFlow ? (
                            <Badge variant="outline">{session.currentFlow.name}</Badge>
                          ) : (
                            <span className="text-muted-foreground">No flow</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={session.realTimeMetrics.voiceQuality * 100} 
                              className="w-16 h-2" 
                            />
                            <span className="text-sm">
                              {Math.round(session.realTimeMetrics.voiceQuality * 100)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {session.realTimeMetrics.riskIndicators.length > 0 ? (
                              <Badge variant="destructive" className="text-xs">
                                {session.realTimeMetrics.riskIndicators.length} alerts
                              </Badge>
                            ) : (
                              <Badge variant="default" className="text-xs">
                                Normal
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onSessionSelect(session)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onSystemAction(`configure-${session.id}`)}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emergency Escalations Tab */}
        <TabsContent value="escalations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Emergency Escalations
              </CardTitle>
              <CardDescription>
                {dashboard.pendingEscalations.length} pending escalation{dashboard.pendingEscalations.length !== 1 ? 's' : ''} requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard.pendingEscalations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending escalations</p>
                  <p className="text-sm">Emergency alerts will appear here when triggered</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboard.pendingEscalations.map((escalation) => (
                    <Alert key={escalation.id} className="border-orange-200 bg-orange-50">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <div className="flex items-center justify-between w-full">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getSeverityColor(escalation.severity)}>
                              {escalation.severity.toUpperCase()}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {escalation.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <AlertDescription className="text-orange-800">
                            <strong>Reason:</strong> {escalation.reason}
                          </AlertDescription>
                          <AlertDescription className="text-orange-800">
                            <strong>Action:</strong> {escalation.action.replace('_', ' ')}
                          </AlertDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEscalationResolve(escalation.id)}
                          >
                            Resolve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onSystemAction(`escalate-${escalation.id}`)}
                          >
                            Escalate Further
                          </Button>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Actions Tab */}
        <TabsContent value="recent-actions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Steering Actions</CardTitle>
              <CardDescription>
                Last {dashboard.recentActions.length} steering action{dashboard.recentActions.length !== 1 ? 's' : ''} across all sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard.recentActions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent actions</p>
                  <p className="text-sm">Steering actions will appear here as they occur</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Action Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboard.recentActions.map((action) => (
                      <TableRow key={action.id}>
                        <TableCell className="text-sm">
                          {action.timestamp.toLocaleTimeString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{action.type.replace('_', ' ')}</Badge>
                        </TableCell>
                        <TableCell>{action.description}</TableCell>
                        <TableCell>
                          <Badge variant="default">Completed</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Steering Effectiveness</CardTitle>
                <CardDescription>
                  Performance metrics for steering interventions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Successful Interventions</span>
                    <div className="flex items-center gap-2">
                      <Progress value={85} className="w-20" />
                      <span className="text-sm font-medium">85%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Call Completion Rate</span>
                    <div className="flex items-center gap-2">
                      <Progress value={92} className="w-20" />
                      <span className="text-sm font-medium">92%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Response Time</span>
                    <span className="text-sm font-medium">2.3s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Emergency Escalations</span>
                    <span className="text-sm font-medium">3</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Common Interventions</CardTitle>
                <CardDescription>
                  Most frequently used steering actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Inject Question</span>
                    <Badge variant="secondary">32</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Conversation Redirect</span>
                    <Badge variant="secondary">28</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Speed Adjustment</span>
                    <Badge variant="secondary">21</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Empathy Prompt</span>
                    <Badge variant="secondary">18</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Emergency Escalation</span>
                    <Badge variant="destructive">3</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}