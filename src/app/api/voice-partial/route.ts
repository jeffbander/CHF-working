import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const partialSpeechResult = formData.get('PartialSpeechResult') as string;
    const callSid = formData.get('CallSid') as string;
    
    console.log(`Partial speech for ${callSid}: "${partialSpeechResult}"`);
    
    // This endpoint receives partial speech results as the user speaks
    // We can use this for real-time processing or UI updates
    // For now, just log and return empty response
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error processing partial speech:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}