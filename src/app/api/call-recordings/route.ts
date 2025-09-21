import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

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

    const client = createTwilioClient();
    if (!client) {
      return NextResponse.json({ error: 'Twilio not configured' }, { status: 500 });
    }

    if (callSid) {
      // Get recordings for specific call
      const recordings = await client.recordings.list({
        callSid: callSid,
        limit: 20
      });

      const recordingsWithDetails = await Promise.all(
        recordings.map(async (recording) => {
          try {
            // Get call details
            const call = await client.calls(recording.callSid).fetch();
            
            return {
              sid: recording.sid,
              callSid: recording.callSid,
              duration: recording.duration,
              dateCreated: recording.dateCreated,
              uri: recording.uri,
              mediaUrl: `https://api.twilio.com${recording.uri.replace('.json', '.mp3')}`,
              callDetails: {
                to: call.to,
                from: call.from,
                status: call.status,
                duration: call.duration,
                startTime: call.startTime,
                endTime: call.endTime
              }
            };
          } catch (error) {
            console.error(`Error fetching call details for ${recording.callSid}:`, error);
            return {
              sid: recording.sid,
              callSid: recording.callSid,
              duration: recording.duration,
              dateCreated: recording.dateCreated,
              uri: recording.uri,
              mediaUrl: `https://api.twilio.com${recording.uri.replace('.json', '.mp3')}`,
              error: 'Could not fetch call details'
            };
          }
        })
      );

      return NextResponse.json({
        callSid,
        recordings: recordingsWithDetails
      });
    } else {
      // Get all recent recordings
      const recordings = await client.recordings.list({
        limit: 50,
        dateCreatedAfter: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      });

      const recordingsWithDetails = await Promise.all(
        recordings.map(async (recording) => {
          try {
            const call = await client.calls(recording.callSid).fetch();
            
            return {
              sid: recording.sid,
              callSid: recording.callSid,
              duration: recording.duration,
              dateCreated: recording.dateCreated,
              uri: recording.uri,
              mediaUrl: `https://api.twilio.com${recording.uri.replace('.json', '.mp3')}`,
              callDetails: {
                to: call.to,
                from: call.from,
                status: call.status,
                duration: call.duration,
                startTime: call.startTime,
                endTime: call.endTime
              }
            };
          } catch (error) {
            return {
              sid: recording.sid,
              callSid: recording.callSid,
              duration: recording.duration,
              dateCreated: recording.dateCreated,
              uri: recording.uri,
              mediaUrl: `https://api.twilio.com${recording.uri.replace('.json', '.mp3')}`,
              error: 'Could not fetch call details'
            };
          }
        })
      );

      return NextResponse.json({
        recordings: recordingsWithDetails,
        count: recordings.length
      });
    }

  } catch (error) {
    console.error('Error fetching call recordings:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch recordings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}