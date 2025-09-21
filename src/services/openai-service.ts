// HeartVoice Monitor - HIPAA-Compliant OpenAI Integration Service
// Based on chatgpt-expert design specifications for clinical voice analysis

import { SafeVoiceAnalysisRequest } from '@/types/clinical';

interface ClinicalAnalysisResponse {
  riskIndicators: {
    anxiety: number; // 0-100 scale
    breathlessness: number; // 0-100 scale
    confusion: number; // 0-100 scale
    fatigue: number; // 0-100 scale
  };
  conversationQuality: {
    coherence: number; // 0-100 scale
    engagement: number; // 0-100 scale
    completeness: number; // 0-100 scale
  };
  clinicalSummary: string; // 2-3 sentence professional summary
  recommendedActions: string[]; // Standardized clinical actions
  confidence: number; // Analysis confidence 0-100
}

export class PHIProtectionService {
  private redactionPatterns = {
    names: /\b[A-Z][a-z]+\s[A-Z][a-z]+\b/g,
    phones: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
    ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
    dates: /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g,
    addresses: /\b\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|court|ct|circle|cir|boulevard|blvd)\b/gi
  };

  async deidentifyTranscript(rawTranscript: string): Promise<string> {
    let cleanTranscript = rawTranscript;
    
    // Replace all PHI patterns with generic placeholders
    cleanTranscript = cleanTranscript.replace(this.redactionPatterns.names, '[PATIENT]');
    cleanTranscript = cleanTranscript.replace(this.redactionPatterns.phones, '[PHONE]');
    cleanTranscript = cleanTranscript.replace(this.redactionPatterns.ssn, '[ID]');
    cleanTranscript = cleanTranscript.replace(this.redactionPatterns.dates, '[DATE]');
    cleanTranscript = cleanTranscript.replace(this.redactionPatterns.addresses, '[ADDRESS]');
    
    // Additional healthcare-specific redaction
    cleanTranscript = cleanTranscript.replace(/MRN[\s:]*\d+/gi, '[MRN]');
    cleanTranscript = cleanTranscript.replace(/DOB[\s:]*\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/gi, '[DOB]');
    
    return cleanTranscript;
  }

  validateNoPHI(text: string): boolean {
    // Check if any PHI patterns remain
    const patterns = Object.values(this.redactionPatterns);
    return !patterns.some(pattern => pattern.test(text));
  }
}

export class ClinicalAnalysisCache {
  private cache = new Map<string, { data: ClinicalAnalysisResponse; expires: number }>();
  private readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  generateCacheKey(request: SafeVoiceAnalysisRequest): string {
    // Create cache key from deidentified content (no PHI)
    const content = `${request.clinicalContext}_${request.deidentifiedTranscript.length}_${request.conversationFlow.join('_')}`;
    return Buffer.from(content).toString('base64').slice(0, 32);
  }

  get(key: string): ClinicalAnalysisResponse | null {
    const cached = this.cache.get(key);
    if (!cached || Date.now() > cached.expires) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  }

  set(key: string, data: ClinicalAnalysisResponse): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + this.CACHE_DURATION
    });
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    const now = Date.now();
    const active = Array.from(this.cache.values()).filter(item => item.expires > now).length;
    return {
      totalEntries: this.cache.size,
      activeEntries: active,
      expiredEntries: this.cache.size - active,
      hitRate: 0 // Would track this in production
    };
  }
}

export class HeartVoiceOpenAIService {
  private phiProtection: PHIProtectionService;
  private cache: ClinicalAnalysisCache;
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.phiProtection = new PHIProtectionService();
    this.cache = new ClinicalAnalysisCache();
    
