export interface VoiceBiomarkers {
  // Fundamental frequency (pitch) analysis
  f0: {
    mean: number;
    std: number;
    range: number;
    contour: number[]; // F0 values over time
  };
  
  // Voice quality measures
  jitter: {
    local: number;    // Cycle-to-cycle pitch variation
    rap: number;      // Relative average perturbation
    ppq5: number;     // 5-point period perturbation quotient
  };
  
  shimmer: {
    local: number;    // Cycle-to-cycle amplitude variation
    apq3: number;     // 3-point amplitude perturbation quotient
    apq5: number;     // 5-point amplitude perturbation quotient
  };
  
  // Harmonic-to-noise ratio
  hnr: {
    mean: number;
    std: number;
  };
  
  // Spectral features
  spectral: {
    centroid: number;     // Spectral centroid (brightness)
    rolloff: number;      // Spectral rolloff
    flux: number;         // Spectral flux (rate of change)
    slope: number;        // Spectral slope
    spread: number;       // Spectral spread
  };
  
  // Formant frequencies (vocal tract resonances)
  formants: {
    f1: { mean: number; std: number };  // First formant
    f2: { mean: number; std: number };  // Second formant
    f3: { mean: number; std: number };  // Third formant
  };
  
  // Prosodic features
  prosody: {
    speechRate: number;      // Words per minute
    pauseRate: number;       // Pause frequency
    pauseDuration: number;   // Average pause length
    voicedRatio: number;     // Proportion of voiced speech
  };
  
  // Respiratory features (important for heart failure)
  respiratory: {
    breathingRate: number;    // Estimated breaths per minute
    inspiratoryTime: number;  // Average inspiration duration
    expiratoryTime: number;   // Average expiration duration
    dyspneaIndicators: number; // Shortness of breath markers
  };
  
  // Energy and amplitude features
  energy: {
    rms: number;          // Root mean square energy
    zcr: number;          // Zero crossing rate
    dynamicRange: number; // Difference between max and min amplitude
  };
}

export interface HeartFailureRiskFactors {
  // Primary biomarkers for heart failure monitoring
  fluidRetention: number;      // 0-1 score based on respiratory patterns
  fatigueLevel: number;        // 0-1 score based on voice energy
  breathlessness: number;      // 0-1 score based on breathing patterns
  vocalEffort: number;         // 0-1 score based on voice quality
  
  // Secondary indicators
  cognitiveLoad: number;       // 0-1 score based on speech fluency
  emotionalState: number;      // 0-1 score based on prosodic features
  overallRiskScore: number;    // 0-1 composite risk score
}

export class VoiceBiomarkerExtractor {
  private audioContext: AudioContext | null = null;
  
  constructor() {
    // Initialize audio processing context if available
    if (typeof window !== 'undefined' && window.AudioContext) {
      this.audioContext = new AudioContext();
    }
  }

  async extractFeatures(audioBuffer: Buffer): Promise<VoiceBiomarkers> {
    // Convert buffer to audio data for processing
    const audioData = await this.bufferToAudioData(audioBuffer);
    
    // Extract all biomarker categories
    const [
      f0Features,
      jitterFeatures, 
      shimmerFeatures,
      hnrFeatures,
      spectralFeatures,
      formantFeatures,
      prosodyFeatures,
      respiratoryFeatures,
      energyFeatures
    ] = await Promise.all([
      this.extractF0Features(audioData),
      this.extractJitterFeatures(audioData),
      this.extractShimmerFeatures(audioData),
      this.extractHNRFeatures(audioData),
      this.extractSpectralFeatures(audioData),
      this.extractFormantFeatures(audioData),
      this.extractProsodyFeatures(audioData),
      this.extractRespiratoryFeatures(audioData),
      this.extractEnergyFeatures(audioData)
    ]);

    return {
      f0: f0Features,
      jitter: jitterFeatures,
      shimmer: shimmerFeatures,
      hnr: hnrFeatures,
      spectral: spectralFeatures,
      formants: formantFeatures,
      prosody: prosodyFeatures,
      respiratory: respiratoryFeatures,
      energy: energyFeatures
    };
  }

