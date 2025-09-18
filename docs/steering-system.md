# Call Steering System

The HeartVoice Monitor Call Steering System enables real-time guidance and control of AI-powered voice conversations with heart failure patients. This system allows clinicians to monitor, intervene, and guide voice interactions to ensure optimal patient care and safety.

## Overview

The steering system provides:

- **Real-time Call Monitoring**: Live metrics and biomarker analysis during calls
- **Dynamic Conversation Control**: Ability to guide conversation flow and inject prompts
- **Emergency Escalation**: Immediate intervention capabilities for critical situations
- **Conversation Flow Management**: Pre-defined conversation paths and templates
- **Clinical Decision Support**: Context-aware suggestions and risk indicators

## Architecture

### Core Components

#### 1. Steering Control Panel (`SteeringControlPanel.tsx`)
Primary interface for controlling individual call sessions:
- Quick action buttons for common interventions
- Real-time prompts and conversation guidance
- Live metrics display (voice quality, stress level, cooperation)
- Voice biomarker monitoring (jitter, shimmer, HNR)
- Emergency escalation controls

#### 2. Steering Dashboard (`SteeringDashboard.tsx`)
System-wide overview and management:
- Active sessions monitoring
- Emergency escalations queue
- Recent actions history
- System health status
- Performance analytics

#### 3. Steering Service (`steering-service.ts`)
Real-time state management and communication:
- WebSocket connection for live updates
- Session lifecycle management
- Action execution and tracking
- Emergency escalation handling
- Event-driven architecture

#### 4. Type Definitions (`types/steering.ts`)
Comprehensive type system covering:
- Steering sessions and actions
- Conversation flows and templates
- Emergency escalations
- Real-time metrics and biomarkers
- Dashboard data structures

## Key Features

### Real-time Call Control

#### Quick Actions
- **Ask About Symptoms**: Inject symptom assessment questions
- **Check Medications**: Prompt medication compliance review
- **Breathing Assessment**: Guide to respiratory evaluation
- **Skip to Summary**: Fast-forward to conversation conclusion

#### Real-time Prompts
- **Speak Slower**: Improve clarity and comprehension
- **Be More Empathetic**: Enhance emotional connection
- **Repeat Question**: Clarify misunderstood prompts
- **Wait Longer**: Allow more response time

### Conversation Flow Management

#### Pre-defined Flows
1. **Symptom Assessment**: Comprehensive heart failure symptom evaluation
2. **Medication Review**: Adherence checking and side effect monitoring
3. **Emergency Protocol**: Rapid assessment for urgent situations
4. **Routine Follow-up**: Standard check-in procedures

#### Flow Triggers
- Risk level thresholds
- Symptom severity indicators
- Manual clinician intervention
- Time-based transitions

### Emergency Escalation

#### Severity Levels
- **Critical**: Emergency services, immediate intervention
- **High**: Clinical supervisor notification, human takeover
- **Medium**: Care team alerts, follow-up scheduling
- **Low**: Documentation, routine follow-up

#### Escalation Actions
- **Emergency Services**: 911 dispatch and EMS notification
- **Human Takeover**: Transfer to live clinician
- **Clinical Alert**: Notify care team via dashboard
- **Immediate Callback**: Priority scheduling for clinician call

### Real-time Metrics

#### Voice Quality Indicators
- **Voice Quality**: Overall clarity and intelligibility (0-100%)
- **Stress Level**: Detected vocal stress indicators (0-100%)
- **Cooperation Level**: Patient engagement and responsiveness (0-100%)

#### Voice Biomarkers
- **Jitter**: Voice stability measure (milliseconds)
- **Shimmer**: Amplitude variation percentage
- **HNR (Harmonics-to-Noise Ratio)**: Voice clarity (dB)
- **Speech Rate**: Words per minute
- **Pause Duration**: Average pause length (seconds)

#### Risk Indicators
Automatic detection of:
- High stress levels
- Poor voice quality
- Low cooperation
- Elevated biomarker values
- Manual escalation flags

## API Endpoints

### Session Management
```
GET    /api/steering/sessions        # List all sessions
POST   /api/steering/sessions        # Create new session
```

