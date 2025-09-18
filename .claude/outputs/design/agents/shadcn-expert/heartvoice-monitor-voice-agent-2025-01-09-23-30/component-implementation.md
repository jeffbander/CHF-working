# HeartVoice Monitor Voice Agent Component Implementation

**Project**: HeartVoice Monitor Voice Agent Upgrade  
**Date**: 2025-01-09  
**Version**: 1.0  
**Implementation**: shadcn/ui + Tailwind CSS Healthcare Components

## Healthcare Design System Specifications

### Color Palette (WCAG AA Compliant)

```css
/* Primary Healthcare Colors */
:root {
  /* Calming Teal - Primary Brand */
  --primary-teal: #0f766e;           /* 4.5:1 contrast on white */
  --primary-teal-light: #14b8a6;    /* Hover states */
  --primary-teal-dark: #0d5b52;     /* Focus states */
  
  /* Clinical White & Backgrounds */
  --clinical-white: #fafafa;         /* Main background */
  --surface-white: #ffffff;         /* Card surfaces */
  --surface-gray: #f8fafc;          /* Subtle backgrounds */
  
  /* Status Colors (Healthcare Appropriate) */
  --success-green: #16a34a;         /* Normal values, success states */
  --warning-amber: #d97706;         /* Elevated values, caution */
  --critical-red: #dc2626;          /* Emergency, critical alerts */
  --info-blue: #2563eb;            /* Information, links */
  
  /* Text & Neutral Colors */
  --text-primary: #0f172a;         /* Primary text (14.59:1 contrast) */
  --text-secondary: #475569;       /* Secondary text (7.07:1 contrast) */
  --text-muted: #64748b;           /* Muted text (4.78:1 contrast) */
  --border-light: #e2e8f0;         /* Light borders */
  --border-medium: #cbd5e1;        /* Medium borders */
}
```

### Typography Scale (Inter Font System)

```css
/* Font Family */
.font-clinical {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.font-mono-data {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;
}

/* Typography Classes */
.text-clinical-h1 { @apply text-3xl font-semibold leading-tight tracking-tight; }
.text-clinical-h2 { @apply text-2xl font-semibold leading-tight; }
.text-clinical-h3 { @apply text-xl font-medium leading-snug; }
.text-clinical-h4 { @apply text-lg font-medium leading-snug; }
.text-clinical-body { @apply text-sm leading-relaxed; }
.text-clinical-body-lg { @apply text-base leading-relaxed; }
.text-clinical-caption { @apply text-xs leading-normal font-medium; }
.text-clinical-label { @apply text-xs leading-normal font-medium uppercase tracking-wide; }
```

## Core Component Implementations

### 1. ConversationMonitor - Live Call Interface

```tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  AlertTriangle, 
  Activity,
  Brain,
  User,
  Bot
} from "lucide-react"

interface ConversationMonitorProps {
  patientName: string
  patientId: string
  callStatus: "listening" | "speaking" | "analyzing" | "completed"
  callDuration: string
  transcript: TranscriptMessage[]
  biomarkers: VoiceBiomarker[]
  onIntervention: () => void
  onEscalate: () => void
  onEndCall: () => void
  className?: string
}

interface TranscriptMessage {
  id: string
  timestamp: string
  speaker: "patient" | "ai"
  message: string
  isAlert?: boolean
  alertType?: "symptom" | "emergency" | "quality"
}

interface VoiceBiomarker {
  jitter: number
  shimmer: number
  hnr: number
  timestamp: string
}

const ConversationMonitor = React.forwardRef<
  HTMLDivElement,
  ConversationMonitorProps
>(({ 
  patientName, 
  patientId, 
  callStatus, 
  callDuration, 
  transcript, 
  biomarkers, 
  onIntervention, 
  onEscalate, 
  onEndCall, 
  className 
}, ref) => {
  const [isScrolledToBottom, setIsScrolledToBottom] = React.useState(true)
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)
  
  // Auto-scroll to bottom for new messages
  React.useEffect(() => {
    if (isScrolledToBottom && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [transcript, isScrolledToBottom])

  const getStatusIndicator = () => {
    const statusConfig = {
      listening: {
        icon: <Mic className="h-4 w-4" />,
        text: "Listening",
        className: "bg-blue-500 text-white animate-pulse"
      },
      speaking: {
        icon: <Activity className="h-4 w-4" />,
        text: "Speaking", 
        className: "bg-green-500 text-white animate-pulse"
      },
      analyzing: {
        icon: <Brain className="h-4 w-4" />,
        text: "Analyzing",
        className: "bg-amber-500 text-white animate-spin"
      },
      completed: {
        icon: <PhoneOff className="h-4 w-4" />,
        text: "Completed",
        className: "bg-gray-500 text-white"
      }
    }
    
    return statusConfig[callStatus]
  }

  const getCurrentBiomarkers = () => {
    return biomarkers[biomarkers.length - 1] || { jitter: 0, shimmer: 0, hnr: 0 }
  }

  const getBiomarkerStatus = (metric: string, value: number) => {
    const thresholds = {
      jitter: { normal: 0.5, warning: 1.0, critical: 1.5 },
      shimmer: { normal: 1.5, warning: 2.5, critical: 3.5 },
      hnr: { normal: 15, warning: 12, critical: 10 }
    }
    
    const threshold = thresholds[metric as keyof typeof thresholds]
    if (!threshold) return "normal"
    
    if (metric === "hnr") {
      if (value <= threshold.critical) return "critical"
      if (value <= threshold.warning) return "warning"
      return "normal"
    } else {
      if (value >= threshold.critical) return "critical"
      if (value >= threshold.warning) return "warning"
      return "normal"
    }
  }

  const statusIndicator = getStatusIndicator()
  const currentBiomarkers = getCurrentBiomarkers()

  return (
    <div ref={ref} className={cn("grid grid-cols-1 lg:grid-cols-3 gap-6", className)}>
      {/* Conversation Header */}
      <div className="lg:col-span-3">
        <Card className="border-[var(--border-medium)]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-clinical-h3 text-[var(--text-primary)]">
                  {patientName}
                </h2>
                <p className="text-clinical-caption text-[var(--text-muted)]">
                  Patient ID: {patientId} • Duration: {callDuration}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge 
                  variant="outline" 
                  className={cn("gap-2", statusIndicator.className)}
                >
                  {statusIndicator.icon}
                  {statusIndicator.text}
                </Badge>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onIntervention}
                    className="text-[var(--primary-teal)] border-[var(--primary-teal)] hover:bg-[var(--primary-teal)] hover:text-white"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Join Call
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={onEscalate}
                    className="bg-[var(--critical-red)] hover:bg-red-700"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Escalate
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onEndCall}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <PhoneOff className="h-4 w-4 mr-2" />
                    End Call
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Conversation Transcript */}
      <div className="lg:col-span-2">
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="pb-3">
            <h3 className="text-clinical-h4 text-[var(--text-primary)]">
              Live Conversation
            </h3>
          </CardHeader>
          
          <CardContent className="flex-1 p-0">
            <ScrollArea 
              ref={scrollAreaRef}
              className="h-full px-6 pb-6"
              onScrollCapture={(e) => {
                const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
                setIsScrolledToBottom(scrollTop + clientHeight >= scrollHeight - 10)
              }}
            >
              <div className="space-y-4">
                {transcript.map((message) => (
                  <div key={message.id} className="space-y-2">
                    <div className={cn(
                      "flex gap-3",
                      message.speaker === "ai" ? "justify-start" : "justify-end"
                    )}>
                      {message.speaker === "ai" && (
                        <div className="w-8 h-8 rounded-full bg-[var(--primary-teal)] flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      )}
                      
                      <div className={cn(
                        "max-w-[80%] rounded-lg px-4 py-2",
                        message.speaker === "ai" 
                          ? "bg-[var(--surface-gray)] text-[var(--text-primary)]"
                          : "bg-[var(--primary-teal)] text-white"
                      )}>
                        <p className="text-clinical-body">{message.message}</p>
                        <p className="text-clinical-caption opacity-70 mt-1">
                          {message.timestamp}
                        </p>
                      </div>
                      
                      {message.speaker === "patient" && (
                        <div className="w-8 h-8 rounded-full bg-[var(--info-blue)] flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    
                    {message.isAlert && (
                      <Alert className={cn(
                        "ml-11",
                        message.alertType === "emergency" 
                          ? "border-[var(--critical-red)] bg-red-50" 
                          : "border-[var(--warning-amber)] bg-amber-50"
                      )}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-clinical-caption">
                          {message.alertType === "emergency" 
                            ? "Emergency keyword detected - immediate attention required"
                            : "Clinical symptom mentioned - review recommended"
                          }
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
                
                {/* Live typing indicator */}
                {callStatus === "speaking" && (
                  <div className="flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-full bg-[var(--primary-teal)] flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-[var(--surface-gray)] rounded-lg px-4 py-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce [animation-delay:0.1s]" />
                        <div className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce [animation-delay:0.2s]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Voice Biomarkers Panel */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <h3 className="text-clinical-h4 text-[var(--text-primary)]">
              Voice Biomarkers
            </h3>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Jitter */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-clinical-label text-[var(--text-secondary)]">
                  Jitter
                </label>
                <Badge 
                  variant="outline"
                  className={cn(
                    getBiomarkerStatus("jitter", currentBiomarkers.jitter) === "normal" && "border-green-300 text-green-700",
                    getBiomarkerStatus("jitter", currentBiomarkers.jitter) === "warning" && "border-amber-300 text-amber-700",
                    getBiomarkerStatus("jitter", currentBiomarkers.jitter) === "critical" && "border-red-300 text-red-700"
                  )}
                >
                  {currentBiomarkers.jitter.toFixed(2)}%
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    getBiomarkerStatus("jitter", currentBiomarkers.jitter) === "normal" && "bg-green-500",
                    getBiomarkerStatus("jitter", currentBiomarkers.jitter) === "warning" && "bg-amber-500",
                    getBiomarkerStatus("jitter", currentBiomarkers.jitter) === "critical" && "bg-red-500"
                  )}
                  style={{ width: `${Math.min((currentBiomarkers.jitter / 2) * 100, 100)}%` }}
                />
              </div>
            </div>

            <Separator />

            {/* Shimmer */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-clinical-label text-[var(--text-secondary)]">
                  Shimmer
                </label>
                <Badge 
                  variant="outline"
                  className={cn(
                    getBiomarkerStatus("shimmer", currentBiomarkers.shimmer) === "normal" && "border-green-300 text-green-700",
                    getBiomarkerStatus("shimmer", currentBiomarkers.shimmer) === "warning" && "border-amber-300 text-amber-700",
                    getBiomarkerStatus("shimmer", currentBiomarkers.shimmer) === "critical" && "border-red-300 text-red-700"
                  )}
                >
                  {currentBiomarkers.shimmer.toFixed(2)}%
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    getBiomarkerStatus("shimmer", currentBiomarkers.shimmer) === "normal" && "bg-green-500",
                    getBiomarkerStatus("shimmer", currentBiomarkers.shimmer) === "warning" && "bg-amber-500",
                    getBiomarkerStatus("shimmer", currentBiomarkers.shimmer) === "critical" && "bg-red-500"
                  )}
                  style={{ width: `${Math.min((currentBiomarkers.shimmer / 5) * 100, 100)}%` }}
                />
              </div>
            </div>

            <Separator />

            {/* HNR */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-clinical-label text-[var(--text-secondary)]">
                  HNR
                </label>
                <Badge 
                  variant="outline"
                  className={cn(
                    getBiomarkerStatus("hnr", currentBiomarkers.hnr) === "normal" && "border-green-300 text-green-700",
                    getBiomarkerStatus("hnr", currentBiomarkers.hnr) === "warning" && "border-amber-300 text-amber-700",
                    getBiomarkerStatus("hnr", currentBiomarkers.hnr) === "critical" && "border-red-300 text-red-700"
                  )}
                >
                  {currentBiomarkers.hnr.toFixed(1)} dB
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    getBiomarkerStatus("hnr", currentBiomarkers.hnr) === "normal" && "bg-green-500",
                    getBiomarkerStatus("hnr", currentBiomarkers.hnr) === "warning" && "bg-amber-500",
                    getBiomarkerStatus("hnr", currentBiomarkers.hnr) === "critical" && "bg-red-500"
                  )}
                  style={{ width: `${Math.min((currentBiomarkers.hnr / 25) * 100, 100)}%` }}
                />
              </div>
            </div>

            <Separator />

            {/* Live Waveform Placeholder */}
            <div className="space-y-2">
              <label className="text-clinical-label text-[var(--text-secondary)]">
                Live Audio Waveform
              </label>
              <div className="h-16 bg-[var(--surface-gray)] rounded-lg flex items-center justify-center">
                <div className="flex items-end gap-1 h-8">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-[var(--primary-teal)] animate-pulse rounded-full"
                      style={{
                        height: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
})

ConversationMonitor.displayName = "ConversationMonitor"

export { ConversationMonitor }
```

### 2. VoiceAgentConfigPanel - AI Configuration Interface

```tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Save,
  Play,
  Settings,
  Brain,
  BookOpen,
  Zap,
  Volume2,
  Heart,
  AlertTriangle
} from "lucide-react"

interface VoiceAgentConfigPanelProps {
  onSave: (config: AgentConfiguration) => void
  onPreview: (config: AgentConfiguration) => void
  initialConfig?: AgentConfiguration
  className?: string
}

interface AgentConfiguration {
  personality: {
    tone: number // 0-100 (professional to warm)
    empathy: number // 0-100
    speakingPace: number // 0-100 (slow to fast)
    usePatientName: boolean
    askFollowUps: boolean
    acknowledgeEmotions: boolean
    useMedicalTerminology: boolean
  }
  conversation: {
    greeting: string
    transitionPhrases: string[]
    emergencyKeywords: string[]
    escalationTriggers: string[]
  }
  knowledge: {
    generalTopics: string[]
    medicalConditions: string[]
    medications: string[]
    symptoms: string[]
  }
  functions: {
    recordBiomarkers: boolean
    updatePatientRecord: boolean
    triggerAlerts: boolean
    scheduleFollowUp: boolean
    provideEducation: boolean
  }
}

const VoiceAgentConfigPanel = React.forwardRef<
  HTMLDivElement,
  VoiceAgentConfigPanelProps
>(({ onSave, onPreview, initialConfig, className }, ref) => {
  const [config, setConfig] = React.useState<AgentConfiguration>(
    initialConfig || {
      personality: {
        tone: 70,
        empathy: 80,
        speakingPace: 50,
        usePatientName: true,
        askFollowUps: true,
        acknowledgeEmotions: true,
        useMedicalTerminology: false
      },
      conversation: {
        greeting: "Hi {patientName}, this is your HeartVoice assistant. How are you feeling today?",
        transitionPhrases: ["That's helpful to know...", "I understand...", "Let me ask about..."],
        emergencyKeywords: ["chest pain", "can't breathe", "dizzy", "faint"],
        escalationTriggers: ["severe symptoms", "worsening condition", "emergency"]
      },
      knowledge: {
        generalTopics: ["weather", "family", "hobbies", "current events"],
        medicalConditions: ["heart failure", "hypertension", "diabetes"],
        medications: ["ACE inhibitors", "beta blockers", "diuretics"],
        symptoms: ["shortness of breath", "swelling", "fatigue", "chest pain"]
      },
      functions: {
        recordBiomarkers: true,
        updatePatientRecord: true,
        triggerAlerts: true,
        scheduleFollowUp: true,
        provideEducation: true
      }
    }
  )

  const [activeTab, setActiveTab] = React.useState("personality")
  const [isPreviewPlaying, setIsPreviewPlaying] = React.useState(false)

  const handlePreview = () => {
    setIsPreviewPlaying(true)
    onPreview(config)
    // Simulate preview duration
    setTimeout(() => setIsPreviewPlaying(false), 3000)
  }

  const getToneLabel = (value: number) => {
    if (value < 30) return "Professional"
    if (value < 70) return "Balanced"
    return "Warm & Caring"
  }

  const getEmpathyLabel = (value: number) => {
    if (value < 40) return "Clinical"
    if (value < 70) return "Moderate"
    return "Highly Empathetic"
  }

  const getPaceLabel = (value: number) => {
    if (value < 40) return "Slow & Clear"
    if (value < 70) return "Moderate"
    return "Quick & Efficient"
  }

  return (
    <div ref={ref} className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-clinical-h2 text-[var(--text-primary)]">
            Voice Agent Configuration
          </h2>
          <p className="text-clinical-body text-[var(--text-secondary)] mt-1">
            Configure your AI assistant's personality, conversation style, and clinical capabilities
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={isPreviewPlaying}
            className="text-[var(--primary-teal)] border-[var(--primary-teal)] hover:bg-[var(--primary-teal)] hover:text-white"
          >
            {isPreviewPlaying ? (
              <>
                <Volume2 className="h-4 w-4 mr-2 animate-pulse" />
                Playing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Preview
              </>
            )}
          </Button>
          
          <Button
            onClick={() => onSave(config)}
            className="bg-[var(--primary-teal)] hover:bg-[var(--primary-teal-dark)] text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personality" className="gap-2">
            <Heart className="h-4 w-4" />
            Personality
          </TabsTrigger>
          <TabsTrigger value="conversation" className="gap-2">
            <Brain className="h-4 w-4" />
            Conversation
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="functions" className="gap-2">
            <Zap className="h-4 w-4" />
            Functions
          </TabsTrigger>
        </TabsList>

        {/* Personality Tab */}
        <TabsContent value="personality" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-clinical-h4 text-[var(--text-primary)]">
                  Voice Characteristics
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Tone Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-clinical-label text-[var(--text-secondary)]">
                      Voice Tone
                    </Label>
                    <Badge variant="outline">
                      {getToneLabel(config.personality.tone)}
                    </Badge>
                  </div>
                  <Slider
                    value={[config.personality.tone]}
                    onValueChange={([value]) => 
                      setConfig(prev => ({
                        ...prev,
                        personality: { ...prev.personality, tone: value }
                      }))
                    }
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-clinical-caption text-[var(--text-muted)]">
                    <span>Professional</span>
                    <span>Warm & Caring</span>
                  </div>
                </div>

                {/* Empathy Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-clinical-label text-[var(--text-secondary)]">
                      Empathy Level
                    </Label>
                    <Badge variant="outline">
                      {getEmpathyLabel(config.personality.empathy)}
                    </Badge>
                  </div>
                  <Slider
                    value={[config.personality.empathy]}
                    onValueChange={([value]) => 
                      setConfig(prev => ({
                        ...prev,
                        personality: { ...prev.personality, empathy: value }
                      }))
                    }
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-clinical-caption text-[var(--text-muted)]">
                    <span>Clinical</span>
                    <span>Highly Empathetic</span>
                  </div>
                </div>

                {/* Speaking Pace */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-clinical-label text-[var(--text-secondary)]">
                      Speaking Pace
                    </Label>
                    <Badge variant="outline">
                      {getPaceLabel(config.personality.speakingPace)}
                    </Badge>
                  </div>
                  <Slider
                    value={[config.personality.speakingPace]}
                    onValueChange={([value]) => 
                      setConfig(prev => ({
                        ...prev,
                        personality: { ...prev.personality, speakingPace: value }
                      }))
                    }
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-clinical-caption text-[var(--text-muted)]">
                    <span>Slow & Clear</span>
                    <span>Quick & Efficient</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Behavior Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-clinical-h4 text-[var(--text-primary)]">
                  Conversation Behavior
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-clinical-body text-[var(--text-primary)]">
                      Use Patient's Name
                    </Label>
                    <p className="text-clinical-caption text-[var(--text-muted)]">
                      Personalize conversation with patient's name
                    </p>
                  </div>
                  <Switch
                    checked={config.personality.usePatientName}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({
                        ...prev,
                        personality: { ...prev.personality, usePatientName: checked }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-clinical-body text-[var(--text-primary)]">
                      Ask Follow-up Questions
                    </Label>
                    <p className="text-clinical-caption text-[var(--text-muted)]">
                      Encourage detailed responses from patients
                    </p>
                  </div>
                  <Switch
                    checked={config.personality.askFollowUps}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({
                        ...prev,
                        personality: { ...prev.personality, askFollowUps: checked }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-clinical-body text-[var(--text-primary)]">
                      Acknowledge Emotions
                    </Label>
                    <p className="text-clinical-caption text-[var(--text-muted)]">
                      Respond empathetically to emotional cues
                    </p>
                  </div>
                  <Switch
                    checked={config.personality.acknowledgeEmotions}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({
                        ...prev,
                        personality: { ...prev.personality, acknowledgeEmotions: checked }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-clinical-body text-[var(--text-primary)]">
                      Use Medical Terminology
                    </Label>
                    <p className="text-clinical-caption text-[var(--text-muted)]">
                      Include clinical terms in conversations
                    </p>
                  </div>
                  <Switch
                    checked={config.personality.useMedicalTerminology}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({
                        ...prev,
                        personality: { ...prev.personality, useMedicalTerminology: checked }
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <Card className="bg-[var(--surface-gray)]">
            <CardHeader>
              <CardTitle className="text-clinical-h4 text-[var(--text-primary)]">
                Live Preview
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--primary-teal)] flex items-center justify-center">
                    <Heart className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-clinical-body text-[var(--text-primary)]">
                      "{config.conversation.greeting}"
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handlePreview}
                        disabled={isPreviewPlaying}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        {isPreviewPlaying ? "Playing..." : "Play Sample"}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-[var(--surface-gray)] rounded-lg">
                  <h4 className="text-clinical-caption text-[var(--text-secondary)] mb-2">
                    Current Settings:
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-clinical-caption">
                    <div>
                      <span className="font-medium">Tone:</span> {getToneLabel(config.personality.tone)}
                    </div>
                    <div>
                      <span className="font-medium">Empathy:</span> {getEmpathyLabel(config.personality.empathy)}
                    </div>
                    <div>
                      <span className="font-medium">Pace:</span> {getPaceLabel(config.personality.speakingPace)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversation Tab */}
        <TabsContent value="conversation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-clinical-h4 text-[var(--text-primary)]">
                  Conversation Templates
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-clinical-label text-[var(--text-secondary)]">
                    Greeting Message
                  </Label>
                  <Textarea
                    value={config.conversation.greeting}
                    onChange={(e) => 
                      setConfig(prev => ({
                        ...prev,
                        conversation: { ...prev.conversation, greeting: e.target.value }
                      }))
                    }
                    placeholder="Enter the initial greeting message..."
                    className="min-h-[80px]"
                  />
                  <p className="text-clinical-caption text-[var(--text-muted)]">
                    Use {"{patientName}"} to personalize the greeting
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-clinical-label text-[var(--text-secondary)]">
                    Transition Phrases
                  </Label>
                  <Textarea
                    value={config.conversation.transitionPhrases.join('\n')}
                    onChange={(e) => 
                      setConfig(prev => ({
                        ...prev,
                        conversation: { 
                          ...prev.conversation, 
                          transitionPhrases: e.target.value.split('\n').filter(Boolean)
                        }
                      }))
                    }
                    placeholder="Enter transition phrases (one per line)..."
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-clinical-h4 text-[var(--text-primary)] flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-[var(--warning-amber)]" />
                  Emergency Detection
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-clinical-label text-[var(--text-secondary)]">
                    Emergency Keywords
                  </Label>
                  <Textarea
                    value={config.conversation.emergencyKeywords.join('\n')}
                    onChange={(e) => 
                      setConfig(prev => ({
                        ...prev,
                        conversation: { 
                          ...prev.conversation, 
                          emergencyKeywords: e.target.value.split('\n').filter(Boolean)
                        }
                      }))
                    }
                    placeholder="Enter emergency keywords (one per line)..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-clinical-label text-[var(--text-secondary)]">
                    Escalation Triggers
                  </Label>
                  <Textarea
                    value={config.conversation.escalationTriggers.join('\n')}
                    onChange={(e) => 
                      setConfig(prev => ({
                        ...prev,
                        conversation: { 
                          ...prev.conversation, 
                          escalationTriggers: e.target.value.split('\n').filter(Boolean)
                        }
                      }))
                    }
                    placeholder="Enter escalation triggers (one per line)..."
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Knowledge Base Tab */}
        <TabsContent value="knowledge" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-clinical-h4 text-[var(--text-primary)]">
                  General Knowledge
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-clinical-label text-[var(--text-secondary)]">
                    General Topics
                  </Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {config.knowledge.generalTopics.map((topic, index) => (
                      <Badge key={index} variant="secondary">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Add general topic and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const value = e.currentTarget.value.trim()
                        if (value) {
                          setConfig(prev => ({
                            ...prev,
                            knowledge: {
                              ...prev.knowledge,
                              generalTopics: [...prev.knowledge.generalTopics, value]
                            }
                          }))
                          e.currentTarget.value = ''
                        }
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-clinical-h4 text-[var(--text-primary)]">
                  Medical Knowledge
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-clinical-label text-[var(--text-secondary)]">
                    Medical Conditions
                  </Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {config.knowledge.medicalConditions.map((condition, index) => (
                      <Badge key={index} variant="secondary">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Add medical condition and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const value = e.currentTarget.value.trim()
                        if (value) {
                          setConfig(prev => ({
                            ...prev,
                            knowledge: {
                              ...prev.knowledge,
                              medicalConditions: [...prev.knowledge.medicalConditions, value]
                            }
                          }))
                          e.currentTarget.value = ''
                        }
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-clinical-label text-[var(--text-secondary)]">
                    Medications
                  </Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {config.knowledge.medications.map((medication, index) => (
                      <Badge key={index} variant="secondary">
                        {medication}
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Add medication and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const value = e.currentTarget.value.trim()
                        if (value) {
                          setConfig(prev => ({
                            ...prev,
                            knowledge: {
                              ...prev.knowledge,
                              medications: [...prev.knowledge.medications, value]
                            }
                          }))
                          e.currentTarget.value = ''
                        }
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Functions Tab */}
        <TabsContent value="functions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-clinical-h4 text-[var(--text-primary)]">
                AI Function Capabilities
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-clinical-body text-[var(--text-primary)]">
                      Record Voice Biomarkers
                    </Label>
                    <p className="text-clinical-caption text-[var(--text-muted)]">
                      Automatically capture jitter, shimmer, and HNR during conversation
                    </p>
                  </div>
                  <Switch
                    checked={config.functions.recordBiomarkers}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({
                        ...prev,
                        functions: { ...prev.functions, recordBiomarkers: checked }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-clinical-body text-[var(--text-primary)]">
                      Update Patient Records
                    </Label>
                    <p className="text-clinical-caption text-[var(--text-muted)]">
                      Automatically log conversation outcomes to EHR
                    </p>
                  </div>
                  <Switch
                    checked={config.functions.updatePatientRecord}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({
                        ...prev,
                        functions: { ...prev.functions, updatePatientRecord: checked }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-clinical-body text-[var(--text-primary)]">
                      Trigger Clinical Alerts
                    </Label>
                    <p className="text-clinical-caption text-[var(--text-muted)]">
                      Send immediate alerts for concerning symptoms
                    </p>
                  </div>
                  <Switch
                    checked={config.functions.triggerAlerts}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({
                        ...prev,
                        functions: { ...prev.functions, triggerAlerts: checked }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-clinical-body text-[var(--text-primary)]">
                      Schedule Follow-ups
                    </Label>
                    <p className="text-clinical-caption text-[var(--text-muted)]">
                      Automatically schedule next calls based on patient needs
                    </p>
                  </div>
                  <Switch
                    checked={config.functions.scheduleFollowUp}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({
                        ...prev,
                        functions: { ...prev.functions, scheduleFollowUp: checked }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between md:col-span-2">
                  <div>
                    <Label className="text-clinical-body text-[var(--text-primary)]">
                      Provide Patient Education
                    </Label>
                    <p className="text-clinical-caption text-[var(--text-muted)]">
                      Share relevant health information and self-care tips
                    </p>
                  </div>
                  <Switch
                    checked={config.functions.provideEducation}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({
                        ...prev,
                        functions: { ...prev.functions, provideEducation: checked }
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
})

VoiceAgentConfigPanel.displayName = "VoiceAgentConfigPanel"

export { VoiceAgentConfigPanel }
```

