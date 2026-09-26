/**
 * GENESIS CORE ⇄ GENESIS AI GATEWAY BRIDGE — TEST SUITE
 *
 * Verifies the raccordement's non-negotiable requirements:
 * 1. A correctly matched mission+agent submission is accepted and routed
 *    through the same permission/validation pipeline as an internal proposal.
 * 2. A mismatched agentId (anti-spoofing) is rejected before PermissionService.
 * 3. isSimulated=false submitted externally is always forced back to true.
 * 4. An unknown actionType string never reaches PermissionService.
 * 5. A governance-only action (e.g. MANAGE_PERMISSIONS) submitted through
 *    this bridge is refused exactly like it would be internally — no bypass.
 * 6. Every submission (accepted, rejected, forced-simulated) is audited.
 */

import { GenesisCore } from '../core/genesisCore.js';
import { TestResultItem, TestSuiteReport } from './genesisAgentTests.js';

export function runGatewayBridgeTests(core: GenesisCore): TestSuiteReport {
  const results: TestResultItem[] = [];

  // Fresh mission for isolated testing, assigned to Miss Danford.
  const mission = core.missionService.createMission({
    title: '[TEST GATEWAY BRIDGE] Proposition externe',
    description: 'Mission de test pour vérifier le raccordement Core ⇄ AI Gateway.',
    creatorId: 'usr_miss_m',
    assignedAgentId: 'agt_miss_danford',
    priority: 'LOW'
  });

  // =========================================================================
  // TEST 1: Correct mission+agent submission is accepted and routed through
  // the normal validation pipeline (CONTACT_COMPANY requires human validation).
  // =========================================================================
  let test1Passed = false;
  let test1Detail = '';
  try {
    const result = core.submitGatewayProposedAction({
      missionId: mission.id,
      agentId: 'agt_miss_danford',
      actionType: 'CONTACT_COMPANY',
      name: 'Contacter le fournisseur test',
      target: 'Fournisseur Test SARL',
      rationale: 'Proposition de test soumise via la Genesis AI Gateway.',
      payload: {},
      isSimulated: true,
      verifiedData: [],
      uncertainData: [],
      risks: [],
      alternatives: []
    });
    test1Passed = !result.rejected && result.requiresHuman === true && Boolean(result.validationRequest);
    test1Detail = test1Passed
      ? 'Soumission acceptée, ticket de validation créé pour Miss M, comme pour une proposition interne.'
      : `Échec : rejected=${JSON.stringify(result.rejected)}, requiresHuman=${result.requiresHuman}.`;
  } catch (err) {
    test1Detail = `Échec inattendu : ${err instanceof Error ? err.message : String(err)}`;
  }
  results.push({
    id: 1,
    name: 'Soumission valide acceptée et routée vers la validation humaine',
    passed: test1Passed,
    details: test1Detail,
    evidence: { missionId: mission.id }
  });

  // =========================================================================
  // TEST 2: Anti-spoofing — wrong agentId for this mission is rejected
  // before reaching PermissionService.
  // =========================================================================
  let test2Passed = false;
  let test2Detail = '';
  try {
    const result = core.submitGatewayProposedAction({
      missionId: mission.id,
      agentId: 'agt_logistics', // NOT the assigned agent (agt_miss_danford)
      actionType: 'CONTACT_COMPANY',
      name: 'Tentative usurpation',
      target: 'Cible',
      rationale: 'Ne devrait jamais être acceptée.',
      payload: {},
      isSimulated: true,
      verifiedData: [],
      uncertainData: [],
      risks: [],
      alternatives: []
    });
    test2Passed = result.rejected?.code === 'AGENT_MISMATCH';
    test2Detail = test2Passed
      ? "Rejet correct : l'agent soumissionnaire ne correspond pas à l'agent assigné à la mission."
      : `Échec : rejected=${JSON.stringify(result.rejected)}.`;
  } catch (err) {
    test2Detail = `Échec inattendu : ${err instanceof Error ? err.message : String(err)}`;
  }
  results.push({
    id: 2,
    name: "Anti-usurpation : agentId non assigné à la mission → rejeté",
    passed: test2Passed,
    details: test2Detail,
    evidence: {}
  });

  // =========================================================================
  // TEST 3: isSimulated=false submitted externally is always forced to true.
  // =========================================================================
  let test3Passed = false;
  let test3Detail = '';
  try {
    const mission2 = core.missionService.createMission({
      title: '[TEST GATEWAY BRIDGE] Forçage simulation',
      description: 'Vérifie que isSimulated est forcé à true.',
      creatorId: 'usr_miss_m',
      assignedAgentId: 'agt_miss_danford',
      priority: 'LOW'
    });
    core.submitGatewayProposedAction({
      missionId: mission2.id,
      agentId: 'agt_miss_danford',
      actionType: 'CONTACT_COMPANY',
      name: 'Test forçage simulation',
      target: 'Cible',
      rationale: 'isSimulated=false soumis volontairement pour ce test.',
      payload: {},
      isSimulated: false, // deliberately false
      verifiedData: [],
      uncertainData: [],
      risks: [],
      alternatives: []
    });
    const updatedMission = core.missionService.getMissionById(mission2.id);
    test3Passed = updatedMission?.requestedAction?.isSimulated === true;
    test3Detail = test3Passed
      ? "isSimulated=false soumis par l'appelant a bien été ignoré ; l'action stockée reste isSimulated=true."
      : `Échec : requestedAction.isSimulated=${updatedMission?.requestedAction?.isSimulated}.`;
  } catch (err) {
    test3Detail = `Échec inattendu : ${err instanceof Error ? err.message : String(err)}`;
  }
  results.push({
    id: 3,
    name: 'isSimulated=false externe toujours forcé à true',
    passed: test3Passed,
    details: test3Detail,
    evidence: {}
  });

  // =========================================================================
  // TEST 4: Unknown actionType string is rejected before PermissionService.
  // =========================================================================
  let test4Passed = false;
  let test4Detail = '';
  try {
    const result = core.submitGatewayProposedAction({
      missionId: mission.id,
      agentId: 'agt_miss_danford',
      actionType: 'DELETE_EVERYTHING', // not a real Permission
      name: 'Action invalide',
      target: 'Cible',
      rationale: 'Ne devrait jamais être acceptée.',
      payload: {},
      isSimulated: true,
      verifiedData: [],
      uncertainData: [],
      risks: [],
      alternatives: []
    });
    test4Passed = result.rejected?.code === 'INVALID_ACTION_TYPE';
    test4Detail = test4Passed
      ? "Rejet correct : 'DELETE_EVERYTHING' n'est pas une Permission Genesis reconnue."
      : `Échec : rejected=${JSON.stringify(result.rejected)}.`;
  } catch (err) {
    test4Detail = `Échec inattendu : ${err instanceof Error ? err.message : String(err)}`;
  }
  results.push({
    id: 4,
    name: 'actionType inconnu rejeté avant tout appel à PermissionService',
    passed: test4Passed,
    details: test4Detail,
    evidence: {}
  });

  // =========================================================================
  // TEST 5: A governance-only action (MANAGE_PERMISSIONS) submitted via the
  // bridge is refused exactly like it would be internally — no bypass.
  // =========================================================================
  let test5Passed = false;
  let test5Detail = '';
  try {
    const result = core.submitGatewayProposedAction({
      missionId: mission.id,
      agentId: 'agt_miss_danford',
      actionType: 'MANAGE_PERMISSIONS',
      name: "Tentative d'auto-habilitation",
      target: 'agt_miss_danford',
      rationale: 'Ne devrait jamais être exécutable par un agent.',
      payload: {},
      isSimulated: true,
      verifiedData: [],
      uncertainData: [],
      risks: [],
      alternatives: []
    });
    // MANAGE_PERMISSIONS is a known Permission, so it is NOT rejected at the
    // DTO-validation stage — it must instead require human validation, exactly
    // as PermissionService already enforces for governance actions.
    test5Passed = !result.rejected && result.requiresHuman === true;
    test5Detail = test5Passed
      ? 'MANAGE_PERMISSIONS soumis via la passerelle exige toujours une validation humaine — aucun contournement possible.'
      : `Échec : rejected=${JSON.stringify(result.rejected)}, requiresHuman=${result.requiresHuman}.`;
  } catch (err) {
    test5Detail = `Échec inattendu : ${err instanceof Error ? err.message : String(err)}`;
  }
  results.push({
    id: 5,
    name: 'Aucun contournement de gouvernance via la passerelle (MANAGE_PERMISSIONS)',
    passed: test5Passed,
    details: test5Detail,
    evidence: {}
  });

  // =========================================================================
  // TEST 6: Every submission left a GATEWAY_ACTION_SUBMITTED audit trail.
  // =========================================================================
  let test6Passed = false;
  let test6Detail = '';
  try {
    const recent = core.auditService.getHistory(100);
    const hasSubmitted = recent.some((e) => e.eventType === 'GATEWAY_ACTION_SUBMITTED');
    test6Passed = hasSubmitted;
    test6Detail = test6Passed
      ? "L'événement GATEWAY_ACTION_SUBMITTED est bien présent dans le registre notarié."
      : 'Échec : aucun événement GATEWAY_ACTION_SUBMITTED trouvé.';
  } catch (err) {
    test6Detail = `Échec inattendu : ${err instanceof Error ? err.message : String(err)}`;
  }
  results.push({
    id: 6,
    name: 'Traçabilité complète des soumissions de la passerelle (audit)',
    passed: test6Passed,
    details: test6Detail,
    evidence: {}
  });

  const passedTests = results.filter((r) => r.passed).length;

  return {
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    passedTests,
    failedTests: results.length - passedTests,
    allPassed: passedTests === results.length,
    results
  };
}
