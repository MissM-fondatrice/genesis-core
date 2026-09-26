/**
 * GENESIS AI PROVIDER GATEWAY v0.1 — Provider Registry (section 11)
 *
 * Central, read-only view of which AI providers exist, their configuration
 * status, and their declared models/capabilities. Never exposes API keys.
 */

import { AIProviderAdapter } from './aiProviderAdapter.js';
import { GeminiAdapter } from './adapters/geminiAdapter.js';
import { ClaudeAdapter } from './adapters/claudeAdapter.js';
import { OpenAIAdapter } from './adapters/openaiAdapter.js';
import { SimulatedAdapter } from './adapters/simulatedAdapter.js';
import { ProviderId, ProviderInfo } from './aiTypes.js';

export class ProviderRegistry {
  private adapters: Map<ProviderId, AIProviderAdapter>;
  private simulatedAdapter: SimulatedAdapter;

  constructor() {
    this.adapters = new Map<ProviderId, AIProviderAdapter>([
      ['claude', new ClaudeAdapter()],
      ['gemini', new GeminiAdapter()],
      ['openai', new OpenAIAdapter()]
    ]);
    this.simulatedAdapter = new SimulatedAdapter();
  }

  public getAdapter(providerId: ProviderId): AIProviderAdapter | undefined {
    return this.adapters.get(providerId);
  }

  public getSimulatedAdapter(): SimulatedAdapter {
    return this.simulatedAdapter;
  }

  public getAllProviderIds(): ProviderId[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Public, key-free status listing for Miss M (section 21: "AI PROVIDERS" table).
   */
  public getStatusList(): ProviderInfo[] {
    const now = new Date().toISOString();
    const real: ProviderInfo[] = Array.from(this.adapters.values()).map((adapter) => ({
      providerId: adapter.providerId,
      name: adapter.name,
      status: adapter.getStatus(),
      models: adapter.getModels(),
      capabilities: ['text_generation', 'mission_analysis_advisory'],
      simulationMode: adapter.getStatus() !== 'AVAILABLE',
      lastCheckedAt: now,
      restrictions: [
        'Ne peut ni modifier la Constitution Genesis, ni les permissions, ni exécuter une action externe réelle.'
      ]
    }));

    const simulated: ProviderInfo = {
      providerId: 'simulated',
      name: this.simulatedAdapter.name,
      status: 'SIMULATED',
      models: this.simulatedAdapter.getModels(),
      capabilities: ['fallback_advisory'],
      simulationMode: true,
      lastCheckedAt: now,
      restrictions: ['Toujours disponible comme filet de sécurité ; jamais présenté comme un fournisseur réel.']
    };

    return [...real, simulated];
  }
}
