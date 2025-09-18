'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Mic, 
  Brain, 
  Heart, 
  AlertTriangle, 
  Save, 
  RotateCcw, 
  TestTube, 
  Phone,
  Volume2,
  MessageSquare,
  Shield,
  Activity,
  Clock
} from 'lucide-react';

interface VoiceAgentConfig {
  // OpenAI Realtime Settings
  model: string;
  systemPrompt: string;
  temperature: number;
  responseLatency: 'low' | 'balanced' | 'high_quality';
  
  // Voice Processing Settings
  enableVoiceBiomarkers: boolean;
  biomarkerSensitivity: 'low' | 'medium' | 'high';
  riskScoreThreshold: number;
  
  // Conversation Flow Settings
  maxCallDuration: number; // minutes
  enableSmallTalk: boolean;
  empathyLevel: 'clinical' | 'balanced' | 'warm';
  
  // Clinical Assessment Settings
  requiredQuestions: string[];
  optionalQuestions: string[];
  enableAdaptiveQuestioning: boolean;
  
  // Alert & Escalation Settings
  enableEmergencyDetection: boolean;
  emergencyKeywords: string[];
  autoEscalationThreshold: number;
  clinicalAlertSettings: {
    highRisk: boolean;
    respiratoryDistress: boolean;
    cognitiveChanges: boolean;
  };
  
  // Privacy & Compliance
  enableAudioRecording: boolean;
  dataRetentionDays: number;
  hipaaComplianceMode: boolean;
  
  // Advanced Settings
  enableFunctionCalling: boolean;
  customInstructions: string;
  debugMode: boolean;
}

interface VoiceAgentConfigPanelProps {
  config: VoiceAgentConfig;
  onConfigChange: (config: VoiceAgentConfig) => void;
  onTestVoiceAgent: () => void;
  onSaveConfig: () => void;
  onResetConfig: () => void;
  isLoading?: boolean;
  className?: string;
}

const DEFAULT_CONFIG: VoiceAgentConfig = {
  model: 'gpt-4o-realtime-preview-2024-12-17',
  systemPrompt: `You are a compassionate AI health assistant conducting voice-based check-ins for heart failure patients. Your role is to:

1. Build rapport with warm, empathetic conversation
2. Assess symptoms through natural dialogue 
3. Extract voice biomarkers during speech
4. Identify concerning changes requiring clinical attention
5. Provide reassurance while maintaining clinical accuracy

Key guidelines:
- Use patient's preferred name and speak warmly
- Ask open-ended questions about how they're feeling
- Listen for shortness of breath, fatigue, or concerning symptoms
- Encourage counting exercises for voice analysis
- Never provide medical advice or diagnosis
- Escalate immediately if emergency keywords detected`,
  
  temperature: 0.7,
  responseLatency: 'balanced',
  enableVoiceBiomarkers: true,
  biomarkerSensitivity: 'medium',
  riskScoreThreshold: 0.6,
  maxCallDuration: 10,
  enableSmallTalk: true,
  empathyLevel: 'warm',
  requiredQuestions: [
    "How are you feeling today overall?",
    "Have you experienced any shortness of breath?",
    "How has your energy level been?",
    "Can you count from 1 to 10 for me?"
  ],
  optionalQuestions: [
    "How is your appetite?",
    "Have you been sleeping well?",
    "Any swelling in your legs or feet?",
    "How are you managing your medications?"
  ],
  enableAdaptiveQuestioning: true,
  enableEmergencyDetection: true,
  emergencyKeywords: [
    "chest pain", "can't breathe", "emergency", "help me", "call 911",
    "heart attack", "severe pain", "dizzy", "fainting", "collapsed"
  ],
  autoEscalationThreshold: 0.8,
  clinicalAlertSettings: {
    highRisk: true,
    respiratoryDistress: true,
    cognitiveChanges: true
  },
  enableAudioRecording: false,
  dataRetentionDays: 7,
  hipaaComplianceMode: true,
  enableFunctionCalling: true,
  customInstructions: "",
  debugMode: false
};