### 3. CallStatusIndicator - Real-time Conversation State

```tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Brain, 
  CheckCircle, 
  AlertTriangle,
  Phone,
  PhoneOff
} from "lucide-react"

interface CallStatusIndicatorProps {
  status: "idle" | "connecting" | "listening" | "speaking" | "analyzing" | "completed" | "error"
  duration?: string
  signalQuality?: "excellent" | "good" | "fair" | "poor"
  showDuration?: boolean
  showSignalQuality?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

const CallStatusIndicator = React.forwardRef<
  HTMLDivElement,
  CallStatusIndicatorProps
>(({ 
  status, 
  duration, 
  signalQuality = "good", 
  showDuration = true, 
  showSignalQuality = true,
  size = "md",
  className 
}, ref) => {
  const getStatusConfig = () => {
    const configs = {
      idle: {
        icon: <PhoneOff className="h-4 w-4" />,
        text: "Idle",
        className: "bg-gray-100 text-gray-600 border-gray-200",
        animation: ""
      },
      connecting: {
        icon: <Phone className="h-4 w-4" />,
        text: "Connecting",
        className: "bg-blue-100 text-blue-600 border-blue-200",
        animation: "animate-pulse"
      },
      listening: {
        icon: <Mic className="h-4 w-4" />,
        text: "Listening",
        className: "bg-blue-500 text-white border-blue-500",
        animation: "animate-pulse"
      },
      speaking: {
        icon: <Volume2 className="h-4 w-4" />,
        text: "Speaking",
        className: "bg-green-500 text-white border-green-500",
        animation: "animate-pulse"
      },
      analyzing: {
        icon: <Brain className="h-4 w-4" />,
        text: "Analyzing",
        className: "bg-amber-500 text-white border-amber-500",
        animation: "animate-spin"
      },
      completed: {
        icon: <CheckCircle className="h-4 w-4" />,
        text: "Completed",
        className: "bg-gray-500 text-white border-gray-500",
        animation: ""
      },
      error: {
        icon: <AlertTriangle className="h-4 w-4" />,
        text: "Error",
        className: "bg-red-500 text-white border-red-500",
        animation: "animate-bounce"
      }
    }
    
    return configs[status]
  }

  const getSignalQualityConfig = () => {
    const configs = {
      excellent: {
        color: "text-green-500",
        bars: 4,
        text: "Excellent"
      },
      good: {
        color: "text-green-400",
        bars: 3,
        text: "Good"
      },
      fair: {
        color: "text-amber-500",
        bars: 2,
        text: "Fair"
      },
      poor: {
        color: "text-red-500",
        bars: 1,
        text: "Poor"
      }
    }
    
    return configs[signalQuality]
  }

  const getSizeClasses = () => {
    const sizes = {
      sm: {
        badge: "text-xs px-2 py-1",
        icon: "h-3 w-3",
        spacing: "gap-1"
      },
      md: {
        badge: "text-sm px-3 py-1.5",
        icon: "h-4 w-4",
        spacing: "gap-2"
      },
      lg: {
        badge: "text-base px-4 py-2",
        icon: "h-5 w-5", 
        spacing: "gap-3"
      }
    }
    
    return sizes[size]
  }

  const statusConfig = getStatusConfig()
  const signalConfig = getSignalQualityConfig()
  const sizeClasses = getSizeClasses()

  return (
    <div ref={ref} className={cn("flex items-center gap-3", className)}>
      {/* Main Status Badge */}
      <Badge
        variant="outline"
        className={cn(
          "border font-medium",
          sizeClasses.badge,
          sizeClasses.spacing,
          statusConfig.className,
          statusConfig.animation
        )}
      >
        <span className={statusConfig.animation}>
          {React.cloneElement(statusConfig.icon, { 
            className: sizeClasses.icon 
          })}
        </span>
        {statusConfig.text}
      </Badge>

      {/* Duration Display */}
      {showDuration && duration && (
        <span className="text-clinical-caption text-[var(--text-muted)] font-mono-data">
          {duration}
        </span>
      )}

      {/* Signal Quality Indicator */}
      {showSignalQuality && (status === "listening" || status === "speaking" || status === "analyzing") && (
        <div className="flex items-center gap-1">
          <div className="flex items-end gap-0.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-1 bg-gray-200 rounded-full",
                  i < signalConfig.bars && signalConfig.color,
                  i === 0 && "h-2",
                  i === 1 && "h-3",
                  i === 2 && "h-4",
                  i === 3 && "h-5"
                )}
              />
            ))}
          </div>
          {size !== "sm" && (
            <span className={cn("text-clinical-caption font-medium", signalConfig.color)}>
              {signalConfig.text}
            </span>
          )}
        </div>
      )}
    </div>
  )
})

CallStatusIndicator.displayName = "CallStatusIndicator"

export { CallStatusIndicator }
```