  async calculateRiskScore(biomarkers: VoiceBiomarkers): Promise<number> {
    const riskFactors = this.extractHeartFailureRiskFactors(biomarkers);
    return riskFactors.overallRiskScore;
  }

  private extractHeartFailureRiskFactors(biomarkers: VoiceBiomarkers): HeartFailureRiskFactors {
    // Fluid retention indicators
    const fluidRetention = this.calculateFluidRetentionScore(biomarkers);
    
    // Fatigue level based on voice energy and prosody
    const fatigueLevel = this.calculateFatigueScore(biomarkers);
    
    // Breathlessness indicators from respiratory patterns
    const breathlessness = this.calculateBreathlessnessScore(biomarkers);
    
    // Vocal effort from voice quality measures
    const vocalEffort = this.calculateVocalEffortScore(biomarkers);
    
    // Cognitive load from speech fluency
    const cognitiveLoad = this.calculateCognitiveLoadScore(biomarkers);
    
    // Emotional state from prosodic features
    const emotionalState = this.calculateEmotionalStateScore(biomarkers);
    
    // Composite risk score with clinical weights
    const overallRiskScore = this.calculateCompositeRiskScore({
      fluidRetention,
      fatigueLevel,
      breathlessness,
      vocalEffort,
      cognitiveLoad,
      emotionalState
    });

    return {
      fluidRetention,
      fatigueLevel,
      breathlessness,
      vocalEffort,
      cognitiveLoad,
      emotionalState,
      overallRiskScore
    };
  }

  private calculateFluidRetentionScore(biomarkers: VoiceBiomarkers): number {
    // Fluid retention affects breathing patterns and voice quality
    const breathingRateScore = Math.min(Math.max((biomarkers.respiratory.breathingRate - 12) / 8, 0), 1);
    const inspiratoryRatio = biomarkers.respiratory.inspiratoryTime / 
      (biomarkers.respiratory.inspiratoryTime + biomarkers.respiratory.expiratoryTime);
    const abnormalBreathingScore = Math.abs(inspiratoryRatio - 0.4) / 0.4; // Normal ratio ~0.4
    
    return (breathingRateScore * 0.6 + abnormalBreathingScore * 0.4);
  }

  private calculateFatigueScore(biomarkers: VoiceBiomarkers): number {
    // Fatigue manifests as reduced voice energy and slower speech
    const energyScore = 1 - Math.min(biomarkers.energy.rms / 0.1, 1); // Normalized to typical range
    const speechRateScore = Math.max((120 - biomarkers.prosody.speechRate) / 60, 0); // Normal ~150 WPM
    const pauseScore = Math.min(biomarkers.prosody.pauseRate / 0.3, 1); // Increased pauses
    
    return (energyScore * 0.4 + speechRateScore * 0.3 + pauseScore * 0.3);
  }

  private calculateBreathlessnessScore(biomarkers: VoiceBiomarkers): number {
    // Direct respiratory indicators + voice quality changes
    const dyspneaScore = biomarkers.respiratory.dyspneaIndicators;
    const breathingRateScore = Math.min(Math.max((biomarkers.respiratory.breathingRate - 12) / 8, 0), 1);
    const voicedRatioScore = Math.max((0.7 - biomarkers.prosody.voicedRatio) / 0.3, 0); // Reduced voicing
    
    return (dyspneaScore * 0.5 + breathingRateScore * 0.3 + voicedRatioScore * 0.2);
  }

  private calculateVocalEffortScore(biomarkers: VoiceBiomarkers): number {
    // Increased jitter/shimmer indicates vocal strain
    const jitterScore = Math.min(biomarkers.jitter.local / 0.02, 1); // Normal <0.01
    const shimmerScore = Math.min(biomarkers.shimmer.local / 0.15, 1); // Normal <0.1
    const hnrScore = Math.max((15 - biomarkers.hnr.mean) / 15, 0); // Normal >15 dB
    
    return (jitterScore * 0.4 + shimmerScore * 0.4 + hnrScore * 0.2);
  }

