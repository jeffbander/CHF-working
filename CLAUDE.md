# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **HeartVoice Monitor** - a clinical voice biomarker platform for heart failure monitoring. The web application serves as the control center for managing AI-powered voice agents that conduct automated patient calls, analyze voice biomarkers, and provide clinical insights to healthcare providers.

## Project Status

**Current Phase**: Planning and requirements gathering
- Product requirements are documented in `prompts/create-prd.txt`
- No implementation code exists yet - this is a greenfield project
- Target delivery: 20 sprints (40 weeks)

## Core Functionality Requirements

The HeartVoice Monitor platform provides:

1. **Patient Management**: Web interface for managing heart failure patient rosters with clinical data
2. **Voice Agent Configuration**: Web-based configuration panel for AI voice agents and conversation flows
3. **Automated Voice Calls**: Integration with telephony services (Twilio) and voice AI (ElevenLabs)
4. **Voice Biomarker Analysis**: Real-time analysis of acoustic features indicating heart failure progression
5. **Clinical Dashboard**: Risk scoring, trend analysis, and predictive analytics for clinicians
6. **EHR Integration**: FHIR-compliant integration with Epic, Cerner, and other electronic health records

## Technical Architecture Decisions

### Frontend Stack
- **Framework**: React 18+ with TypeScript
- **UI Library**: Material-UI or Ant Design for clinical interfaces
- **State Management**: Redux Toolkit or Zustand
- **Charts**: Recharts or D3.js for biomarker visualizations
- **Real-time**: WebSocket for live call status updates

### Backend Stack
- **Framework**: Node.js with Express or FastAPI (Python)
- **Database**: PostgreSQL for clinical data storage
- **Cache**: Redis for session management and performance
- **Queue**: Bull/RabbitMQ for call scheduling and processing
- **File Storage**: AWS S3 for temporary audio files

### Voice AI Integration
- **Primary**: ElevenLabs Conversational AI API
- **Fallback**: Vapi.ai or Retell AI
- **Telephony**: Twilio Programmable Voice
- **Transcription**: Deepgram or AssemblyAI for speech-to-text

### Key Integrations
- **EHR Systems**: Epic FHIR, Cerner SMART on FHIR
- **Voice Services**: ElevenLabs, Twilio
- **Monitoring**: Datadog for application performance
- **Notifications**: SendGrid for email alerts

## Compliance & Security Requirements

### HIPAA Compliance
- Business Associate Agreements (BAAs) with all vendors
- AES-256 encryption at rest, TLS 1.3 in transit
- Field-level encryption for PHI (Protected Health Information)
- RBAC (Role-Based Access Control) with MFA
- Comprehensive audit logging and breach notification

### FDA Considerations
- Software as Medical Device (SaMD) classification
- Potential 510(k) submission for Class II medical device
- Clinical validation and Quality Management System (QMS)

## Development Roadmap

### Phase 1: Foundation (Sprints 1-4)
- User authentication and authorization system
- Patient data model and CRUD operations
- Basic dashboard layout and navigation
- API gateway setup and documentation

### Phase 2: Voice Integration (Sprints 5-8)
- Twilio phone system integration
- ElevenLabs conversational AI setup
- Call scheduling and queue management
- Basic voice analysis pipeline

### Phase 3: Clinical Features (Sprints 9-12)
- Voice biomarker analysis engine
- Risk scoring algorithms and predictive models
- Clinical alert system and notifications
- Trend visualizations and reporting

### Phase 4: EHR Integration (Sprints 13-16)
- Epic FHIR connection and data sync
- Clinical documentation workflows
- Provider dashboard integration
- Care team collaboration features

### Phase 5: Production Ready (Sprints 17-20)
- Performance optimization and scaling
- Security hardening and penetration testing
- User acceptance testing with clinical partners
- Documentation and training materials

## Success Metrics

### Technical KPIs
- System uptime: >99.9%
- Page load speed: <2 seconds
- API response time: <200ms (p95)
- Call completion rate: >80%
- Voice analysis accuracy: >85%

### Clinical KPIs
- 30-day readmission reduction: >30%
- Early fluid detection: >85% sensitivity
- False positive rate: <15%
- Clinician satisfaction: >4/5 rating

### Business KPIs
- User adoption: 50% target clinicians in 6 months
- Cost per patient monitoring: <$10/month
- ROI from readmission prevention: 10:1 target

## Development Guidelines

When implementing this application:

1. **Start with security**: Implement HIPAA-compliant authentication and authorization first
2. **Build modular services**: Separate patient management, voice processing, and clinical analytics
3. **Implement comprehensive logging**: All PHI access must be audited
4. **Design for scalability**: Support 1,000+ concurrent clinicians and 10,000+ patients
5. **Prioritize reliability**: Healthcare systems require 99.9%+ uptime
6. **Follow clinical workflows**: Design UI/UX around actual clinical decision-making processes

## Directory Structure
```
heartvoice-monitor/
├── .claude/              # Claude Code configuration and hooks
├── docs/                # Technical and clinical documentation
├── prompts/             # PRD and requirements documents
├── frontend/            # React TypeScript web application
├── backend/             # API server and business logic
├── voice-engine/        # Voice analysis and AI integration
├── database/            # PostgreSQL schemas and migrations
├── infrastructure/      # Docker, K8s, and deployment configs
└── CLAUDE.md           # This file
```

## MVP Scope

Focus on these features for initial release:
- Basic patient roster management
- Simple voice call scheduling
- ElevenLabs integration for automated calls
- Core voice biomarker analysis (jitter, shimmer, HNR)
- Risk score calculation and trending
- Clinical dashboard with patient list and alerts

Out of scope for MVP:
- Advanced machine learning models
- Multi-language support
- Real-time collaboration features
- Mobile applications
- Advanced analytics and reporting
- Integration with multiple EHR systems simultaneously

## Testing Strategy

- **Unit Tests**: Jest/Vitest for business logic
- **Integration Tests**: API endpoints and database operations  
- **E2E Tests**: Cypress for critical clinical workflows
- **Voice Testing**: Automated testing of voice AI interactions
- **Security Testing**: OWASP compliance and penetration testing
- **Clinical Validation**: Testing with real clinicians and simulated patient data

## Performance Targets

- **Web Application**: <2s page load, <200ms API response
- **Voice Processing**: <1.5s end-to-end call latency
- **Database**: <100ms query response times
- **Concurrent Users**: Support 1,000+ simultaneous clinicians
- **Patient Capacity**: 50,000+ patients per deployment

## Important Reminders

- All development must maintain HIPAA compliance
- Voice recordings are temporary and must be deleted after analysis
- Clinical alerts require immediate notification pathways
- Patient consent is required for all voice interactions
- All changes affecting clinical workflows require stakeholder approval