import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const speechResult = formData.get('SpeechResult') as string;
    const callSid = formData.get('CallSid') as string;
    const confidence = formData.get('Confidence') as string;
    
    console.log(`Symptoms response for ${callSid}: "${speechResult}" (confidence: ${confidence})`);
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    let response = '';
    let detectedSymptoms: string[] = [];
    
    if (speechResult) {
      const lowerResponse = speechResult.toLowerCase();
      
      // Detect heart failure symptoms
      if (lowerResponse.includes('short') || lowerResponse.includes('breath') || lowerResponse.includes('breathing')) {
        detectedSymptoms.push('shortness of breath');
      }
      if (lowerResponse.includes('tired') || lowerResponse.includes('fatigue') || lowerResponse.includes('exhausted')) {
        detectedSymptoms.push('fatigue');
      }
      if (lowerResponse.includes('swell') || lowerResponse.includes('puffy') || lowerResponse.includes('bloated')) {
        detectedSymptoms.push('swelling');
      }
      if (lowerResponse.includes('chest') || lowerResponse.includes('pain') || lowerResponse.includes('pressure')) {
        detectedSymptoms.push('chest discomfort');
      }
      if (lowerResponse.includes('dizzy') || lowerResponse.includes('lightheaded')) {
        detectedSymptoms.push('dizziness');
      }
      
      // Generate appropriate response
      if (detectedSymptoms.length > 0) {
        if (detectedSymptoms.length === 1) {
          response = `I understand you've been experiencing ${detectedSymptoms[0]}. Thank you for sharing that with me.`;
        } else {
          response = `I heard you mention ${detectedSymptoms.slice(0, -1).join(', ')} and ${detectedSymptoms[detectedSymptoms.length - 1]}. I appreciate you telling me about these symptoms.`;
        }
      } else if (lowerResponse.includes('good') || lowerResponse.includes('fine') || lowerResponse.includes('okay') || lowerResponse.includes('well')) {
        response = `That's wonderful to hear that you're feeling well.`;
      } else if (lowerResponse.includes('no') || lowerResponse.includes('none') || lowerResponse.includes('nothing')) {
        response = `It's great that you're not experiencing any concerning symptoms right now.`;
      } else {
        response = `Thank you for sharing how you're feeling.`;
      }
      
      console.log(`✅ Detected symptoms: ${detectedSymptoms.join(', ') || 'none'}`);
    } else {
      response = `I didn't catch your response, but that's okay.`;
    }
    
    // Return TwiML that acknowledges symptoms and moves to energy question
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Ruth-Neural" language="en-US" rate="medium" pitch="medium">
    ${response}
  </Say>
  <Pause length="2"/>
  <Redirect>${baseUrl}/api/voice-webhook/energy</Redirect>
</Response>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/xml',
        },
      }
    );

  } catch (error) {
    console.error('Error processing symptoms webhook:', error);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural" language="en-US">
    Let me continue with the next question.
  </Say>
  <Redirect>${baseUrl}/api/voice-webhook/energy</Redirect>
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