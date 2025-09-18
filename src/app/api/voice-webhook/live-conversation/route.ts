import { NextRequest, NextResponse } from 'next/server';

// Simple conversation state management
interface ConversationState {
  phase: 'greeting' | 'symptoms' | 'energy' | 'followup' | 'closing';
  collectedInfo: {
    symptoms: string[];
    energyLevel?: number;
    concerns: string[];
  };
}

// Store conversation states (in production, use Redis or database)
const conversationStates = new Map<string, ConversationState>();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const speechResult = formData.get('SpeechResult') as string;
    const callSid = formData.get('CallSid') as string;
    const confidence = formData.get('Confidence') as string;
    
    console.log(`Live conversation for ${callSid}: "${speechResult}" (confidence: ${confidence})`);
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
    
    // Get or create conversation state
    let state = conversationStates.get(callSid);
    if (!state) {
      state = {
        phase: 'greeting',
        collectedInfo: {
          symptoms: [],
          concerns: []
        }
      };
      conversationStates.set(callSid, state);
    }
    
    // Process the patient's speech and generate contextual response
    const { response, nextPhase, shouldContinue } = await processPatientSpeech(
      speechResult, 
      state, 
      callSid
    );
    
    // Update conversation state
    state.phase = nextPhase;
    conversationStates.set(callSid, state);
    
    // Generate TwiML response
    if (shouldContinue) {
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Ruth-Neural" language="en-US" rate="medium" pitch="medium">
    ${response}
  </Say>
  <Gather 
    input="speech"
    action="${baseUrl}/api/voice-webhook/live-conversation"
    method="POST"
    speechTimeout="4"
    speechModel="experimental_conversations"
    enhanced="true"
    profanityFilter="false"
  >
    <Say voice="Polly.Ruth-Neural" language="en-US" rate="medium" pitch="medium">
      I'm here listening.
    </Say>
  </Gather>
  <Redirect>${baseUrl}/api/voice-webhook/live-conversation</Redirect>
</Response>`,
        {
          status: 200,
          headers: { 'Content-Type': 'text/xml' },
        }
      );
    } else {
      // End the conversation
      conversationStates.delete(callSid);
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Ruth-Neural" language="en-US" rate="medium" pitch="medium">
    ${response}
  </Say>
  <Pause length="1"/>
  <Say voice="Polly.Ruth-Neural" language="en-US" rate="medium" pitch="medium">
    Thank you for your time. Your care team will review this information. Take care and have a wonderful day!
  </Say>
  <Hangup />
</Response>`,
        {
          status: 200,
          headers: { 'Content-Type': 'text/xml' },
        }
      );
    }

  } catch (error) {
    console.error('Error in live conversation:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Ruth-Neural" language="en-US" rate="medium" pitch="medium">
    I'm sorry, I had trouble hearing you. Let me finish up our check-in.
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

async function processPatientSpeech(
  speechResult: string, 
  state: ConversationState, 
  callSid: string
): Promise<{ response: string; nextPhase: ConversationState['phase']; shouldContinue: boolean }> {
  
  if (!speechResult || speechResult.trim() === '') {
    // Handle silence - don't wait, be proactive
    switch (state.phase) {
      case 'greeting':
        return {
          response: "I'm here to check on your health. How have you been feeling lately?",
          nextPhase: 'symptoms',
          shouldContinue: true
        };
      case 'symptoms':
        return {
          response: "That's helpful. Now, how would you rate your energy level from 1 to 10?",
          nextPhase: 'energy',
          shouldContinue: true
        };
      default:
        return {
          response: "Thank you for taking the time to talk with me.",
          nextPhase: 'closing',
          shouldContinue: false
        };
    }
  }
  
  const lowerSpeech = speechResult.toLowerCase();
  
  // Emergency detection - immediate response
  const emergencyWords = ['chest pain', 'can\'t breathe', 'heart racing', 'dizzy', 'passing out', 'help me'];
  if (emergencyWords.some(word => lowerSpeech.includes(word))) {
    console.log(`🚨 EMERGENCY DETECTED for ${callSid}: ${speechResult}`);
    return {
      response: "I'm concerned about what you're describing. This sounds like it needs immediate medical attention. Please call 911 or go to the emergency room right away.",
      nextPhase: 'closing',
      shouldContinue: false
    };
  }
  
  // Context-aware responses based on conversation phase
  switch (state.phase) {
    case 'greeting':
    case 'symptoms':
      // Detect symptoms
      const detectedSymptoms = [];
      if (lowerSpeech.includes('short') || lowerSpeech.includes('breath')) detectedSymptoms.push('shortness of breath');
      if (lowerSpeech.includes('tired') || lowerSpeech.includes('fatigue')) detectedSymptoms.push('fatigue');
      if (lowerSpeech.includes('swell') || lowerSpeech.includes('puffy')) detectedSymptoms.push('swelling');
      if (lowerSpeech.includes('chest') || lowerSpeech.includes('pressure')) detectedSymptoms.push('chest discomfort');
      
      state.collectedInfo.symptoms.push(...detectedSymptoms);
      
      if (detectedSymptoms.length > 0) {
        return {
          response: `I understand you've been experiencing ${detectedSymptoms.join(' and ')}. Can you tell me more about when this started or how severe it is?`,
          nextPhase: 'followup',
          shouldContinue: true
        };
      } else if (lowerSpeech.includes('good') || lowerSpeech.includes('fine') || lowerSpeech.includes('well')) {
        return {
          response: "That's wonderful to hear you're feeling good. How would you rate your energy level on a scale of 1 to 10?",
          nextPhase: 'energy',
          shouldContinue: true
        };
      } else {
        return {
          response: "I see. Tell me, have you noticed any shortness of breath, unusual fatigue, or swelling lately?",
          nextPhase: 'symptoms',
          shouldContinue: true
        };
      }
      
    case 'energy':
      // Extract energy level
      const numberMatch = speechResult.match(/\b(\d+)\b/);
      let energyLevel = numberMatch ? parseInt(numberMatch[1]) : null;
      
      if (!energyLevel) {
        // Try to interpret descriptive responses
        if (lowerSpeech.includes('low') || lowerSpeech.includes('tired')) energyLevel = 3;
        else if (lowerSpeech.includes('okay') || lowerSpeech.includes('average')) energyLevel = 5;
        else if (lowerSpeech.includes('good') || lowerSpeech.includes('great')) energyLevel = 8;
      }
      
      if (energyLevel) {
        state.collectedInfo.energyLevel = energyLevel;
        if (energyLevel <= 4) {
          return {
            response: `An energy level of ${energyLevel} is concerning. Have you been getting enough rest, and are you taking your medications as prescribed?`,
            nextPhase: 'followup',
            shouldContinue: true
          };
        } else {
          return {
            response: `Good to hear your energy is at ${energyLevel}. Is there anything else you'd like to share about how you've been feeling?`,
            nextPhase: 'closing',
            shouldContinue: true
          };
        }
      } else {
        return {
          response: "I didn't catch a number. Could you tell me your energy level as a number from 1 to 10?",
          nextPhase: 'energy',
          shouldContinue: true
        };
      }
      
    case 'followup':
      // Gather additional context
      state.collectedInfo.concerns.push(speechResult);
      return {
        response: "I appreciate you sharing that with me. Your information will help your care team monitor your condition. Is there anything else concerning you?",
        nextPhase: 'closing',
        shouldContinue: true
      };
      
    default:
      return {
        response: "Thank you for sharing all of this information with me.",
        nextPhase: 'closing',
        shouldContinue: false
      };
  }
}

// Handle GET requests (redirects without speech)
export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
  
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Ruth-Neural" language="en-US" rate="medium" pitch="medium">
    I'm here to check on your health. How have you been feeling lately?
  </Say>
  <Gather 
    input="speech"
    action="${baseUrl}/api/voice-webhook/live-conversation"
    method="POST"
    speechTimeout="4"
    speechModel="experimental_conversations"
    enhanced="true"
  >
    <Say voice="Polly.Ruth-Neural" language="en-US" rate="medium" pitch="medium">
      Go ahead, I'm listening.
    </Say>
  </Gather>
  <Hangup />
</Response>`,
    {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    }
  );
}