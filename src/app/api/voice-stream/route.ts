import { NextRequest } from 'next/server';
import { WebSocketServer, WebSocket } from 'ws';
import crypto from 'crypto';
import { createElevenLabsService, ClinicalVoiceConfigs } from '../../../services/elevenlabs-service';
import { createVoiceBiomarkerService } from '../../../services/voice-biomarker-service';

// WebSocket server for Twilio Media Streams
let wss: WebSocketServer | null = null;

// Initialize WebSocket server (singleton pattern)
function getWSS() {
  if (!wss) {
    wss = new WebSocketServer({ port: 3001 });
    console.log('WebSocket server started on port 3001');
  }
  return wss;
}

// Validate Twilio signature
function validateTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string,
  authToken: string
): boolean {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}${params[key]}`)
    .join('');

  const data = url + sortedParams;
  const expectedSignature = crypto
    .createHmac('sha1', authToken)
    .update(data, 'utf8')
    .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Voice biomarker analysis from μ-law audio
function analyzeVoiceBiomarkers(audioBuffer: Buffer): {
  jitter: number;
  shimmer: number;
  hnr: number;
  f0: number;
  spectralSlope: number;
  voiceIntensity: number;
} {
  // TODO: Replace with actual signal processing
  // For now, return realistic simulated values
  return {
    jitter: Math.random() * 3,        // 0-3% typical
    shimmer: Math.random() * 8,       // 0-8% typical
    hnr: 8 + Math.random() * 6,       // 8-14 dB typical
    f0: 120 + Math.random() * 80,     // 120-200 Hz typical
    spectralSlope: -12 + Math.random() * 8, // -12 to -4 dB/octave
    voiceIntensity: 40 + Math.random() * 30  // 40-70 dB typical
  };
}

// Convert base64 μ-law to PCM for analysis
function ulawToPcm(ulawData: Buffer): Buffer {
  const pcmData = Buffer.alloc(ulawData.length * 2); // 16-bit PCM

  for (let i = 0; i < ulawData.length; i++) {
    const ulaw = ulawData[i];
    // μ-law decompression algorithm
    const sign = (ulaw & 0x80) ? -1 : 1;
    const exponent = (ulaw & 0x70) >> 4;
    const mantissa = ulaw & 0x0F;

    let sample = mantissa * 2 + 33;
    sample = sample << (exponent + 2);
    sample = sample - 33;
    sample = sample * sign;

    // Write 16-bit PCM sample
    pcmData.writeInt16LE(sample, i * 2);
  }

  return pcmData;
}

// Handle WebSocket upgrade for Media Streams
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  try {
    // Get WebSocket server
    const wsServer = getWSS();

    wsServer.on('connection', (ws: WebSocket, request) => {
      console.log('New WebSocket connection established');

      // Validate WebSocket upgrade signature (Twilio sends this in lowercase)
      const signature = request.headers['x-twilio-signature'];
      const authToken = process.env.TWILIO_AUTH_TOKEN;

      if (signature && authToken) {
        // TODO: Implement WebSocket signature validation
        // This is more complex for WebSocket upgrades but recommended for production
        console.log('WebSocket signature validation - TODO: implement');
      }

      let streamSid: string = '';
      let callSid: string = '';
      let patientId: string = '';
      let patientName: string = '';
      let conversationState = 'greeting';
      let audioBuffer: Buffer[] = [];
      let lastSpeechTime = Date.now();
      let isSpeaking = false;
      let isListening = false;
      let bargeInDetected = false;

      // Initialize services
      const ttsService = createElevenLabsService(
        process.env.ELEVENLABS_API_KEY || '',
        process.env.ELEVENLABS_VOICE_ID || ''
      );

      const biomarkerService = createVoiceBiomarkerService({
        sampleRate: 8000,
        windowSizeMs: 25,
        hopSizeMs: 10,
        minVoiceThreshold: 0.1
      });

      // Enhanced conversation flow with natural responses
      const conversationFlow = {
        greeting: {
          message: `Hello ${patientName ? patientName : 'there'}! This is your HeartVoice Monitor calling for your daily health check-in. I hope you're having a good day. How are you feeling today?`,
          voiceConfig: ClinicalVoiceConfigs.patient_care,
          expectsResponse: true,
          timeout: 10000,
          next: 'energy_level'
        },
        energy_level: {
          message: "Thank you for sharing that with me. On a scale of 1 to 10, how would you rate your energy level today? Take your time.",
          voiceConfig: ClinicalVoiceConfigs.instructions,
          expectsResponse: true,
          timeout: 8000,
          next: 'breathing'
        },
        breathing: {
          message: "I appreciate that information. Now, please tell me about any shortness of breath or breathing difficulties you may have experienced today. Feel free to describe it in your own words.",
          voiceConfig: ClinicalVoiceConfigs.sensitive,
          expectsResponse: true,
          timeout: 15000,
          next: 'counting_task'
        },
        counting_task: {
          message: "Thank you for being so helpful. For our voice analysis, I'd like you to count from 1 to 10 at your normal speaking pace. This helps us understand your voice patterns. Please go ahead when you're ready.",
          voiceConfig: ClinicalVoiceConfigs.instructions,
          expectsResponse: true,
          timeout: 12000,
          next: 'closing'
        },
        closing: {
          message: "Perfect! Thank you so much for completing your voice assessment today. Your healthcare team will review these results and reach out if needed. If you have any urgent concerns, please don't hesitate to contact your doctor. Take care and have a wonderful rest of your day!",
          voiceConfig: ClinicalVoiceConfigs.patient_care,
          expectsResponse: false,
          timeout: 0,
          next: null
        }
      };

      // Send audio to Twilio as base64 μ-law
      const sendAudioToTwilio = (audioData: Buffer) => {
        const message = {
          event: 'media',
          streamSid: streamSid,
          media: {
            payload: audioData.toString('base64')
          }
        };
        ws.send(JSON.stringify(message));
      };

      // Clear any buffered audio (for barge-in)
      const clearBufferedAudio = () => {
        ws.send(JSON.stringify({
          event: 'clear',
          streamSid: streamSid
        }));
        isSpeaking = false;
        console.log('Cleared buffered audio due to barge-in');
      };

      // Detect barge-in during TTS playback
      const detectBargeIn = (audioLevel: number) => {
        if (isSpeaking && audioLevel > 0.2) { // Threshold for speech detection
          if (!bargeInDetected) {
            bargeInDetected = true;
            clearBufferedAudio();
            console.log('Barge-in detected - patient is speaking');
          }
        }
      };

      // Enhanced conversation processing with barge-in support
      const processConversationTurn = async () => {
        const currentStep = conversationFlow[conversationState as keyof typeof conversationFlow];
        if (!currentStep) return;

        console.log(`Processing conversation step: ${conversationState}`);

        try {
          // Reset barge-in detection
          bargeInDetected = false;
          isSpeaking = true;
          isListening = false;

          // Generate TTS with streaming for low latency
          const ttsBase64 = await ttsService.generateTTS(currentStep.message, {
            streaming: true,
            chunkCallback: (chunk: string) => {
              // Send audio chunk immediately for low latency
              if (!bargeInDetected) {
                sendAudioToTwilio(Buffer.from(chunk, 'base64'));
              }
            }
          });

          // If not barged in, mark speech complete and start listening
          if (!bargeInDetected) {
            isSpeaking = false;

            // Send mark to indicate TTS completion
            ws.send(JSON.stringify({
              event: 'mark',
              streamSid: streamSid,
              mark: {
                name: 'tts_complete'
              }
            }));

            // Start listening for patient response if expected
            if (currentStep.expectsResponse) {
              isListening = true;
              console.log(`Listening for patient response (timeout: ${currentStep.timeout}ms)`);

              // Set timeout for patient response
              setTimeout(() => {
                if (isListening) {
                  console.log('Patient response timeout - proceeding to next step');
                  proceedToNextStep();
                }
              }, currentStep.timeout);
            } else {
              // No response expected, proceed immediately
              setTimeout(() => proceedToNextStep(), 2000);
            }
          }

        } catch (error) {
          console.error('Error in conversation processing:', error);
          // Fallback: proceed to next step
          setTimeout(() => proceedToNextStep(), 3000);
        }
      };

      // Proceed to next conversation step
      const proceedToNextStep = () => {
        isListening = false;
        const currentStep = conversationFlow[conversationState as keyof typeof conversationFlow];

        if (currentStep?.next) {
          conversationState = currentStep.next;
          // Small delay before next step for natural flow
          setTimeout(() => processConversationTurn(), 1500);
        } else {
          // End call gracefully
          setTimeout(() => {
            ws.send(JSON.stringify({
              event: 'mark',
              streamSid: streamSid,
              mark: {
                name: 'call_complete'
              }
            }));
          }, 2000);
        }
      };

      // Handle incoming WebSocket messages
      ws.on('message', async (message: Buffer) => {
        try {
          const data = JSON.parse(message.toString());

          switch (data.event) {
            case 'connected':
              console.log('Twilio Media Stream connected');
              break;

            case 'start':
              streamSid = data.start.streamSid;
              callSid = data.start.callSid;

              // Extract patient information from custom parameters
              const customParams = data.start.customParameters || {};
              patientId = customParams.patientId || 'unknown';
              patientName = customParams.patientName || '';

              console.log(`Stream started - SID: ${streamSid}, Call: ${callSid}, Patient: ${patientId} (${patientName})`);

              // Update greeting message with patient name
              if (patientName) {
                conversationFlow.greeting.message = `Hello ${patientName}! This is your HeartVoice Monitor calling for your daily health check-in. I hope you're having a good day. How are you feeling today?`;
              }

              // Start the conversation with a brief delay
              setTimeout(() => processConversationTurn(), 1000);
              break;

            case 'media':
              // Incoming audio from patient (μ-law encoded)
              const audioPayload = Buffer.from(data.media.payload, 'base64');
              audioBuffer.push(audioPayload);
              lastSpeechTime = Date.now();

              // Calculate audio level for barge-in detection
              const audioLevel = audioPayload.reduce((sum, sample) => sum + Math.abs(sample - 127), 0) / audioPayload.length / 128;

              // Detect barge-in if we're currently speaking
              detectBargeIn(audioLevel);

              // Real-time voice biomarker analysis
              if (audioBuffer.length > 50) { // Analyze every ~1 second (50 chunks of 20ms)
                const combinedAudio = Buffer.concat(audioBuffer);

                try {
                  const biomarkers = await biomarkerService.analyzeAudioChunk(combinedAudio);

                  if (biomarkers) {
                    console.log(`Real-time biomarkers for patient ${patientId}:`, {
                      jitter: biomarkers.jitter.toFixed(2),
                      shimmer: biomarkers.shimmer.toFixed(2),
                      hnr: biomarkers.hnr.toFixed(2),
                      f0: biomarkers.f0Mean.toFixed(2),
                      quality: biomarkers.analysisQuality.toFixed(2)
                    });

                    // Store biomarkers in database (TODO: implement database storage)
                    // await storeBiomarkers(patientId, callSid, biomarkers);

                    // Check for clinical alerts
                    const { trends, alerts } = biomarkerService.getTrendingAnalysis(5);
                    if (alerts.length > 0) {
                      console.log(`Clinical alerts for patient ${patientId}:`, alerts);
                      // TODO: Send alerts to clinical dashboard
                    }
                  }
                } catch (error) {
                  console.error('Biomarker analysis error:', error);
                }

                // Reset buffer
                audioBuffer = [];
              }

              // If we're listening and patient is speaking, detect speech end
              if (isListening && audioLevel > 0.1) {
                lastSpeechTime = Date.now();
              }
              break;

            case 'mark':
              console.log('Received mark:', data.mark.name);

              if (data.mark.name === 'tts_complete') {
                console.log('TTS playback completed');
              } else if (data.mark.name === 'speech_ended') {
                console.log('Patient speech ended - proceeding to next step');
                proceedToNextStep();
              } else if (data.mark.name === 'call_complete') {
                console.log('Call assessment completed');
              }
              break;

            case 'stop':
              console.log('Media stream stopped');
              break;

            default:
              console.log('Unknown event:', data.event);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      });

      // Enhanced speech end detection with context awareness
      const speechEndTimer = setInterval(() => {
        if (isListening && Date.now() - lastSpeechTime > 2000) { // 2 seconds of silence while listening
          if (audioBuffer.length > 0) {
            console.log('Detected end of patient speech');

            // Analyze the final speech segment
            const finalAudio = Buffer.concat(audioBuffer);
            biomarkerService.analyzeAudioChunk(finalAudio).then(biomarkers => {
              if (biomarkers) {
                console.log(`Final speech analysis for ${conversationState}:`, {
                  duration: biomarkers.durationMs,
                  quality: biomarkers.analysisQuality,
                  jitter: biomarkers.jitter.toFixed(2),
                  shimmer: biomarkers.shimmer.toFixed(2)
                });
              }
            }).catch(console.error);

            // Send mark to indicate speech ended
            ws.send(JSON.stringify({
              event: 'mark',
              streamSid: streamSid,
              mark: {
                name: 'speech_ended'
              }
            }));

            // Clear the audio buffer
            audioBuffer = [];
          }
        }
      }, 100);

      ws.on('close', () => {
        console.log('WebSocket connection closed');
        clearInterval(speechEndTimer);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        clearInterval(speechEndTimer);
      });
    });

    return new Response('WebSocket server running', { status: 200 });

  } catch (error) {
    console.error('Error in WebSocket handler:', error);
    return new Response('WebSocket setup failed', { status: 500 });
  }
}