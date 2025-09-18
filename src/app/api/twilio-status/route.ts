import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const callSid = formData.get('CallSid') as string;
    const callStatus = formData.get('CallStatus') as string;
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const direction = formData.get('Direction') as string;
    const apiVersion = formData.get('ApiVersion') as string;

    // Log all the status information
    console.log(`🔔 Twilio Status Callback - ${callSid}:`);
    console.log(`   Status: ${callStatus}`);
    console.log(`   From: ${from} → To: ${to}`);
    console.log(`   Direction: ${direction}`);

    // Log specific events
    switch (callStatus) {
      case 'initiated':
        console.log(`📞 Call ${callSid} initiated`);
        break;
      case 'ringing':
        console.log(`📱 Call ${callSid} is ringing`);
        break;
      case 'answered':
        console.log(`✅ Call ${callSid} answered`);
        break;
      case 'completed':
        const duration = formData.get('CallDuration') as string;
        console.log(`🏁 Call ${callSid} completed after ${duration} seconds`);
        break;
      case 'busy':
        console.log(`📵 Call ${callSid} received busy signal`);
        break;
      case 'no-answer':
        console.log(`📭 Call ${callSid} - no answer`);
        break;
      case 'failed':
        console.log(`❌ Call ${callSid} failed`);
        break;
      case 'canceled':
        console.log(`🚫 Call ${callSid} canceled`);
        break;
    }

    // Log any error information
    if (formData.get('ErrorCode')) {
      console.log(`🚨 Twilio Error ${formData.get('ErrorCode')}: ${formData.get('ErrorMessage')}`);
    }

    return new NextResponse('OK', { status: 200 });

  } catch (error) {
    console.error('Error processing Twilio status callback:', error);
    return new NextResponse('Error', { status: 500 });
  }
}