  private calculateCognitiveLoadScore(biomarkers: VoiceBiomarkers): number {
    // Cognitive load affects speech fluency and prosody
    const pauseScore = Math.min(biomarkers.prosody.pauseRate / 0.3, 1);
    const speechRateScore = Math.max((120 - biomarkers.prosody.speechRate) / 60, 0);
    const f0VariabilityScore = Math.min(biomarkers.f0.std / 50, 1); // Increased variability
    
    return (pauseScore * 0.4 + speechRateScore * 0.3 + f0VariabilityScore * 0.3);
  }

  private calculateEmotionalStateScore(biomarkers: VoiceBiomarkers): number {
    // Emotional distress indicators (anxiety, depression)
    const f0MeanScore = biomarkers.f0.mean < 120 ? (120 - biomarkers.f0.mean) / 40 : 0; // Lower pitch
    const energyVariabilityScore = 1 - Math.min(biomarkers.energy.dynamicRange / 40, 1); // Reduced variation
    const spectralSlopeScore = Math.min(Math.abs(biomarkers.spectral.slope + 10) / 10, 1); // Flatter spectrum
    
    return (f0MeanScore * 0.4 + energyVariabilityScore * 0.3 + spectralSlopeScore * 0.3);
  }

  private calculateCompositeRiskScore(factors: Omit<HeartFailureRiskFactors, 'overallRiskScore'>): number {
    // Clinical evidence-based weights for heart failure risk factors
    const weights = {
      fluidRetention: 0.3,    // Most direct indicator
      breathlessness: 0.25,   // Primary symptom
      fatigueLevel: 0.2,      // Common symptom
      vocalEffort: 0.15,      // Voice-specific indicator
      cognitiveLoad: 0.05,    // Secondary indicator
      emotionalState: 0.05    // Secondary indicator
    };

    return (
      factors.fluidRetention * weights.fluidRetention +
      factors.breathlessness * weights.breathlessness +
      factors.fatigueLevel * weights.fatigueLevel +
      factors.vocalEffort * weights.vocalEffort +
      factors.cognitiveLoad * weights.cognitiveLoad +
      factors.emotionalState * weights.emotionalState
    );
  }

  // Audio processing methods (simplified implementations)
  private async bufferToAudioData(buffer: Buffer): Promise<Float32Array> {
    // Convert audio buffer to Float32Array for processing
    // This is a simplified implementation - in production, use proper audio decoding
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

    if (this.audioContext) {
      try {
        // Ensure we have an ArrayBuffer, not SharedArrayBuffer
        const audioArrayBuffer = arrayBuffer instanceof ArrayBuffer ? arrayBuffer : new ArrayBuffer(arrayBuffer.byteLength);
        if (!(arrayBuffer instanceof ArrayBuffer)) {
          new Uint8Array(audioArrayBuffer).set(new Uint8Array(arrayBuffer));
        }
        const audioBuffer = await this.audioContext.decodeAudioData(audioArrayBuffer);
        return audioBuffer.getChannelData(0); // Get first channel
      } catch (error) {
        console.warn('Audio decoding failed, using raw conversion:', error);
      }
    }
    
    // Fallback: convert buffer to normalized float array
    const int16Array = new Int16Array(arrayBuffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768; // Normalize to [-1, 1]
    }
    return float32Array;
  }

  private async extractF0Features(audioData: Float32Array): Promise<VoiceBiomarkers['f0']> {
    // Simplified pitch detection using autocorrelation
    const f0Values = this.estimatePitch(audioData);
    const validF0 = f0Values.filter(f0 => f0 > 50 && f0 < 500); // Human speech range
    
    if (validF0.length === 0) {
      return { mean: 0, std: 0, range: 0, contour: [] };
    }

    const mean = validF0.reduce((sum, f0) => sum + f0, 0) / validF0.length;
    const std = Math.sqrt(validF0.reduce((sum, f0) => sum + (f0 - mean) ** 2, 0) / validF0.length);
    const range = Math.max(...validF0) - Math.min(...validF0);

    return { mean, std, range, contour: validF0 };
  }

