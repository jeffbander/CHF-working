# HeartVoice Monitor

A clinical voice biomarker platform for heart failure monitoring built with Next.js 15, TypeScript, and shadcn/ui components.

## Overview

HeartVoice Monitor is a healthcare application that uses AI-powered voice analysis to monitor heart failure patients remotely. The platform conducts automated voice calls, analyzes speech patterns for clinical biomarkers, and provides real-time risk assessment to healthcare providers.

## Key Features

- **🏥 Clinical Dashboard**: Risk-based patient monitoring with real-time alerts
- **📞 Automated Voice Calls**: AI-powered patient interactions via ElevenLabs and Twilio
- **🧠 Voice Biomarker Analysis**: Advanced speech processing for clinical insights
- **🔊 Real-time Risk Assessment**: Continuous monitoring with intelligent alerting
- **🔒 HIPAA Compliant**: Privacy-first architecture with PHI protection
- **⚡ Modern UI**: Healthcare-appropriate design with accessibility compliance

## Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI Components**: shadcn/ui with Tailwind CSS
- **Voice AI**: ElevenLabs Conversational AI
- **Telephony**: Twilio Programmable Voice
- **AI Analysis**: OpenAI GPT-4o for clinical insights
- **Architecture**: RESTful APIs with TypeScript services

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key (for voice analysis)
- ElevenLabs API key (for voice agents)
- Twilio account (for telephony)

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd heartvoice-monitor
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open the application:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Configuration

Key environment variables needed:

```env
# AI Services
OPENAI_API_KEY=sk-your-openai-key
ELEVENLABS_API_KEY=your-elevenlabs-key
ELEVENLABS_VOICE_ID=your-voice-id

# Telephony
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_FROM_NUMBER=+1234567890
```

## Application Structure

```
heartvoice-monitor/
├── src/
│   ├── app/                 # Next.js 15 App Router
│   │   ├── api/            # API routes
│   │   │   ├── patients/   # Patient management
│   │   │   └── dashboard/  # Dashboard data
│   │   └── page.tsx        # Main dashboard page
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui components
│   │   └── clinical/      # Clinical-specific components
│   ├── services/          # Business logic
│   │   ├── openai-service.ts      # HIPAA-compliant AI analysis
│   │   ├── voice-processing-service.ts  # Voice biomarker processing
│   │   └── patient-service.ts     # Patient management
│   ├── types/             # TypeScript definitions
│   └── lib/               # Utilities
├── .env.example           # Environment template
└── README.md             # This file
```

## Core Components

### Clinical Dashboard
- **Risk Overview Cards**: Population health metrics
- **Critical Alerts Panel**: Immediate attention notifications
- **Patient Table**: Comprehensive patient roster with risk levels
- **Real-time Updates**: Live data refresh and status monitoring

### Voice Processing Pipeline
1. **Call Initiation**: Automated scheduling via Twilio
2. **AI Conversation**: Natural language interaction via ElevenLabs
3. **Biomarker Extraction**: Voice analysis for clinical indicators
4. **Risk Calculation**: Machine learning-based risk scoring
5. **Clinical Alerts**: Automatic notification for high-risk patients

### HIPAA Compliance
- **PHI Protection**: De-identification before external API processing
- **Audit Logging**: Comprehensive access and action tracking
- **Data Encryption**: AES-256 at rest, TLS 1.3 in transit
- **Access Controls**: Role-based permissions and authentication

## API Endpoints

### Patient Management
- `GET /api/patients` - List all patients with filtering
- `GET /api/patients/[id]` - Get individual patient details
- `POST /api/patients` - Create new patient enrollment
- `PUT /api/patients/[id]` - Update patient information

### Dashboard
- `GET /api/dashboard` - Get dashboard overview data
- `GET /api/dashboard/alerts` - Get critical alerts
- `GET /api/dashboard/metrics` - Get population health metrics

## Clinical Features

### Risk Assessment
- **Low Risk (0-34)**: Routine monitoring, weekly calls
- **Medium Risk (35-59)**: Increased attention, bi-weekly calls  
- **High Risk (60-79)**: Daily monitoring, clinical review
- **Critical Risk (80-100)**: Immediate intervention required

### Voice Biomarkers
- **Jitter**: Cycle-to-cycle frequency variation (cardiac stress indicator)
- **Shimmer**: Amplitude variation (respiratory compromise indicator)
- **HNR**: Harmonics-to-noise ratio (voice quality degradation)
- **F0**: Fundamental frequency (speaking pitch changes)
- **Spectral Slope**: Vocal tract characteristic changes

### Clinical Workflows
- **Cardiologists**: Risk prioritization and clinical decision support
- **Nurses/Care Coordinators**: Patient population management
- **Administrators**: Program oversight and performance metrics

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint code analysis
- `npm run type-check` - TypeScript type checking

### Code Organization

- **Services**: Business logic with proper error handling
- **Components**: Reusable UI components with TypeScript props
- **Types**: Comprehensive TypeScript definitions for clinical data
- **API Routes**: RESTful endpoints following Next.js conventions

## Production Deployment

### Requirements
- Node.js 18+ runtime environment
- PostgreSQL database for patient data
- Redis cache for performance optimization
- SSL certificates for HTTPS (required for HIPAA)

### Security Considerations
- Enable HTTPS in production environments
- Configure proper CORS policies
- Set up comprehensive audit logging
- Implement rate limiting for API endpoints
- Use secure session management

## Compliance & Regulatory

### HIPAA Compliance
- Business Associate Agreements (BAAs) with all vendors
- Complete audit trails for all patient data access
- Encrypted data transmission and storage
- Role-based access controls with MFA

### FDA Considerations
- Voice biomarker algorithms designed for potential Class II device classification
- Quality management system (QMS) ready architecture
- Clinical validation pathways for regulatory submission

## Support & Documentation

### Clinical Documentation
- Voice biomarker interpretation guidelines
- Risk scoring methodology and clinical thresholds
- Patient enrollment and consent management procedures
- Alert escalation protocols for clinical teams

### Technical Documentation
- API reference with example requests/responses
- Component library documentation with usage examples
- Deployment guides for healthcare environments
- Security configuration and compliance checklists

## License

This is proprietary healthcare software designed for clinical environments. All rights reserved.

## Contact

For technical support or clinical inquiries, please contact the development team.

---

Built with ❤️ for healthcare providers improving heart failure patient outcomes.
