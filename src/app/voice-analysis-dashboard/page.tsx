'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Activity, 
  Heart, 
  Mic, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Phone,
  BarChart3,
  Waveform
} from 'lucide-react';

interface VoiceBiomarkers {
  jitter: { local: number; rap: number; ppq5: number };
  shimmer: { local: number; apq3: number; apq5: number };
  hnr: { mean: number; std: number };
  f0: { mean: number; std: number; range: number };
  prosody: { speechRate: number; pauseRate: number; voicedRatio: number };
  spectral: { centroid: number; rolloff: number; slope: number };
}

interface VoiceAnalysisResult {
  patientId: string;
  patientName: string;
  callSid: string;
  timestamp: string;
  question: 'symptoms' | 'counting';
  biomarkers: VoiceBiomarkers;
  riskScore: number;
  duration: number;
  analysisType: string;
}

export default function VoiceAnalysisDashboard() {
  const [analysisResults, setAnalysisResults] = useState<VoiceAnalysisResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<VoiceAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const mockResults: VoiceAnalysisResult[] = [
      {
        patientId: 'patient-001',
        patientName: 'John Smith',
        callSid: 'CA123456789',
        timestamp: new Date().toISOString(),
        question: 'symptoms',
        biomarkers: {
          jitter: { local: 0.028, rap: 0.025, ppq5: 0.030 },
          shimmer: { local: 0.085, apq3: 0.078, apq5: 0.082 },
          hnr: { mean: 13.2, std: 2.1 },
          f0: { mean: 142.5, std: 18.3, range: 85.2 },
          prosody: { speechRate: 145, pauseRate: 0.25, voicedRatio: 0.72 },
          spectral: { centroid: 1250, rolloff: 3200, slope: -8.5 }
        },
        riskScore: 75,
        duration: 28,
        analysisType: 'symptom_narrative'
      },
      {
        patientId: 'patient-001',
        patientName: 'John Smith',
        callSid: 'CA123456789',
        timestamp: new Date(Date.now() - 60000).toISOString(),
        question: 'counting',
        biomarkers: {
          jitter: { local: 0.015, rap: 0.013, ppq5: 0.017 },
          shimmer: { local: 0.045, apq3: 0.042, apq5: 0.047 },
          hnr: { mean: 16.8, std: 1.5 },
          f0: { mean: 138.2, std: 12.1, range: 45.3 },
          prosody: { speechRate: 180, pauseRate: 0.15, voicedRatio: 0.85 },
          spectral: { centroid: 1180, rolloff: 2950, slope: -7.2 }
        },
        riskScore: 35,
        duration: 12,
        analysisType: 'standardized_speech'
      }
    ];
    
    setAnalysisResults(mockResults);
    setSelectedResult(mockResults[0]);
    setLoading(false);
  }, []);

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: 'Critical', color: 'destructive', icon: AlertTriangle };
    if (score >= 60) return { level: 'High', color: 'warning', icon: TrendingUp };
    if (score >= 40) return { level: 'Moderate', color: 'secondary', icon: Activity };
    return { level: 'Low', color: 'success', icon: CheckCircle };
  };

  const getBiomarkerStatus = (value: number, thresholds: { normal: number; elevated: number }) => {
    if (value > thresholds.elevated) return { status: 'Pathological', color: 'destructive' };
    if (value > thresholds.normal) return { status: 'Elevated', color: 'warning' };
    return { status: 'Normal', color: 'success' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Waveform className="h-8 w-8 animate-pulse mx-auto mb-4" />
          <p>Loading voice analysis results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Voice Biomarker Analysis Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time voice analysis for heart failure monitoring
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Initiate Voice Assessment
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analysis Results List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Recent Analyses
            </CardTitle>
            <CardDescription>
              Voice biomarker analysis results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysisResults.map((result, index) => {
              const risk = getRiskLevel(result.riskScore);
              const RiskIcon = risk.icon;
              
              return (
                <div
                  key={`${result.callSid}-${result.question}`}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedResult === result ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedResult(result)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{result.patientName}</h3>
                    <Badge variant={risk.color as any} className="flex items-center gap-1">
                      <RiskIcon className="h-3 w-3" />
                      {result.riskScore}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {new Date(result.timestamp).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-3 w-3" />
                      {result.question === 'symptoms' ? 'Symptom Description' : 'Counting Analysis'}
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-3 w-3" />
                      {result.duration}s duration
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Detailed Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {selectedResult && (
            <>
              {/* Risk Score Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Heart Failure Risk Assessment
                  </CardTitle>
                  <CardDescription>
                    Analysis for {selectedResult.patientName} - {selectedResult.analysisType}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Risk Score</span>
                      <Badge variant={getRiskLevel(selectedResult.riskScore).color as any} className="text-lg px-3 py-1">
                        {selectedResult.riskScore}/100
                      </Badge>
                    </div>
                    <Progress value={selectedResult.riskScore} className="h-3" />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Analysis Type:</span>
                        <p className="font-medium">{selectedResult.analysisType.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <p className="font-medium">{selectedResult.duration} seconds</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Biomarker Details */}
              <Tabs defaultValue="voice-quality" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="voice-quality">Voice Quality</TabsTrigger>
                  <TabsTrigger value="pitch">Pitch Analysis</TabsTrigger>
                  <TabsTrigger value="prosody">Prosody</TabsTrigger>
                  <TabsTrigger value="spectral">Spectral</TabsTrigger>
                </TabsList>

                <TabsContent value="voice-quality" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Jitter Analysis */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Jitter Analysis</CardTitle>
                        <CardDescription>Pitch variation measurements</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Local Jitter</span>
                            <Badge variant={getBiomarkerStatus(selectedResult.biomarkers.jitter.local, { normal: 0.0104, elevated: 0.025 }).color as any}>
                              {(selectedResult.biomarkers.jitter.local * 100).toFixed(2)}%
                            </Badge>
                          </div>
                          <Progress value={Math.min(selectedResult.biomarkers.jitter.local * 1000, 100)} />
                          <p className="text-xs text-muted-foreground">
                            Normal: &lt;1.04%, Pathological: &gt;2.5%
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Shimmer Analysis */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Shimmer Analysis</CardTitle>
                        <CardDescription>Amplitude variation measurements</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Local Shimmer</span>
                            <Badge variant={getBiomarkerStatus(selectedResult.biomarkers.shimmer.local, { normal: 0.035, elevated: 0.10 }).color as any}>
                              {(selectedResult.biomarkers.shimmer.local * 100).toFixed(2)}%
                            </Badge>
                          </div>
                          <Progress value={Math.min(selectedResult.biomarkers.shimmer.local * 200, 100)} />
                          <p className="text-xs text-muted-foreground">
                            Normal: &lt;3.5%, Pathological: &gt;10%
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* HNR Analysis */}
                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle className="text-lg">Harmonics-to-Noise Ratio (HNR)</CardTitle>
                        <CardDescription>Voice quality measurement</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">HNR Mean</span>
                            <Badge variant={getBiomarkerStatus(15 - selectedResult.biomarkers.hnr.mean, { normal: 0, elevated: 3 }).color as any}>
                              {selectedResult.biomarkers.hnr.mean.toFixed(1)} dB
                            </Badge>
                          </div>
                          <Progress value={Math.min(selectedResult.biomarkers.hnr.mean * 4, 100)} />
                          <p className="text-xs text-muted-foreground">
                            Normal: &gt;15 dB, Concerning: &lt;12 dB
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="pitch" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Fundamental Frequency (F0) Analysis</CardTitle>
                      <CardDescription>Pitch characteristics and patterns</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{selectedResult.biomarkers.f0.mean.toFixed(1)}</div>
                        <div className="text-sm text-muted-foreground">Mean F0 (Hz)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{selectedResult.biomarkers.f0.std.toFixed(1)}</div>
                        <div className="text-sm text-muted-foreground">Standard Deviation</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{selectedResult.biomarkers.f0.range.toFixed(1)}</div>
                        <div className="text-sm text-muted-foreground">Range (Hz)</div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="prosody" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Prosodic Features</CardTitle>
                      <CardDescription>Speech rhythm and timing patterns</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{selectedResult.biomarkers.prosody.speechRate}</div>
                        <div className="text-sm text-muted-foreground">Speech Rate (WPM)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{(selectedResult.biomarkers.prosody.pauseRate * 100).toFixed(1)}%</div>
                        <div className="text-sm text-muted-foreground">Pause Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{(selectedResult.biomarkers.prosody.voicedRatio * 100).toFixed(1)}%</div>
                        <div className="text-sm text-muted-foreground">Voiced Ratio</div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="spectral" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Spectral Analysis</CardTitle>
                      <CardDescription>Frequency domain characteristics</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{selectedResult.biomarkers.spectral.centroid}</div>
                        <div className="text-sm text-muted-foreground">Centroid (Hz)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{selectedResult.biomarkers.spectral.rolloff}</div>
                        <div className="text-sm text-muted-foreground">Rolloff (Hz)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{selectedResult.biomarkers.spectral.slope.toFixed(1)}</div>
                        <div className="text-sm text-muted-foreground">Slope (dB/Hz)</div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
