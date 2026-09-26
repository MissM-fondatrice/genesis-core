/**
 * GENESIS AI PROVIDER GATEWAY v0.1
 *
 * Common adapter contract. Every provider (Gemini, Claude, OpenAI, or any
 * future provider) implements this interface. Genesis Core and the Gateway
 * router never import a provider SDK directly — only adapters do, and only
 * behind this interface (section 6 and 9 of the specification).
 */

import { ProviderId, ProviderStatus, GenesisAIRequest, GenesisAIResponse } from './aiTypes.js';

export interface AIProviderAdapter {
  readonly providerId: ProviderId;
  readonly name: string;

  /** True only if the required server-side API key is present. Never fabricated. */
  isConfigured(): boolean;

  /** Current status without making a network call. */
  getStatus(): ProviderStatus;

  /** Models this adapter can serve when configured. */
  getModels(): string[];

  /**
   * Executes the request against the underlying provider and returns a
   * normalized GenesisAIResponse. Must never throw for expected failure
   * modes (missing config, timeout, rate limit, etc.) — those are reported
   * as a normalized error response instead, so a single provider failure
   * cannot corrupt Genesis Core or mission state.
   */
  generate(request: GenesisAIRequest): Promise<GenesisAIResponse>;
}
