import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const callSid = formData.get('CallSid') as string;
    
    console.log(`Call completion for ${callSid}`);
    
    // This is where we would typically:
    // 1. Store the collected data in patient records
    // 2. Calculate risk scores
    // 3. Send alerts to care team if needed
    // 4. Schedule follow-up if necessary
    
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Ruth-Neural" language="en-US" rate="medium" pitch="medium">
    Thank you so much for taking the time to complete this health check-in. Your responses have been carefully recorded and will be reviewed by your care team.
  </Say>
  <Pause length="2"/>
  <Say voice="Polly.Ruth-Neural" language="en-US" rate="medium" pitch="medium">
    If you have any urgent concerns or symptoms, please contact your healthcare provider immediately or call 911 for emergencies.
  </Say>
  <Pause length="2"/>
  <Say voice="Polly.Ruth-Neural" language="en-US" rate="medium" pitch="medium">
    Take care, and we'll check in with you again soon. Have a wonderful day! Goodbye!
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
    console.error('Error in completion webhook:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural" language="en-US">
    Thank you for your time. Your health check-in is now complete. Take care and goodbye!
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

// Handle GET request (direct access to completion)
export async function GET(req: NextRequest) {
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural" language="en-US">
    Thank you for completing your health check-in. Your information has been recorded for your care team. Take care and goodbye!
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