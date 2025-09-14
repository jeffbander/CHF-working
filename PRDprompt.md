# PRD Creation Prompt for HeartVoice Monitor Voice Agent Upgrade

Based on extensive research of 2024 voice AI technologies, clinical voice biomarker studies, and healthcare conversational AI implementations, here's a detailed prompt to help you create a Product Requirements Document for upgrading your voice agent system:

---

**PROMPT FOR PRD CREATION:**

Create a comprehensive Product Requirements Document (PRD) for upgrading the HeartVoice Monitor voice agent system from basic Twilio TwiML to an advanced conversational AI platform. The document should address the following requirements and specifications:

## 1. EXECUTIVE SUMMARY
Define the transition from the current robotic TwiML "alice" voice to a natural, empathetic conversational AI system that can:
- Conduct natural health assessments through engaging conversation
- Seamlessly switch between general topics (weather, hobbies, current events) and clinical questions
- Extract voice biomarkers during natural speech rather than forced recordings
- Build patient rapport to increase engagement and compliance

## 2. TECHNICAL ARCHITECTURE

**Primary Solution: OpenAI Realtime API Integration**
- WebSocket-based architecture connecting Twilio Media Streams to OpenAI Realtime API
- Model: gpt-4o-realtime (latest version with 82.8% reasoning accuracy)
- Latency: 232-320ms response time for natural conversation flow
- Architecture: Patient Phone → Twilio → Media Stream WebSocket → Node.js Proxy Server → OpenAI Realtime WebSocket → GPT-4o

**Fallback Solution: ElevenLabs Conversational AI**
- Orchestration platform with TTS/STT pipeline
- 3,000+ voice options with voice cloning capability
- Support for 32 languages
- Flexible LLM selection (can use OpenAI, Claude, Gemini)

## 3. VOICE BIOMARKER EXTRACTION

Specify requirements for extracting clinically validated acoustic features during natural conversation:
- **Primary biomarkers**: Jitter, shimmer, harmonics-to-noise ratio (HNR)
- **Speech characteristics**: Phonation stability, voice quality, speech rate, phrase length
- **Clinical correlations**: Map to BNP levels, NYHA class, pulmonary congestion indicators
- **Processing**: Real-time extraction during conversation without interrupting flow
- **Validation**: Based on 2024 clinical studies showing 32% increased mortality risk per SD increase

## 4. CONVERSATION DESIGN

**Engagement Strategy:**
- Start with warm, personalized greeting using patient's name and context
- Begin with non-threatening general topics to establish rapport
- Gradually transition to health-related questions
- Use active listening and empathetic responses
- Maintain conversational memory throughout the call

**Knowledge Base Requirements:**
- General knowledge for small talk (current events, weather, sports, hobbies)
- Heart failure-specific medical knowledge
- Medication awareness and side effects
- Dietary and lifestyle recommendations
- Emergency symptom recognition protocols

**Context Switching:**
- Smooth transitions between casual conversation and clinical assessment
- Natural integration of required health questions
- Ability to return to previous topics if patient shows discomfort
- Dynamic follow-up questions based on patient responses

## 5. FUNCTION CALLING & INTEGRATIONS

Define function calls the AI agent should be able to execute:
- `recordVoiceBiomarkers()`: Capture and analyze voice segments
- `updatePatientRecord()`: Log responses and clinical data
- `triggerAlert()`: Escalate critical symptoms to care team
- `scheduleFollowUp()`: Book appointments or additional calls
- `provideEducation()`: Share relevant health information
- `assessMedication()`: Check adherence and side effects

## 6. PATIENT EXPERIENCE REQUIREMENTS

**Conversation Qualities:**
- Empathetic and warm tone appropriate for elderly patients
- Clear enunciation and adjustable speaking pace
- Cultural sensitivity and language preferences
- Ability to repeat or clarify information
- Recognition of emotional distress or confusion