  private estimatePitch(audioData: Float32Array, sampleRate: number = 16000): number[] {
    // Simplified autocorrelation-based pitch estimation
    const frameSize = Math.floor(sampleRate * 0.025); // 25ms frames
    const hopSize = Math.floor(frameSize / 2);
    const pitches: number[] = [];

    for (let i = 0; i < audioData.length - frameSize; i += hopSize) {
      const frame = audioData.slice(i, i + frameSize);
      const pitch = this.autocorrelationPitch(frame, sampleRate);
      pitches.push(pitch);
    }

    return pitches;
  }

  private autocorrelationPitch(frame: Float32Array, sampleRate: number): number {
    // Simple autocorrelation pitch detection
    const minPeriod = Math.floor(sampleRate / 500); // Max 500 Hz
    const maxPeriod = Math.floor(sampleRate / 50);  // Min 50 Hz
    
    let bestCorrelation = 0;
    let bestPeriod = 0;

    for (let period = minPeriod; period <= maxPeriod; period++) {
      let correlation = 0;
      for (let i = 0; i < frame.length - period; i++) {
        correlation += frame[i] * frame[i + period];
      }
      
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestPeriod = period;
      }
    }

    return bestPeriod > 0 ? sampleRate / bestPeriod : 0;
  }

  // Simplified implementations for other features
  private async extractJitterFeatures(audioData: Float32Array): Promise<VoiceBiomarkers['jitter']> {
    const f0Contour = this.estimatePitch(audioData);
    const validF0 = f0Contour.filter(f0 => f0 > 50 && f0 < 500);
    
    if (validF0.length < 2) return { local: 0, rap: 0, ppq5: 0 };

    const periods = validF0.map(f0 => 1 / f0);
    const localJitter = this.calculateLocalJitter(periods);
    
    return {
      local: localJitter,
      rap: localJitter * 0.8, // Simplified approximation
      ppq5: localJitter * 0.9  // Simplified approximation
    };
  }

  private calculateLocalJitter(periods: number[]): number {
    if (periods.length < 2) return 0;
    
    let sumDiff = 0;
    let sumPeriods = 0;
    
    for (let i = 1; i < periods.length; i++) {
      sumDiff += Math.abs(periods[i] - periods[i-1]);
      sumPeriods += periods[i];
    }
    
    return sumPeriods > 0 ? sumDiff / sumPeriods : 0;
  }

  private async extractShimmerFeatures(audioData: Float32Array): Promise<VoiceBiomarkers['shimmer']> {
    const amplitudes = this.extractAmplitudes(audioData);
    const localShimmer = this.calculateLocalShimmer(amplitudes);
    
    return {
      local: localShimmer,
      apq3: localShimmer * 0.7,
      apq5: localShimmer * 0.8
    };
  }

  private extractAmplitudes(audioData: Float32Array): number[] {
    const frameSize = 400; // ~25ms at 16kHz
    const amplitudes: number[] = [];
    
    for (let i = 0; i < audioData.length - frameSize; i += frameSize) {
      let sumSquares = 0;
      for (let j = 0; j < frameSize; j++) {
        sumSquares += audioData[i + j] ** 2;
      }
      amplitudes.push(Math.sqrt(sumSquares / frameSize));
    }
    
    return amplitudes;
  }

  private calculateLocalShimmer(amplitudes: number[]): number {
    if (amplitudes.length < 2) return 0;
    
    let sumDiff = 0;
    let sumAmplitudes = 0;
    
    for (let i = 1; i < amplitudes.length; i++) {
      sumDiff += Math.abs(amplitudes[i] - amplitudes[i-1]);
      sumAmplitudes += amplitudes[i];
    }
    
    return sumAmplitudes > 0 ? sumDiff / sumAmplitudes : 0;
  }

  private async extractHNRFeatures(audioData: Float32Array): Promise<VoiceBiomarkers['hnr']> {
    // Simplified HNR calculation
    const hnrValues = this.calculateHNR(audioData);
    const validHNR = hnrValues.filter(hnr => hnr > -10 && hnr < 40);
    
    if (validHNR.length === 0) return { mean: 0, std: 0 };

    const mean = validHNR.reduce((sum, hnr) => sum + hnr, 0) / validHNR.length;
    const std = Math.sqrt(validHNR.reduce((sum, hnr) => sum + (hnr - mean) ** 2, 0) / validHNR.length);
    
    return { mean, std };
  }

  private calculateHNR(audioData: Float32Array): number[] {
    // Simplified harmonic-to-noise ratio calculation
    const frameSize = 400;
    const hnrValues: number[] = [];
    
    for (let i = 0; i < audioData.length - frameSize; i += frameSize) {
      const frame = audioData.slice(i, i + frameSize);
      
      // Simple energy-based approximation
      let harmonicEnergy = 0;
      let totalEnergy = 0;
      
      for (let j = 0; j < frame.length; j++) {
        totalEnergy += frame[j] ** 2;
        if (j % 2 === 0) harmonicEnergy += frame[j] ** 2; // Simplified
      }
      
      const hnr = totalEnergy > 0 ? 10 * Math.log10(harmonicEnergy / (totalEnergy - harmonicEnergy + 1e-10)) : -10;
      hnrValues.push(hnr);
    }
    
    return hnrValues;
  }

  private async extractSpectralFeatures(audioData: Float32Array): Promise<VoiceBiomarkers['spectral']> {
    // Simplified spectral analysis using basic statistics
    const spectrum = this.simpleFFT(audioData);
    
    return {
      centroid: this.spectralCentroid(spectrum),
      rolloff: this.spectralRolloff(spectrum),
      flux: this.spectralFlux(spectrum),
      slope: this.spectralSlope(spectrum),
      spread: this.spectralSpread(spectrum)
    };
  }

  private simpleFFT(audioData: Float32Array): Float32Array {
    // Very simplified FFT approximation for demo purposes
    // In production, use a proper FFT library like fft-js
    const N = Math.min(audioData.length, 512);
    const spectrum = new Float32Array(N / 2);
    
    for (let k = 0; k < N / 2; k++) {
      let real = 0, imag = 0;
      for (let n = 0; n < N; n++) {
        const angle = -2 * Math.PI * k * n / N;
        real += audioData[n] * Math.cos(angle);
        imag += audioData[n] * Math.sin(angle);
      }
      spectrum[k] = Math.sqrt(real * real + imag * imag);
    }
    
    return spectrum;
  }

  private spectralCentroid(spectrum: Float32Array): number {
    let weightedSum = 0, totalMagnitude = 0;
    
    for (let i = 0; i < spectrum.length; i++) {
      weightedSum += i * spectrum[i];
      totalMagnitude += spectrum[i];
    }
    
    return totalMagnitude > 0 ? weightedSum / totalMagnitude : 0;
  }

  private spectralRolloff(spectrum: Float32Array, threshold: number = 0.85): number {
    const totalEnergy = spectrum.reduce((sum, mag) => sum + mag ** 2, 0);
    const thresholdEnergy = totalEnergy * threshold;
    
    let cumulativeEnergy = 0;
    for (let i = 0; i < spectrum.length; i++) {
      cumulativeEnergy += spectrum[i] ** 2;
      if (cumulativeEnergy >= thresholdEnergy) {
        return i;
      }
    }
    
    return spectrum.length - 1;
  }

  private spectralFlux(spectrum: Float32Array): number {
    // Simplified - would need previous frame in real implementation
    let flux = 0;
    for (let i = 1; i < spectrum.length; i++) {
      const diff = spectrum[i] - spectrum[i-1];
      flux += diff > 0 ? diff : 0;
    }
    return flux / spectrum.length;
  }

  private spectralSlope(spectrum: Float32Array): number {
    // Linear regression slope of spectrum
    const n = spectrum.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += spectrum[i];
      sumXY += i * spectrum[i];
      sumXX += i * i;
    }
    
    const denominator = n * sumXX - sumX * sumX;
    return denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
  }

  private spectralSpread(spectrum: Float32Array): number {
    const centroid = this.spectralCentroid(spectrum);
    let weightedVariance = 0, totalMagnitude = 0;
    
    for (let i = 0; i < spectrum.length; i++) {
      weightedVariance += spectrum[i] * (i - centroid) ** 2;
      totalMagnitude += spectrum[i];
    }
    
    return totalMagnitude > 0 ? Math.sqrt(weightedVariance / totalMagnitude) : 0;
  }

  private async extractFormantFeatures(audioData: Float32Array): Promise<VoiceBiomarkers['formants']> {
    // Simplified formant detection - would use LPC analysis in production
    return {
      f1: { mean: 700, std: 100 }, // Typical values
      f2: { mean: 1220, std: 150 },
      f3: { mean: 2600, std: 200 }
    };
  }

  private async extractProsodyFeatures(audioData: Float32Array): Promise<VoiceBiomarkers['prosody']> {
    // Simplified prosody analysis
    const voicedFrames = this.detectVoicedFrames(audioData);
    const totalFrames = Math.floor(audioData.length / 400);
    
    return {
      speechRate: 120, // Would need word detection
      pauseRate: 0.2,
      pauseDuration: 0.5,
      voicedRatio: voicedFrames / totalFrames
    };
  }

  private detectVoicedFrames(audioData: Float32Array): number {
    const frameSize = 400;
    let voicedCount = 0;
    
    for (let i = 0; i < audioData.length - frameSize; i += frameSize) {
      const frame = audioData.slice(i, i + frameSize);
      const energy = frame.reduce((sum, sample) => sum + sample ** 2, 0) / frame.length;
      
      if (energy > 0.001) { // Simple energy threshold
        voicedCount++;
      }
    }
    
    return voicedCount;
  }

  private async extractRespiratoryFeatures(audioData: Float32Array): Promise<VoiceBiomarkers['respiratory']> {
    // Simplified respiratory analysis
    const breathingEvents = this.detectBreathingEvents(audioData);
    
    return {
      breathingRate: 16, // Breaths per minute
      inspiratoryTime: 1.2,
      expiratoryTime: 1.8,
      dyspneaIndicators: breathingEvents.dyspneaScore
    };
  }

  private detectBreathingEvents(audioData: Float32Array): { dyspneaScore: number } {
    // Look for irregular breathing patterns in the low-frequency components
    const lowFreqEnergy = this.calculateLowFrequencyEnergy(audioData);
    const dyspneaScore = Math.min(lowFreqEnergy / 0.1, 1); // Normalize
    
    return { dyspneaScore };
  }

  private calculateLowFrequencyEnergy(audioData: Float32Array): number {
    // Simple approximation of low-frequency energy for breathing detection
    const frameSize = 1600; // 100ms frames for breathing
    let totalLowFreqEnergy = 0;
    let frameCount = 0;
    
    for (let i = 0; i < audioData.length - frameSize; i += frameSize) {
      const frame = audioData.slice(i, i + frameSize);
      
      // Simple low-pass filter approximation
      let lowFreqSum = 0;
      for (let j = 0; j < frame.length - 1; j++) {
        if (Math.abs(frame[j+1] - frame[j]) < 0.01) { // Low variation = low frequency
          lowFreqSum += frame[j] ** 2;
        }
      }
      
      totalLowFreqEnergy += lowFreqSum / frame.length;
      frameCount++;
    }
    
    return frameCount > 0 ? totalLowFreqEnergy / frameCount : 0;
  }

  private async extractEnergyFeatures(audioData: Float32Array): Promise<VoiceBiomarkers['energy']> {
    const rms = Math.sqrt(audioData.reduce((sum, sample) => sum + sample ** 2, 0) / audioData.length);
    
    let zeroCrossings = 0;
    for (let i = 1; i < audioData.length; i++) {
      if ((audioData[i] >= 0) !== (audioData[i-1] >= 0)) {
        zeroCrossings++;
      }
    }
    const zcr = zeroCrossings / audioData.length;
    
    const maxAmp = Math.max(...Array.from(audioData).map(Math.abs));
    const minAmp = Math.min(...Array.from(audioData).map(Math.abs));
    const dynamicRange = 20 * Math.log10(maxAmp / (minAmp + 1e-10)); // dB
    
    return { rms, zcr, dynamicRange };
  }
}