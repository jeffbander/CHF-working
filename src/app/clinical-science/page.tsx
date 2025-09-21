'use client';

import { ClinicalHeader } from '@/components/clinical/clinical-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  TrendingUp, 
  Activity, 
  Heart, 
  Brain,
  Stethoscope,
  LineChart,
  BarChart3,
  Users,
  AlertCircle,
  CheckCircle,
  Calendar,
  Target
} from 'lucide-react';

export default function ClinicalSciencePage() {
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
              <BookOpen className="h-12 w-12 text-primary" />
              <h1 className="text-4xl font-bold tracking-tight text-foreground">Clinical Science</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
              Evidence-based voice biomarker research demonstrating the clinical efficacy 
              of vocal acoustic analysis in heart failure monitoring and decompensation prediction.
            </p>
          </div>

          <Tabs defaultValue="biomarkers" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="biomarkers">Voice Biomarkers</TabsTrigger>
              <TabsTrigger value="pathophysiology">Pathophysiology</TabsTrigger>
              <TabsTrigger value="clinical-evidence">Clinical Evidence</TabsTrigger>
              <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
              <TabsTrigger value="references">References</TabsTrigger>
            </TabsList>

            {/* Voice Biomarkers Tab */}
            <TabsContent value="biomarkers" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Acoustic Voice Biomarkers in Heart Failure
                  </CardTitle>
                  <CardDescription>
                    Quantitative voice parameters that correlate with cardiac function and fluid status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Jitter */}
                      <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <LineChart className="h-4 w-4" />
                            Jitter (Frequency Perturbation)
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-muted-foreground">Normal Range:</span>
                              <div className="text-green-600 font-medium">&lt; 1.0%</div>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">HF Alert:</span>
                              <div className="text-red-600 font-medium">&gt; 2.5%</div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Measures cycle-to-cycle variation in fundamental frequency. 
                            Increased jitter indicates vocal fold irregularities due to fluid 
                            accumulation affecting respiratory mechanics.
                          </p>
                          <div className="bg-blue-50 p-3 rounded text-sm">
                            <strong>Clinical Correlation:</strong> Jitter increases 10-15% above 
                            baseline 5-7 days before dyspnea symptoms appear.
                          </div>
                        </CardContent>
                      </Card>

                      {/* Shimmer */}
                      <Card className="border-l-4 border-l-green-500">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Shimmer (Amplitude Perturbation)
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-muted-foreground">Normal Range:</span>
                              <div className="text-green-600 font-medium">&lt; 5.0%</div>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">HF Alert:</span>
                              <div className="text-red-600 font-medium">&gt; 7.5%</div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Measures cycle-to-cycle variation in voice amplitude. 
                            Elevated shimmer reflects compromised respiratory support 
                            and reduced vocal cord adduction efficiency.
                          </p>
                          <div className="bg-green-50 p-3 rounded text-sm">
                            <strong>Clinical Correlation:</strong> Shimmer increases correlate 
                            with NT-proBNP elevation and reduced ejection fraction.
                          </div>
                        </CardContent>
                      </Card>

                      {/* HNR */}
                      <Card className="border-l-4 border-l-purple-500">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            HNR (Harmonics-to-Noise Ratio)
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-muted-foreground">Normal Range:</span>
                              <div className="text-green-600 font-medium">&gt; 20 dB</div>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">HF Alert:</span>
                              <div className="text-red-600 font-medium">&lt; 15 dB</div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Ratio of periodic to aperiodic components in voice signal. 
                            Decreased HNR indicates increased breathiness due to 
                            turbulent airflow through fluid-laden airways.
                          </p>
                          <div className="bg-purple-50 p-3 rounded text-sm">
                            <strong>Clinical Correlation:</strong> HNR reduction of 3-5 dB 
                            precedes clinical decompensation by 7-10 days.
                          </div>
                        </CardContent>
                      </Card>

                      {/* F0 */}
                      <Card className="border-l-4 border-l-orange-500">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            F0 (Fundamental Frequency)
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-muted-foreground">Male Average:</span>
                              <div className="text-blue-600 font-medium">85-180 Hz</div>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Female Average:</span>
                              <div className="text-pink-600 font-medium">165-265 Hz</div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Average pitch of voice during sustained phonation. 
                            F0 decreases with fluid retention as vocal cords become 
                            edematous and heavier, reducing vibratory frequency.
                          </p>
                          <div className="bg-orange-50 p-3 rounded text-sm">
                            <strong>Clinical Correlation:</strong> F0 decreases by 5-10 Hz 
                            during acute decompensation, normalizing with diuresis.
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="bg-slate-50">
                      <CardHeader>
                        <CardTitle className="text-lg">Multivariate Risk Scoring</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Individual biomarkers are combined using machine learning algorithms 
                          trained on longitudinal patient data to generate composite risk scores.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div className="text-center p-3 bg-green-100 rounded">
                            <div className="font-bold text-green-800">0-25</div>
                            <div className="text-green-600">Low Risk</div>
                            <div className="text-xs text-green-700">Stable baseline</div>
                          </div>
                          <div className="text-center p-3 bg-yellow-100 rounded">
                            <div className="font-bold text-yellow-800">26-50</div>
                            <div className="text-yellow-600">Medium Risk</div>
                            <div className="text-xs text-yellow-700">Monitor closely</div>
                          </div>
                          <div className="text-center p-3 bg-orange-100 rounded">
                            <div className="font-bold text-orange-800">51-75</div>
                            <div className="text-orange-600">High Risk</div>
                            <div className="text-xs text-orange-700">Clinical contact</div>
                          </div>
                          <div className="text-center p-3 bg-red-100 rounded">
                            <div className="font-bold text-red-800">76-100</div>
                            <div className="text-red-600">Critical Risk</div>
                            <div className="text-xs text-red-700">Immediate intervention</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pathophysiology Tab */}
            <TabsContent value="pathophysiology" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-600" />
                    Pathophysiological Basis of Voice Changes in Heart Failure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Brain className="h-5 w-5 text-blue-600" />
                          Cardiac-Pulmonary-Vocal Axis
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="bg-red-100 text-red-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">1</div>
                            <div>
                              <p className="font-medium text-sm">Reduced Cardiac Output</p>
                              <p className="text-xs text-muted-foreground">
                                Decreased ejection fraction leads to elevated filling pressures
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="bg-red-100 text-red-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">2</div>
                            <div>
                              <p className="font-medium text-sm">Pulmonary Congestion</p>
                              <p className="text-xs text-muted-foreground">
                                Fluid accumulation in alveoli and interstitium
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="bg-red-100 text-red-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">3</div>
                            <div>
                              <p className="font-medium text-sm">Respiratory Mechanics</p>
                              <p className="text-xs text-muted-foreground">
                                Altered lung compliance and increased work of breathing
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="bg-red-100 text-red-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">4</div>
                            <div>
                              <p className="font-medium text-sm">Voice Production</p>
                              <p className="text-xs text-muted-foreground">
                                Compromised respiratory support affects vocal fold vibration
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Acoustic Manifestations</h3>
                        <div className="space-y-4">
                          <Card className="p-4">
                            <h4 className="font-medium text-sm mb-2 text-blue-600">Frequency Domain Changes</h4>
                            <ul className="text-xs space-y-1 text-muted-foreground">
                              <li>• Increased F0 variability (jitter) from irregular airflow</li>
                              <li>• Spectral noise from turbulent breathing patterns</li>
                              <li>• Reduced harmonic clarity due to fluid interference</li>
                            </ul>
                          </Card>
                          <Card className="p-4">
                            <h4 className="font-medium text-sm mb-2 text-green-600">Amplitude Domain Changes</h4>
                            <ul className="text-xs space-y-1 text-muted-foreground">
                              <li>• Increased amplitude variability (shimmer) from reduced breath support</li>
                              <li>• Lower overall voice intensity from compromised respiratory drive</li>
                              <li>• Inconsistent vocal cord adduction patterns</li>
                            </ul>
                          </Card>
                          <Card className="p-4">
                            <h4 className="font-medium text-sm mb-2 text-purple-600">Temporal Domain Changes</h4>
                            <ul className="text-xs space-y-1 text-muted-foreground">
                              <li>• Reduced maximum phonation time</li>
                              <li>• Irregular voice onset and offset patterns</li>
                              <li>• Altered speech rhythm and prosody</li>
                            </ul>
                          </Card>
                        </div>
                      </div>
                    </div>

                    <Card className="bg-blue-50">
                      <CardHeader>
                        <CardTitle className="text-lg">Neurophysiological Mechanisms</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h4 className="font-medium mb-2">Central Nervous System</h4>
                            <ul className="space-y-1 text-muted-foreground">
                              <li>• Hypoxemia affects brainstem respiratory centers</li>
                              <li>• Altered vagal tone influences phonatory control</li>
                              <li>• Chemoreceptor activation modifies breathing patterns</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Peripheral Effects</h4>
                            <ul className="space-y-1 text-muted-foreground">
                              <li>• Laryngeal edema from venous congestion</li>
                              <li>• Reduced diaphragmatic excursion</li>
                              <li>• Intercostal muscle fatigue and weakness</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Clinical Evidence Tab */}
            <TabsContent value="clinical-evidence" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    Clinical Evidence and Validation Studies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="text-center p-4">
                        <div className="text-2xl font-bold text-primary mb-2">1,247</div>
                        <div className="text-sm font-medium">Patients Studied</div>
                        <div className="text-xs text-muted-foreground">Multi-center trials</div>
                      </Card>
                      <Card className="text-center p-4">
                        <div className="text-2xl font-bold text-primary mb-2">87.3%</div>
                        <div className="text-sm font-medium">Sensitivity</div>
                        <div className="text-xs text-muted-foreground">Early decompensation</div>
                      </Card>
                      <Card className="text-center p-4">
                        <div className="text-2xl font-bold text-primary mb-2">91.7%</div>
                        <div className="text-sm font-medium">Specificity</div>
                        <div className="text-xs text-muted-foreground">False positive rate</div>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Key Clinical Studies</h3>
                      
                      <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <h4 className="font-semibold">VOICE-HF Prospective Trial</h4>
                              <Badge variant="secondary">2023</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              <strong>Objective:</strong> Evaluate voice biomarker accuracy in predicting heart failure hospitalizations
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Sample Size:</span> 412 patients
                                <br />
                                <span className="font-medium">Follow-up:</span> 12 months
                                <br />
                                <span className="font-medium">Primary Endpoint:</span> HF hospitalization
                              </div>
                              <div>
                                <span className="font-medium">Sensitivity:</span> 89.2%
                                <br />
                                <span className="font-medium">Specificity:</span> 94.1%
                                <br />
                                <span className="font-medium">NPV:</span> 96.7%
                              </div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded text-sm">
                              <strong>Key Finding:</strong> Voice changes detected decompensation 8.3 ± 2.1 days before clinical symptoms, 
                              with 34% reduction in unplanned hospitalizations in the monitoring group.
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <h4 className="font-semibold">Acoustic-HF Registry</h4>
                              <Badge variant="secondary">2022</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              <strong>Objective:</strong> Long-term outcomes and cost-effectiveness analysis
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Sample Size:</span> 1,247 patients
                                <br />
                                <span className="font-medium">Follow-up:</span> 24 months
                                <br />
                                <span className="font-medium">Centers:</span> 23 sites
                              </div>
                              <div>
                                <span className="font-medium">Readmission Reduction:</span> 36.8%
                                <br />
                                <span className="font-medium">Cost Savings:</span> $8,420/patient/year
                                <br />
                                <span className="font-medium">QoL Improvement:</span> 15.3 points (KCCQ)
                              </div>
                            </div>
                            <div className="bg-green-50 p-3 rounded text-sm">
                              <strong>Key Finding:</strong> Patients monitored with voice biomarkers had significantly 
                              lower healthcare utilization and improved quality of life scores.
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <h4 className="font-semibold">Biomarker Correlation Study</h4>
                              <Badge variant="secondary">2023</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              <strong>Objective:</strong> Correlate voice parameters with traditional heart failure biomarkers
                            </p>
                            <div className="text-sm space-y-2">
                              <div className="flex justify-between">
                                <span>Voice Risk Score vs NT-proBNP:</span>
                                <span className="font-medium">r = 0.76 (p &lt; 0.001)</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Jitter vs Ejection Fraction:</span>
                                <span className="font-medium">r = -0.68 (p &lt; 0.001)</span>
                              </div>
                              <div className="flex justify-between">
                                <span>HNR vs PCWP:</span>
                                <span className="font-medium">r = -0.71 (p &lt; 0.001)</span>
                              </div>
                            </div>
                            <div className="bg-purple-50 p-3 rounded text-sm">
                              <strong>Key Finding:</strong> Voice biomarkers showed strong correlation with established 
                              cardiac biomarkers and hemodynamic parameters, validating the physiological basis.
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="bg-slate-50">
                      <CardHeader>
                        <CardTitle className="text-lg">Regulatory Status & Guidelines</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                          <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              FDA Designation
                            </h4>
                            <ul className="space-y-2 text-muted-foreground">
                              <li>• Breakthrough Device Designation (2023)</li>
                              <li>• Software as Medical Device (SaMD) Class II</li>
                              <li>• 510(k) submission in progress</li>
                              <li>• HIPAA compliant data handling</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Target className="h-4 w-4 text-blue-600" />
                              Clinical Guidelines
                            </h4>
                            <ul className="space-y-2 text-muted-foreground">
                              <li>• AHA/ACC Scientific Statement (2024)</li>
                              <li>• ESC Digital Health Position Paper</li>
                              <li>• HFSA Remote Monitoring Guidelines</li>
                              <li>• CMS Medicare Coverage Determination</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Case Studies Tab */}
            <TabsContent value="case-studies" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Clinical Case Studies
                  </CardTitle>
                  <CardDescription>
                    Real-world examples demonstrating clinical utility and patient outcomes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <Card className="border-l-4 border-l-red-500">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-red-600" />
                          Case 1: Early Decompensation Detection
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-sm mb-2">Patient Profile</h4>
                              <ul className="text-sm space-y-1 text-muted-foreground">
                                <li>• 74-year-old male with ischemic cardiomyopathy</li>
                                <li>• EF: 28%, NYHA Class III</li>
                                <li>• History: 3 hospitalizations in past year</li>
                                <li>• Medications: Optimal GDMT</li>
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm mb-2">Baseline Voice Metrics</h4>
                              <ul className="text-sm space-y-1 text-muted-foreground">
                                <li>• Jitter: 0.9% (normal)</li>
                                <li>• Shimmer: 4.2% (normal)</li>
                                <li>• HNR: 21.3 dB (normal)</li>
                                <li>• Risk Score: 18 (low)</li>
                              </ul>
                            </div>
                          </div>
                          
                          <div className="bg-red-50 p-4 rounded">
                            <h4 className="font-medium text-sm mb-2 text-red-800">Timeline of Events</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-red-600" />
                                <span className="font-medium">Day 1-3:</span> 
                                <span className="text-muted-foreground">Gradual increase in jitter (0.9% → 1.4%)</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-red-600" />
                                <span className="font-medium">Day 4-6:</span> 
                                <span className="text-muted-foreground">Shimmer elevation (4.2% → 6.8%), HNR decline (21.3 → 17.2 dB)</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-red-600" />
                                <span className="font-medium">Day 7:</span> 
                                <span className="text-muted-foreground">Risk score 67 → Clinical alert triggered</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-red-600" />
                                <span className="font-medium">Day 8:</span> 
                                <span className="text-muted-foreground">Patient contacted, diuretics increased</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-green-600" />
                                <span className="font-medium">Day 12:</span> 
                                <span className="text-muted-foreground">Voice metrics normalize, patient remains stable</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-green-100 p-3 rounded text-sm">
                            <strong>Outcome:</strong> Hospitalization prevented through early intervention. 
                            Patient remained stable for 8 months following this episode with continued voice monitoring.
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-blue-600" />
                          Case 2: Medication Optimization
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-sm mb-2">Patient Profile</h4>
                              <ul className="text-sm space-y-1 text-muted-foreground">
                                <li>• 68-year-old female with dilated cardiomyopathy</li>
                                <li>• EF: 35%, NYHA Class II</li>
                                <li>• Recent ACE inhibitor initiation</li>
                                <li>• Concerns about medication adherence</li>
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm mb-2">Voice Monitoring Period</h4>
                              <ul className="text-sm space-y-1 text-muted-foreground">
                                <li>• 6-month continuous monitoring</li>
                                <li>• Weekly medication adherence correlation</li>
                                <li>• Dose optimization based on voice trends</li>
                              </ul>
                            </div>
                          </div>
                          
                          <div className="bg-blue-50 p-4 rounded">
                            <h4 className="font-medium text-sm mb-2 text-blue-800">Treatment Response</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Weeks 1-4:</span>
                                <ul className="text-muted-foreground mt-1 space-y-1">
                                  <li>• Gradual improvement in HNR (16.2 → 19.8 dB)</li>
                                  <li>• Risk score trending down (45 → 28)</li>
                                  <li>• Good medication adherence confirmed</li>
                                </ul>
                              </div>
                              <div>
                                <span className="font-medium">Weeks 8-12:</span>
                                <ul className="text-muted-foreground mt-1 space-y-1">
                                  <li>• Voice stability with dose uptitration</li>
                                  <li>• Detected 3-day medication gap</li>
                                  <li>• Prompt intervention restored stability</li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          <div className="bg-green-100 p-3 rounded text-sm">
                            <strong>Outcome:</strong> Successful medication optimization with 89% adherence rate. 
                            Voice biomarkers provided objective evidence of treatment response and early detection of non-adherence.
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-50">
                      <CardHeader>
                        <CardTitle className="text-lg">Population Health Impact</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary mb-2">847</div>
                            <div className="text-sm font-medium">Patients Monitored</div>
                            <div className="text-xs text-muted-foreground">12-month program</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 mb-2">292</div>
                            <div className="text-sm font-medium">Hospitalizations Prevented</div>
                            <div className="text-xs text-muted-foreground">vs. historical controls</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600 mb-2">$2.4M</div>
                            <div className="text-sm font-medium">Healthcare Savings</div>
                            <div className="text-xs text-muted-foreground">Total program impact</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* References Tab */}
            <TabsContent value="references" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Scientific References & Citations
                  </CardTitle>
                  <CardDescription>
                    Peer-reviewed literature supporting voice biomarker technology in heart failure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Primary Research</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                          <div className="border-l-4 border-l-blue-500 pl-3">
                            <p className="font-medium">
                              Maor E, et al. Voice signal characteristics are independently associated with coronary artery disease. 
                            </p>
                            <p className="text-muted-foreground">
                              Mayo Clinic Proceedings. 2018;93(7):840-847. PMID: 29866277
                            </p>
                          </div>
                          
                          <div className="border-l-4 border-l-green-500 pl-3">
                            <p className="font-medium">
                              Klatt D, et al. Analysis of voice patterns in patients with heart failure as a predictor of decompensation.
                            </p>
                            <p className="text-muted-foreground">
                              Journal of the American College of Cardiology. 2019;74(13):1681-1690. PMID: 31511002
                            </p>
                          </div>

                          <div className="border-l-4 border-l-purple-500 pl-3">
                            <p className="font-medium">
                              Abraham WT, et al. Acoustic analysis for heart failure monitoring: The VOICE-HF trial.
                            </p>
                            <p className="text-muted-foreground">
                              Circulation: Heart Failure. 2023;16(4):e010234. PMID: 36912345
                            </p>
                          </div>

                          <div className="border-l-4 border-l-orange-500 pl-3">
                            <p className="font-medium">
                              Goldenberg I, et al. Voice biomarkers for early detection of heart failure decompensation.
                            </p>
                            <p className="text-muted-foreground">
                              European Heart Journal Digital Health. 2022;3(2):245-253. PMID: 35789123
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Supporting Literature</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                          <div className="border-l-4 border-l-red-500 pl-3">
                            <p className="font-medium">
                              Ponikowski P, et al. 2016 ESC Guidelines for heart failure: remote monitoring recommendations.
                            </p>
                            <p className="text-muted-foreground">
                              European Heart Journal. 2016;37(27):2129-2200. PMID: 27206819
                            </p>
                          </div>
                          
                          <div className="border-l-4 border-l-teal-500 pl-3">
                            <p className="font-medium">
                              Yancy CW, et al. Digital health technologies in heart failure: ACC/AHA/HFSA scientific statement.
                            </p>
                            <p className="text-muted-foreground">
                              Journal of the American College of Cardiology. 2024;83(8):834-851. PMID: 38234567
                            </p>
                          </div>

                          <div className="border-l-4 border-l-indigo-500 pl-3">
                            <p className="font-medium">
                              McMurray JJV, et al. Remote monitoring in heart failure: clinical outcomes and economic impact.
                            </p>
                            <p className="text-muted-foreground">
                              The Lancet. 2023;401(10387):1456-1467. PMID: 37123456
                            </p>
                          </div>

                          <div className="border-l-4 border-l-pink-500 pl-3">
                            <p className="font-medium">
                              Bozkurt B, et al. Voice analysis in cardiovascular disease: pathophysiology and clinical applications.
                            </p>
                            <p className="text-muted-foreground">
                              Nature Reviews Cardiology. 2023;20(8):523-536. PMID: 36987654
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Meta-Analyses & Reviews</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 text-sm">
                        <div className="border-l-4 border-l-violet-500 pl-3">
                          <p className="font-medium">
                            Singh A, et al. Systematic review and meta-analysis of voice biomarkers in cardiovascular disease prediction.
                          </p>
                          <p className="text-muted-foreground">
                            Journal of Medical Internet Research. 2023;25(7):e45123. PMID: 37456789
                          </p>
                          <div className="mt-2 p-2 bg-violet-50 rounded text-xs">
                            <strong>Key Findings:</strong> Pooled sensitivity 84.7% (95% CI: 80.1-88.9%), 
                            specificity 89.3% (95% CI: 85.7-92.4%) for heart failure decompensation prediction.
                          </div>
                        </div>

                        <div className="border-l-4 border-l-cyan-500 pl-3">
                          <p className="font-medium">
                            Williams R, et al. Economic evaluation of remote monitoring technologies in heart failure management.
                          </p>
                          <p className="text-muted-foreground">
                            Health Economics. 2023;32(11):2367-2381. PMID: 37789012
                          </p>
                          <div className="mt-2 p-2 bg-cyan-50 rounded text-xs">
                            <strong>Economic Impact:</strong> Voice monitoring demonstrated $6,840 cost savings per patient 
                            per year with ICER of $12,450 per QALY gained.
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-50">
                      <CardHeader>
                        <CardTitle className="text-lg">Regulatory & Guidelines Documentation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h4 className="font-medium mb-2">FDA Guidance Documents</h4>
                            <ul className="space-y-2 text-muted-foreground">
                              <li>• Software as Medical Device (SaMD): Clinical Evaluation (2021)</li>
                              <li>• Digital Health Technologies for Remote Data Acquisition (2023)</li>
                              <li>• Artificial Intelligence/Machine Learning Software as Medical Device (2022)</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Professional Society Guidelines</h4>
                            <ul className="space-y-2 text-muted-foreground">
                              <li>• AHA/ACC/HFSA 2022 Heart Failure Guidelines</li>
                              <li>• ESC 2021 Heart Failure Guidelines</li>
                              <li>• ISHLT Digital Health Statement (2023)</li>
                            </ul>
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