**Engagement Metrics:**
- Target: >85% call completion rate
- Average conversation duration: 5-8 minutes
- Patient satisfaction score: >4.2/5
- Voice biomarker capture rate: >90%

## 7. COMPLIANCE & SECURITY

**HIPAA Requirements:**
- End-to-end encryption for all audio streams
- No persistent storage of voice recordings
- Audit logs for all PHI access
- BAA agreements with all vendors (OpenAI, Twilio, ElevenLabs)

**Clinical Safety:**
- Emergency escalation protocols
- Suicide/crisis detection and response
- Clear disclaimers about AI nature of agent
- Human handoff capabilities for complex situations

## 8. IMPLEMENTATION PHASES

**Phase 1: Infrastructure Setup (2 weeks)**
- WebSocket proxy server development
- OpenAI Realtime API integration
- Twilio Media Streams configuration
- Basic conversation flow

**Phase 2: Conversation Design (3 weeks)**
- Knowledge base development
- Prompt engineering for healthcare context
- Function calling implementation
- Voice biomarker extraction pipeline

**Phase 3: Clinical Integration (3 weeks)**
- EHR data synchronization
- Alert system implementation
- Clinical dashboard updates
- Provider notification workflows

**Phase 4: Testing & Validation (4 weeks)**
- Voice quality testing across demographics
- Clinical accuracy validation
- Stress testing for concurrent calls
- Patient acceptance testing

## 9. COST ANALYSIS

**OpenAI Realtime API:**
- Input: $32/1M tokens (~$0.06/minute)
- Output: $64/1M tokens (~$0.24/minute)
- Estimated cost per 5-minute call: $1.50

**ElevenLabs (Fallback):**
- $0.08/minute flat rate
- Estimated cost per 5-minute call: $0.40

**Infrastructure:**
- WebSocket server hosting: ~$200/month
- Monitoring and logging: ~$100/month

## 10. SUCCESS CRITERIA

**Technical Metrics:**
- WebSocket connection reliability: >99.5%
- Audio stream latency: <500ms end-to-end
- Concurrent call capacity: 100+ simultaneous
- Voice biomarker extraction accuracy: >85%

**Clinical Outcomes:**
- 30% reduction in unexpected readmissions
- 25% increase in early decompensation detection
- 40% improvement in patient engagement scores
- 50% reduction in missed check-ins

## 11. RISK MITIGATION

**Technical Risks:**
- Fallback to ElevenLabs if OpenAI has outages
- Graceful degradation to TwiML for critical failures
- Local caching of common responses
- Multiple WebSocket server instances for redundancy

**Clinical Risks:**
- Physician review of all high-risk conversations
- Clear AI disclosure to patients
- Emergency hotline transfer capability
- Regular clinical validation of biomarker algorithms

## 12. FUTURE ENHANCEMENTS

- Vision capabilities for wound assessment via MMS
- Multi-language support for diverse populations
- Family member participation in calls
- Integration with wearable devices
- Predictive modeling using longitudinal voice data

---

## Research Foundation

This PRD prompt incorporates:
- **Latest 2024 clinical research** on voice biomarkers showing 32% mortality risk correlation
- **Technical implementation details** from official OpenAI/Twilio repositories and demos
- **Healthcare-specific conversational AI** best practices from real-world deployments
- **Performance metrics** from production healthcare AI systems (Kaiser Permanente, Alan)
- **Compliance requirements** for HIPAA-compliant healthcare applications
- **Cost analysis** based on current API pricing and usage patterns

## Key Technical References

- **OpenAI Realtime API**: WebSocket-based speech-to-speech with GPT-4o
- **Twilio Media Streams**: Real-time audio streaming for phone calls
- **Voice Biomarkers**: Clinical validation from AHF-Voice Study (2024)
- **Healthcare AI**: Patient engagement improvements from conversational AI studies

The upgrade from basic TwiML to OpenAI Realtime API or ElevenLabs will transform patient interactions from robotic questionnaires to engaging, therapeutic conversations that naturally capture critical health data while building trust and improving outcomes.