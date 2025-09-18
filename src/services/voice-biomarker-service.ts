// Voice biomarker service stub for testing
export function createVoiceBiomarkerService(config: any) {
  return {
    async analyzeAudioChunk(audioBuffer: Buffer) {
      console.log(`[STUB] Analyzing audio chunk of ${audioBuffer.length} bytes`);
      // Return mock biomarker data
      return {
        jitter: Math.random() * 3,        // 0-3% typical
        shimmer: Math.random() * 8,       // 0-8% typical 
        hnr: 8 + Math.random() * 6,       // 8-14 dB typical
        f0Mean: 120 + Math.random() * 80, // 120-200 Hz typical
        analysisQuality: 0.8 + Math.random() * 0.2, // 0.8-1.0
        durationMs: 1000 + Math.random() * 500
      };
    },
    
    getTrendingAnalysis(lookback: number) {
      console.log(`[STUB] Getting trending analysis for last ${lookback} sessions`);
      return {
        trends: ['Stable jitter', 'Improving shimmer'],
        alerts: [] // No alerts for testing
      };
    }
  };
}
