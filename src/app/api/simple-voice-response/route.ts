import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Get form data from Twilio
    const formData = await req.formData();
    const speechResult = formData.get('SpeechResult') as string;
    const callSid = formData.get('CallSid') as string;
    
    console.log(`Simple voice response for ${callSid}: "${speechResult}"`);
    
    // Simple response based on what patient said
    let response = "Thank you for sharing that.";
    
    if (speechResult) {
      const speech = speechResult.toLowerCase();
      if (speech.includes('good') || speech.includes('fine') || speech.includes('well')) {
        response = "That's wonderful to hear you're feeling good.";
      } else if (speech.includes('bad') || speech.includes('tired') || speech.includes('pain')) {
        response = "I understand you're not feeling your best. Your care team will be notified.";
      } else if (speech.includes('short') || speech.includes('breath')) {
        response = "Thank you for letting me know about your breathing. This information is important for your care team.";
      }
    }
    
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Ruth-Neural" language="en-US" rate="medium" pitch="medium">
    ${response}
  </Say>
  <Pause length="1"/>
  <Say voice="Polly.Ruth-Neural" language="en-US" rate="medium" pitch="medium">
    Thank you for completing your health check. Your care team will review this information. Take care!
  </Say>
  <Hangup />
</Response>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      }
    );

  } catch (error) {
    console.error('Error in simple voice response:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Ruth-Neural" language="en-US" rate="medium" pitch="medium">
    Thank you for calling. Have a good day!
  </Say>
  <Hangup />
</Response>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      }
    );
  }
}