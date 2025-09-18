// ElevenLabs service stub for testing
export const ClinicalVoiceConfigs = {
  patient_care: {
    stability: 0.5,
    similarity_boost: 0.5
  },
  instructions: {
    stability: 0.6,
    similarity_boost: 0.4
  },
  sensitive: {
    stability: 0.7,
    similarity_boost: 0.3
  }
};

export function createElevenLabsService(apiKey: string, voiceId: string) {
  return {
    async generateTTS(message: string, options?: any) {
      console.log(`[STUB] TTS: "${message}"`);
      // Return mock base64 audio data
      return 'mock-audio-base64';
    }
  };
}
