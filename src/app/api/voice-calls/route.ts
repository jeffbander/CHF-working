import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// Initialize Twilio client only when valid credentials are present
function createTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken || accountSid.includes('your-') || authToken.includes('your-')) {
    return null;
  }
  
  return twilio(accountSid, authToken);
}

export async function POST(req: NextRequest) {
  try {
    const { patientId, phoneNumber, patientName } = await req.json();

    // Create Twilio client
    const client = createTwilioClient();
    if (!client || !process.env.TWILIO_FROM_NUMBER) {
      return NextResponse.json(
        { 
          error: 'Twilio not configured', 
          details: 'Please set valid TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER in your .env file.',
          setupInstructions: 'Visit console.twilio.com to get your credentials'
        },
        { status: 500 }
      );
    }

    // Create inline TwiML for immediate voice assessment (no webhook needed)
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-US">
    Hello ${patientName}. This is your HeartVoice Monitor calling for your daily health check-in. 
    I will ask you three quick questions about how you're feeling today. 
    Please answer clearly after each beep.
  </Say>
  
  <Pause length="1"/>
  
  <Say voice="alice" language="en-US">
    First, on a scale of 1 to 10, how would you rate your energy level today?
  </Say>
  
  <Record 
    maxLength="10"
    timeout="5"
    trim="trim-silence"
    playBeep="true"
  />
  
  <Say voice="alice" language="en-US">
    Thank you. Now, please tell me about any shortness of breath you experienced today.
  </Say>
  
  <Record 
    maxLength="30"
    timeout="5"
    trim="trim-silence"
    playBeep="true"
  />
  
  <Say voice="alice" language="en-US">
    Finally, please count from 1 to 10 at your normal speaking pace.
  </Say>
  
  <Record 
    maxLength="20"
    timeout="5"
    trim="trim-silence"
    playBeep="true"
  />
  
  <Say voice="alice" language="en-US">
    Thank you for completing your voice assessment. 
    Your healthcare team will review these results. 
    If you have any urgent concerns, please contact your doctor immediately. 
    Take care!
  </Say>
  
  <Hangup/>
</Response>`;

    // Initiate call using Twilio with inline TwiML
    const call = await client.calls.create({
      to: phoneNumber,
      from: process.env.TWILIO_FROM_NUMBER!,
      twiml: twimlResponse,
      timeout: 30, // Ring for 30 seconds
      record: true // Enable recording for voice analysis
    });

    console.log(`Initiated call to ${patientName} (${phoneNumber}): ${call.sid}`);

    return NextResponse.json({
      success: true,
      callSid: call.sid,
      status: call.status,
      message: `Call initiated to ${patientName} at ${phoneNumber}`
    });

  } catch (error) {
    console.error('Error initiating voice call:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initiate call',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check call status
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const callSid = searchParams.get('callSid');

    if (!callSid) {
      return NextResponse.json({ error: 'Call SID required' }, { status: 400 });
    }

    const client = createTwilioClient();
    if (!client) {
      return NextResponse.json({ error: 'Twilio not configured' }, { status: 500 });
    }

    const call = await client.calls(callSid).fetch();

    return NextResponse.json({
      callSid: call.sid,
      status: call.status,
      duration: call.duration,
      startTime: call.startTime,
      endTime: call.endTime,
      price: call.price
    });

  } catch (error) {
    console.error('Error fetching call status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch call status' },
      { status: 500 }
    );
  }
}