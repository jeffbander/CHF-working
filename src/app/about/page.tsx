'use client';

import { ClinicalHeader } from '@/components/clinical/clinical-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Phone, 
  Activity, 
  Shield, 
  Clock, 
  Users, 
  CheckCircle,
  ArrowRight,
  Stethoscope,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export default function AboutPage() {
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
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">HV</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">HeartVoice Monitor</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Revolutionary voice biomarker technology that detects heart failure decompensation 
              7-10 days before symptoms appear, enabling proactive clinical intervention.
            </p>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="how-it-works">How It Works</TabsTrigger>
              <TabsTrigger value="benefits">Benefits</TabsTrigger>
              <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-600" />
                    What is HeartVoice Monitor?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    HeartVoice Monitor is a clinical-grade voice biomarker platform that uses advanced acoustic 
                    analysis to detect early signs of heart failure decompensation. By analyzing subtle changes 
                    in voice patterns that occur when fluid accumulates in the lungs, our system provides 
                    clinicians with early warning signals to intervene before hospitalization becomes necessary.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-4 border rounded-lg">
                      <Phone className="h-8 w-8 text-primary mx-auto mb-2" />
                      <h3 className="font-semibold text-sm">Daily Monitoring</h3>
                      <p className="text-xs text-muted-foreground">Automated voice calls</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Activity className="h-8 w-8 text-primary mx-auto mb-2" />
                      <h3 className="font-semibold text-sm">Voice Analysis</h3>
                      <p className="text-xs text-muted-foreground">AI-powered biomarkers</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <AlertTriangle className="h-8 w-8 text-primary mx-auto mb-2" />
                      <h3 className="font-semibold text-sm">Early Alerts</h3>
                      <p className="text-xs text-muted-foreground">7-10 day prediction</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Key Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Early Detection</span>
                        <Badge variant="secondary">7-10 days</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Readmission Reduction</span>
                        <Badge variant="secondary">30-40%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Clinical Accuracy</span>
                        <Badge variant="secondary">85%+</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Patient Compliance</span>
                        <Badge variant="secondary">90%+</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Clinical Impact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">Prevents emergency hospitalizations through early intervention</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">Improves patient quality of life with proactive care</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">Reduces healthcare costs by avoiding costly readmissions</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">Enables remote monitoring for elderly and mobility-impaired patients</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* How It Works Tab */}
            <TabsContent value="how-it-works" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>The Science Behind Voice Biomarkers</CardTitle>
                  <CardDescription>
                    Understanding how voice changes reflect heart failure progression
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Heart className="h-4 w-4 text-red-600" />
                          Heart Failure Process
                        </h3>
                        <ol className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                            Heart pumps less effectively
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                            Fluid backs up into lungs
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                            Pulmonary edema develops
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">4</span>
                            Voice characteristics change
                          </li>
                        </ol>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Activity className="h-4 w-4 text-blue-600" />
                          Voice Analysis Process
                        </h3>
                        <ol className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                            Daily 3-minute phone call
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                            Voice recording analysis
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                            Biomarker extraction
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">4</span>
                            Risk score calculation
                          </li>
                        </ol>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Key Voice Biomarkers</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-primary">Jitter:</span> Pitch variation (normal &lt;1%, alert &gt;2%)
                        </div>
                        <div>
                          <span className="font-medium text-primary">Shimmer:</span> Volume variation (normal &lt;5%, alert &gt;7%)
                        </div>
                        <div>
                          <span className="font-medium text-primary">HNR:</span> Voice clarity (normal &gt;20dB, alert &lt;15dB)
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Benefits Tab */}
            <TabsContent value="benefits" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-primary" />
                      For Clinicians
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">Proactive Patient Management</p>
                          <p className="text-xs text-muted-foreground">Identify decompensation before symptoms appear</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">Efficient Monitoring</p>
                          <p className="text-xs text-muted-foreground">Automated daily assessments reduce manual workload</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Shield className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">Risk Stratification</p>
                          <p className="text-xs text-muted-foreground">Objective data to prioritize patient care</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Activity className="h-4 w-4 text-orange-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">Clinical Decision Support</p>
                          <p className="text-xs text-muted-foreground">Data-driven insights for treatment adjustments</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      For Patients
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Phone className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">Convenient Monitoring</p>
                          <p className="text-xs text-muted-foreground">Simple 3-minute phone calls from home</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Heart className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">Better Health Outcomes</p>
                          <p className="text-xs text-muted-foreground">Early intervention prevents hospitalizations</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Shield className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">Peace of Mind</p>
                          <p className="text-xs text-muted-foreground">Continuous monitoring provides reassurance</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">Improved Quality of Life</p>
                          <p className="text-xs text-muted-foreground">Avoid emergency situations and maintain independence</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Healthcare System Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">30-40%</div>
                      <div className="text-sm text-muted-foreground">Reduction in readmissions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">$8,000+</div>
                      <div className="text-sm text-muted-foreground">Average cost savings per patient</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">85%+</div>
                      <div className="text-sm text-muted-foreground">Clinical accuracy in prediction</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Getting Started Tab */}
            <TabsContent value="getting-started" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Implementation Roadmap</CardTitle>
                  <CardDescription>
                    Step-by-step guide to deploying HeartVoice Monitor in your practice
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                      <div>
                        <h3 className="font-semibold mb-2">Patient Enrollment</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Identify eligible heart failure patients and obtain consent for voice monitoring.
                        </p>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <p>• NYHA Class II-IV heart failure patients</p>
                          <p>• Recent hospitalization or high readmission risk</p>
                          <p>• Telephone access and verbal communication ability</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                      <div>
                        <h3 className="font-semibold mb-2">Baseline Collection</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Establish individual voice baselines during stable clinical periods.
                        </p>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <p>• 5-7 days of initial voice recordings</p>
                          <p>• Clinical assessment to confirm stability</p>
                          <p>• Medication adherence verification</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                      <div>
                        <h3 className="font-semibold mb-2">Daily Monitoring</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Automated daily calls begin with personalized assessment protocols.
                        </p>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <p>• Scheduled at patient&apos;s preferred time</p>
                          <p>• 3-minute structured voice assessment</p>
                          <p>• Real-time biomarker analysis</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                      <div>
                        <h3 className="font-semibold mb-2">Clinical Integration</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Alerts and trends integrate with existing clinical workflows.
                        </p>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <p>• Dashboard integration with EHR systems</p>
                          <p>• Automated clinical alerts for risk changes</p>
                          <p>• Comprehensive reporting and analytics</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Patient Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Heart failure diagnosis (NYHA II-IV)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Telephone access (landline or mobile)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Able to speak clearly for 3 minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Informed consent for monitoring</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Stable clinical condition for baseline</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Support Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-primary" />
                        <span className="text-sm">24/7 technical support</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-primary" />
                        <span className="text-sm">Clinical training programs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-primary" />
                        <span className="text-sm">Patient education materials</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-primary" />
                        <span className="text-sm">EHR integration assistance</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-primary" />
                        <span className="text-sm">Ongoing clinical consultation</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}