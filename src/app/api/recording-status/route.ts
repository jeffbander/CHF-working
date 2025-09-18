import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const recordingSid = formData.get('RecordingSid') as string;
    const recordingStatus = formData.get('RecordingStatus') as string;
    const callSid = formData.get('CallSid') as string;
    const recordingUrl = formData.get('RecordingUrl') as string;
    const duration = formData.get('RecordingDuration') as string;
    
    console.log(`Recording status update for call ${callSid}:`);
    console.log(`- Recording SID: ${recordingSid}`);
    console.log(`- Status: ${recordingStatus}`);
    console.log(`- URL: ${recordingUrl}`);
    console.log(`- Duration: ${duration} seconds`);
    
    if (recordingStatus === 'completed' && recordingUrl) {
      // Here we would typically:
      // 1. Download the recording
      // 2. Process with OpenAI Whisper for transcription
      // 3. Extract voice biomarkers
      // 4. Generate clinical insights
      // 5. Store results in database
      
      console.log(`🎙️ Recording completed for ${callSid}: ${recordingUrl}`);
      console.log(`📊 Ready for voice biomarker analysis and AI processing`);
    }
    
    return NextResponse.json({ 
      status: 'received',
      recordingSid,
      callSid 
    });

  } catch (error) {
    console.error('Error processing recording status:', error);
    return NextResponse.json(
      { error: 'Failed to process recording status' },
      { status: 500 }
    );
  }
}