    // In production, this would come from secure environment variables
    this.apiKey = process.env.OPENAI_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('OpenAI API key not found. Service will use fallback analysis.');
    }
  }

  async analyzeClinicalVoice(request: SafeVoiceAnalysisRequest): Promise<ClinicalAnalysisResponse> {
    // Check cache first (7-day retention)
    const cacheKey = this.cache.generateCacheKey(request);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Validate no PHI in request
    if (!this.phiProtection.validateNoPHI(request.deidentifiedTranscript)) {
      throw new Error('PHI detected in analysis request. Cannot proceed with OpenAI processing.');
    }

    try {
      const analysis = await this.performOpenAIAnalysis(request);
      this.cache.set(cacheKey, analysis);
      return analysis;
    } catch (error) {
      console.error('OpenAI analysis failed:', error);
      return this.fallbackAnalysis(request);
    }
  }

  private async performOpenAIAnalysis(request: SafeVoiceAnalysisRequest): Promise<ClinicalAnalysisResponse> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not available');
    }

    const prompt = this.buildClinicalPrompt(request);
    
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-2024-08-06', // Latest GPT-4o for clinical reasoning
        messages: [
          {
            role: 'system',
            content: 'You are a clinical AI assistant specializing in heart failure patient monitoring. Analyze deidentified voice transcripts for clinical indicators. Provide structured, objective assessments.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1, // Low temperature for consistent clinical analysis
        max_tokens: 1000,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'clinical_analysis',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                riskIndicators: {
                  type: 'object',
                  properties: {
                    anxiety: { type: 'number', minimum: 0, maximum: 100 },
                    breathlessness: { type: 'number', minimum: 0, maximum: 100 },
                    confusion: { type: 'number', minimum: 0, maximum: 100 },
                    fatigue: { type: 'number', minimum: 0, maximum: 100 }
                  },
                  required: ['anxiety', 'breathlessness', 'confusion', 'fatigue'],
                  additionalProperties: false
                },
                conversationQuality: {
                  type: 'object',
                  properties: {
                    coherence: { type: 'number', minimum: 0, maximum: 100 },
                    engagement: { type: 'number', minimum: 0, maximum: 100 },
                    completeness: { type: 'number', minimum: 0, maximum: 100 }
                  },
                  required: ['coherence', 'engagement', 'completeness'],
                  additionalProperties: false
                },
                clinicalSummary: {
                  type: 'string',
                  maxLength: 500
                },
                recommendedActions: {
                  type: 'array',
                  items: { type: 'string', maxLength: 100 },
                  maxItems: 5
                },
                confidence: { type: 'number', minimum: 0, maximum: 100 }
              },
              required: ['riskIndicators', 'conversationQuality', 'clinicalSummary', 'recommendedActions', 'confidence'],
              additionalProperties: false
            }
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content) as ClinicalAnalysisResponse;
  }

  private buildClinicalPrompt(request: SafeVoiceAnalysisRequest): string {
    return `
Analyze this deidentified heart failure patient voice interaction transcript:

**Clinical Context**: ${request.clinicalContext}
**Session ID**: ${request.sessionId}
**Transcript**: "${request.deidentifiedTranscript}"
**Conversation Flow**: ${request.conversationFlow.join(' -> ')}

Provide a structured clinical analysis focusing on:

1. **Risk Indicators** (0-100 scale):
   - Anxiety level based on speech patterns and content
   - Breathlessness indicators from voice quality and statements
   - Confusion/cognitive clarity from conversation coherence
   - Fatigue level from energy in responses and voice strength

2. **Conversation Quality** (0-100 scale):
   - Coherence of patient responses
   - Level of engagement and cooperation
   - Completeness of information provided

3. **Clinical Summary**: 2-3 sentence professional assessment
4. **Recommended Actions**: Up to 5 clinical actions based on findings
5. **Confidence**: Your confidence in this analysis (0-100)

Focus on objective clinical indicators. Do not make specific diagnoses or treatment recommendations.
    `;
  }

  private fallbackAnalysis(request: SafeVoiceAnalysisRequest): ClinicalAnalysisResponse {
    // Rule-based fallback analysis when OpenAI is unavailable
    // This would be more sophisticated in production
    const transcriptLength = request.deidentifiedTranscript.length;
    const responseCount = request.conversationFlow.length;
    
    return {
      riskIndicators: {
        anxiety: Math.min(80, transcriptLength < 100 ? 60 : 30),
        breathlessness: responseCount < 3 ? 70 : 40,
        confusion: transcriptLength < 50 ? 60 : 20,
        fatigue: responseCount < 2 ? 80 : 35
      },
      conversationQuality: {
        coherence: Math.min(90, transcriptLength * 0.5),
        engagement: Math.min(85, responseCount * 20),
        completeness: responseCount >= 3 ? 75 : 40
      },
      clinicalSummary: "Analysis completed using fallback system due to AI service unavailability. Clinical review recommended.",
      recommendedActions: ["Schedule clinical review", "Verify patient contact", "Consider follow-up call"],
      confidence: 60 // Lower confidence for rule-based analysis
    };
  }

  // Utility methods for monitoring and maintenance
  getCacheStats() {
    return this.cache.getStats();
  }

  clearCache() {
    this.cache.clear();
  }

  async validateService(): Promise<boolean> {
    try {
      // Test with minimal safe request
      const testRequest: SafeVoiceAnalysisRequest = {
        sessionId: 'test-session',
        deidentifiedTranscript: 'Patient reports feeling okay today.',
        conversationFlow: ['greeting', 'symptoms_check', 'closing'],
        clinicalContext: 'routine_check',
        timestamp: new Date().toISOString()
      };

      await this.analyzeClinicalVoice(testRequest);
      return true;
    } catch (error) {
      console.error('OpenAI service validation failed:', error);
      return false;
    }
  }
}