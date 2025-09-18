'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Phone, 
  PhoneOff, 
  AlertTriangle, 
  Heart, 
  Activity, 
  Mic, 
  MicOff, 
  User, 
  Bot,
  TrendingUp,
  Clock,
  Volume2
} from 'lucide-react';

interface VoiceBiomarkers {
  timestamp: Date;
  riskScore: number;
  features: {
    f0: { mean: number; std: number };
    jitter: { local: number };
    shimmer: { local: number };
    hnr: { mean: number };
    respiratory: { breathingRate: number; dyspneaIndicators: number };
    energy: { rms: number };
  };
}

interface TranscriptEntry {
  speaker: 'patient' | 'agent';
  text: string;
  timestamp: Date;
  audioFeatures?: any;
}

interface ConversationSession {
  callSid: string;
  patientId: string;
  patientName: string;
  phoneNumber: string;
  startTime: Date;
  status: 'connecting' | 'active' | 'completed' | 'failed';
  currentPhase: 'rapport_building' | 'symptom_assessment' | 'voice_analysis' | 'closing';
  transcripts: TranscriptEntry[];
  biomarkers: VoiceBiomarkers[];
  alerts: Array<{
    type: 'clinical' | 'emergency' | 'technical';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: Date;
  }>;
}

interface ConversationMonitorProps {
  session?: ConversationSession;
  onEndCall?: (callSid: string) => void;
  onEmergencyAlert?: (alert: any) => void;
  className?: string;
}

