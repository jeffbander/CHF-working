import { NextRequest, NextResponse } from 'next/server';
import { VoiceBiomarkerExtractor } from '../../../services/voice-biomarker-extractor';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');
    const question = searchParams.get('question');

    // Get form data from Twilio
    const formData = await req.formData();
    const recordingUrl = formData.get('RecordingUrl') as string;
    const recordingSid = formData.get('RecordingSid') as string;
    const callSid = formData.get('CallSid') as string;
    const duration = formData.get('RecordingDuration') as string;

    console.log(`🎙️ Received voice recording for patient ${patientId}, question: ${question}`);
    console.log(`📊 Recording SID: ${recordingSid}, Duration: ${duration}s, URL: ${recordingUrl}`);

    let biomarkerAnalysis;

    try {
      // Initialize voice biomarker extractor
      const extractor = new VoiceBiomarkerExtractor();

      // Download and analyze the audio file
      console.log(`🔄 Downloading audio from: ${recordingUrl}`);
      const response = await fetch(recordingUrl);

      if (!response.ok) {
        throw new Error(`Failed to download audio: ${response.status}`);
      }

      const audioBuffer = await response.arrayBuffer();
      console.log(`✅ Downloaded ${audioBuffer.byteLength} bytes of audio data`);

      // Extract voice biomarkers
      console.log(`🔬 Extracting voice biomarkers...`);
      const biomarkers = await extractor.extractFeatures(Buffer.from(audioBuffer));

      // Calculate risk score based on biomarkers
      const riskScore = calculateHeartFailureRisk(biomarkers, question);

      biomarkerAnalysis = {
        patientId,
        question,
        recordingSid,
        callSid,
        duration: parseInt(duration || '0'),
        biomarkers,
        riskScore,
        timestamp: new Date().toISOString(),
        analysisType: question === 'counting' ? 'standardized_speech' : 'symptom_narrative'
      };

      console.log(`🎯 Voice biomarker analysis completed:`, {
        jitter: biomarkers.jitter?.local?.toFixed(3),
        shimmer: biomarkers.shimmer?.local?.toFixed(3),
        hnr: biomarkers.hnr?.mean?.toFixed(1),
        f0: biomarkers.f0?.mean?.toFixed(1),
        riskScore
      });

    } catch (error) {
      console.error(`❌ Error analyzing voice biomarkers:`, error);

      // Fallback to basic analysis if biomarker extraction fails
      biomarkerAnalysis = {
        patientId,
        question,
        recordingSid,
        callSid,
        duration: parseInt(duration || '0'),
        biomarkers: {
          jitter: 0,
          shimmer: 0,
          hnr: 0,
          f0: 0,
          spectralSlope: 0,
          voiceIntensity: 0
        },
        riskScore: 0,
        timestamp: new Date().toISOString(),
        analysisType: question === 'counting' ? 'standardized_speech' : 'symptom_narrative',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Store analysis results (in a real app, this would go to a database)
    console.log(`💾 Storing voice analysis results for patient ${patientId}`);

    // Determine next step based on question type
    let nextTwiml;

    if (question === 'symptoms') {
      // After symptoms recording, move to counting
      nextTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Redirect>/api/voice-twiml?patientId=${patientId}&amp;phase=voice_analysis</Redirect>
</Response>`;
    } else if (question === 'counting') {
      // After counting, conclude the call
      nextTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Redirect>/api/voice-twiml?patientId=${patientId}&amp;phase=conclusion</Redirect>
</Response>`;
    } else {
      // Default fallback
      nextTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">Thank you for your response. Your voice analysis is complete.</Say>
  <Hangup/>
</Response>`;
    }

    return new NextResponse(nextTwiml, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });

  } catch (error) {
    console.error('Error in voice analysis:', error);
    
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-US">Thank you for your response.</Say>
  <Hangup/>
</Response>`;

    return new NextResponse(errorTwiml, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  }
}

// Calculate heart failure risk score based on voice biomarkers
function calculateHeartFailureRisk(biomarkers: any, questionType: string): number {
  if (!biomarkers) return 0;

  let riskScore = 0;

  // Jitter analysis (higher jitter = higher risk)
  if (biomarkers.jitter?.local) {
    if (biomarkers.jitter.local > 0.025) riskScore += 30; // Pathological (2.5%)
    else if (biomarkers.jitter.local > 0.0104) riskScore += 15; // Elevated (1.04%)
  }

  // Shimmer analysis (higher shimmer = higher risk)
  if (biomarkers.shimmer?.local) {
    if (biomarkers.shimmer.local > 0.10) riskScore += 25; // Pathological (10%)
    else if (biomarkers.shimmer.local > 0.035) riskScore += 12; // Elevated (3.5%)
  }

  // HNR analysis (lower HNR = higher risk)
  if (biomarkers.hnr?.mean) {
    if (biomarkers.hnr.mean < 12) riskScore += 20; // Poor voice quality
    else if (biomarkers.hnr.mean < 15) riskScore += 10; // Reduced quality
  }

  // F0 analysis (abnormal pitch patterns)
  if (biomarkers.f0?.mean) {
    if (biomarkers.f0.mean < 100 || biomarkers.f0.mean > 250) riskScore += 10;
  }

  // Prosody analysis (speech rate and pauses)
  if (biomarkers.prosody?.speechRate) {
    if (biomarkers.prosody.speechRate < 100) riskScore += 8; // Very slow speech
  }

  if (biomarkers.prosody?.pauseRate) {
    if (biomarkers.prosody.pauseRate > 0.3) riskScore += 8; // Frequent pauses
  }

  // Additional weight for counting vs symptoms
  if (questionType === 'counting') {
    // Counting provides more standardized analysis
    riskScore *= 1.2;
  }

  return Math.min(Math.round(riskScore), 100); // Cap at 100
}