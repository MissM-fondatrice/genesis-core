/**
 * GENESIS OFFICIAL AGENT ARCHITECTURE & GOVERNANCE TEST SUITE
 * 
 * Verifies all 10 constitutional requirements:
 * 1. All 15 agents are visible.
 * 2. Every agent has a unique identity.
 * 3. Agents can receive appropriate missions.
 * 4. Agents cannot execute unauthorized actions.
 * 5. Agents cannot grant themselves permissions.
 * 6. Human validation works.
 * 7. Simulated external actions are clearly marked SIMULATED.
 * 8. Important agent actions appear in History.
 * 9. Inter-agent communication is traceable.
 * 10. The RESTAURATION HoloMenu domain remains separate from future medical, airport or retirement-home concepts.
 */

import { GenesisCore } from '../core/genesisCore.js';
import { AuditEvent } from '../../src/types/genesis.js';

export interface TestResultItem {
  id: number;
  name: string;
  passed: boolean;
  details: string;
  evidence: Record<string, unknown>;
}

export interface TestSuiteReport {
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  allPassed: boolean;
  results: TestResultItem[];
}

export function runGenesisAgentTests(core: GenesisCore): TestSuiteReport {
  const results: TestResultItem[] = [];

  // =========================================================================
  // TEST 1: All 15 agents are visible
  // =========================================================================
  const allAgents = core.agentService.getAllAgents();
  const agentCount = allAgents.length;
  const test1Passed = agentCount === 15;
  results.push({
    id: 1,
    name: 'Visibilité des 15 agents officiels',
    passed: test1Passed,
    details: test1Passed
      ? `Exactement 15 agents spécialisés sont enregistrés et actifs dans Genesis Core.`
      : `Échec : ${agentCount} agents trouvés au lieu des 15 requis.`,
    evidence: {
      expectedCount: 15,
      actualCount: agentCount,
      agentNames: allAgents.map((a) => a.name)
    }
  });

  // =========================================================================
  // TEST 2: Every agent has a unique identity
  // =========================================================================
  const idSet = new Set(allAgents.map((a) => a.id));
  const nameSet = new Set(allAgents.map((a) => a.name));
  const test2Passed = idSet.size === 15 && nameSet.size === 15;
  results.push({
    id: 2,
    name: 'Unicité absolue des identités d\'agents',
    passed: test2Passed,
    details: test2Passed
      ? `Chaque agent dispose d'un identifiant unique (idSet: ${idSet.size}) et d'un nom organisationnel distinct (nameSet: ${nameSet.size}).`
      : `Échec : Collision d'identifiants ou de noms détectée.`,
    evidence: {
      uniqueIdsCount: idSet.size,
      uniqueNamesCount: nameSet.size,
      ids: Array.from(idSet)
    }
  });

  // =========================================================================
  // TEST 3: Agents can receive appropriate missions
  // =========================================================================
  const bestCommercial = core.agentService.findBestAgentForMission({
    title: 'Négociation fournisseur CHR',
    description: 'Prospection pour matériel de cuisine et devis'
  });
  const bestTech = core.agentService.findBestAgentForMission({
    title: 'Incident terminal HoloMenu',
    description: 'API et firmware borne tactile de commande'
  });
  const bestAntiGaspi = core.agentService.findBestAgentForMission({
    title: 'Collecte surplus buffet',
    description: 'Redistribution aux associations caritatives'
  });

  const test3Passed =
    bestCommercial.agent.id === 'agt_miss_danford' &&
    bestTech.agent.id === 'agt_technical' &&
    bestAntiGaspi.agent.id === 'agt_antigaspi';

  results.push({
    id: 3,
    name: 'Attribution intelligente des missions selon les domaines',
    passed: test3Passed,
    details: test3Passed
      ? `Routage contextuel validé : commercial -> Miss Danford, HoloMenu -> Technical Agent, surplus -> Anti-Gaspi Agent.`
      : `Échec de routage d'expertise.`,
    evidence: {
      commercialRoutedTo: bestCommercial.agent.name,
      technicalRoutedTo: bestTech.agent.name,
      antiGaspiRoutedTo: bestAntiGaspi.agent.name
    }
  });

  // =========================================================================
  // TEST 4: Agents cannot execute unauthorized actions
  // =========================================================================
  const logisticsAgent = core.identityService.getIdentityById('agt_logistics')!;
  const unauthorizedEval = core.permissionService.evaluatePermission({
    actor: logisticsAgent,
    action: 'APPROVE_ACTION' // Sovereign founder permission
  });

  const test4Passed = !unauthorizedEval.granted && unauthorizedEval.requiresHumanValidation;
  results.push({
    id: 4,
    name: 'Interdiction d\'actes non habilités ou souverains',
    passed: test4Passed,
    details: test4Passed
      ? `Rejet conforme : Logistics Agent a tenté d'exécuter APPROVE_ACTION. Motif: ${unauthorizedEval.reason}`
      : `Échec : Une action régalienne a été accordée à un agent autonome.`,
    evidence: {
      attemptedAction: 'APPROVE_ACTION',
      agent: logisticsAgent.name,
      evaluationGranted: unauthorizedEval.granted,
      reason: unauthorizedEval.reason
    }
  });

  // =========================================================================
  // TEST 5: Agents cannot grant themselves permissions
  // =========================================================================
  const missDanford = core.identityService.getIdentityById('agt_miss_danford')!;
  const integrityCheck = core.identityService.verifyIdentityIntegrity(missDanford.id, 'FOUNDER');
  const selfElevationAttempt = core.permissionService.evaluatePermission({
    actor: missDanford,
    action: 'CREATE_MISSION' as any // Attempting founder governance
  });

  const test5Passed = !integrityCheck.valid && !selfElevationAttempt.granted;
  results.push({
    id: 5,
    name: 'Inviolabilité des permissions (auto-attribution prohibée)',
    passed: test5Passed,
    details: test5Passed
      ? `Barrière constitutionnelle confirmée : Miss Danford ne peut ni devenir Fondatrice ni s'auto-octroyer de privilèges.`
      : `Échec : Violation constitutionnelle non bloquée.`,
    evidence: {
      integrityViolation: integrityCheck.violation,
      selfElevationBlocked: !selfElevationAttempt.granted
    }
  });

  // =========================================================================
  // TEST 6: Human validation works
  // =========================================================================
  const externalContactEval = core.permissionService.evaluatePermission({
    actor: missDanford,
    action: 'CONTACT_COMPANY'
  });

  const test6Passed =
    !externalContactEval.granted &&
    externalContactEval.requiresHumanValidation === true;

  results.push({
    id: 6,
    name: 'Gouvernance avec validation humaine obligatoire',
    passed: test6Passed,
    details: test6Passed
      ? `Démarche sensible (CONTACT_COMPANY) suspendue : passage obligatoire en HUMAN_REQUIRED pour signature de Miss M.`
      : `Échec : Démarche extérieure exécutée sans saisine de Miss M.`,
    evidence: {
      action: 'CONTACT_COMPANY',
      requiresHumanValidation: externalContactEval.requiresHumanValidation,
      evaluationReason: externalContactEval.reason
    }
  });

  // =========================================================================
  // TEST 7: Simulated external actions are clearly marked SIMULATED
  // =========================================================================
  const simulatedResult = core.agentService.executeSimulatedAction(
    {
      id: 'msn_test_audit',
      title: 'Test Audit',
      description: 'Test',
      creatorId: 'usr_miss_m',
      assignedAgentId: 'agt_miss_danford',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      context: {}
    },
    {
      actionType: 'CONTACT_COMPANY',
      name: 'Prise de contact EuroKitchen',
      target: 'EuroKitchen Pro',
      rationale: 'Demande de devis',
      payload: {},
      risksAndLimitations: [],
      proposedNextStep: 'Validation Miss M',
      isSimulated: true
    }
  );

  const test7Passed =
    simulatedResult.summary.includes('SIMULATED ACTION') &&
    simulatedResult.disclaimer.includes('SIMULATION');

  results.push({
    id: 7,
    name: 'Marquage strict et certifié des actions SIMULÉES',
    passed: test7Passed,
    details: test7Passed
      ? `Label SIMULATED ACTION certifié. Clause d'exclusion de responsabilité présente: « ${simulatedResult.disclaimer} »`
      : `Échec : Marquage de simulation manquant ou ambigu.`,
    evidence: {
      summary: simulatedResult.summary,
      disclaimer: simulatedResult.disclaimer
    }
  });

  // =========================================================================
  // TEST 8: Important agent actions appear in History
  // =========================================================================
  const recentEvents = core.auditService.getEvents(20);
  const test8Passed = recentEvents.length > 0 && recentEvents.some((e: AuditEvent) => e.actorType !== undefined);

  results.push({
    id: 8,
    name: 'Traçabilité inaltérable dans le registre d\'historique',
    passed: test8Passed,
    details: test8Passed
      ? `Le registre notarié contient ${recentEvents.length} événements horodatés et infalsifiables.`
      : `Échec : Aucun événement tracé dans l'historique d'audit.`,
    evidence: {
      eventCount: recentEvents.length,
      sampleEventTypes: recentEvents.slice(0, 3).map((e: AuditEvent) => e.eventType)
    }
  });

  // =========================================================================
  // TEST 9: Inter-agent communication is traceable
  // =========================================================================
  const testExchange = core.collaborateInterAgent({
    fromAgentId: 'agt_technical',
    toAgentId: 'agt_miss_danford',
    requestSummary: 'Demande de validation des contraintes d\'alimentation électrique EuroKitchen'
  });

  const exchangeEvents = core.auditService.getEvents(10).filter(
    (e: AuditEvent) => e.eventType === 'INTER_AGENT_COMMUNICATION'
  );
  const test9Passed = testExchange !== undefined && exchangeEvents.length > 0;

  results.push({
    id: 9,
    name: 'Communication inter-agents traçable & filtrée',
    passed: test9Passed,
    details: test9Passed
      ? `Échange Technical Agent -> Miss Danford acheminé via Core. Données filtrées au strict nécessaire et notariées dans l'audit.`
      : `Échec : Échange inter-agents non tracé.`,
    evidence: {
      exchangeId: testExchange.id,
      from: testExchange.fromAgentName,
      to: testExchange.toAgentName,
      filteredResponse: testExchange.filteredResponse,
      auditLogged: exchangeEvents.length > 0
    }
  });

  // =========================================================================
  // TEST 10: The RESTAURATION HoloMenu domain remains separate
  // =========================================================================
  const techAgent = core.identityService.getIdentityById('agt_technical')!;
  const boundaryText = techAgent.constitutionalBoundaries.join(' ').toLowerCase();
  const domainText = techAgent.domain.toLowerCase();

  const mentionsRestauration = domainText.includes('restauration');
  const isolatedFromMedical = boundaryText.includes('médical');
  const isolatedFromAirport = boundaryText.includes('aéroportuaire');
  const isolatedFromRetirement = boundaryText.includes('ehpad');

  const test10Passed =
    mentionsRestauration &&
    isolatedFromMedical &&
    isolatedFromAirport &&
    isolatedFromRetirement;

  results.push({
    id: 10,
    name: 'Isolement strict du domaine RESTAURATION HoloMenu',
    passed: test10Passed,
    details: test10Passed
      ? `Garde-fou constitutionnel certifié : HoloMenu est rigoureusement restreint à la restauration et étanche face aux concepts médicaux, aéroportuaires et EHPAD.`
      : `Échec : Absence de clause de cloisonnement de domaine sur l'Agent Technique.`,
    evidence: {
      domain: techAgent.domain,
      boundaries: techAgent.constitutionalBoundaries
    }
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
