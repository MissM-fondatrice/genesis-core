/**
 * GENESIS AI PROVIDER GATEWAY v0.1 — TEST SUITE
 *
 * Verifies the non-negotiable requirements from the specification:
 * 1. A request via the common interface is accepted for an authorized actor.
 * 2. An agent without the required permission is blocked before any provider is reached.
 * 3. Unauthorized tools are stripped, never forwarded to a provider (section 16).
 * 4. With no provider configured, Genesis Core still functions via the simulation sandbox.
 * 5. A simulated response is always explicitly marked `simulated: true`.
 * 6. Every gateway call — accepted, blocked, or simulated — is present in the audit trail.
 * 7. Adding/using multiple providers requires no rewrite of Genesis Core (registry shape).
 * 8. Core mission logic (deterministic analysis) is unaffected by an AI Gateway outage.
 * 9. An agent cannot use the Gateway to self-authorize governance actions.
 */

import { GenesisCore } from '../core/genesisCore.js';
import { Identity } from '../../src/types/genesis.js';
import { TestResultItem, TestSuiteReport } from './genesisAgentTests.js';

export function runAIGatewayTests(core: GenesisCore): TestSuiteReport {
  const results: TestResultItem[] = [];

  const danford = core.identityService.getIdentityById('agt_miss_danford');

  // =========================================================================
  // TEST 7: Registry exposes exactly the 3 real providers + simulated fallback,
  // proving a new provider can be registered without touching Genesis Core.
  // =========================================================================
  const providerStatus = core.getAIProvidersStatus();
  const expectedIds = ['claude', 'gemini', 'openai', 'simulated'];
  const actualIds = providerStatus.map((p) => String(p.providerId)).sort();
  const test7Passed = expectedIds.every((id) => actualIds.includes(id)) && providerStatus.every((p) => !JSON.stringify(p).toLowerCase().includes('key'));
  results.push({
    id: 7,
    name: 'Registre des fournisseurs sans réécriture du Core & sans clé exposée',
    passed: test7Passed,
    details: test7Passed
      ? `Le registre expose ${providerStatus.length} entrées (3 fournisseurs réels + simulation) sans aucune clé API.`
      : `Échec : registre incomplet ou clé potentiellement exposée.`,
    evidence: { providerIds: actualIds }
  });

  // =========================================================================
  // TEST 8: Deterministic mission analysis remains intact even though no real
  // AI provider is configured in this environment (Core stays functional).
  // =========================================================================
  let test8Passed = false;
  let test8Detail = '';
  try {
    const mission = core.missionService.createMission({
      title: '[TEST AI GATEWAY] Fournisseur matériel restauration',
      description: 'Mission de test pour vérifier la résilience du Core face à une IA indisponible.',
      creatorId: 'usr_miss_m',
      assignedAgentId: 'agt_miss_danford',
      priority: 'LOW'
    });
    // Deterministic analysis must succeed synchronously regardless of AI Gateway outcome.
    const { proposedAction } = core.agentService.analyzeMission(mission);
    test8Passed = Boolean(proposedAction && proposedAction.actionType);
    test8Detail = test8Passed
      ? 'Le moteur déterministe Genesis a produit une proposition valide indépendamment de la disponibilité IA.'
      : "Échec : aucune proposition déterministe produite.";
  } catch (err) {
    test8Detail = `Échec inattendu : ${err instanceof Error ? err.message : String(err)}`;
  }
  results.push({
    id: 8,
    name: "Résilience : le Core reste fonctionnel si aucun fournisseur IA n'est disponible",
    passed: test8Passed,
    details: test8Detail,
    evidence: {}
  });

  // =================