### 4. VoiceBiomarkerChart - Live Visualization

```tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart
} from "recharts"
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react"

interface VoiceBiomarkerChartProps {
  data: BiomarkerDataPoint[]
  metric?: "jitter" | "shimmer" | "hnr" | "all"
  showLive?: boolean
  showThresholds?: boolean
  timeRange?: "1min" | "5min" | "15min" | "1hour"
  className?: string
}

interface BiomarkerDataPoint {
  timestamp: string
  jitter: number
  shimmer: number
  hnr: number
  isLive?: boolean
}

const VoiceBiomarkerChart = React.forwardRef<
  HTMLDivElement,
  VoiceBiomarkerChartProps
>(({ 
  data, 
  metric = "all", 
  showLive = true, 
  showThresholds = true, 
  timeRange = "5min",
  className 
}, ref) => {
  const [activeMetric, setActiveMetric] = React.useState<"jitter" | "shimmer" | "hnr">(
    metric === "all" ? "jitter" : metric
  )

  const getMetricConfig = (metricType: "jitter" | "shimmer" | "hnr") => {
    const configs = {
      jitter: {
        color: "#0f766e",
        unit: "%",
        name: "Jitter",
        domain: [0, 2],
        thresholds: {
          normal: 0.5,
          warning: 1.0,
          critical: 1.5
        },
        description: "Voice frequency variation"
      },
      shimmer: {
        color: "#2563eb",
        unit: "%",
        name: "Shimmer",
        domain: [0, 5],
        thresholds: {
          normal: 1.5,
          warning: 2.5,
          critical: 3.5
        },
        description: "Voice amplitude variation"
      },
      hnr: {
        color: "#16a34a",
        unit: "dB",
        name: "HNR",
        domain: [5, 25],
        thresholds: {
          normal: 15,
          warning: 12,
          critical: 10
        },
        description: "Harmonics-to-noise ratio"
      }
    }
    
    return configs[metricType]
  }

  const getCurrentValue = (metricType: "jitter" | "shimmer" | "hnr") => {
    const latestData = data[data.length - 1]
    return latestData ? latestData[metricType] : 0
  }

  const getTrend = (metricType: "jitter" | "shimmer" | "hnr") => {
    if (data.length < 2) return "stable"
    
    const current = getCurrentValue(metricType)
    const previous = data[data.length - 2][metricType]
    const config = getMetricConfig(metricType)
    
    const threshold = metricType === "hnr" ? 0.5 : 0.1
    
    if (metricType === "hnr") {
      if (current > previous + threshold) return "improving"
      if (current < previous - threshold) return "declining"
    } else {
      if (current > previous + threshold) return "declining"
      if (current < previous - threshold) return "improving"
    }
    
    return "stable"
  }

  const getStatusLevel = (metricType: "jitter" | "shimmer" | "hnr", value: number) => {
    const config = getMetricConfig(metricType)
    
    if (metricType === "hnr") {
      if (value <= config.thresholds.critical) return "critical"
      if (value <= config.thresholds.warning) return "warning"
      return "normal"
    } else {
      if (value >= config.thresholds.critical) return "critical"
      if (value >= config.thresholds.warning) return "warning"
      return "normal"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      normal: "bg-green-100 text-green-700 border-green-200",
      warning: "bg-amber-100 text-amber-700 border-amber-200",
      critical: "bg-red-100 text-red-700 border-red-200"
    }
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.normal
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const config = getMetricConfig(activeMetric)
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="text-clinical-caption text-[var(--text-muted)]">
            {formatTimestamp(label)}
          </p>
          <p className="text-clinical-body text-[var(--text-primary)] font-medium">
            {config.name}: {payload[0].value.toFixed(2)}{config.unit}
          </p>
        </div>
      )
    }
    return null
  }

  const renderMetricChart = (metricType: "jitter" | "shimmer" | "hnr") => {
    const config = getMetricConfig(metricType)
    const currentValue = getCurrentValue(metricType)
    const trend = getTrend(metricType)
    const status = getStatusLevel(metricType, currentValue)

    return (
      <div className="space-y-4">
        {/* Metric Header */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-clinical-h4 text-[var(--text-primary)]">
              {config.name}
            </h4>
            <p className="text-clinical-caption text-[var(--text-muted)]">
              {config.description}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {getTrendIcon(trend)}
            <Badge 
              variant="outline"
              className={getStatusBadge(status)}
            >
              {currentValue.toFixed(2)}{config.unit}
            </Badge>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`gradient-${metricType}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={config.color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={config.color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatTimestamp}
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                domain={config.domain}
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => `${value}${config.unit}`}
              />
              
              {showThresholds && (
                <>
                  <ReferenceLine 
                    y={config.thresholds.warning} 
                    stroke="#d97706" 
                    strokeDasharray="5 5"
                    label={{ value: "Warning", position: "topRight" }}
                  />
                  <ReferenceLine 
                    y={config.thresholds.critical} 
                    stroke="#dc2626" 
                    strokeDasharray="5 5"
                    label={{ value: "Critical", position: "topRight" }}
                  />
                </>
              )}
              
              <Area
                type="monotone"
                dataKey={metricType}
                stroke={config.color}
                strokeWidth={2}
                fill={`url(#gradient-${metricType})`}
                dot={(props) => {
                  if (props.payload?.isLive && showLive) {
                    return (
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={4}
                        fill={config.color}
                        stroke="white"
                        strokeWidth={2}
                        className="animate-pulse"
                      />
                    )
                  }
                  return null
                }}
              />
              
              <Tooltip content={<CustomTooltip />} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className={cn(
              "w-3 h-3 rounded-full mx-auto mb-1",
              currentValue <= config.thresholds.normal ? "bg-green-500" : "bg-gray-200"
            )} />
            <p className="text-clinical-caption text-[var(--text-muted)]">Normal</p>
            <p className="text-clinical-caption font-mono-data">
              ≤ {config.thresholds.normal}{config.unit}
            </p>
          </div>
          
          <div className="text-center">
            <div className={cn(
              "w-3 h-3 rounded-full mx-auto mb-1",
              currentValue > config.thresholds.normal && currentValue <= config.thresholds.warning 
                ? "bg-amber-500" : "bg-gray-200"
            )} />
            <p className="text-clinical-caption text-[var(--text-muted)]">Warning</p>
            <p className="text-clinical-caption font-mono-data">
              {config.thresholds.warning}{config.unit}
            </p>
          </div>
          
          <div className="text-center">
            <div className={cn(
              "w-3 h-3 rounded-full mx-auto mb-1",
              currentValue > config.thresholds.critical ? "bg-red-500" : "bg-gray-200"
            )} />
            <p className="text-clinical-caption text-[var(--text-muted)]">Critical</p>
            <p className="text-clinical-caption font-mono-data">
              > {config.thresholds.critical}{config.unit}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (metric === "all") {
    return (
      <Card ref={ref} className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="text-clinical-h3 text-[var(--text-primary)]">
            Voice Biomarkers
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeMetric} onValueChange={(value) => setActiveMetric(value as typeof activeMetric)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="jitter">Jitter</TabsTrigger>
              <TabsTrigger value="shimmer">Shimmer</TabsTrigger>
              <TabsTrigger value="hnr">HNR</TabsTrigger>
            </TabsList>
            
            <TabsContent value="jitter" className="mt-6">
              {renderMetricChart("jitter")}
            </TabsContent>
            
            <TabsContent value="shimmer" className="mt-6">
              {renderMetricChart("shimmer")}
            </TabsContent>
            
            <TabsContent value="hnr" className="mt-6">
              {renderMetricChart("hnr")}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card ref={ref} className={cn("w-full", className)}>
      <CardContent className="pt-6">
        {renderMetricChart(metric)}
      </CardContent>
    </Card>
  )
})

