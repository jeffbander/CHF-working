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
    // Check if request has a body
    const contentType = req.headers.get('content-type');
    console.log('Content-Type:', contentType);

    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body:', requestBody);
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { patientId, phoneNumber, patientName } = requestBody;

    // Validate required fields
    if (!patientId || !phoneNumber || !patientName) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          details: 'patientId, phoneNumber, and patientName are required',
          received: { patientId, phoneNumber, patientName }
        },
        { status: 400 }
      );
    }

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

    // Format phone number for Twilio (ensure +1 prefix for US numbers)
    let formattedNumber = phoneNumber;
    if (phoneNumber && !phoneNumber.startsWith('+')) {
      // If it's a 10-digit US number, add +1
      if (phoneNumber.replace(/\D/g, '').length === 10) {
        formattedNumber = `+1${phoneNumber.replace(/\D/g, '')}`;
      } else if (phoneNumber.replace(/\D/g, '').length === 11 && phoneNumber.replace(/\D/g, '')[0] === '1') {
        formattedNumber = `+${phoneNumber.replace(/\D/g, '')}`;
      }
    }

    // ✅ Natural conversation with real-time voice biomarker extraction using Media Streams
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;

    // Use WebSocket Media Streams for natural conversation WITHOUT beeps
    const useWebSocket = false; // ❌ Disable WebSocket for now - use TwiML fallback until WebSocket server is configured

    let twimlResponse: string;

    if (useWebSocket) {
      // WebSocket URL for Media Streams - points to the Next.js integrated WebSocket server
      const websocketUrl = process.env.WEBSOCKET_BASE_URL || `wss://4160af2a6b66.ngrok.app/api/voice-stream`;

      twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream
      url="${websocketUrl}"
      track="both_tracks"
      statusCallback="${baseUrl}/api/voice-stream-status"
      statusCallbackMethod="POST">
      <Parameter name="patientId" value="${patientId}" />
      <Parameter name="patientName" value="${patientName}" />
      <Parameter name="sessionType" value="voice_biomarker_assessment" />
    </Stream>
  </Connect>
</Response>`;
    } else {
      // Fallback TwiML webhook approach - calls the voice-twiml endpoint
      twimlResponse = 'WEBHOOK'; // Special marker to use webhook URL instead
    }

    // Initiate call using Twilio
    console.log(`Attempting call: ${formattedNumber} from ${process.env.TWILIO_FROM_NUMBER}`);

    const publicBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;

    let callOptions: any = {
      to: formattedNumber,
      from: process.env.TWILIO_FROM_NUMBER!,
      timeout: 30, // Ring for 30 seconds
      statusCallback: `${publicBaseUrl}/api/twilio-status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      statusCallbackMethod: 'POST'
    };

    if (twimlResponse === 'WEBHOOK') {
      // Use webhook URL approach
      callOptions.url = `${publicBaseUrl}/api/voice-twiml?patientId=${patientId}&patientName=${encodeURIComponent(patientName)}`;
      console.log(`Using webhook URL: ${callOptions.url}`);
    } else {
      // Use inline TwiML (for WebSocket streaming)
      callOptions.twiml = twimlResponse;
      console.log(`Using inline TwiML: ${twimlResponse.substring(0, 200)}...`);
    }

    const call = await client.calls.create(callOptions);

    console.log(`Call initiated to ${patientName} (${phoneNumber} → ${formattedNumber}): ${call.sid}`);

    // Create steering session for the real call
    try {
      const steeringResponse = await fetch(`${publicBaseUrl}/api/steering/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callId: call.sid,
          patientId: patientId,
          clinicianId: 'clinician-001' // Default for demo
        })
      });
      
      if (steeringResponse.ok) {
        const steeringData = await steeringResponse.json();
        console.log(`Steering session created: ${steeringData.session?.id}`);
      }
    } catch (error) {
      console.error('Failed to create steering session for real call:', error);
    }

    return NextResponse.json({
      success: true,
      callSid: call.sid,
      status: call.status,
      message: `Call initiated to ${patientName} at ${phoneNumber}`,
      note: 'Steering session created automatically for call monitoring.'
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