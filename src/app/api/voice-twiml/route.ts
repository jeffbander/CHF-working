import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');
    const patientName = searchParams.get('patientName');

    // Create TwiML response for voice interaction
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-US">
    Hello ${patientName || 'there'}. This is your HeartVoice Monitor calling for your daily health check-in. 
    I'm going to ask you a few questions about how you're feeling today. 
    Please answer in a clear, natural voice.
  </Say>
  
  <Pause length="1"/>
  
  <Say voice="alice" language="en-US">
    First, on a scale of 1 to 10, how would you rate your energy level today? 
    Please speak your answer after the beep.
  </Say>
  
  <Record 
    action="/api/voice-analysis?patientId=${patientId}&question=energy"
    method="POST"
    maxLength="10"
    timeout="5"
    trim="trim-silence"
    recordingStatusCallback="/api/voice-analysis-status"
    recordingStatusCallbackMethod="POST"
  />
  
  <Say voice="alice" language="en-US">
    Thank you. Now, please tell me about any shortness of breath you may have experienced today. 
    Speak for up to 30 seconds after the beep.
  </Say>
  
  <Record 
    action="/api/voice-analysis?patientId=${patientId}&question=breathing"
    method="POST"
    maxLength="30"
    timeout="5"
    trim="trim-silence"
    recordingStatusCallback="/api/voice-analysis-status"
    recordingStatusCallbackMethod="POST"
  />
  
  <Say voice="alice" language="en-US">
    Finally, please count from 1 to 10 at a normal pace. This helps us analyze your voice patterns.
  </Say>
  
  <Record 
    action="/api/voice-analysis?patientId=${patientId}&question=counting"
    method="POST"
    maxLength="20"
    timeout="5"
    trim="trim-silence"
    recordingStatusCallback="/api/voice-analysis-status"
    recordingStatusCallbackMethod="POST"
  />
  
  <Say voice="alice" language="en-US">
    Thank you for completing your voice assessment today. 
    Your healthcare team will review the results. 
    If you have any urgent concerns, please contact your doctor immediately. 
    Have a wonderful day!
  </Say>
  
  <Hangup/>
</Response>`;

    return new NextResponse(twiml, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });

  } catch (error) {
    console.error('Error generating TwiML:', error);
    
    // Error fallback TwiML
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-US">
    We're sorry, there was an issue with your voice assessment today. 
    Please try again later or contact your healthcare provider if you have urgent concerns.
  </Say>
  <Hangup/>
</Response>`;

    return new NextResponse(errorTwiml, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  }
}