export function VoiceAgentConfigPanel({
  config,
  onConfigChange,
  onTestVoiceAgent,
  onSaveConfig,
  onResetConfig,
  isLoading = false,
  className = ""
}: VoiceAgentConfigPanelProps) {
  const [localConfig, setLocalConfig] = useState<VoiceAgentConfig>(config);
  const [hasChanges, setHasChanges] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  useEffect(() => {
    setHasChanges(JSON.stringify(localConfig) !== JSON.stringify(config));
  }, [localConfig, config]);

  const handleConfigUpdate = (updates: Partial<VoiceAgentConfig>) => {
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };

  const handleSave = () => {
    onSaveConfig();
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalConfig(DEFAULT_CONFIG);
    onResetConfig();
    setHasChanges(true);
  };

  const handleTest = async () => {
    setTestStatus('testing');
    try {
      await onTestVoiceAgent();
      setTestStatus('success');
      setTimeout(() => setTestStatus('idle'), 3000);
    } catch (error) {
      setTestStatus('error');
      setTimeout(() => setTestStatus('idle'), 3000);
    }
  };

  const getRiskThresholdLabel = (threshold: number) => {
    if (threshold < 0.3) return 'Low Sensitivity';
    if (threshold < 0.7) return 'Medium Sensitivity';
    return 'High Sensitivity';
  };

  const getLatencyLabel = (latency: string) => {
    switch (latency) {
      case 'low': return 'Fastest Response (~200ms)';
      case 'balanced': return 'Balanced (~500ms)';
      case 'high_quality': return 'Best Quality (~800ms)';
      default: return latency;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <CardTitle>Voice Agent Configuration</CardTitle>
              {hasChanges && (
                <Badge variant="secondary" className="ml-2">
                  Unsaved Changes
                </Badge>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTest}
                disabled={isLoading || testStatus === 'testing'}
                className="flex items-center space-x-1"
              >
                <TestTube className="w-4 h-4" />
                <span>{testStatus === 'testing' ? 'Testing...' : 'Test Agent'}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isLoading}
                className="flex items-center space-x-1"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isLoading || !hasChanges}
                className="flex items-center space-x-1"
              >
                <Save className="w-4 h-4" />
                <span>Save Config</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {/* Test Status */}
        {testStatus !== 'idle' && (
          <CardContent className="pt-0">
            <div className={`p-3 rounded-lg text-sm flex items-center space-x-2 ${
              testStatus === 'testing' ? 'bg-blue-50 text-blue-700' :
              testStatus === 'success' ? 'bg-green-50 text-green-700' :
              'bg-red-50 text-red-700'
            }`}>
              {testStatus === 'testing' && <Activity className="w-4 h-4 animate-spin" />}
              {testStatus === 'success' && <Shield className="w-4 h-4" />}
              {testStatus === 'error' && <AlertTriangle className="w-4 h-4" />}
              <span>
                {testStatus === 'testing' && 'Testing OpenAI Realtime API connection...'}
                {testStatus === 'success' && 'Voice agent test completed successfully!'}
                {testStatus === 'error' && 'Voice agent test failed. Check configuration and API keys.'}
              </span>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Configuration Tabs */}
      <Tabs defaultValue="conversation" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="conversation" className="flex items-center space-x-1">
            <MessageSquare className="w-4 h-4" />
            <span>Conversation</span>
          </TabsTrigger>
          <TabsTrigger value="voice" className="flex items-center space-x-1">
            <Mic className="w-4 h-4" />
            <span>Voice Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="clinical" className="flex items-center space-x-1">
            <Heart className="w-4 h-4" />
            <span>Clinical</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center space-x-1">
            <AlertTriangle className="w-4 h-4" />
            <span>Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center space-x-1">
            <Brain className="w-4 h-4" />
            <span>Advanced</span>
          </TabsTrigger>
        </TabsList>

        {/* Conversation Settings */}
        <TabsContent value="conversation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>Conversation Flow Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Model Selection */}
              <div className="space-y-2">
                <Label>OpenAI Model</Label>
                <select
                  value={localConfig.model}
                  onChange={(e) => handleConfigUpdate({ model: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="gpt-4o-realtime-preview-2024-12-17">GPT-4o Realtime (Recommended)</option>
                  <option value="gpt-4o-realtime-preview">GPT-4o Realtime (Latest)</option>
                </select>
                <p className="text-sm text-gray-600">
                  The AI model used for natural conversation and clinical assessment
                </p>
              </div>

              {/* Response Latency */}
              <div className="space-y-2">
                <Label>Response Latency</Label>
                <select
                  value={localConfig.responseLatency}
                  onChange={(e) => handleConfigUpdate({ responseLatency: e.target.value as any })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="low">Fastest Response (~200ms)</option>
                  <option value="balanced">Balanced (~500ms)</option>
                  <option value="high_quality">Best Quality (~800ms)</option>
                </select>
                <p className="text-sm text-gray-600">
                  {getLatencyLabel(localConfig.responseLatency)}
                </p>
              </div>

              {/* Empathy Level */}
              <div className="space-y-2">
                <Label>Conversation Style</Label>
                <select
                  value={localConfig.empathyLevel}
                  onChange={(e) => handleConfigUpdate({ empathyLevel: e.target.value as any })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="clinical">Clinical & Professional</option>
                  <option value="balanced">Balanced & Caring</option>
                  <option value="warm">Warm & Empathetic</option>
                </select>
              </div>

              {/* Call Duration */}
              <div className="space-y-2">
                <Label>Maximum Call Duration</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="5"
                    max="20"
                    value={localConfig.maxCallDuration}
                    onChange={(e) => handleConfigUpdate({ maxCallDuration: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="w-16 text-sm font-medium">{localConfig.maxCallDuration} min</span>
                </div>
              </div>

              {/* Conversation Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Small Talk</Label>
                    <p className="text-sm text-gray-600">Allow casual conversation to build rapport</p>
                  </div>
                  <Switch
                    checked={localConfig.enableSmallTalk}
                    onCheckedChange={(checked) => handleConfigUpdate({ enableSmallTalk: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Adaptive Questioning</Label>
                    <p className="text-sm text-gray-600">Adjust questions based on patient responses</p>
                  </div>
                  <Switch
                    checked={localConfig.enableAdaptiveQuestioning}
                    onCheckedChange={(checked) => handleConfigUpdate({ enableAdaptiveQuestioning: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Voice Analysis Settings */}
        <TabsContent value="voice">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4" />
                <span>Voice Biomarker Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Voice Biomarkers</Label>
                  <p className="text-sm text-gray-600">Extract acoustic features during conversation</p>
                </div>
                <Switch
                  checked={localConfig.enableVoiceBiomarkers}
                  onCheckedChange={(checked) => handleConfigUpdate({ enableVoiceBiomarkers: checked })}
                />
              </div>

              {localConfig.enableVoiceBiomarkers && (
                <>
                  <div className="space-y-2">
                    <Label>Analysis Sensitivity</Label>
                    <select
                      value={localConfig.biomarkerSensitivity}
                      onChange={(e) => handleConfigUpdate({ biomarkerSensitivity: e.target.value as any })}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="low">Low - Basic Features Only</option>
                      <option value="medium">Medium - Comprehensive Analysis</option>
                      <option value="high">High - Maximum Detail</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Risk Score Alert Threshold</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          min="0.1"
                          max="1.0"
                          step="0.1"
                          value={localConfig.riskScoreThreshold}
                          onChange={(e) => handleConfigUpdate({ riskScoreThreshold: parseFloat(e.target.value) })}
                          className="flex-1"
                        />
                        <span className="w-20 text-sm font-medium">
                          {Math.round(localConfig.riskScoreThreshold * 100)}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {getRiskThresholdLabel(localConfig.riskScoreThreshold)} - Alerts triggered above this risk score
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clinical Assessment */}
        <TabsContent value="clinical">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="w-4 h-4" />
                <span>Clinical Assessment Protocol</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Required Assessment Questions</Label>
                <div className="space-y-2">
                  {localConfig.requiredQuestions.map((question, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                      <span className="flex-1 text-sm">{question}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  These questions will always be asked during the health check-in
                </p>
              </div>

              <div className="space-y-2">
                <Label>Optional Questions (Asked Based on Context)</Label>
                <div className="space-y-2">
                  {localConfig.optionalQuestions.map((question, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
                      <span className="flex-1 text-sm">{question}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  These questions may be asked if relevant to patient responses
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alert Settings */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Clinical Alerts & Escalation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Emergency Detection</Label>
                  <p className="text-sm text-gray-600">Automatically detect emergency situations</p>
                </div>
                <Switch
                  checked={localConfig.enableEmergencyDetection}
                  onCheckedChange={(checked) => handleConfigUpdate({ enableEmergencyDetection: checked })}
                />
              </div>

              {localConfig.enableEmergencyDetection && (
                <div className="space-y-2">
                  <Label>Emergency Keywords</Label>
                  <div className="flex flex-wrap gap-1">
                    {localConfig.emergencyKeywords.map((keyword, index) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    These phrases will trigger immediate emergency escalation
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <Label>Clinical Alert Types</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">High Risk Score Alerts</Label>
                      <p className="text-xs text-gray-600">Alert when voice biomarkers indicate high risk</p>
                    </div>
                    <Switch
                      checked={localConfig.clinicalAlertSettings.highRisk}
                      onCheckedChange={(checked) => handleConfigUpdate({
                        clinicalAlertSettings: { ...localConfig.clinicalAlertSettings, highRisk: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Respiratory Distress</Label>
                      <p className="text-xs text-gray-600">Alert for breathing difficulties or shortness of breath</p>
                    </div>
                    <Switch
                      checked={localConfig.clinicalAlertSettings.respiratoryDistress}
                      onCheckedChange={(checked) => handleConfigUpdate({
                        clinicalAlertSettings: { ...localConfig.clinicalAlertSettings, respiratoryDistress: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Cognitive Changes</Label>
                      <p className="text-xs text-gray-600">Alert for confusion or speech pattern changes</p>
                    </div>
                    <Switch
                      checked={localConfig.clinicalAlertSettings.cognitiveChanges}
                      onCheckedChange={(checked) => handleConfigUpdate({
                        clinicalAlertSettings: { ...localConfig.clinicalAlertSettings, cognitiveChanges: checked }
                      })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>Advanced Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>System Prompt</Label>
                <textarea
                  value={localConfig.systemPrompt}
                  onChange={(e) => handleConfigUpdate({ systemPrompt: e.target.value })}
                  rows={8}
                  className="w-full p-3 border rounded-md text-sm font-mono"
                  placeholder="Enter custom system prompt for the AI assistant..."
                />
                <p className="text-sm text-gray-600">
                  Core instructions that define the AI assistant's behavior and personality
                </p>
              </div>

              <div className="space-y-2">
                <Label>Custom Instructions</Label>
                <textarea
                  value={localConfig.customInstructions}
                  onChange={(e) => handleConfigUpdate({ customInstructions: e.target.value })}
                  rows={4}
                  className="w-full p-3 border rounded-md text-sm"
                  placeholder="Additional custom instructions or specific requirements..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Function Calling</Label>
                    <p className="text-sm text-gray-600">Enable AI to call biomarker and alert functions</p>
                  </div>
                  <Switch
                    checked={localConfig.enableFunctionCalling}
                    onCheckedChange={(checked) => handleConfigUpdate({ enableFunctionCalling: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Debug Mode</Label>
                    <p className="text-sm text-gray-600">Enable detailed logging for troubleshooting</p>
                  </div>
                  <Switch
                    checked={localConfig.debugMode}
                    onCheckedChange={(checked) => handleConfigUpdate({ debugMode: checked })}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <Label>HIPAA Compliance & Data Retention</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">HIPAA Compliance Mode</Label>
                      <p className="text-xs text-gray-600">Enhanced privacy and audit logging</p>
                    </div>
                    <Switch
                      checked={localConfig.hipaaComplianceMode}
                      onCheckedChange={(checked) => handleConfigUpdate({ hipaaComplianceMode: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Audio Recording</Label>
                      <p className="text-xs text-gray-600">Store temporary audio for quality assurance</p>
                    </div>
                    <Switch
                      checked={localConfig.enableAudioRecording}
                      onCheckedChange={(checked) => handleConfigUpdate({ enableAudioRecording: checked })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Data Retention Period</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="1"
                        max="30"
                        value={localConfig.dataRetentionDays}
                        onChange={(e) => handleConfigUpdate({ dataRetentionDays: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="w-16 text-sm font-medium">{localConfig.dataRetentionDays} days</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Call transcripts and biomarker data will be automatically deleted after this period
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}