import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const speechResult = formData.get('SpeechResult') as string;
    const digits = formData.get('Digits') as string;
    const callSid = formData.get('CallSid') as string;
    const confidence = formData.get('Confidence') as string;
    
    console.log(`Energy response for ${callSid}: speech="${speechResult}", digits="${digits}" (confidence: ${confidence})`);
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    let response = '';
    let energyLevel: number | null = null;
    
    // Try to extract energy level from speech or digits
    if (digits) {
      energyLevel = parseInt(digits);
    } else if (speechResult) {
      const lowerResponse = speechResult.toLowerCase();
      
      // Extract number from speech
      const numberMatch = speechResult.match(/\b(\d+)\b/);
      if (numberMatch) {
        energyLevel = parseInt(numberMatch[1]);
      } else {
        // Try to interpret descriptive responses
        if (lowerResponse.includes('very low') || lowerResponse.includes('terrible') || lowerResponse.includes('awful')) {
          energyLevel = 1;
        } else if (lowerResponse.includes('low') || lowerResponse.includes('poor') || lowerResponse.includes('tired')) {
          energyLevel = 3;
        } else if (lowerResponse.includes('okay') || lowerResponse.includes('fair') || lowerResponse.includes('average')) {
          energyLevel = 5;
        } else if (lowerResponse.includes('good') || lowerResponse.includes('better')) {
          energyLevel = 7;
        } else if (lowerResponse.includes('great') || lowerResponse.includes('excellent') || lowerResponse.includes('wonderful')) {
          energyLevel = 9;
        }
      }
    }
    
    // Generate appropriate response based on energy level
    if (energyLevel !== null) {
      if (energyLevel >= 1 && energyLevel <= 10) {
        if (energyLevel <= 3) {
          response = `I understand your energy level is ${energyLevel} out of 10, which is quite low. This information is important for your care team to know.`;
        } else if (energyLevel <= 5) {
          response = `You rated your energy as ${energyLevel} out of 10. That's helpful information for monitoring your condition.`;
        } else if (energyLevel <= 7) {
          response = `It's good to hear your energy level is ${energyLevel} out of 10. That shows you're managing fairly well.`;
        } else {
          response = `That's wonderful! An energy level of ${energyLevel} out of 10 is excellent. I'm glad you're feeling so energetic.`;
        }
      } else {
        response = `Thank you for sharing your energy level.`;
      }
      
      console.log(`✅ Energy level recorded: ${energyLevel}/10`);
    } else {
      response = `Thank you for your response about your energy level.`;
      console.log(`ℹ️ Energy level not clearly determined from response`);
    }
    
    // Return TwiML that wraps up the call
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Ruth-Neural" language="en-US" rate="medium" pitch="medium">
    ${response}
  </Say>
  <Pause length="2"/>
  <Redirect>${baseUrl}/api/voice-webhook/completion</Redirect>
</Response>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/xml',
        },
      }
    );

  } catch (error) {
    console.error('Error processing energy webhook:', error);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Redirect>${baseUrl}/api/voice-webhook/completion</Redirect>
</Response>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/xml',
        },
      }
    );
  }
}

// Handle GET request for when no response is given
export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
  
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Ruth-Neural" language="en-US" rate="medium" pitch="medium">
    Now I'd like you to rate your energy level from 1 to 10.
  </Say>
  <Gather 
    input="speech dtmf"
    action="${baseUrl}/api/voice-webhook/energy"
    method="POST"
    speechTimeout="8"
    numDigits="2"
  >
    <Say voice="Polly.Ruth-Neural" language="en-US" rate="medium" pitch="medium">
      Please say a number from 1 to 10, or press the numbers on your phone. 1 means very low energy, and 10 means you feel full of energy.
    </Say>
  </Gather>
  <Redirect>${baseUrl}/api/voice-webhook/completion</Redirect>
</Response>`,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    }
  );
}