### Action Execution
```
POST   /api/steering/actions         # Execute steering action
GET    /api/steering/actions         # Get action history
```

### Emergency Escalation
```
GET    /api/steering/escalations     # List pending escalations
POST   /api/steering/escalations     # Create escalation
PATCH  /api/steering/escalations     # Update/resolve escalation
```

### Dashboard Data
```
GET    /api/steering/dashboard       # Get dashboard overview
POST   /api/steering/dashboard       # Dashboard actions (refresh, etc.)
```

## Usage Guide

### Starting a Steering Session

1. Navigate to `/steering` in the HeartVoice Monitor
2. Click "New Session" to create a steering session
3. Enter patient ID when prompted
4. Session appears in active sessions list
5. Click "View" to open control panel

### Monitoring Active Calls

1. **Dashboard Tab**: Overview of all active sessions
2. **Control Panel Tab**: Detailed control for selected session
3. **Live Metrics**: Real-time voice quality and biomarkers
4. **Risk Indicators**: Automated alerts for concerning patterns

### Executing Steering Actions

1. Select session from dashboard
2. Switch to "Control Panel" tab
3. Choose appropriate action category:
   - **Quick Actions**: Common interventions
   - **Real-time Prompts**: Voice agent guidance
   - **Conversation Flows**: Path changes
   - **Emergency**: Critical escalations

### Handling Emergencies

1. Monitor for automatic risk indicators
2. Use "Emergency" tab for critical situations
3. Choose appropriate escalation level
4. System automatically notifies relevant parties
5. Track resolution in escalations queue

## Configuration

### WebSocket Connection
Default configuration connects to:
- Development: `ws://localhost:3001`
- Production: `wss://your-production-websocket-url`

### Conversation Flow Templates
Located in `steering-service.ts`:
- Symptom Assessment Flow
- Medication Review Flow
- Emergency Protocol Flow

Customize flows by modifying the service template methods.

### Risk Thresholds
Configurable thresholds for automatic risk detection:
- Stress Level: >70% triggers alert
- Voice Quality: <50% triggers alert
- Cooperation: <40% triggers alert
- Biomarker limits: Jitter >8ms, HNR <12dB

## Development

### Adding New Steering Actions

1. Update `SteeringAction` type in `types/steering.ts`
2. Add action handling in `steering-service.ts`
3. Implement UI controls in `SteeringControlPanel.tsx`
4. Add API route handling in `/api/steering/actions/route.ts`

### Creating Custom Conversation Flows

1. Define flow structure using `ConversationFlow` type
2. Add to template list in `steering-service.ts`
3. Implement flow selection UI
4. Test with conversation steps and triggers

### Adding New Metrics

1. Extend `CallMetrics` interface
2. Update real-time metrics collection
3. Add visualization to control panel
4. Configure risk thresholds

## Security Considerations

- All steering actions are logged with timestamps
- Emergency escalations trigger immediate notifications
- Patient data is handled according to HIPAA requirements
- WebSocket connections use secure protocols in production
- API endpoints validate user authentication and authorization

## Testing

### Demo Mode
Development environment includes demo session creation:
- Simulated patient conversations
- Mock voice metrics and biomarkers
- Test escalation workflows
- Practice steering interventions

### Integration Testing
- Test WebSocket connectivity
- Verify API endpoint responses
- Validate emergency escalation flows
- Check real-time metric updates

## Troubleshooting

### Common Issues

**WebSocket Disconnection**
- Check network connectivity
- Verify WebSocket server status
- Restart application if needed
- Monitor connection status indicator

**Missing Metrics**
- Ensure voice processing service is running
- Check biomarker extraction pipeline
- Verify API endpoint connectivity
- Review error logs for processing issues

**Escalation Failures**
- Confirm notification service configuration
- Check emergency contact information
- Verify care team notification settings
- Test escalation severity routing

### Monitoring

- Dashboard system status indicators
- WebSocket connection status
- Real-time metric updates
- Error logging and alerting

## Future Enhancements

- Multi-language conversation flow support
- Advanced machine learning risk prediction
- Integration with additional EHR systems
- Mobile application for steering controls
- Advanced analytics and reporting
- Custom workflow builder interface