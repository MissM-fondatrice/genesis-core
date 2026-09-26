/**
 * GENESIS AI PROVIDER GATEWAY v0.1 — OpenAI Adapter
 * Translates Genesis normalized request/response to/from the OpenAI
 * Chat Completions API. OPENAI_API_KEY is server-side only.
 */

import { AIProviderAdapter } from '../aiProviderAdapter.js';
import { GenesisAIRequest, GenesisAIResponse, ProviderStatus } from '../aiTypes.js';
import { classifyFetchError, errorResponse, fetchWithTimeout, notConfiguredResponse } from './adapterUtils.js';

const DEFAULT_MODEL = 'gpt-4o';

export class OpenAIAdapter implements AIProviderAdapter {
  public readonly providerId = 'openai' as const;
  public readonly name = 'OpenAI';

  public isConfigured(): boolean {
    return Boolean(process.env.OPENAI_API_KEY);
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
      return notConfiguredResponse('openai', request, startedAt);
    }

    try {
      const model = request.model || DEFAULT_MODEL;
      const res = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: request.systemContext.objective },
            ...request.messages.filter((m) => m.role !== 'system').map((m) => ({ role: m.role, content: m.content }))
          ]
        })
      });

      if (!res.ok) {
        const bodyText = await res.text().catch(() => '');
        return errorResponse('openai', request, startedAt, {
          code: res.status === 401 ? 'AUTHENTICATION_ERROR' : res.status === 429 ? 'RATE_LIMIT' : 'UNKNOWN_ERROR',
          message: `OpenAI API returned HTTP ${res.status}. ${bodyText.slice(0, 200)}`,
          providerId: 'openai'
        });
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || '';

      return {
        requestId: request.requestId,
        provider: 'openai',
        model,
        response: text,
        status: 'OK',
        usage: {
          inputTokens: data.usage?.prompt_tokens,
          outputTokens: data.usage?.completion_tokens
        },
        latencyMs: Date.now() - startedAt,
        toolCalls: [],
        warnings: [],
        timestamp: new Date().toISOString(),
        simulated: false,
        auditMetadata: {
          requestId: request.requestId,
          provenance: 'ESTIMATED',
          fallbackChain: ['openai']
        }
      };
    } catch (err) {
      return errorResponse('openai', request, startedAt, {
        code: classifyFetchError(err),
        message: err instanceof Error ? err.message : 'Unknown error calling OpenAI API.',
        providerId: 'openai'
      });
    }
  }
}
