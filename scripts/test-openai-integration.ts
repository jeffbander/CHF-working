#!/usr/bin/env tsx

// Test script for OpenAI Realtime API integration
import { OpenAIRealtimeService } from '../src/services/openai-realtime-service';

async function testOpenAIIntegration() {
  console.log('🧪 Testing OpenAI Realtime API Integration');
  console.log('==========================================');

  // Check for required environment variables
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY environment variable is required');
    console.log('   Please set your OpenAI API key in .env.local');
    process.exit(1);
  }

  try {
    console.log('📡 Initializing OpenAI Realtime Service...');
    
    // Create configuration object
    const config = {
      apiKey: process.env.OPENAI_API_KEY!,
      model: 'gpt-4o-realtime-preview-2024-12-17',
      sessionConfig: {
        modalities: ['text', 'audio'] as ['text', 'audio'],
        instructions: 'You are a helpful AI assistant for testing purposes.',
        voice: 'alloy',
        input_audio_format: 'pcm16' as 'pcm16',
        output_audio_format: 'pcm16' as 'pcm16'
      }
    };
    
    const service = new OpenAIRealtimeService(config);

    console.log('🔗 Testing connection to OpenAI Realtime API...');
    const sessionId = await service.connect({
      patientId: 'test-patient-123',
      status: 'connecting'
    });

    console.log(`✅ Successfully connected with session ID: ${sessionId}`);

    // Test audio data (mock)
    console.log('🎵 Testing audio data handling...');
    const mockAudioBuffer = new ArrayBuffer(1024); // Silent audio buffer
    service.sendAudioInput(mockAudioBuffer);

    console.log('✅ Audio data processed successfully');
    
    // Test audio commit
    console.log('🔄 Testing audio commit...');
    service.commitAudioInput();

    console.log('✅ Audio input committed successfully');

    // Clean up
    console.log('🧹 Disconnecting from OpenAI...');
    await service.disconnect();

    console.log('✅ OpenAI Realtime API integration test completed successfully!');
    console.log('');
    console.log('🎉 Next steps:');
    console.log('   - Configure Twilio Media Streams');
    console.log('   - Test WebSocket proxy server');
    console.log('   - Set up voice biomarker analysis');
    console.log('   - Test end-to-end call flow');

  } catch (error) {
    console.error('❌ OpenAI integration test failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        console.log('💡 Tip: Check your OPENAI_API_KEY is valid and has Realtime API access');
      } else if (error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
        console.log('💡 Tip: Check your internet connection and OpenAI API status');
      }
    }
    
    process.exit(1);
  }
}

// Run the test if called directly
if (require.main === module) {
  testOpenAIIntegration().catch(console.error);
}

export { testOpenAIIntegration };