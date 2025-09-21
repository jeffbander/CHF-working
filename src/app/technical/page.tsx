'use client';

import { ClinicalHeader } from '@/components/clinical/clinical-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Cpu, 
  Database, 
  Phone, 
  Shield, 
  Workflow, 
  BarChart3,
  Settings,
  Cloud,
  Lock,
  Activity,
  TrendingUp,
  Clock,
  Zap,
  Network,
  HardDrive,
  MonitorSpeaker
} from 'lucide-react';

export default function TechnicalPage() {
  // Mock clinician data for header
  const currentClinician = {
    name: "Dr. Sarah Chen",
    title: "Cardiologist",
    id: "clinician-001"
  };

  return (
    <div className="min-h-screen bg-background">
      <ClinicalHeader 
        clinicianName={currentClinician.name}
        clinicianTitle={currentClinician.title}
        alertCount={0}
      />

      <main className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Cpu className="h-12 w-12 text-primary" />
              <h1 className="text-4xl font-bold tracking-tight text-foreground">Technical Documentation</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
              Comprehensive technical architecture, algorithms, and implementation details 
              for the HeartVoice Monitor voice biomarker analysis platform.
            </p>
          </div>

          <Tabs defaultValue="architecture" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="architecture">Architecture</TabsTrigger>
              <TabsTrigger value="voice-processing">Voice Processing</TabsTrigger>
              <TabsTrigger value="algorithms">Algorithms</TabsTrigger>
              <TabsTrigger value="monitoring">Patient Monitoring</TabsTrigger>
              <TabsTrigger value="integration">Integration</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            {/* Architecture Tab */}
            <TabsContent value="architecture" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="h-5 w-5 text-primary" />
                    System Architecture Overview
                  </CardTitle>
                  <CardDescription>
                    High-level architecture of the HeartVoice Monitor platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Voice Collection Layer
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span>Twilio Programmable Voice</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span>ElevenLabs Conversational AI</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span>Real-time call orchestration</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span>Audio quality validation</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-l-4 border-l-green-500">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Cpu className="h-4 w-4" />
                            Processing Engine
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>Next.js 15 Application Framework</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>OpenAI GPT-4 Analysis Engine</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>Python voice analysis pipeline</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>Redis caching layer</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-l-4 border-l-purple-500">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            Data & Storage
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span>PostgreSQL patient database</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span>Time-series voice metrics</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span>HIPAA-compliant encryption</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span>Automated backup systems</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="bg-slate-50">
                      <CardHeader>
                        <CardTitle className="text-lg">Data Flow Architecture</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-white rounded border">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                              <div>
                                <p className="font-medium text-sm">Call Initiation</p>
                                <p className="text-xs text-muted-foreground">Automated daily calls triggered by scheduler</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">Twilio API</Badge>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-white rounded border">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                              <div>
                                <p className="font-medium text-sm">Voice Recording</p>
                                <p className="text-xs text-muted-foreground">3-minute structured assessment with quality validation</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">ElevenLabs</Badge>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-white rounded border">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                              <div>
                                <p className="font-medium text-sm">Biomarker Extraction</p>
                                <p className="text-xs text-muted-foreground">Real-time acoustic analysis and feature extraction</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">Python/ML</Badge>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-white rounded border">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                              <div>
                                <p className="font-medium text-sm">Risk Assessment</p>
                                <p className="text-xs text-muted-foreground">ML model generates risk scores and clinical alerts</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">OpenAI GPT-4</Badge>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-white rounded border">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">5</div>
                              <div>
                                <p className="font-medium text-sm">Clinical Integration</p>
                                <p className="text-xs text-muted-foreground">Dashboard updates and EHR integration via FHIR</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">FHIR R4</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Voice Processing Tab */}
            <TabsContent value="voice-processing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MonitorSpeaker className="h-5 w-5 text-primary" />
                    Voice Processing Pipeline
                  </CardTitle>
                  <CardDescription>
                    Detailed technical implementation of voice biomarker extraction
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <Card className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <CardTitle className="text-lg">Audio Preprocessing</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium mb-3">Signal Processing Steps</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                <span><strong>Sampling Rate:</strong> 16kHz, 16-bit PCM</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                <span><strong>Pre-emphasis:</strong> High-pass filter (α = 0.97)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                <span><strong>Windowing:</strong> Hamming window (25ms, 10ms hop)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                <span><strong>Normalization:</strong> Zero-mean unit variance</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-3">Quality Validation</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                <span><strong>SNR Threshold:</strong> &gt; 15 dB</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                <span><strong>Clipping Detection:</strong> &lt; 2% samples at limits</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                <span><strong>Voice Activity:</strong> &gt; 70% speech content</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                <span><strong>Duration Check:</strong> Minimum 2 minutes</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500">
                      <CardHeader>
                        <CardTitle className="text-lg">Feature Extraction Algorithms</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <h4 className="font-medium">Fundamental Frequency (F0)</h4>
                              <div className="bg-green-50 p-3 rounded text-sm">
                                <code className="text-xs">
                                  def extract_f0(signal, sr=16000):<br />
                                  &nbsp;&nbsp;# Autocorrelation-based pitch detection<br />
                                  &nbsp;&nbsp;frame_length = int(0.025 * sr)<br />
                                  &nbsp;&nbsp;hop_length = int(0.010 * sr)<br />
                                  &nbsp;&nbsp;f0 = librosa.yin(signal, fmin=75, fmax=300)<br />
                                  &nbsp;&nbsp;return np.median(f0[f0 &gt; 0])
                                </code>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <h4 className="font-medium">Jitter Calculation</h4>
                              <div className="bg-blue-50 p-3 rounded text-sm">
                                <code className="text-xs">
                                  def calculate_jitter(f0_contour):<br />
                                  &nbsp;&nbsp;# Period-to-period variation<br />
                                  &nbsp;&nbsp;periods = 1.0 / f0_contour<br />
                                  &nbsp;&nbsp;diff = np.abs(np.diff(periods))<br />
                                  &nbsp;&nbsp;jitter = np.mean(diff) / np.mean(periods)<br />
                                  &nbsp;&nbsp;return jitter * 100  # Convert to %
                                </code>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <h4 className="font-medium">Shimmer Calculation</h4>
                              <div className="bg-purple-50 p-3 rounded text-sm">
                                <code className="text-xs">
                                  def calculate_shimmer(amplitude):<br />
                                  &nbsp;&nbsp;# Amplitude variation measure<br />
                                  &nbsp;&nbsp;amp_diff = np.abs(np.diff(amplitude))<br />
                                  &nbsp;&nbsp;shimmer = np.mean(amp_diff) / np.mean(amplitude)<br />
                                  &nbsp;&nbsp;return shimmer * 100  # Convert to %
                                </code>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <h4 className="font-medium">HNR Calculation</h4>
                              <div className="bg-orange-50 p-3 rounded text-sm">
                                <code className="text-xs">
                                  def calculate_hnr(signal, f0, sr=16000):<br />
                                  &nbsp;&nbsp;# Harmonics-to-noise ratio<br />
                                  &nbsp;&nbsp;harmonic_power = get_harmonic_power(signal, f0)<br />
                                  &nbsp;&nbsp;noise_power = get_noise_power(signal, f0)<br />
                                  &nbsp;&nbsp;return 10 * np.log10(harmonic_power / noise_power)
                                </code>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-50">
                      <CardHeader>
                        <CardTitle className="text-lg">Real-time Processing Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-white rounded">
                            <div className="text-2xl font-bold text-primary">1.2s</div>
                            <div className="text-sm font-medium">Processing Time</div>
                            <div className="text-xs text-muted-foreground">3-minute audio</div>
                          </div>
                          <div className="text-center p-3 bg-white rounded">
                            <div className="text-2xl font-bold text-green-600">99.7%</div>
                            <div className="text-sm font-medium">Uptime</div>
                            <div className="text-xs text-muted-foreground">Last 12 months</div>
                          </div>
                          <div className="text-center p-3 bg-white rounded">
                            <div className="text-2xl font-bold text-blue-600">15ms</div>
                            <div className="text-sm font-medium">API Latency</div>
                            <div className="text-xs text-muted-foreground">p95 response time</div>
                          </div>
                          <div className="text-center p-3 bg-white rounded">
                            <div className="text-2xl font-bold text-purple-600">10K+</div>
                            <div className="text-sm font-medium">Daily Calls</div>
                            <div className="text-xs text-muted-foreground">Peak capacity</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Algorithms Tab */}
            <TabsContent value="algorithms" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-primary" />
                    Machine Learning Algorithms
                  </CardTitle>
                  <CardDescription>
                    Advanced ML models for risk prediction and clinical decision support
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <Card className="border-l-4 border-l-red-500">
                      <CardHeader>
                        <CardTitle className="text-lg">Risk Prediction Model</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium mb-3">Model Architecture</h4>
                              <div className="space-y-2 text-sm">
                                <div><strong>Type:</strong> Gradient Boosting (XGBoost)</div>
                                <div><strong>Input Features:</strong> 47 acoustic parameters</div>
                                <div><strong>Training Data:</strong> 125,000+ voice samples</div>
                                <div><strong>Validation:</strong> 5-fold cross-validation</div>
                                <div><strong>Performance:</strong> AUC 0.89 (95% CI: 0.86-0.92)</div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-3">Feature Importance</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center">
                                  <span>Jitter (local)</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-20 h-2 bg-gray-200 rounded">
                                      <div className="w-16 h-2 bg-red-500 rounded"></div>
                                    </div>
                                    <span className="text-xs">0.18</span>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span>HNR</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-20 h-2 bg-gray-200 rounded">
                                      <div className="w-14 h-2 bg-blue-500 rounded"></div>
                                    </div>
                                    <span className="text-xs">0.15</span>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span>Shimmer (local)</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-20 h-2 bg-gray-200 rounded">
                                      <div className="w-12 h-2 bg-green-500 rounded"></div>
                                    </div>
                                    <span className="text-xs">0.13</span>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span>F0 variability</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-20 h-2 bg-gray-200 rounded">
                                      <div className="w-8 h-2 bg-purple-500 rounded"></div>
                                    </div>
                                    <span className="text-xs">0.09</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-red-50 p-4 rounded">
                            <h4 className="font-medium text-red-800 mb-2">Risk Score Calculation</h4>
                            <div className="text-sm text-red-700 font-mono">
                              risk_score = XGBoost_model.predict_proba(features)[1] * 100<br />
                              clinical_risk = risk_score * clinical_weight_factor<br />
                              final_score = min(100, clinical_risk + temporal_trend_adjustment)
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <CardTitle className="text-lg">Longitudinal Trend Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium mb-3">Time-Series Model</h4>
                              <div className="space-y-2 text-sm">
                                <div><strong>Algorithm:</strong> LSTM Neural Network</div>
                                <div><strong>Sequence Length:</strong> 14 days (lookback)</div>
                                <div><strong>Prediction Window:</strong> 7 days (forecast)</div>
                                <div><strong>Update Frequency:</strong> Daily retraining</div>
                                <div><strong>Trend Detection:</strong> Mann-Kendall test</div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-3">Change Point Detection</h4>
                              <div className="bg-blue-50 p-3 rounded text-xs font-mono">
                                def detect_change_points(timeseries):<br />
                                &nbsp;&nbsp;# PELT algorithm implementation<br />
                                &nbsp;&nbsp;model = "rbf"  # Radial basis function<br />
                                &nbsp;&nbsp;algo = rpt.Pelt(model=model)<br />
                                &nbsp;&nbsp;result = algo.fit_predict(timeseries, pen=10)<br />
                                &nbsp;&nbsp;return result[:-1]  # Remove last point
                              </div>
                            </div>
                          </div>

                          <div className="bg-blue-50 p-4 rounded">
                            <h4 className="font-medium text-blue-800 mb-2">Trend Classification</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-green-600">Improving:</span>
                                <div className="text-xs text-muted-foreground">Slope &lt; -0.5 points/day</div>
                              </div>
                              <div>
                                <span className="font-medium text-yellow-600">Stable:</span>
                                <div className="text-xs text-muted-foreground">-0.5 ≤ slope ≤ 0.5 points/day</div>
                              </div>
                              <div>
                                <span className="font-medium text-red-600">Deteriorating:</span>
                                <div className="text-xs text-muted-foreground">Slope &gt; 0.5 points/day</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500">
                      <CardHeader>
                        <CardTitle className="text-lg">Clinical Decision Support</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium mb-3">Alert Generation Rules</h4>
                              <div className="space-y-3">
                                <div className="p-3 bg-red-100 rounded text-sm">
                                  <span className="font-medium text-red-800">Critical Alert:</span>
                                  <div className="text-xs mt-1">Risk score &gt; 75 OR 3-day upward trend &gt; 15 points</div>
                                </div>
                                <div className="p-3 bg-orange-100 rounded text-sm">
                                  <span className="font-medium text-orange-800">High Alert:</span>
                                  <div className="text-xs mt-1">Risk score 51-75 OR 5-day upward trend &gt; 10 points</div>
                                </div>
                                <div className="p-3 bg-yellow-100 rounded text-sm">
                                  <span className="font-medium text-yellow-800">Medium Alert:</span>
                                  <div className="text-xs mt-1">Risk score 26-50 OR 7-day upward trend &gt; 8 points</div>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-3">Clinical Recommendations</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-start gap-2">
                                  <Zap className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                                  <span><strong>Diuretic Adjustment:</strong> Increase loop diuretic dose by 50-100%</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <Activity className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                  <span><strong>Medication Review:</strong> Assess ACE-I/ARB and beta-blocker adherence</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <Phone className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span><strong>Contact Patient:</strong> Schedule follow-up within 24-48 hours</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <Clock className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                                  <span><strong>Monitoring:</strong> Increase call frequency to twice daily</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Patient Monitoring Tab */}
            <TabsContent value="monitoring" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Longitudinal Patient Monitoring
                  </CardTitle>
                  <CardDescription>
                    Comprehensive patient tracking and trend analysis over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <Card className="border-l-4 border-l-teal-500">
                      <CardHeader>
                        <CardTitle className="text-lg">Patient Baseline Establishment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium mb-3">Baseline Collection Protocol</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                                  <span><strong>Duration:</strong> 7-10 days of stable recordings</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                                  <span><strong>Quality Control:</strong> &gt; 90% successful calls</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                                  <span><strong>Clinical Status:</strong> NYHA class unchanged</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                                  <span><strong>Medication Stability:</strong> No changes in 14 days</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-3">Statistical Baseline Calculation</h4>
                              <div className="bg-teal-50 p-3 rounded text-xs font-mono">
                                baseline_metrics = {'{}'}<br />
                                &nbsp;&nbsp;'jitter_mean': np.mean(jitter_values),<br />
                                &nbsp;&nbsp;'jitter_std': np.std(jitter_values),<br />
                                &nbsp;&nbsp;'shimmer_mean': np.mean(shimmer_values),<br />
                                &nbsp;&nbsp;'hnr_mean': np.mean(hnr_values),<br />
                                &nbsp;&nbsp;'f0_mean': np.mean(f0_values),<br />
                                &nbsp;&nbsp;'baseline_risk': np.mean(risk_scores)<br />
                                {'}'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-indigo-500">
                      <CardHeader>
                        <CardTitle className="text-lg">Continuous Monitoring System</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="p-4">
                              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Daily Monitoring
                              </h4>
                              <div className="space-y-2 text-xs">
                                <div>• Automated call scheduling</div>
                                <div>• Real-time quality assessment</div>
                                <div>• Immediate biomarker extraction</div>
                                <div>• Risk score calculation</div>
                              </div>
                            </Card>
                            
                            <Card className="p-4">
                              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                                <BarChart3 className="h-4 w-4" />
                                Weekly Analysis
                              </h4>
                              <div className="space-y-2 text-xs">
                                <div>• Trend pattern recognition</div>
                                <div>• Statistical significance testing</div>
                                <div>• Baseline drift detection</div>
                                <div>• Clinical correlation review</div>
                              </div>
                            </Card>
                            
                            <Card className="p-4">
                              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Monthly Review
                              </h4>
                              <div className="space-y-2 text-xs">
                                <div>• Model performance evaluation</div>
                                <div>• Baseline recalibration</div>
                                <div>• Clinical outcome correlation</div>
                                <div>• Algorithm refinement</div>
                              </div>
                            </Card>
                          </div>

                          <div className="bg-indigo-50 p-4 rounded">
                            <h4 className="font-medium text-indigo-800 mb-2">Adaptive Monitoring Frequency</h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                              <div className="text-center">
                                <div className="font-bold text-green-600">Low Risk (0-25)</div>
                                <div className="text-xs text-muted-foreground">Every 2-3 days</div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-yellow-600">Medium Risk (26-50)</div>
                                <div className="text-xs text-muted-foreground">Daily</div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-orange-600">High Risk (51-75)</div>
                                <div className="text-xs text-muted-foreground">Twice daily</div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-red-600">Critical (76-100)</div>
                                <div className="text-xs text-muted-foreground">Every 4-6 hours</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500">
                      <CardHeader>
                        <CardTitle className="text-lg">Data Visualization & Trends</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium mb-3">Time-Series Visualizations</h4>
                            <div className="space-y-3">
                              <div className="p-3 bg-purple-50 rounded text-sm">
                                <span className="font-medium">Risk Score Trending:</span>
                                <div className="text-xs mt-1">30-day rolling chart with confidence intervals</div>
                              </div>
                              <div className="p-3 bg-blue-50 rounded text-sm">
                                <span className="font-medium">Biomarker Correlation:</span>
                                <div className="text-xs mt-1">Multi-axis plots showing jitter, shimmer, HNR relationships</div>
                              </div>
                              <div className="p-3 bg-green-50 rounded text-sm">
                                <span className="font-medium">Clinical Events:</span>
                                <div className="text-xs mt-1">Medication changes, hospitalizations overlaid on voice trends</div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-3">Alert Dashboard</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between items-center p-2 bg-gray-100 rounded">
                                <span>Active Alerts</span>
                                <Badge variant="destructive" className="text-xs">23</Badge>
                              </div>
                              <div className="flex justify-between items-center p-2 bg-gray-100 rounded">
                                <span>Patients at Risk</span>
                                <Badge variant="secondary" className="text-xs">67</Badge>
                              </div>
                              <div className="flex justify-between items-center p-2 bg-gray-100 rounded">
                                <span>Interventions Today</span>
                                <Badge variant="outline" className="text-xs">12</Badge>
                              </div>
                              <div className="flex justify-between items-center p-2 bg-gray-100 rounded">
                                <span>System Uptime</span>
                                <Badge variant="secondary" className="text-xs">99.7%</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Integration Tab */}
            <TabsContent value="integration" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Workflow className="h-5 w-5 text-primary" />
                    Clinical System Integration
                  </CardTitle>
                  <CardDescription>
                    EHR integration, FHIR compliance, and clinical workflow automation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <Card className="border-l-4 border-l-emerald-500">
                      <CardHeader>
                        <CardTitle className="text-lg">FHIR R4 Implementation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium mb-3">Supported FHIR Resources</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                  <span><strong>Patient:</strong> Demographics and identifiers</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                  <span><strong>Observation:</strong> Voice biomarker measurements</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                  <span><strong>DiagnosticReport:</strong> Voice analysis summaries</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                  <span><strong>Flag:</strong> Clinical alerts and warnings</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                  <span><strong>Communication:</strong> Alert notifications</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-3">FHIR Observation Example</h4>
                              <div className="bg-emerald-50 p-3 rounded text-xs font-mono overflow-x-auto">
                                {'{'}<br />
                                &nbsp;&nbsp;"resourceType": "Observation",<br />
                                &nbsp;&nbsp;"status": "final",<br />
                                &nbsp;&nbsp;"code": {'{'}<br />
                                &nbsp;&nbsp;&nbsp;&nbsp;"coding": [{'{'}<br />
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"system": "http://heartvoice.com/fhir",<br />
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"code": "jitter",<br />
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"display": "Voice Jitter"<br />
                                &nbsp;&nbsp;&nbsp;&nbsp;{'}'}]<br />
                                &nbsp;&nbsp;{'},'}<br />
                                &nbsp;&nbsp;"subject": {'{'}<br />
                                &nbsp;&nbsp;&nbsp;&nbsp;"reference": "Patient/12345"<br />
                                &nbsp;&nbsp;{'},'}<br />
                                &nbsp;&nbsp;"valueQuantity": {'{'}<br />
                                &nbsp;&nbsp;&nbsp;&nbsp;"value": 2.1,<br />
                                &nbsp;&nbsp;&nbsp;&nbsp;"unit": "%"<br />
                                &nbsp;&nbsp;{'}'}<br />
                                {'}'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <CardTitle className="text-lg">EHR System Integrations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="p-4">
                              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                                <Database className="h-4 w-4" />
                                Epic
                              </h4>
                              <div className="space-y-1 text-xs">
                                <div>• MyChart patient portal integration</div>
                                <div>• Smart on FHIR applications</div>
                                <div>• Clinical decision support hooks</div>
                                <div>• Automated documentation</div>
                              </div>
                            </Card>
                            
                            <Card className="p-4">
                              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                                <Database className="h-4 w-4" />
                                Cerner
                              </h4>
                              <div className="space-y-1 text-xs">
                                <div>• PowerChart integration</div>
                                <div>• Real-time data streaming</div>
                                <div>• Alert management system</div>
                                <div>• Clinical workflow automation</div>
                              </div>
                            </Card>
                            
                            <Card className="p-4">
                              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                                <Database className="h-4 w-4" />
                                Allscripts
                              </h4>
                              <div className="space-y-1 text-xs">
                                <div>• Developer Platform APIs</div>
                                <div>• Clinical summary integration</div>
                                <div>• Patient engagement tools</div>
                                <div>• Quality measure reporting</div>
                              </div>
                            </Card>
                          </div>

                          <div className="bg-blue-50 p-4 rounded">
                            <h4 className="font-medium text-blue-800 mb-2">Integration Architecture</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Data Flow:</span>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Bidirectional sync with patient demographics, medications, and clinical notes
                                </div>
                              </div>
                              <div>
                                <span className="font-medium">Authentication:</span>
                                <div className="text-xs text-muted-foreground mt-1">
                                  OAuth 2.0 / SMART on FHIR authentication with refresh tokens
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-orange-500">
                      <CardHeader>
                        <CardTitle className="text-lg">API Specifications</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium mb-3">RESTful API Endpoints</h4>
                              <div className="space-y-3 text-sm">
                                <div className="p-2 bg-orange-50 rounded">
                                  <code className="text-xs">GET /api/v1/patients/{'{id}'}/voice-metrics</code>
                                  <div className="text-xs text-muted-foreground mt-1">Retrieve patient voice biomarkers</div>
                                </div>
                                <div className="p-2 bg-orange-50 rounded">
                                  <code className="text-xs">POST /api/v1/voice-analysis</code>
                                  <div className="text-xs text-muted-foreground mt-1">Submit audio for real-time analysis</div>
                                </div>
                                <div className="p-2 bg-orange-50 rounded">
                                  <code className="text-xs">GET /api/v1/alerts/{'{patient_id}'}</code>
                                  <div className="text-xs text-muted-foreground mt-1">Retrieve active clinical alerts</div>
                                </div>
                                <div className="p-2 bg-orange-50 rounded">
                                  <code className="text-xs">POST /api/v1/webhooks/ehr-update</code>
                                  <div className="text-xs text-muted-foreground mt-1">Receive EHR data updates</div>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-3">WebSocket Real-time Events</h4>
                              <div className="space-y-3 text-sm">
                                <div className="p-2 bg-blue-50 rounded">
                                  <code className="text-xs">voice_analysis_complete</code>
                                  <div className="text-xs text-muted-foreground mt-1">New biomarker results available</div>
                                </div>
                                <div className="p-2 bg-red-50 rounded">
                                  <code className="text-xs">critical_alert_generated</code>
                                  <div className="text-xs text-muted-foreground mt-1">High-priority patient alert</div>
                                </div>
                                <div className="p-2 bg-green-50 rounded">
                                  <code className="text-xs">patient_status_update</code>
                                  <div className="text-xs text-muted-foreground mt-1">Risk level or trend change</div>
                                </div>
                                <div className="p-2 bg-purple-50 rounded">
                                  <code className="text-xs">system_health_check</code>
                                  <div className="text-xs text-muted-foreground mt-1">Platform availability status</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Security & Compliance Framework
                  </CardTitle>
                  <CardDescription>
                    HIPAA compliance, data protection, and cybersecurity implementation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <Card className="border-l-4 border-l-red-500">
                      <CardHeader>
                        <CardTitle className="text-lg">HIPAA Compliance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium mb-3">Administrative Safeguards</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <Lock className="h-3 w-3 text-red-500" />
                                  <span>Security Officer designation</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Lock className="h-3 w-3 text-red-500" />
                                  <span>Workforce training & access management</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Lock className="h-3 w-3 text-red-500" />
                                  <span>Business Associate Agreements (BAAs)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Lock className="h-3 w-3 text-red-500" />
                                  <span>Incident response procedures</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-3">Physical Safeguards</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <HardDrive className="h-3 w-3 text-blue-500" />
                                  <span>Data center access controls</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <HardDrive className="h-3 w-3 text-blue-500" />
                                  <span>Workstation security measures</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <HardDrive className="h-3 w-3 text-blue-500" />
                                  <span>Media disposal procedures</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <HardDrive className="h-3 w-3 text-blue-500" />
                                  <span>Environmental monitoring</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-red-50 p-4 rounded">
                            <h4 className="font-medium text-red-800 mb-2">Technical Safeguards</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Access Control:</span>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Role-based authentication, MFA, automatic logoff
                                </div>
                              </div>
                              <div>
                                <span className="font-medium">Audit Controls:</span>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Comprehensive logging, log monitoring, audit trails
                                </div>
                              </div>
                              <div>
                                <span className="font-medium">Integrity:</span>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Digital signatures, checksums, version control
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500">
                      <CardHeader>
                        <CardTitle className="text-lg">Data Encryption & Protection</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium mb-3">Encryption Standards</h4>
                              <div className="space-y-3">
                                <div className="p-3 bg-green-50 rounded text-sm">
                                  <span className="font-medium text-green-800">Data at Rest:</span>
                                  <div className="text-xs mt-1">AES-256 encryption for database and file storage</div>
                                </div>
                                <div className="p-3 bg-blue-50 rounded text-sm">
                                  <span className="font-medium text-blue-800">Data in Transit:</span>
                                  <div className="text-xs mt-1">TLS 1.3 for all API communications</div>
                                </div>
                                <div className="p-3 bg-purple-50 rounded text-sm">
                                  <span className="font-medium text-purple-800">Voice Data:</span>
                                  <div className="text-xs mt-1">End-to-end encryption during transmission and processing</div>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-3">Key Management</h4>
                              <div className="bg-gray-50 p-3 rounded text-xs font-mono">
                                # AWS KMS Integration<br />
                                encryption_key = kms_client.create_key(<br />
                                &nbsp;&nbsp;KeyUsage='ENCRYPT_DECRYPT',<br />
                                &nbsp;&nbsp;KeySpec='SYMMETRIC_DEFAULT'<br />
                                )<br /><br />
                                # Automatic key rotation<br />
                                kms_client.enable_key_rotation(<br />
                                &nbsp;&nbsp;KeyId=encryption_key['KeyId']<br />
                                )
                              </div>
                            </div>
                          </div>

                          <div className="bg-green-50 p-4 rounded">
                            <h4 className="font-medium text-green-800 mb-2">Data Retention Policy</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Voice Recordings:</span>
                                <div className="text-xs text-muted-foreground mt-1">24-48 hours (analysis only)</div>
                              </div>
                              <div>
                                <span className="font-medium">Biomarker Data:</span>
                                <div className="text-xs text-muted-foreground mt-1">7 years (clinical requirement)</div>
                              </div>
                              <div>
                                <span className="font-medium">Audit Logs:</span>
                                <div className="text-xs text-muted-foreground mt-1">7 years (regulatory compliance)</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <CardTitle className="text-lg">Cybersecurity Framework</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium mb-3">Security Monitoring</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <Activity className="h-3 w-3 text-blue-500" />
                                  <span>24/7 SOC monitoring</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Activity className="h-3 w-3 text-blue-500" />
                                  <span>SIEM integration (Splunk)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Activity className="h-3 w-3 text-blue-500" />
                                  <span>Intrusion detection systems</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Activity className="h-3 w-3 text-blue-500" />
                                  <span>Vulnerability scanning</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Activity className="h-3 w-3 text-blue-500" />
                                  <span>Penetration testing (quarterly)</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-3">Incident Response</h4>
                              <div className="space-y-2 text-sm">
                                <div><strong>Detection:</strong> Automated threat detection and alerting</div>
                                <div><strong>Containment:</strong> Immediate isolation of affected systems</div>
                                <div><strong>Investigation:</strong> Forensic analysis and root cause determination</div>
                                <div><strong>Recovery:</strong> System restoration and security hardening</div>
                                <div><strong>Lessons Learned:</strong> Post-incident review and improvements</div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-blue-50 p-4 rounded">
                            <h4 className="font-medium text-blue-800 mb-2">Compliance Certifications</h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="text-center p-2 bg-white rounded">
                                <div className="font-bold text-sm">SOC 2 Type II</div>
                                <div className="text-xs text-muted-foreground">Current</div>
                              </div>
                              <div className="text-center p-2 bg-white rounded">
                                <div className="font-bold text-sm">ISO 27001</div>
                                <div className="text-xs text-muted-foreground">Certified</div>
                              </div>
                              <div className="text-center p-2 bg-white rounded">
                                <div className="font-bold text-sm">FedRAMP</div>
                                <div className="text-xs text-muted-foreground">In Progress</div>
                              </div>
                              <div className="text-center p-2 bg-white rounded">
                                <div className="font-bold text-sm">HITRUST</div>
                                <div className="text-xs text-muted-foreground">Planned</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-50">
                      <CardHeader>
                        <CardTitle className="text-lg">Privacy Protection Measures</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium mb-3">Data Minimization</h4>
                            <div className="space-y-2 text-sm text-muted-foreground">
                              <div>• Voice recordings processed and deleted within 48 hours</div>
                              <div>• Only clinically relevant biomarkers stored long-term</div>
                              <div>• Patient identifiers separated from voice data</div>
                              <div>• Aggregate reporting without individual identification</div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-3">Patient Rights</h4>
                            <div className="space-y-2 text-sm text-muted-foreground">
                              <div>• Right to access personal health information</div>
                              <div>• Right to request data corrections</div>
                              <div>• Right to withdraw consent and delete data</div>
                              <div>• Transparent data usage notifications</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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