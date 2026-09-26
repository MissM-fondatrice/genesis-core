/**
 * GENESIS AI PROVIDER GATEWAY v0.1 — Claude (Anthropic) Adapter
 *
 * Translates the Genesis normalized request/response format to/from the
 * Anthropic Messages API. The rest of Genesis never touches this file's
 * request/response shapes directly — it only sees GenesisAIRequest /
 * GenesisAIResponse (section 9).
 *
 * The API key (ANTHROPIC_API_KEY) is read exclusively from server-side
 * environment variables. It is never logged, never sent to the frontend.
 */

import { AIProviderAdapter } from '../aiProviderAdapter.js';
import { GenesisAIRequest, GenesisAIResponse, ProviderStatus } from '../aiTypes.js';
import { classifyFetchError, errorResponse, fetchWithTimeout, notConfiguredResponse } from './adapterUtils.js';

const DEFAULT_MODEL = 'claude-sonnet-4-6';

export class ClaudeAdapter implements AIProviderAdapter {
  public readonly providerId = 'claude' as const;
  public readonly name = 'Claude (Anthropic)';

  public isConfigured(): boolean {
    return Boolean(process.env.ANTHROPIC_API_KEY);
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
      return notConfiguredResponse('claude', request, startedAt);
    }

    try {
      const model = request.model || DEFAULT_MODEL;
      const res = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY as string,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          max_tokens: 1024,
          system: request.systemContext.objective,
          messages: request.messages
            .filter((m) => m.role !== 'system')
            .map((m) => ({ role: m.role, content: m.content }))
        })
      });

      if (!res.ok) {
        const bodyText = await res.text().catch(() => '');
        return errorResponse('claude', request, startedAt, {
          code: res.status === 401 ? 'AUTHENTICATION_ERROR' : res.status === 429 ? 'RATE_LIMIT' : 'UNKNOWN_ERROR',
          message: `Claude API returned HTTP ${res.status}. ${bodyText.slice(0, 200)}`,
          providerId: 'claude'
        });
      }

      const data = await res.json();
      const text = Array.isArray(data.content)
        ? data.content.map((block: { type: string; text?: string }) => (block.type === 'text' ? block.text || '' : '')).join('\n')
        : '';

      return {
        requestId: request.requestId,
        provider: 'claude',
        model,
        response: text,
        status: 'OK',
        usage: {
          inputTokens: data.usage?.input_tokens,
          outputTokens: data.usage?.output_tokens
        },
        latencyMs: Date.now() - startedAt,
        toolCalls: [],
        warnings: [],
        timestamp: new Date().toISOString(),
        simulated: false,
        auditMetadata: {
          requestId: request.requestId,
          provenance: 'ESTIMATED',
          fallbackChain: ['claude']
        }
      };
    } catch (err) {
      return errorResponse('claude', request, startedAt, {
        code: classifyFetchError(err),
        message: err instanceof Error ? err.message : 'Unknown error calling Claude API.',
        providerId: 'claude'
      });
    }
  }
}
