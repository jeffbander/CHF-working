# HeartVoice Monitor Voice Agent UI/UX Design Specification

**Project**: HeartVoice Monitor Voice Agent Upgrade  
**Date**: 2025-01-09  
**Version**: 1.0  
**Status**: Initial Design Specification  

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Design Philosophy](#design-philosophy)
3. [Core Interface Requirements](#core-interface-requirements)
4. [Component Hierarchy](#component-hierarchy)
5. [User Flows](#user-flows)
6. [Wireframes & Layouts](#wireframes--layouts)
7. [Design System](#design-system)
8. [Accessibility & Compliance](#accessibility--compliance)
9. [Technical Implementation](#technical-implementation)
10. [Success Metrics](#success-metrics)

## Executive Summary

This specification defines the complete UI/UX design for upgrading the HeartVoice Monitor from basic Twilio TwiML to an OpenAI Realtime API conversational AI system. The design prioritizes clinical workflow efficiency, real-time conversation monitoring, and healthcare-appropriate user experience while maintaining HIPAA compliance and accessibility standards.

### Key Design Objectives
- Create intuitive interfaces for real-time conversation monitoring
- Provide comprehensive voice agent configuration capabilities
- Enable seamless clinical intervention during patient calls
- Visualize voice biomarkers and patient engagement metrics
- Support emergency escalation workflows
- Maintain healthcare-grade accessibility and compliance

## Design Philosophy

### Clinical-First Approach
- **Trust & Reliability**: Clean, professional interfaces that inspire confidence
- **Efficiency**: Minimize cognitive load for busy healthcare professionals
- **Safety**: Clear visual indicators for critical information and emergency situations
- **Accessibility**: WCAG AA compliance for diverse healthcare environments

### Visual Design Principles
- **Calming Healthcare Palette**: Teals, soft blues, professional whites
- **Hierarchy**: Clear information architecture with prominent critical alerts
- **Contextual**: Adaptive interfaces that respond to conversation states
- **Minimal**: Reduce visual noise to focus on essential clinical information

## Core Interface Requirements

### 1. Real-Time Conversation Monitoring Dashboard

**Purpose**: Central command center for monitoring active patient conversations

**Key Features**:
- Live conversation transcript with speaker identification
- Real-time conversation state indicators (listening, speaking, analyzing)
- Voice biomarker visualization during active calls
- Emergency escalation controls
- Intervention capability for clinicians

**Layout**: Primary dashboard with sidebar for active calls list

### 2. Voice Agent Configuration Panel

**Purpose**: Comprehensive setup for conversational AI personality and behavior

**Key Features**:
- Conversation flow designer with visual node editor
- AI personality configuration (tone, empathy level, response style)
- Knowledge base management for general and clinical topics
- Function calling setup for clinical actions
- Template library for different patient types

**Layout**: Multi-tab interface with live preview capability

### 3. Live Call Status Interface

**Purpose**: Real-time monitoring of individual patient conversations

**Key Features**:
- Conversation transcript with timestamps
- Speaker identification (patient vs AI agent)
- Conversation quality scoring in real-time
- Voice biomarker data visualization
- Clinical intervention controls

**Layout**: Split-screen with transcript and biomarker visualizations

### 4. Voice Biomarker Visualization

**Purpose**: Real-time and historical voice analysis for clinical insights

**Key Features**:
- Live waveform display during calls
- Jitter, shimmer, and HNR trend charts
- Clinical correlation indicators (BNP, NYHA class)
- Historical comparison with previous calls
- Automated alert thresholds

**Layout**: Multi-panel dashboard with time-series charts

### 5. Patient Engagement Metrics Dashboard

**Purpose**: Analytics and insights for conversation quality and patient engagement

**Key Features**:
- Conversation completion rates
- Patient satisfaction scores
- Engagement trend analysis
- Call duration and quality metrics
- Comparative analytics across patient cohorts

**Layout**: Card-based dashboard with interactive charts

## Component Hierarchy

### Application Structure

```
App
├── Navigation
│   ├── Primary Navigation
│   ├── User Profile
│   └── Emergency Alert Banner
├── Main Content Area
│   ├── Dashboard Layout
│   │   ├── Active Calls Sidebar
│   │   ├── Primary Content Panel
│   │   └── Quick Actions Panel
│   ├── Configuration Layout
│   │   ├── Navigation Tabs
│   │   ├── Configuration Forms
│   │   └── Preview Panel
│   └── Analytics Layout
│       ├── Metric Cards
│       ├── Chart Grid
│       └── Filter Controls
└── Footer
    ├── Status Indicators
    ├── Help Resources
    └── Compliance Info
```

### Core Components

#### 1. ConversationMonitor
```
ConversationMonitor
├── ConversationHeader
│   ├── PatientInfo
│   ├── CallStatus
│   └── ActionButtons
├── ConversationTranscript
│   ├── MessageBubble
│   ├── SpeakerIdentity
│   └── Timestamp
├── VoiceBiomarkers
│   ├── WaveformDisplay
│   ├── BiometricCharts
│   └── AlertIndicators
└── InterventionPanel
    ├── QuickActions
    ├── EscalationControls
    └── Notes
```

#### 2. AgentConfiguration
```
AgentConfiguration
├── PersonalitySettings
│   ├── ToneSlider
│   ├── EmpathyLevel
│   └── ResponseStyle
├── ConversationFlowDesigner
│   ├── NodeEditor
│   ├── FlowValidation
│   └── TestingPanel
├── KnowledgeBase
│   ├── TopicCategories
│   ├── ContentEditor
│   └── ValidationRules
└── FunctionCalling
    ├── ActionDefinitions
    ├── ParameterMapping
    └── ResponseHandling
```

#### 3. VoiceBiomarkerChart
```
VoiceBiomarkerChart
├── ChartContainer
│   ├── TimeSeriesChart
│   ├── ThresholdLines
│   └── DataPoints
├── LegendPanel
│   ├── MetricLabels
│   ├── ColorCoding
│   └── UnitDisplay
└── AlertOverlay
    ├── CriticalThresholds
    ├── TrendIndicators
    └── ClinicalCorrelations
```

## User Flows

### 1. Clinician Configuring Voice Agent

**User**: Clinical Administrator  
**Goal**: Set up conversational AI for heart failure patients  

**Flow**:
1. **Entry Point**: Navigate to Agent Configuration
2. **Personality Setup**: Configure tone, empathy, speaking pace
3. **Conversation Design**: Create conversation flow using visual editor
4. **Knowledge Base**: Add heart failure-specific information
5. **Testing**: Preview conversation with sample scenarios
6. **Deployment**: Activate agent for patient calls
7. **Monitoring**: Review initial performance metrics

**Key Screens**:
- Agent Configuration Dashboard
- Personality Settings Panel
- Conversation Flow Designer
- Knowledge Base Editor
- Testing & Preview Interface
- Deployment Confirmation

### 2. Live Monitoring of Patient Conversation

**User**: Clinical Staff Member  
**Goal**: Monitor ongoing patient call and intervene if needed  

**Flow**:
1. **Entry Point**: Active Calls Dashboard notification
2. **Call Selection**: Choose patient conversation to monitor
3. **Real-time Viewing**: Watch transcript and biomarkers live
4. **Assessment**: Evaluate conversation quality and patient responses
5. **Intervention Decision**: Determine if human intervention needed
6. **Action**: Either continue monitoring or escalate to clinician
7. **Documentation**: Add notes to patient record

**Key Screens**:
- Active Calls Dashboard
- Live Conversation Monitor
- Voice Biomarker Visualization
- Intervention Panel
- Patient Record Integration

### 3. Post-Call Analysis and Review

**User**: Clinician  
**Goal**: Review conversation quality and biomarker data  

**Flow**:
1. **Entry Point**: Completed Calls list
2. **Call Selection**: Choose patient conversation for review
3. **Transcript Review**: Read full conversation transcript
4. **Biomarker Analysis**: Examine voice analysis results
5. **Clinical Assessment**: Correlate findings with patient condition
6. **Documentation**: Update patient record with insights
7. **Follow-up Planning**: Schedule next call or clinical action

**Key Screens**:
- Completed Calls Dashboard
- Conversation Transcript Viewer
- Biomarker Analysis Panel
- Clinical Notes Interface
- Follow-up Scheduling

### 4. Emergency Escalation Workflow

**User**: AI System + Clinical Staff  
**Goal**: Escalate critical situations detected during conversation  

**Flow**:
1. **Trigger**: AI detects emergency keywords or critical biomarkers
2. **Alert Generation**: System creates high-priority alert
3. **Staff Notification**: On-call clinician receives immediate notification
4. **Call Assessment**: Clinician reviews conversation and patient data
5. **Intervention**: Direct call to patient or emergency services
6. **Documentation**: Record emergency response actions
7. **Follow-up**: Ensure patient safety and care coordination

**Key Screens**:
- Emergency Alert Modal
- Critical Patient Dashboard
- Emergency Response Panel
- Documentation Interface
- Care Coordination Tools

## Wireframes & Layouts

### 1. Main Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] HeartVoice Monitor          [Search] [Alerts] [Profile Menu] │
├─────────────────────────────────────────────────────────────────────┤
│ Navigation: [Dashboard] [Calls] [Agents] [Analytics] [Settings]     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────────────┐ ┌─────────────────────────────────────────────┐ │
│ │ Active Calls    │ │ Primary Content Area                        │ │
│ │                 │ │                                             │ │
│ │ ● Patient A     │ │ ┌─────────────────────────────────────────┐ │ │
│ │   Voice Call    │ │ │ Welcome, Dr. Smith                      │ │ │
│ │   3:42 active   │ │ │                                         │ │ │
│ │                 │ │ │ Today's Overview:                       │ │ │
│ │ ● Patient B     │ │ │ • 12 calls scheduled                    │ │ │
│ │   Scheduled     │ │ │ • 3 active conversations                │ │ │
│ │   14:30         │ │ │ • 2 pending reviews                     │ │ │
│ │                 │ │ └─────────────────────────────────────────┘ │ │
│ │ ● Patient C     │ │                                             │ │
│ │   Completed     │ │ ┌─────────────────────────────────────────┐ │ │
│ │   Needs Review  │ │ │ Recent Activity                         │ │ │
│ │                 │ │ │ [Chart: Call completion rates]          │ │ │
│ │ [View All]      │ │ │ [Chart: Voice biomarker trends]         │ │ │
│ └─────────────────┘ │ └─────────────────────────────────────────┘ │ │
│                     │                                             │ │
│                     └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ Status: Connected • Last Update: 14:23 • System Health: Excellent  │
└─────────────────────────────────────────────────────────────────────┘
```

### 2. Live Conversation Monitor

```
┌─────────────────────────────────────────────────────────────────────┐
│ Patient: Mary Johnson (ID: 12345) | Call Duration: 04:23 | Status: ● │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────────────────────────────┐ ┌─────────────────────────────┐ │
│ │ Conversation Transcript         │ │ Voice Biomarkers           │ │
│ │                                 │ │                             │ │
│ │ [14:20] AI: Good afternoon Mary,│ │ ┌─────────────────────────┐ │ │
│ │ how are you feeling today?      │ │ │ Jitter: 0.3% (Normal)  │ │ │
│ │                                 │ │ │ [||||||||||||░░░░░░░░]  │ │ │
│ │ [14:20] Patient: I'm feeling a  │ │ └─────────────────────────┘ │ │
│ │ bit short of breath today...    │ │                             │ │
│ │ ⚠️ Alert: Dyspnea mentioned     │ │ ┌─────────────────────────┐ │ │
│ │                                 │ │ │ Shimmer: 2.1% (⚠️ High) │ │ │
│ │ [14:21] AI: I understand that   │ │ │ [||||||||||||||||░░░░]  │ │ │
│ │ must be concerning. Can you...  │ │ └─────────────────────────┘ │ │
│ │                                 │ │                             │ │
│ │ [Currently: AI speaking...]     │ │ ┌─────────────────────────┐ │ │
│ │ ⭕ Speaking indicator           │ │ │ HNR: 12.3 dB (Normal)   │ │ │
│ │                                 │ │ │ [||||||||||||░░░░░░░░]  │ │ │
│ │                                 │ │ └─────────────────────────┘ │ │
│ └─────────────────────────────────┘ │                             │ │
│                                     │ [Live Waveform Display]     │ │
│ ┌─────────────────────────────────┐ │ ~~~~~~~~~~~~~~~~~~~~~~~~     │ │
│ │ Quick Actions                   │ │                             │ │
│ │ [🔊 Join Call] [⚠️ Escalate]   │ │                             │ │
│ │ [📝 Add Note] [🛑 End Call]    │ └─────────────────────────────┘ │
│ └─────────────────────────────────┘                               │
└─────────────────────────────────────────────────────────────────────┘
```

### 3. Agent Configuration Panel

```
┌─────────────────────────────────────────────────────────────────────┐
│ Agent Configuration | [Save Draft] [Preview] [Deploy] [Cancel]      │
├─────────────────────────────────────────────────────────────────────┤
│ Tabs: [Personality] [Conversation Flow] [Knowledge Base] [Functions] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────────────────────────────┐ ┌─────────────────────────────┐ │
│ │ Personality Settings            │ │ Live Preview                │ │
│ │                                 │ │                             │ │
│ │ Voice Tone:                     │ │ "Hi Mary, this is your      │ │
│ │ Warm ●────────○────── Professional │ │ HeartVoice assistant.       │ │
│ │                                 │ │ How are you feeling today?" │ │
│ │ Empathy Level:                  │ │                             │ │
│ │ Low ○────●────○────── High      │ │ [🔊 Play Sample]           │ │
│ │                                 │ │                             │ │
│ │ Speaking Pace:                  │ │ ┌─────────────────────────┐ │ │
│ │ Slow ○────●────○──── Fast       │ │ │ Voice Characteristics   │ │ │
│ │                                 │ │ │ • Tone: Warm, caring    │ │ │
│ │ Response Style:                 │ │ │ • Pace: Moderate        │ │ │
│ │ ☑️ Ask follow-up questions      │ │ │ • Style: Conversational │ │ │
│ │ ☑️ Use patient's name           │ │ └─────────────────────────┘ │ │
│ │ ☑️ Acknowledge emotions         │ │                             │ │
│ │ ☐ Use medical terminology       │ │ ┌─────────────────────────┐ │ │
│ │                                 │ │ │ Sample Conversations    │ │ │
│ │ Crisis Detection:               │ │ │ [▶️ Routine Check-in]   │ │ │
│ │ ☑️ Suicide risk keywords        │ │ │ [▶️ Symptom Report]     │ │ │
│ │ ☑️ Emergency symptoms           │ │ │ [▶️ Medication Review]  │ │ │
│ │ ☑️ Escalation triggers          │ │ └─────────────────────────┘ │ │
│ └─────────────────────────────────┘ └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### 4. Voice Biomarker Analytics Dashboard

```
┌─────────────────────────────────────────────────────────────────────┐
│ Voice Biomarker Analytics | Patient: Mary Johnson | Last 30 Days    │
├─────────────────────────────────────────────────────────────────────┤
│ Filters: [All Patients ▼] [30 Days ▼] [All Biomarkers ▼] [Export]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────────────────────────────┐ ┌─────────────────────────────┐ │
│ │ Jitter Analysis                 │ │ Clinical Correlations       │ │
│ │ [Time series chart showing      │ │                             │ │
│ │  jitter values over time with   │ │ ┌─────────────────────────┐ │ │
│ │  normal/warning/critical zones] │ │ │ BNP Correlation         │ │ │
│ │                                 │ │ │ r = 0.73 (Strong)       │ │ │
│ │ Current: 0.3% (Normal)          │ │ │ [Scatter plot showing   │ │ │
│ │ Trend: ↗️ Increasing            │ │ │  voice metrics vs BNP]  │ │ │
│ │ Avg: 0.25% | Peak: 0.4%        │ │ └─────────────────────────┘ │ │
│ └─────────────────────────────────┘ │                             │ │
│                                     │ ┌─────────────────────────┐ │ │
│ ┌─────────────────────────────────┐ │ │ NYHA Class Prediction   │ │ │
│ │ Shimmer Analysis                │ │ │ Current: Class II       │ │ │
│ │ [Time series chart for shimmer  │ │ │ Confidence: 85%         │ │ │
│ │  with trend lines and alerts]   │ │ │ [Progress indicator]    │ │ │
│ │                                 │ │ └─────────────────────────┘ │ │
│ │ Current: 2.1% (⚠️ Elevated)     │ │                             │ │
│ │ Trend: ↗️ Worsening             │ │ ┌─────────────────────────┐ │ │
│ │ Alert: Threshold exceeded       │ │ │ Risk Assessment         │ │ │
│ │ └─────────────────────────────────┘ │ │ Readmission Risk: 23%   │ │ │
│                                     │ │ Decompensation: Low     │ │ │
│ ┌─────────────────────────────────┐ │ │ [Risk meter display]    │ │ │
│ │ HNR (Harmonics-to-Noise Ratio) │ │ └─────────────────────────┘ │ │
│ │ [Chart showing HNR trends with  │ │                             │ │
│ │  clinical interpretation zones] │ │ [📊 Generate Report]       │ │ │
│ │                                 │ │ [📧 Share with Team]       │ │ │
│ │ Current: 12.3 dB (Normal)       │ │ [📋 Add to Patient Record] │ │ │
│ │ Trend: → Stable                 │ │                             │ │ │
│ └─────────────────────────────────┘ └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## Design System

### Color Palette

#### Primary Healthcare Colors
- **Teal Primary**: `#008B8B` - Primary actions, headers
- **Teal Light**: `#20B2AA` - Hover states, accents
- **Teal Dark**: `#006666` - Focus states, emphasis

#### Supporting Colors
- **Professional Blue**: `#4A90E2` - Information, links
- **Soft Green**: `#28A745` - Success, normal values
- **Warning Orange**: `#FFA500` - Caution, elevated values
- **Critical Red**: `#DC3545` - Alerts, emergency states
- **Neutral Gray**: `#6C757D` - Text, borders
- **Background**: `#F8F9FA` - Page backgrounds
- **White**: `#FFFFFF` - Cards, panels

#### Accessibility Compliance
- All color combinations meet WCAG AA contrast ratios (4.5:1 minimum)
- Critical information uses shape/icon + color encoding
- Color-blind friendly palette with sufficient differentiation

### Typography

#### Font Family
- **Primary**: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- **Monospace**: `"SF Mono", Monaco, "Cascadia Code", monospace` (for data display)

#### Typography Scale
```css
/* Headers */
h1: 32px/1.2, font-weight: 600
h2: 24px/1.3, font-weight: 600
h3: 20px/1.4, font-weight: 500
h4: 16px/1.4, font-weight: 500

/* Body Text */
body: 14px/1.5, font-weight: 400
large: 16px/1.5, font-weight: 400
small: 12px/1.4, font-weight: 400
caption: 11px/1.3, font-weight: 500

/* UI Elements */
button: 14px/1.2, font-weight: 500
label: 13px/1.3, font-weight: 500
input: 14px/1.4, font-weight: 400
```

### Component Specifications

#### Buttons
```css
/* Primary Button */
.btn-primary {
  background: #008B8B;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  min-height: 36px;
}

/* Secondary Button */
.btn-secondary {
  background: white;
  color: #008B8B;
  border: 1px solid #008B8B;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  min-height: 36px;
}

/* Emergency Button */
.btn-emergency {
  background: #DC3545;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  min-height: 36px;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
}
```

#### Cards & Panels
```css
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #E9ECEF;
  padding: 16px;
}

.panel-header {
  border-bottom: 1px solid #E9ECEF;
  padding-bottom: 12px;
  margin-bottom: 16px;
}
```

#### Status Indicators
```css
.status-active {
  background: #28A745;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.status-warning {
  background: #FFA500;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.status-critical {
  background: #DC3545;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  animation: pulse 2s infinite;
}
```

### Iconography

#### Icon Library
- **Primary**: Lucide React icons for consistency
- **Medical**: Custom healthcare-specific icons
- **Size Scale**: 16px, 20px, 24px, 32px
- **Style**: Outlined style for better accessibility

#### Critical Icons
- 🔊 **Audio/Voice**: Speaker, microphone, waveform
- ⚠️ **Alerts**: Warning triangle, exclamation, bell
- 🫀 **Medical**: Heart, stethoscope, medical cross
- 📈 **Analytics**: Charts, trends, metrics
- 👤 **Users**: Person, team, clinician
- 🔧 **Settings**: Gear, sliders, configuration

### Layout Grid

#### Responsive Breakpoints
```css
/* Mobile First Approach */
xs: 0px      /* Mobile portrait */
sm: 576px    /* Mobile landscape */
md: 768px    /* Tablet */
lg: 992px    /* Desktop */
xl: 1200px   /* Large desktop */
xxl: 1400px  /* Extra large desktop */
```

#### Grid System
- **12-column grid** with flexible gutters
- **16px base unit** for spacing consistency
- **Responsive spacing**: 8px, 16px, 24px, 32px, 48px
- **Max width**: 1200px for main content areas

## Accessibility & Compliance

### WCAG AA Compliance

#### Visual Accessibility
- **Contrast Ratios**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Color Independence**: All information conveyed with icons + color
- **Text Scaling**: Support up to 200% zoom without horizontal scrolling
- **Focus Indicators**: Clear, high-contrast focus rings on all interactive elements

#### Interaction Accessibility
- **Keyboard Navigation**: Full functionality via keyboard alone
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Touch Targets**: Minimum 44px tap targets for mobile
- **Motion**: Respect prefers-reduced-motion settings

#### Content Accessibility
- **Plain Language**: Clear, concise clinical terminology
- **Error Handling**: Descriptive error messages with correction guidance
- **Time Limits**: Adjustable or extendable timeouts for forms
- **Status Updates**: Live regions for real-time conversation updates

### HIPAA Compliance Design

#### Privacy by Design
- **Data Minimization**: Only display necessary patient information
- **Access Controls**: Role-based UI hiding/showing based on permissions
- **Audit Trails**: Visual indicators for logged actions
- **Session Management**: Clear session timeout warnings

#### Security Visual Cues
- **Encryption Status**: Visual indicators for secure connections
- **PHI Handling**: Clear labeling of protected health information
- **Access Logs**: Visible audit trail access for users
- **Data Retention**: Clear indication of temporary vs permanent data

### Healthcare Environment Considerations

#### Clinical Workflow Integration
- **Interruption Handling**: Preserve state during clinical interruptions
- **Quick Actions**: Fast access to emergency and urgent functions
- **Context Switching**: Seamless movement between patients and tasks
- **Documentation**: Streamlined note-taking and record updates

#### Multi-User Environment
- **Shared Workstations**: Clear user identification and quick user switching
- **Role-Based Views**: Customized interfaces for different clinical roles
- **Collaboration**: Visual indicators for team-based decision making
- **Handoff Protocols**: Clear patient transfer and responsibility indication

## Technical Implementation

### Component Architecture

#### React Component Structure
```tsx
// Core layout components
<ApplicationShell>
  <NavigationHeader />
  <SidebarNavigation />
  <MainContent>
    <RouteRenderer />
  </MainContent>
  <StatusFooter />
</ApplicationShell>

// Dashboard-specific components
<ConversationDashboard>
  <ActiveCallsSidebar />
  <ConversationMonitor>
    <ConversationTranscript />
    <VoiceBiomarkerPanel />
    <InterventionControls />
  </ConversationMonitor>
</ConversationDashboard>

// Configuration components
<AgentConfiguration>
  <ConfigurationTabs />
  <PersonalitySettings />
  <ConversationFlowDesigner />
  <LivePreviewPanel />
</AgentConfiguration>
```

#### State Management
```tsx
// Global application state
interface AppState {
  user: UserProfile
  activeCalls: ActiveCall[]
  notifications: Notification[]
  systemStatus: SystemHealth
}

// Conversation monitoring state
interface ConversationState {
  currentCall: CallDetails
  transcript: TranscriptMessage[]
  biomarkers: VoiceBiomarker[]
  interventionOptions: InterventionAction[]
}

// Agent configuration state
interface AgentConfigState {
  personality: PersonalitySettings
  conversationFlow: FlowNode[]
  knowledgeBase: KnowledgeItem[]
  functionCalls: FunctionDefinition[]
}
```

### Real-Time Features

#### WebSocket Integration
```tsx
// Real-time conversation updates
const useConversationWebSocket = (callId: string) => {
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([])
  const [biomarkers, setBiomarkers] = useState<VoiceBiomarker[]>([])
  
  useEffect(() => {
    const ws = new WebSocket(`wss://api.heartvoice.com/calls/${callId}/stream`)
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      switch (data.type) {
        case 'transcript_update':
          setTranscript(prev => [...prev, data.message])
          break
        case 'biomarker_update':
          setBiomarkers(prev => [...prev, data.biomarker])
          break
        case 'intervention_required':
          showInterventionAlert(data.alert)
          break
      }
    }
    
    return () => ws.close()
  }, [callId])
  
  return { transcript, biomarkers }
}
```

#### Real-Time UI Updates
```tsx
// Live status indicators
const LiveStatusIndicator = ({ status }: { status: CallStatus }) => {
  const statusConfig = {
    speaking: { color: 'green', icon: 'Mic', animation: 'pulse' },
    listening: { color: 'blue', icon: 'Ear', animation: 'bounce' },
    analyzing: { color: 'orange', icon: 'Brain', animation: 'spin' },
    completed: { color: 'gray', icon: 'Check', animation: 'none' }
  }
  
  const config = statusConfig[status]
  
  return (
    <div className={`status-indicator ${config.animation}`}>
      <Icon name={config.icon} color={config.color} />
      <span>{status.toUpperCase()}</span>
    </div>
  )
}
```

### Performance Optimization

#### Lazy Loading
```tsx
// Route-based code splitting
const ConversationDashboard = lazy(() => import('./ConversationDashboard'))
const AgentConfiguration = lazy(() => import('./AgentConfiguration'))
const Analytics = lazy(() => import('./Analytics'))

// Component-based lazy loading for heavy charts
const VoiceBiomarkerChart = lazy(() => import('./VoiceBiomarkerChart'))
```

#### Virtualization for Large Data Sets
```tsx
// Virtual scrolling for conversation transcripts
import { FixedSizeList as List } from 'react-window'

const ConversationTranscript = ({ messages }: { messages: TranscriptMessage[] }) => {
  const Row = ({ index, style }: { index: number, style: React.CSSProperties }) => (
    <div style={style}>
      <MessageBubble message={messages[index]} />
    </div>
  )
  
  return (
    <List
      height={600}
      itemCount={messages.length}
      itemSize={60}
      width="100%"
    >
      {Row}
    </List>
  )
}
```

### Chart and Visualization Specifications

#### Voice Biomarker Charts
```tsx
// Time series chart for voice biomarkers
const VoiceBiomarkerChart = ({ data, metric }: ChartProps) => {
  const chartConfig = {
    jitter: {
      yAxis: { domain: [0, 2], unit: '%' },
      thresholds: { normal: 0.5, warning: 1.0, critical: 1.5 },
      color: '#008B8B'
    },
    shimmer: {
      yAxis: { domain: [0, 5], unit: '%' },
      thresholds: { normal: 1.5, warning: 2.5, critical: 3.5 },
      color: '#4A90E2'
    },
    hnr: {
      yAxis: { domain: [5, 25], unit: 'dB' },
      thresholds: { normal: 15, warning: 12, critical: 10 },
      color: '#28A745'
    }
  }
  
  const config = chartConfig[metric]
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="timestamp" />
        <YAxis domain={config.yAxis.domain} />
        <Line 
          dataKey="value" 
          stroke={config.color}
          strokeWidth={2}
          dot={{ r: 3 }}
        />
        <ReferenceLine 
          y={config.thresholds.warning} 
          stroke="#FFA500" 
          strokeDasharray="5 5"
          label="Warning"
        />
        <ReferenceLine 
          y={config.thresholds.critical} 
          stroke="#DC3545" 
          strokeDasharray="5 5"
          label="Critical"
        />
        <Tooltip formatter={(value) => [`${value}${config.yAxis.unit}`, metric]} />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

## Success Metrics

### User Experience Metrics

#### Usability Metrics
- **Task Completion Rate**: >95% for primary workflows
- **Time to Complete**: <30 seconds for routine tasks
- **Error Rate**: <2% for critical actions
- **User Satisfaction**: >4.5/5 rating
- **Accessibility Score**: 100% WCAG AA compliance

#### Clinical Workflow Metrics
- **Call Monitoring Efficiency**: 50% reduction in time to identify issues
- **Intervention Response Time**: <30 seconds from alert to action
- **Documentation Time**: 40% reduction in post-call documentation
- **Context Switching**: <5 seconds between patient records

### Technical Performance Metrics

#### Application Performance
- **Page Load Time**: <2 seconds initial load
- **Component Render Time**: <100ms for updates
- **WebSocket Latency**: <200ms for real-time updates
- **Chart Rendering**: <500ms for complex visualizations
- **Mobile Performance**: 90+ Lighthouse score

#### System Reliability
- **Uptime**: >99.9% availability
- **Error Rate**: <0.1% for critical functions
- **Data Accuracy**: 100% for patient information display
- **Security**: Zero HIPAA compliance violations

### Clinical Impact Metrics

#### Patient Engagement
- **Call Completion Rate**: >85% (improved from current baseline)
- **Patient Satisfaction**: >4.2/5 rating
- **Conversation Quality**: >80% meaningful interaction score
- **Early Detection**: 25% increase in early symptom identification

#### Clinical Outcomes
- **Readmission Reduction**: 30% decrease in 30-day readmissions
- **Response Time**: 50% faster clinical response to deterioration
- **Care Quality**: 20% improvement in care plan adherence
- **Staff Efficiency**: 25% reduction in manual monitoring time

### Implementation Success Criteria

#### Adoption Metrics
- **User Onboarding**: <1 hour to productive use
- **Feature Adoption**: >80% utilization of core features within 30 days
- **Training Time**: 50% reduction from current system
- **Support Tickets**: <1% of users require help after training

#### Business Value
- **Cost per Patient**: <$10/month monitoring cost
- **ROI**: 10:1 return on investment from readmission prevention
- **Scalability**: Support 10,000+ patients without performance degradation
- **Integration**: Seamless EHR integration with <1% data sync errors

---

**Document Status**: Ready for Development  
**Next Steps**: Begin React component implementation with shadcn/ui integration  
**Review Cycle**: Weekly design reviews with clinical stakeholders  
**Validation**: User testing with healthcare professionals before production deployment