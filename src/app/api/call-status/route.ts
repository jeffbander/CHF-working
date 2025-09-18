import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// Initialize Twilio client
function createTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken || accountSid.includes('your-') || authToken.includes('your-')) {
    return null;
  }
  
  return twilio(accountSid, authToken);
}

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

    // Get call details
    const call = await client.calls(callSid).fetch();

    return NextResponse.json({
      callSid: call.sid,
      status: call.status,
      direction: call.direction,
      from: call.from,
      to: call.to,
      duration: call.duration,
      startTime: call.startTime,
      endTime: call.endTime,
      price: call.price,
      priceUnit: call.priceUnit,
      answeredBy: call.answeredBy,
      errorCode: (call as any).errorCode || null,
      errorMessage: (call as any).errorMessage || null
    });

  } catch (error) {
    console.error('Error fetching call status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch call status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Get recent calls
export async function POST(req: NextRequest) {
  try {
    const client = createTwilioClient();
    if (!client) {
      return NextResponse.json({ error: 'Twilio not configured' }, { status: 500 });
    }

    // Get last 10 calls
    const calls = await client.calls.list({ limit: 10 });

    const callData = calls.map(call => ({
      callSid: call.sid,
      status: call.status,
      direction: call.direction,
      from: call.from,
      to: call.to,
      duration: call.duration,
      startTime: call.startTime,
      endTime: call.endTime,
      price: call.price,
      answeredBy: call.answeredBy,
      errorCode: (call as any).errorCode || null,
      errorMessage: (call as any).errorMessage || null
    }));

    return NextResponse.json({ calls: callData });

  } catch (error) {
    console.error('Error fetching recent calls:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch recent calls',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}