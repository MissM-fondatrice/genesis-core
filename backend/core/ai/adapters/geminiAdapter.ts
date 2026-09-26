/**
 * GENESIS AI PROVIDER GATEWAY v0.1 — Gemini (Google) Adapter
 * Translates Genesis normalized request/response to/from the @google/genai
 * SDK. GEMINI_API_KEY is server-side only. This is the only file in Genesis
 * allowed to import @google/genai directly (section 6/9).
 */

import { GoogleGenAI } from '@google/genai';
import { AIProviderAdapter } from '../aiProviderAdapter.js';
import { GenesisAIRequest, GenesisAIResponse, ProviderStatus } from '../aiTypes.js';
import { classifyFetchError, errorResponse, notConfiguredResponse } from './adapterUtils.js';

const DEFAULT_MODEL = 'gemini-2.5-flash';

export class GeminiAdapter implements AIProviderAdapter {
  public readonly providerId = 'gemini' as const;
  public readonly name = 'Gemini (Google)';

  public isConfigured(): boolean {
    return Boolean(process.env.GEMINI_API_KEY);
  }

  public getStatus(): ProviderStatus {
    return this.isConfigured() ? 'AVAILABLE' : 'NOT_CONFIGURED';
  }

  public getModels(): string[] {
    return [DEFAULT_MODEL];
  }

  public async generate(request: GenesisAIRequest): Promise<GenesisAIResponse> {
    const startedAt = Date.now();

    if (!this.isConfigured()) {
      return notConfiguredResponse('gemini', request, startedAt);
    }

    try {
      const model = request.model || DEFAULT_MODEL;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

      const prompt = [
        request.systemContext.objective,
        ...request.messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      ].join('\n\n');

      const result: any = await ai.models.generateContent({
        model,
        contents: prompt
      });

      const text: string = result?.text || '';

      return {
        requestId: request.requestId,
        provider: 'gemini',
        model,
        response: text,
        status: 'OK',
        usage: {
          inputTokens: result?.usageMetadata?.promptTokenCount,
          outputTokens: result?.usageMetadata?.candidatesTokenCount
        },
        latencyMs: Date.now() - startedAt,
        toolCalls: [],
        warnings: [],
        timestamp: new Date().toISOString(),
        simulated: false,
        auditMetadata: {
          requestId: request.requestId,
          provenance: 'ESTIMATED',
          fallbackChain: ['gemini']
        }
      };
    } catch (err) {
      return errorResponse('gemini', request, startedAt, {
        code: classifyFetchError(err),
        message: err instanceof Error ? err.message : 'Unknown error calling Gemini API.',
        providerId: 'gemini'
      });
    }
  }
}
