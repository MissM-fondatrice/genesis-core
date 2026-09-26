/**
 * GENESIS AI PROVIDER GATEWAY v0.1 — Simulated Adapter
 *
 * Reuses Genesis's existing simulation doctrine (section 17): when no real
 * provider is configured or all are unavailable, Genesis Core still
 * functions, but the response is explicitly and permanently marked
 * `simulated: true`. It is never presented as a real provider answer.
 */

import { GenesisAIRequest, GenesisAIResponse, ProviderStatus } from '../aiTypes.js';

/**
 * Deliberately does NOT implement AIProviderAdapter: it is not one of the
 * interchangeable real providers, it is Genesis Core's own last-resort
 * fallback (section 17), always reported as provider 'simulated', never as
 * one of gemini/claude/openai.
 */
export class SimulatedAdapter {
  public readonly name = 'Genesis Simulation Sandbox';

  public isConfigured(): boolean {
    return true;
  }

  public getStatus(): ProviderStatus {
    return 'SIMULATED';
  }

  public getModels(): string[] {
    return ['genesis-simulated-advisory-v0.1'];
  }

  public async generate(request: GenesisAIRequest): Promise<GenesisAIResponse> {
    const startedAt = Date.now();

    return {
      requestId: request.requestId,
      provider: 'simulated',
      model: 'genesis-simulated-advisory-v0.1',
      response: `[RÉPONSE SIMULÉE] Aucun fournisseur IA réel n'est configuré ou disponible. Genesis Core a généré une réponse d'analyse simulée pour la tâche '${request.taskType}' liée à l'objectif : "${request.objective}". Cette réponse est un espace réservé sans valeur informative réelle et ne doit jamais être présentée comme un résultat de fournisseur réel.`,
      status: 'OK',
      latencyMs: Date.now() - startedAt,
      toolCalls: [],
      warnings: ['NO_REAL_PROVIDER_AVAILABLE'],
      timestamp: new Date().toISOString(),
      simulated: true,
      auditMetadata: {
        requestId: request.requestId,
        provenance: 'ESTIMATED',
        fallbackChain: ['simulated']
      }
    };
  }
}