export function ConversationMonitor({ 
  session, 
  onEndCall, 
  onEmergencyAlert,
  className = "" 
}: ConversationMonitorProps) {
  const [isListening, setIsListening] = useState(false);
  const [currentRiskScore, setCurrentRiskScore] = useState(0);
  const [lastTranscript, setLastTranscript] = useState<TranscriptEntry | null>(null);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('excellent');

  // Real-time updates from WebSocket proxy server
  useEffect(() => {
    if (!session) return;

    // In a real implementation, this would connect to the WebSocket proxy server
    // For now, we'll simulate real-time updates
    const interval = setInterval(() => {
      // Simulate voice activity detection
      setIsListening(Math.random() > 0.7);
      
      // Update risk score based on latest biomarkers
      if (session.biomarkers.length > 0) {
        const latestBiomarker = session.biomarkers[session.biomarkers.length - 1];
        setCurrentRiskScore(latestBiomarker.riskScore);
      }
      
      // Update transcript
      if (session.transcripts.length > 0) {
        setLastTranscript(session.transcripts[session.transcripts.length - 1]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  const handleEndCall = useCallback(() => {
    if (session && onEndCall) {
      onEndCall(session.callSid);
    }
  }, [session, onEndCall]);

  const getPhaseDisplayName = (phase: string) => {
    switch (phase) {
      case 'rapport_building': return 'Building Rapport';
      case 'symptom_assessment': return 'Symptom Assessment'; 
      case 'voice_analysis': return 'Voice Analysis';
      case 'closing': return 'Closing';
      default: return 'Unknown Phase';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connecting': return 'bg-yellow-500';
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score < 0.3) return 'text-green-600';
    if (score < 0.6) return 'text-yellow-600';
    if (score < 0.8) return 'text-orange-600';
    return 'text-red-600';
  };

  const getCallDuration = () => {
    if (!session) return '00:00';
    const duration = Date.now() - session.startTime.getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!session) {
    return (
      <Card className={`w-full h-96 ${className}`}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <Phone className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No active conversation</p>
            <p className="text-sm">Waiting for voice call to begin...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Call Status Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(session.status)}`} />
              <div>
                <CardTitle className="text-lg">{session.patientName}</CardTitle>
                <p className="text-sm text-gray-600">{session.phoneNumber}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                {session.status.toUpperCase()}
              </Badge>
              <Badge variant="outline">
                {getPhaseDisplayName(session.currentPhase)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <Clock className="w-4 h-4 mx-auto mb-1" />
              <p className="text-sm font-medium">{getCallDuration()}</p>
              <p className="text-xs text-gray-500">Duration</p>
            </div>
            <div>
              <Heart className={`w-4 h-4 mx-auto mb-1 ${getRiskScoreColor(currentRiskScore)}`} />
              <p className={`text-sm font-medium ${getRiskScoreColor(currentRiskScore)}`}>
                {Math.round(currentRiskScore * 100)}%
              </p>
              <p className="text-xs text-gray-500">Risk Score</p>
            </div>
            <div>
              <Activity className="w-4 h-4 mx-auto mb-1" />
              <p className="text-sm font-medium">{session.biomarkers.length}</p>
              <p className="text-xs text-gray-500">Biomarkers</p>
            </div>
            <div>
              {isListening ? (
                <Mic className="w-4 h-4 mx-auto mb-1 text-green-500" />
              ) : (
                <MicOff className="w-4 h-4 mx-auto mb-1 text-gray-400" />
              )}
              <p className="text-sm font-medium">
                {isListening ? 'Active' : 'Quiet'}
              </p>
              <p className="text-xs text-gray-500">Voice Activity</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Transcript */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center">
            <Volume2 className="w-4 h-4 mr-2" />
            Live Conversation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {session.transcripts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                Conversation will appear here as it happens...
              </p>
            ) : (
              session.transcripts.slice(-5).map((transcript, index) => (
                <div key={index} className="flex space-x-3">
                  <div className="flex-shrink-0">
                    {transcript.speaker === 'patient' ? (
                      <User className="w-4 h-4 text-blue-500 mt-0.5" />
                    ) : (
                      <Bot className="w-4 h-4 text-green-500 mt-0.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium text-gray-700">
                        {transcript.speaker === 'patient' ? session.patientName : 'AI Assistant'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {transcript.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900">{transcript.text}</p>
                  </div>
                </div>
              ))
            )}
            
            {/* Typing indicator for active speech */}
            {isListening && (
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  <User className="w-4 h-4 text-blue-500 mt-0.5 animate-pulse" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-medium text-gray-700">{session.patientName}</span>
                    <span className="text-xs text-gray-400">speaking...</span>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Voice Biomarkers Dashboard */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Voice Biomarkers
            </span>
            <Badge variant={currentRiskScore > 0.7 ? 'destructive' : currentRiskScore > 0.4 ? 'secondary' : 'default'}>
              Risk: {Math.round(currentRiskScore * 100)}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {session.biomarkers.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Voice analysis will begin once conversation starts...
            </p>
          ) : (
            <div className="space-y-3">
              {/* Risk Score Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Overall Risk Score</span>
                  <span className={`text-sm font-bold ${getRiskScoreColor(currentRiskScore)}`}>
                    {Math.round(currentRiskScore * 100)}%
                  </span>
                </div>
                <Progress 
                  value={currentRiskScore * 100} 
                  className="h-2"
                />
              </div>

              {/* Latest Biomarker Details */}
              {session.biomarkers.length > 0 && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Breathing Rate:</span>
                    <span className="ml-2 font-medium">
                      {session.biomarkers[session.biomarkers.length - 1].features.respiratory.breathingRate} bpm
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Voice Quality:</span>
                    <span className="ml-2 font-medium">
                      {session.biomarkers[session.biomarkers.length - 1].features.hnr.mean.toFixed(1)} dB HNR
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Pitch Mean:</span>
                    <span className="ml-2 font-medium">
                      {session.biomarkers[session.biomarkers.length - 1].features.f0.mean.toFixed(1)} Hz
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Energy Level:</span>
                    <span className="ml-2 font-medium">
                      {(session.biomarkers[session.biomarkers.length - 1].features.energy.rms * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerts Panel */}
      {session.alerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center text-orange-800">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Active Alerts ({session.alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {session.alerts.slice(-3).map((alert, index) => (
                <div key={index} className="flex items-start space-x-2 p-2 bg-white rounded border">
                  <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                    alert.severity === 'critical' ? 'text-red-500' :
                    alert.severity === 'high' ? 'text-orange-500' :
                    alert.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-gray-500">
                      {alert.timestamp.toLocaleTimeString()} • {alert.type} • {alert.severity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center space-x-3">
            <Button
              variant={session.status === 'active' ? 'destructive' : 'secondary'}
              size="lg"
              onClick={handleEndCall}
              className="flex items-center space-x-2"
            >
              <PhoneOff className="w-4 h-4" />
              <span>{session.status === 'active' ? 'End Call' : 'Close'}</span>
            </Button>
            
            {session.alerts.some(a => a.severity === 'critical') && (
              <Button
                variant="outline"
                size="lg"
                className="flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => {
                  const criticalAlert = session.alerts.find(a => a.severity === 'critical');
                  if (criticalAlert && onEmergencyAlert) {
                    onEmergencyAlert(criticalAlert);
                  }
                }}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Emergency Protocol</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}