VoiceBiomarkerChart.displayName = "VoiceBiomarkerChart"

export { VoiceBiomarkerChart }
```

### 5. EmergencyEscalation - Crisis Detection UI

```tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  AlertTriangle, 
  Phone, 
  PhoneCall, 
  Clock, 
  User, 
  Stethoscope,
  FileText,
  Send,
  X
} from "lucide-react"

interface EmergencyEscalationProps {
  isVisible: boolean
  severity: "low" | "medium" | "high" | "critical"
  triggerReason: string
  patientName: string
  patientId: string
  transcriptExcerpt: string
  onCallPhysician: () => void
  onCall911: () => void
  onAddNotes: (notes: string) => void
  onDismiss: () => void
  onClose: () => void
  className?: string
}

const EmergencyEscalation = React.forwardRef<
  HTMLDivElement,
  EmergencyEscalationProps
>(({ 
  isVisible,
  severity,
  triggerReason,
  patientName,
  patientId,
  transcriptExcerpt,
  onCallPhysician,
  onCall911,
  onAddNotes,
  onDismiss,
  onClose,
  className 
}, ref) => {
  const [notes, setNotes] = React.useState("")
  const [isCallInProgress, setIsCallInProgress] = React.useState(false)

  const getSeverityConfig = () => {
    const configs = {
      low: {
        color: "bg-blue-500",
        textColor: "text-blue-700",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        icon: <AlertTriangle className="h-5 w-5" />,
        title: "Clinical Review Needed",
        urgency: "Non-urgent"
      },
      medium: {
        color: "bg-amber-500",
        textColor: "text-amber-700",
        bgColor: "bg-amber-50", 
        borderColor: "border-amber-200",
        icon: <AlertTriangle className="h-5 w-5" />,
        title: "Clinical Attention Required",
        urgency: "Urgent"
      },
      high: {
        color: "bg-red-500",
        textColor: "text-red-700",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        icon: <AlertTriangle className="h-6 w-6" />,
        title: "Emergency Response Needed",
        urgency: "High Priority"
      },
      critical: {
        color: "bg-red-600",
        textColor: "text-red-800",
        bgColor: "bg-red-100",
        borderColor: "border-red-300",
        icon: <AlertTriangle className="h-6 w-6" />,
        title: "CRITICAL EMERGENCY",
        urgency: "IMMEDIATE ACTION REQUIRED"
      }
    }
    
    return configs[severity]
  }

  const handleCallPhysician = () => {
    setIsCallInProgress(true)
    onCallPhysician()
    // Simulate call duration
    setTimeout(() => setIsCallInProgress(false), 5000)
  }

  const handleAddNotes = () => {
    if (notes.trim()) {
      onAddNotes(notes.trim())
      setNotes("")
    }
  }

  const config = getSeverityConfig()

  if (!isVisible) return null

  return (
    <div 
      ref={ref} 
      className={cn(
        "fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4",
        className
      )}
    >
      <Card className={cn(
        "w-full max-w-2xl border-2 shadow-2xl",
        config.borderColor,
        severity === "critical" && "animate-pulse"
      )}>
        <CardHeader className={cn("pb-4", config.bgColor)}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-full text-white",
                config.color,
                severity === "critical" && "animate-bounce"
              )}>
                {config.icon}
              </div>
              
              <div>
                <CardTitle className={cn(
                  "text-clinical-h3",
                  config.textColor,
                  severity === "critical" && "text-2xl font-bold"
                )}>
                  {config.title}
                </CardTitle>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "mt-1",
                    config.textColor,
                    config.borderColor
                  )}
                >
                  {config.urgency}
                </Badge>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Patient Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-clinical-label text-[var(--text-secondary)]">
                Patient
              </Label>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-[var(--text-muted)]" />
                <span className="text-clinical-body font-medium">{patientName}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <Label className="text-clinical-label text-[var(--text-secondary)]">
                Patient ID
              </Label>
              <span className="text-clinical-body font-mono-data">{patientId}</span>
            </div>
          </div>

          {/* Trigger Information */}
          <Alert className={cn(config.bgColor, config.borderColor)}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-clinical-body">
              <strong>Trigger Reason:</strong> {triggerReason}
            </AlertDescription>
          </Alert>

          {/* Transcript Excerpt */}
          <div className="space-y-2">
            <Label className="text-clinical-label text-[var(--text-secondary)]">
              Conversation Excerpt
            </Label>
            <div className="bg-[var(--surface-gray)] rounded-lg p-4 border">
              <p className="text-clinical-body text-[var(--text-primary)] italic">
                "{transcriptExcerpt}"
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {severity === "critical" && (
              <Button
                onClick={onCall911}
                className="bg-red-600 hover:bg-red-700 text-white text-lg py-6"
                size="lg"
              >
                <PhoneCall className="h-5 w-5 mr-2" />
                Call 911 Emergency
              </Button>
            )}
            
            <Button
              onClick={handleCallPhysician}
              disabled={isCallInProgress}
              className={cn(
                "bg-[var(--primary-teal)] hover:bg-[var(--primary-teal-dark)] text-white",
                severity === "critical" ? "py-6 text-lg" : "py-3"
              )}
              size="lg"
            >
              {isCallInProgress ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Calling Physician...
                </>
              ) : (
                <>
                  <Stethoscope className="h-4 w-4 mr-2" />
                  Call Physician
                </>
              )}
            </Button>
          </div>

          {/* Notes Section */}
          <div className="space-y-3">
            <Label className="text-clinical-label text-[var(--text-secondary)]">
              Clinical Notes
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add clinical notes about this emergency situation..."
              className="min-h-[80px]"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleAddNotes}
                disabled={!notes.trim()}
                variant="outline"
                size="sm"
              >
                <FileText className="h-4 w-4 mr-2" />
                Add to Patient Record
              </Button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              onClick={onDismiss}
              variant="outline"
              disabled={severity === "critical"}
            >
              Dismiss Alert
            </Button>
            
            <div className="flex items-center gap-2 text-clinical-caption text-[var(--text-muted)]">
              <Clock className="h-4 w-4" />
              Alert triggered at {new Date().toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

EmergencyEscalation.displayName = "EmergencyEscalation"

export { EmergencyEscalation }
```

### 6. ConversationQualityScore - Patient Engagement Metrics

```tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  Clock, 
  TrendingUp,
  TrendingDown,
  Minus,
  Star
} from "lucide-react"

