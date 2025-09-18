import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const speechResult = formData.get('SpeechResult') as string;
    const callSid = formData.get('CallSid') as string;
    const confidence = formData.get('Confidence') as string;
    const digits = formData.get('Digits') as string;
    const recordingUrl = formData.get('RecordingUrl') as string;
    
    console.log(`Voice response received for call ${callSid}:`);
    console.log(`- Speech: "${speechResult}"`);
    console.log(`- Confidence: ${confidence}`);
    console.log(`- Digits: ${digits}`);
    console.log(`- Recording: ${recordingUrl}`);
    
    // Process the patient's response
    let response = '';
    let nextStep = '';
    
    if (speechResult || digits) {
      // Analyze the response for clinical insights
      const patientResponse = speechResult || `Rating: ${digits}`;
      
      // Simple keyword analysis for demo
      const symptoms = [];
      if (speechResult) {
        const lowerResponse = speechResult.toLowerCase();
        if (lowerResponse.includes('short') || lowerResponse.includes('breath')) symptoms.push('shortness of breath');
        if (lowerResponse.includes('tired') || lowerResponse.includes('fatigue')) symptoms.push('fatigue');
        if (lowerResponse.includes('swell') || lowerResponse.includes('puffy')) symptoms.push('swelling');
        if (lowerResponse.includes('chest') || lowerResponse.includes('pain')) symptoms.push('chest discomfort');
      }
      
      if (symptoms.length > 0) {
        response = `I heard you mention ${symptoms.join(' and ')}. Thank you for sharing that information.`;
        nextStep = `
  <Say voice="Polly.Joanna" language="en-US">
    This information has been recorded for your care team to review.
  </Say>`;
      } else if (digits) {
        const energyLevel = parseInt(digits);
        if (energyLevel <= 3) {
          response = `I see you rated your energy as ${energyLevel} out of 10, which is quite low.`;
          nextStep = `
  <Say voice="Polly.Joanna" language="en-US">
    Your low energy level has been noted for your care team.
  </Say>`;
        } else if (energyLevel >= 8) {
          response = `That's great! You rated your energy as ${energyLevel} out of 10.`;
          nextStep = `
  <Say voice="Polly.Joanna" language="en-US">
    It's wonderful to hear you're feeling energetic.
  </Say>`;
        } else {
          response = `You rated your energy as ${energyLevel} out of 10. That's helpful information.`;
          nextStep = `
  <Say voice="Polly.Joanna" language="en-US">
    Thank you for that rating.
  </Say>`;
        }
      } else {
        response = 'Thank you for your response.';
      }
      
      console.log(`✅ Patient response processed: ${patientResponse}`);
      console.log(`📊 Detected symptoms: ${symptoms.join(', ') || 'none'}`);
    } else {
      response = 'I didn\'t catch your response, but that\'s okay.';
    }
    
    // Return TwiML with personalized response using Ruth-Neural voice
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Ruth-Neural" language="en-US" rate="medium" pitch="medium">
    ${response}
  </Say>
  <Pause length="2"/>
  <Say voice="Polly.Ruth-Neural" language="en-US" rate="medium" pitch="medium">
    Now, on a scale of 1 to 10, how would you rate your energy level today? You can just say the number.
  </Say>
  <Record 
    action="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/voice-webhook/energy-response"
    method="POST"
    maxLength="10"
    playBeep="true"
    trim="trim-silence"
  />
  <Say voice="Polly.Ruth-Neural" language="en-US" rate="medium" pitch="medium">
    Thank you for completing your health check-in. Your responses have been recorded for your care team to review. Take care and have a wonderful day!
  </Say>
  <Hangup />
</Response>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/xml',
        },
      }
    );

  } catch (error) {
    console.error('Error processing voice webhook:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-US">
    I'm sorry, there was an error processing your response. Goodbye.
  </Say>
  <Hangup />
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