'use client';

import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClinicalAlert } from '@/types/clinical';
import { AlertTriangle, Phone, CheckCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CriticalAlertsPanelProps {
  alerts: ClinicalAlert[];
  onAcknowledgeAlert?: (alertId: string) => void;
  onContactPatient?: (patientId: string) => void;
}

export function CriticalAlertsPanel({ 
  alerts, 
  onAcknowledgeAlert, 
  onContactPatient 
}: CriticalAlertsPanelProps) {
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());

  const handleAcknowledge = (alertId: string) => {
    setAcknowledged(prev => new Set([...prev, alertId]));
    onAcknowledgeAlert?.(alertId);
  };

  const getPriorityColor = (priority: ClinicalAlert['priority']) => {
    switch (priority) {
      case 'immediate':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'urgent':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'routine':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: ClinicalAlert['priority']) => {
    switch (priority) {
      case 'immediate':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'urgent':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'routine':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const activeAlerts = alerts.filter(alert => 
    alert.status === 'active' && !acknowledged.has(alert.id)
  );

  if (activeAlerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Critical Alerts
          </CardTitle>
          <CardDescription>No active critical alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-400" />
            <p>All patients are stable</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="h-5 w-5" />
          Critical Alerts ({activeAlerts.length})
        </CardTitle>
        <CardDescription>
          Immediate attention required for high-risk patients
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeAlerts.map((alert) => (
          <Alert 
            key={alert.id}
            className={`${getPriorityColor(alert.priority)} border-2`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {getPriorityIcon(alert.priority)}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <AlertTitle className="text-base font-semibold">
                      {alert.message}
                    </AlertTitle>
                    <Badge variant="outline" className="text-xs">
                      {alert.priority.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <AlertDescription className="text-sm">
                    {alert.detailedDescription}
                  </AlertDescription>
                  
                  <div className="text-xs text-muted-foreground flex items-center gap-4">
                    <span>
                      Created {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                    </span>
                    <span>Patient ID: {alert.patientId}</span>
                    <span>Escalation Level: {alert.escalationLevel}</span>
                  </div>

                  {/* Required Actions */}
                  {alert.requiredActions.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-2">Required Actions:</p>
                      <ul className="text-sm space-y-1">
                        {alert.requiredActions.map((action, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-current rounded-full" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onContactPatient?.(alert.patientId)}
                  className="whitespace-nowrap"
                >
                  <Phone className="h-4 w-4 mr-1" />
                  Contact
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleAcknowledge(alert.id)}
                  className="whitespace-nowrap"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Acknowledge
                </Button>
              </div>
            </div>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}