interface ConversationQualityScoreProps {
  overallScore: number // 0-100
  engagementScore: number // 0-100
  responseQuality: number // 0-100
  conversationLength: number // minutes
  responseTime: number // seconds
  interruptionCount: number
  completionRate: number // 0-100
  patientSatisfaction?: number // 1-5 stars
  trends?: {
    engagement: "up" | "down" | "stable"
    quality: "up" | "down" | "stable"
    satisfaction: "up" | "down" | "stable"
  }
  className?: string
}

const ConversationQualityScore = React.forwardRef<
  HTMLDivElement,
  ConversationQualityScoreProps
>(({ 
  overallScore,
  engagementScore,
  responseQuality,
  conversationLength,
  responseTime,
  interruptionCount,
  completionRate,
  patientSatisfaction,
  trends,
  className 
}, ref) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-amber-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { text: "Excellent", className: "bg-green-100 text-green-700 border-green-200" }
    if (score >= 80) return { text: "Good", className: "bg-green-100 text-green-700 border-green-200" }
    if (score >= 70) return { text: "Fair", className: "bg-amber-100 text-amber-700 border-amber-200" }
    if (score >= 60) return { text: "Poor", className: "bg-amber-100 text-amber-700 border-amber-200" }
    return { text: "Critical", className: "bg-red-100 text-red-700 border-red-200" }
  }

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`
  }

  const overallBadge = getScoreBadge(overallScore)

  return (
    <Card ref={ref} className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-clinical-h3 text-[var(--text-primary)]">
            Conversation Quality
          </CardTitle>
          <Badge variant="outline" className={overallBadge.className}>
            {overallBadge.text}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Score Circle */}
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#e2e8f0"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke={overallScore >= 80 ? "#16a34a" : overallScore >= 60 ? "#d97706" : "#dc2626"}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${overallScore * 2.51} 251`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={cn("text-3xl font-bold", getScoreColor(overallScore))}>
                  {overallScore}
                </div>
                <div className="text-clinical-caption text-[var(--text-muted)]">
                  Overall Score
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quality Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-clinical-label text-[var(--text-secondary)]">
                Patient Engagement
              </Label>
              <div className="flex items-center gap-1">
                {trends?.engagement && getTrendIcon(trends.engagement)}
                <span className={cn("text-clinical-caption font-medium", getScoreColor(engagementScore))}>
                  {engagementScore}%
                </span>
              </div>
            </div>
            <Progress value={engagementScore} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-clinical-label text-[var(--text-secondary)]">
                Response Quality
              </Label>
              <div className="flex items-center gap-1">
                {trends?.quality && getTrendIcon(trends.quality)}
                <span className={cn("text-clinical-caption font-medium", getScoreColor(responseQuality))}>
                  {responseQuality}%
                </span>
              </div>
            </div>
            <Progress value={responseQuality} className="h-2" />
          </div>
        </div>

        {/* Conversation Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-[var(--text-muted)]" />
            </div>
            <div className="text-clinical-h4 text-[var(--text-primary)]">
              {conversationLength.toFixed(1)}m
            </div>
            <div className="text-clinical-caption text-[var(--text-muted)]">
              Duration
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <MessageCircle className="h-5 w-5 text-[var(--text-muted)]" />
            </div>
            <div className="text-clinical-h4 text-[var(--text-primary)]">
              {formatTime(responseTime)}
            </div>
            <div className="text-clinical-caption text-[var(--text-muted)]">
              Avg Response
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <ThumbsUp className="h-5 w-5 text-[var(--text-muted)]" />
            </div>
            <div className={cn("text-clinical-h4", getScoreColor(completionRate))}>
              {completionRate}%
            </div>
            <div className="text-clinical-caption text-[var(--text-muted)]">
              Completion
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              {interruptionCount === 0 ? (
                <ThumbsUp className="h-5 w-5 text-green-500" />
              ) : (
                <ThumbsDown className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div className={cn(
              "text-clinical-h4",
              interruptionCount === 0 ? "text-green-600" : "text-red-600"
            )}>
              {interruptionCount}
            </div>
            <div className="text-clinical-caption text-[var(--text-muted)]">
              Interruptions
            </div>
          </div>
        </div>

        {/* Patient Satisfaction */}
        {patientSatisfaction && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-clinical-label text-[var(--text-secondary)]">
                Patient Satisfaction
              </Label>
              <div className="flex items-center gap-1">
                {trends?.satisfaction && getTrendIcon(trends.satisfaction)}
                <span className="text-clinical-caption font-medium">
                  {patientSatisfaction.toFixed(1)}/5.0
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 justify-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-6 w-6",
                    i < Math.floor(patientSatisfaction)
                      ? "text-yellow-500 fill-current"
                      : i < patientSatisfaction
                      ? "text-yellow-500 fill-current opacity-50"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {/* Quality Insights */}
        <div className="pt-4 border-t space-y-2">
          <Label className="text-clinical-label text-[var(--text-secondary)]">
            Quality Insights
          </Label>
          
          <div className="space-y-2">
            {engagementScore >= 80 && (
              <div className="flex items-center gap-2 text-clinical-caption text-green-700">
                <ThumbsUp className="h-4 w-4" />
                High patient engagement throughout conversation
              </div>
            )}
            
            {responseTime < 3 && (
              <div className="flex items-center gap-2 text-clinical-caption text-green-700">
                <Clock className="h-4 w-4" />
                Excellent response time maintaining natural flow
              </div>
            )}
            
            {interruptionCount === 0 && (
              <div className="flex items-center gap-2 text-clinical-caption text-green-700">
                <MessageCircle className="h-4 w-4" />
                Smooth conversation without interruptions
              </div>
            )}
            
            {completionRate < 70 && (
              <div className="flex items-center gap-2 text-clinical-caption text-amber-700">
                <ThumbsDown className="h-4 w-4" />
                Consider adjusting conversation flow for better completion
              </div>
            )}
            
            {responseTime > 5 && (
              <div className="flex items-center gap-2 text-clinical-caption text-red-700">
                <Clock className="h-4 w-4" />
                Response delays may impact patient experience
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

ConversationQualityScore.displayName = "ConversationQualityScore"

export { ConversationQualityScore }
```

## Component Export Index

```tsx
// components/healthcare/index.ts
export { ConversationMonitor } from "./conversation-monitor"
export { VoiceAgentConfigPanel } from "./voice-agent-config-panel"
export { CallStatusIndicator } from "./call-status-indicator"
export { VoiceBiomarkerChart } from "./voice-biomarker-chart"
export { EmergencyEscalation } from "./emergency-escalation"
export { ConversationQualityScore } from "./conversation-quality-score"

// Export types
export type { 
  TranscriptMessage,
  VoiceBiomarker,
  AgentConfiguration,
  BiomarkerDataPoint
} from "./types"
```

## Complete Tailwind Configuration

```js
// tailwind.config.js
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Healthcare color system
        primary: {
          teal: "#0f766e",
          "teal-light": "#14b8a6", 
          "teal-dark": "#0d5b52"
        },
        clinical: {
          white: "#fafafa",
          surface: "#ffffff",
          gray: "#f8fafc"
        },
        status: {
          success: "#16a34a",
          warning: "#d97706",
          critical: "#dc2626",
          info: "#2563eb"
        },
        text: {
          primary: "#0f172a",
          secondary: "#475569",
          muted: "#64748b"
        },
        border: {
          light: "#e2e8f0",
          medium: "#cbd5e1"
        }
      },
      fontFamily: {
        clinical: ['Inter', 'system-ui', 'sans-serif'],
        'mono-data': ['SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'monospace']
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
}
```

## Usage Examples

```tsx
// Example usage in a dashboard
import { 
  ConversationMonitor,
  VoiceAgentConfigPanel,
  CallStatusIndicator,
  VoiceBiomarkerChart,
  EmergencyEscalation,
  ConversationQualityScore
} from "@/components/healthcare"

export default function VoiceAgentDashboard() {
  return (
    <div className="min-h-screen bg-[var(--clinical-white)] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Live Conversation Monitor */}
        <ConversationMonitor
          patientName="Mary Johnson"
          patientId="HF-12345"
          callStatus="speaking"
          callDuration="04:23"
          transcript={conversationData}
          biomarkers={biomarkerData}
          onIntervention={handleIntervention}
          onEscalate={handleEscalation}
          onEndCall={handleEndCall}
        />
        
        {/* Voice Biomarker Visualization */}
        <VoiceBiomarkerChart
          data={biomarkerData}
          metric="all"
          showLive={true}
          showThresholds={true}
        />
        
        {/* Conversation Quality Metrics */}
        <ConversationQualityScore
          overallScore={87}
          engagementScore={92}
          responseQuality={84}
          conversationLength={4.5}
          responseTime={2.3}
          interruptionCount={0}
          completionRate={95}
          patientSatisfaction={4.2}
        />
        
      </div>
    </div>
  )
}
```

This comprehensive component system provides:

1. **Healthcare-specific design** with calming teal colors and clinical typography
2. **WCAG AA compliant** color contrasts and accessibility features
3. **Real-time monitoring** with smooth animations and live updates
4. **Emergency workflows** with prominent alerts and escalation paths
5. **Voice biomarker visualization** with clinical thresholds and interpretations
6. **Complete shadcn/ui integration** with consistent styling and behavior

All components are built with TypeScript for type safety and include comprehensive prop interfaces for easy integration into the HeartVoice Monitor platform.