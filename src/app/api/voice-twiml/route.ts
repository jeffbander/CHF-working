import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');
    const patientName = searchParams.get('patientName');
    const callSid = searchParams.get('CallSid');
    const digits = searchParams.get('Digits');
    const phase = searchParams.get('phase') || 'greeting';

    console.log(`🎙️ TwiML Request - CallSid: ${callSid}, Patient: ${patientName}, Phase: ${phase}, Digits: ${digits}`);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;

    // Enhanced conversation flow with multiple phases for longer interaction
    let twimlResponse = '';

    switch (phase) {
      case 'greeting':
        twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna" rate="medium" language="en-US">
    Hello ${patientName}! This is your AI health assistant from Heart Voice Monitor.
    I'm calling to check on how you're feeling today. This conversation will help us monitor your heart health through voice analysis.

    First, I'd like you to tell me about any symptoms you've been experiencing.
    This could include shortness of breath, fatigue, swelling, chest discomfort, or any other concerns.
    After the tone, please speak for about 30 seconds about how you've been feeling.
  </Say>
  <Record maxLength="35" timeout="4" action="${baseUrl}/api/voice-analysis?patientId=${patientId}&amp;question=symptoms" playBeep="true" />
</Response>`;
        break;

      case 'voice_analysis':
        twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna" rate="medium">
    Thank you for sharing about your symptoms. That information is very helpful for your healthcare team.

    Now, for voice analysis purposes, I need you to count from one to ten clearly and at your normal speaking pace.
    This helps us analyze your voice patterns for any changes that might indicate health concerns.

    After the tone, please count from one to ten, speaking clearly: "One, two, three, four, five, six, seven, eight, nine, ten."
  </Say>
  <Record maxLength="15" timeout="3" action="${baseUrl}/api/voice-analysis?patientId=${patientId}&amp;question=counting" playBeep="true" />
</Response>`;
        break;



      case 'conclusion':
        twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna" rate="medium">
    Perfect! Thank you very much, ${patientName}. I've completed your voice health assessment for today.

    Your voice recordings will be analyzed for important health indicators, and the results will be shared with your healthcare team.
    This voice analysis helps us monitor your heart health in a new and innovative way.

    If you experience any urgent symptoms like severe chest pain, difficulty breathing, or dizziness,
    please don't wait - call 911 or go to the emergency room immediately.

    For non-urgent questions, you can always contact your doctor's office.
    We'll continue to monitor your health through these voice assessments.

    Take care, and have a wonderful day. Goodbye!
  </Say>
  <Pause length="2"/>
  <Hangup/>
</Response>`;
        break;

      default:
        // Fallback for any unexpected phase
        twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">
    Thank you for your time today, ${patientName}. This concludes your health check-in. Goodbye!
  </Say>
  <Hangup/>
</Response>`;
        break;
    }

    console.log(`📞 TwiML Response for ${callSid} (${phase}): ${twimlResponse.substring(0, 200)}...`);

    return new Response(twimlResponse, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });

  } catch (error) {
    console.error('Error generating TwiML:', error);

    // Fallback TwiML response
    const fallbackTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">I'm sorry, there was a technical issue. Please try calling again later. Goodbye.</Say>
  <Hangup/>
</Response>`;

    return new Response(fallbackTwiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  }
}

export async function POST(req: NextRequest) {
  // Handle POST requests the same way as GET
  return GET(req);
}