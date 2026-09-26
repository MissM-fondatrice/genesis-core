/**
 * GENESIS AI PROVIDER GATEWAY v0.1 — Shared adapter helpers.
 * Kept intentionally tiny: adapters must stay simple translators between
 * the Genesis normalized format and a given provider's API.
 */

import { AIError, AIErrorCode, GenesisAIRequest, GenesisAIResponse, ProviderId } from '../aiTypes.js';

export function notConfiguredResponse(
  providerId: ProviderId,
  request: GenesisAIRequest,
  startedAt: number
): GenesisAIResponse {
  return errorResponse(providerId, request, startedAt, {
    code: 'PROVIDER_NOT_CONFIGURED',
    message: `${providerId} is not configured on this server (missing API key). Status: NOT_CONFIGURED.`,
    providerId
  });
}

export function errorResponse(
  providerId: ProviderId | 'simulated',
  request: GenesisAIRequest,
  startedAt: number,
  error: AIError
): GenesisAIResponse {
  return {
    requestId: request.requestId,
    provider: providerId,
    model: request.model || 'n/a',
    response: '',
    status: 'ERROR',
    latencyMs: Date.now() - startedAt,
    toolCalls: [],
    warnings: [],
    error,
    timestamp: new Date().toISOString(),
    simulated: providerId === 'simulated',
    auditMetadata: {
      requestId: request.requestId,
      provenance: 'ESTIMATED',
      fallbackChain: [providerId]
    }
  };
}

export function classifyFetchError(err: unknown): AIErrorCode {
  const msg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
  if (msg.includes('timeout') || msg.includes('aborted')) return 'TIMEOUT';
  if (msg.includes('401') || msg.includes('unauthorized') || msg.includes('authentication')) return 'AUTHENTICATION_ERROR';
  if (msg.includes('429') || msg.includes('rate limit')) return 'RATE_LIMIT';
  if (msg.includes('404') || msg.includes('model')) return 'MODEL_UNAVAILABLE';
  return 'UNKNOWN_ERROR';
}

/** Small fetch wrapper with a hard timeout so a stalled provider can never hang Genesis Core. */
export async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 20000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
