import { NextRequest, NextResponse } from 'next/server';

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

    console.log(`Received voice recording for patient ${patientId}, question: ${question}`);
    console.log(`Recording SID: ${recordingSid}, Duration: ${duration}s`);

    // TODO: Implement actual voice analysis here
    // This would involve:
    // 1. Download the audio file from recordingUrl
    // 2. Analyze voice biomarkers (jitter, shimmer, HNR, F0)
    // 3. Store results in database
    // 4. Generate clinical alerts if needed
    
    // For now, simulate analysis
    const mockAnalysis = {
      patientId,
      question,
      recordingSid,
      callSid,
      duration: parseInt(duration || '0'),
      biomarkers: {
        jitter: Math.random() * 3,
        shimmer: Math.random() * 8,
        hnr: 8 + Math.random() * 6,
        f0: 120 + Math.random() * 80,
        spectralSlope: -12 + Math.random() * 8,
        voiceIntensity: 40 + Math.random() * 30
      },
      riskScore: Math.floor(Math.random() * 100),
      timestamp: new Date().toISOString()
    };

    console.log('Voice analysis completed:', mockAnalysis);

    // Continue with next question in TwiML flow
    const continueTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Redirect>/api/voice-twiml?patientId=${patientId}</Redirect>
</Response>`;

    return new NextResponse(continueTwiml, {
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