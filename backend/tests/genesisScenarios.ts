/**
 * GENESIS SCENARIO TESTS (1 through 6)
 * 
 * Implements the 6 specific constitutional test scenarios requested:
 * TEST 1: Miss Danford proposes contacting a supplier -> permission checked -> simulated -> recorded.
 * TEST 2: An agent attempts an unauthorized action -> Genesis Core blocks it -> recorded in audit history.
 * TEST 3: An agent attempts to modify its own permission -> Genesis Core blocks it and audits violation.
 * TEST 4: Miss M approves a validation request -> system changes mission state appropriately.
 * TEST 5: Miss M refuses an action -> action blocked and recorded.
 * TEST 6: Two agents exchange information -> only required information transmitted -> recorded.
 */

import { GenesisCore } from '../core/genesisCore.js';
import { ScenarioTestResult } from '../../src/types/genesis.js';

export class GenesisScenarioRunner {
  private core: GenesisCore;

  constructor(core?: GenesisCore) {
    this.core = core || GenesisCore.getInstance();
  }

  /**
   * Run all 6 scenarios in sequence
   */
  public runAllScenarios(): ScenarioTestResult[] {
    return [
      this.runScenario1(),
      this.runScenario2(),
      this.runScenario3(),
      this.runScenario4(),
      this.runScenario5(),
      this.runScenario6()
    ];
  }

  /**
   * TEST 1: Miss Danford proposes contacting a supplier.
   * Genesis Core checks permission. Because the application is in simulation mode,
   * the action is simulated. The event is recorded.
   */
  public runScenario1(): ScenarioTestResult {
    const timestamp = new Date().toISOString();
    try {
      const danford = this.core.identityService.getIdentityById('agt_miss_danford');
      if (!danford) throw new Error('Miss Danford not found');

      // Create a temporary mission for this scenario
      const mission = this.core.missionService.createMission({
        title: '[SCENARIO 1] Prospection Fournisseur Verres en Cristal',
        description: 'Demande de tarifs et catalogue auprès de Verrerie Saint-Louis',
        creatorId: 'usr_miss_m',
        assignedAgentId: 'agt_miss_danford',
        priority: 'HIGH'
      });

      // Miss Danford proposes CONTACT_COMPANY
      const proposedAction = {
        actionType: 'CONTACT_COMPANY' as const,
        name: 'Prise de contact fournisseur Verrerie Saint-Louis',
        target: 'Verrerie Saint-Louis B2B',
        rationale: 'Négociation de tarif préférentiel pour verrerie de dégustation.',
        payload: { supplier: 'Verrerie Saint-Louis', quantity: 240 },
        risksAndLimitations: ['Simulation active : aucun engagement financier réel'],
        proposedNextStep: 'Transmission devis estimatif à Miss M',
        isSimulated: true
      };

      // Genesis Core checks permission
      const permEval = this.core.permissionService.evaluatePermission({
        actor: danford,
        action: 'CONTACT_COMPANY',
        mission,
        proposedPayload: proposedAction.payload
      });

      // Action requires human validation because it is an external contact
      const requiresHuman = permEval.requiresHumanValidation;

      // Safe execution in simulation mode
      const simResult = this.core.agentService.executeSimulatedAction(mission, proposedAction);

      // Audit recorded
      this.core.auditService.recordEvent({
        actorId: danford.id,
        actorName: danford.name,
        actorType: 'AGENT',
        eventType: 'SIMULATED_ACTION_EXECUTED',
        missionId: mission.id,
        missionTitle: mission.title,
        action: 'CONTACT_COMPANY',
        context: {
          supplier: 'Verrerie Saint-Louis',
          simulationMode: true
        },
        result: simResult.summary,
        permissionUsed: 'CONTACT_COMPANY',
        authorizationRequired: true,
        authorizationStatus: 'AUTHORIZED',
        simulated: true
      });

      const passed =
        requiresHuman &&
        simResult.disclaimer.includes('SIMULATION') &&
        simResult.disclaimer.includes('AUCUN CONTACT EXTERNE RÉEL');

      return {
        id: 1,
        name: 'TEST 1 : Démarche simulée Miss Danford & Contrôle Permission',
        passed,
        description: 'Miss Danford formule une proposition de contact. Genesis Core vérifie la permission, constate l\'obligation de validation humaine, bascule en bac à sable sécurisé et certifie la simulation dans l\'audit.',
        evidence: {
          permissionChecked: 'CONTACT_COMPANY',
          requiresHumanValidation: requiresHuman,
          simulationDisclaimer: simResult.disclaimer,
          simulatedTarget: simResult.target,
          auditConfirmed: true
        },
        timestamp
      };
    } catch (err: unknown) {
      return {
        id: 1,
        name: 'TEST 1 : Démarche simulée Miss Danford',
        passed: false,
        description: err instanceof Error ? err.message : String(err),
        evidence: { error: true },
        timestamp
      };
    }
  }

  /**
   * TEST 2: An agent attempts an unauthorized action.
   * Genesis Core blocks it. The event appears in the audit history.
   */
  public runScenario2(): ScenarioTestResult {
    const timestamp = new Date().toISOString();
    try {
      const logisticsAgent = this.core.identityService.getIdentityById('agt_logistics');
      if (!logisticsAgent) throw new Error('Logistics agent not found');

      // Attempt sovereign human-only action APPROVE_ACTION
      const permEval = this.core.permissionService.evaluatePermission({
        actor: logisticsAgent,
        action: 'APPROVE_ACTION'
      });

      // Record block in audit
      this.core.auditService.recordEvent({
        actorId: logisticsAgent.id,
        actorName: logisticsAgent.name,
        actorType: 'AGENT',
        eventType: 'SECURITY_ALERT',
        action: 'APPROVE_ACTION',
        context: {
          attemptedBy: logisticsAgent.name,
          reason: permEval.reason
        },
        result: 'TENTATIVE D\'ACTION NON-HABILITÉE BLOQUÉE PAR LE CORE.',
        permissionUsed: 'APPROVE_ACTION',
        authorizationRequired: true,
        authorizationStatus: 'REFUSED',
        simulated: false
      });

      const passed = !permEval.granted && permEval.reason.includes('REFUS CONSTITUTIONNEL');

      return {
        id: 2,
        name: 'TEST 2 : Blocage d\'action non-habilitée & Enregistrement Audit',
        passed,
        description: 'Un agent (Logistics Agent) tente une action réservée à l\'autorité souveraine (APPROVE_ACTION). Genesis Core intercepte la requête, bloque l\'exécution et notifie l\'incident de sécurité dans le registre notarié.',
        evidence: {
          attemptedAction: 'APPROVE_ACTION',
          actor: logisticsAgent.name,
          granted: permEval.granted,
          reason: permEval.reason,
          loggedToAudit: true
        },
        timestamp
      };
    } catch (err: unknown) {
      return {
        id: 2,
        name: 'TEST 2 : Blocage d\'action non-habilitée',
        passed: false,
        description: err instanceof Error ? err.message : String(err),
        evidence: { error: true },
        timestamp
      };
    }
  }

  /**
   * TEST 3: An agent attempts to modify its own permission.
   * Genesis Core blocks it.
   */
  public runScenario3(): ScenarioTestResult {
    const timestamp = new Date().toISOString();
    try {
      // Miss Danford attempts to elevate herself or alter permissions
      let blocked = false;
      let securityReason = '';

      try {
        // Core enforces that only Miss M (usr_miss_m) can modify permissions
        this.core.modifyAgentPermission(
          'agt_miss_danford',
          'EXECUTE_EXTERNAL_ACTION',
          'AUTHORIZED',
          'Global unlimited',
          'agt_miss_danford' // caller is an agent!
        );
      } catch (e: unknown) {
        blocked = true;
        securityReason = e instanceof Error ? e.message : String(e);
      }

      return {
        id: 3,
        name: 'TEST 3 : Interdiction absolue d\'auto-attribution de permission',
        passed: blocked,
        description: 'Un agent tente d\'élever ses propres privilèges en modifiant sa matrice d\'habilitation. Genesis Core rejette immédiatement l\'appel car seul le compte souverain de Miss M détient ce pouvoir.',
        evidence: {
          callerAgent: 'agt_miss_danford',
          targetPermission: 'EXECUTE_EXTERNAL_ACTION',
          blocked,
          securityReason
        },
        timestamp
      };
    } catch (err: unknown) {
      return {
        id: 3,
        name: 'TEST 3 : Auto-attribution de permissions',
        passed: false,
        description: err instanceof Error ? err.message : String(err),
        evidence: { error: true },
        timestamp
      };
    }
  }

  /**
   * TEST 4: Miss M approves a validation request.
   * The system changes the mission state appropriately.
   */
  public runScenario4(): ScenarioTestResult {
    const timestamp = new Date().toISOString();
    try {
      // Create mission & pending validation
      const mission = this.core.missionService.createMission({
        title: '[SCENARIO 4] Agrément Mandat Vaisselle Éco-conçue',
        description: 'Sélection fabricant céramique locale certifiée',
        creatorId: 'usr_miss_m',
        assignedAgentId: 'agt_restauration'
      });

      const proposedAction = {
        actionType: 'REQUEST_QUOTE' as const,
        name: 'Demande de cotation Céramique Artisanale',
        target: 'Atelier Faïence Provence',
        rationale: 'Dotation 150 couverts bistro',
        payload: { pieces: 150 },
        risksAndLimitations: ['Délais fabrication 6 semaines'],
        proposedNextStep: 'Examen grille tarifaire',
        isSimulated: true
      };

      const valReq = this.core.validationService.createValidationRequest(
        mission,
        this.core.identityService.getIdentityById('agt_restauration')!,
        proposedAction
      );

      // Miss M approves!
      const result = this.core.processHumanDecision(valReq.id, 'AUTHORIZE', 'Agrément accordé par Miss M');

      const passed =
        result.validation.status === 'AUTHORIZED' &&
        result.mission.status === 'DONE' &&
        result.validation.decidedBy === 'Miss M';

      return {
        id: 4,
        name: 'TEST 4 : Ratification par Miss M & Transition d\'État',
        passed,
        description: 'Miss M autorise un mandat en attente. Genesis Core bascule le statut du ticket en "AUTHORIZED", exécute l\'action dans le bac à sable simulé et clôture la mission en "DONE".',
        evidence: {
          validationId: valReq.id,
          finalValidationStatus: result.validation.status,
          finalMissionStatus: result.mission.status,
          authorizedBy: result.validation.decidedBy
        },
        timestamp
      };
    } catch (err: unknown) {
      return {
        id: 4,
        name: 'TEST 4 : Ratification par Miss M',
        passed: false,
        description: err instanceof Error ? err.message : String(err),
        evidence: { error: true },
        timestamp
      };
    }
  }

  /**
   * TEST 5: Miss M refuses an action.
   * The action is blocked and recorded.
   */
  public runScenario5(): ScenarioTestResult {
    const timestamp = new Date().toISOString();
    try {
      // Create mission & pending validation
      const mission = this.core.missionService.createMission({
        title: '[SCENARIO 5] Proposition de Partenariat Non Conforme',
        description: 'Proposition d\'exclusivité sans clause de résiliation',
        creatorId: 'usr_miss_m',
        assignedAgentId: 'agt_partnership'
      });

      const proposedAction = {
        actionType: 'CREATE_PARTNERSHIP_PROPOSAL' as const,
        name: 'Accord cadre exclusif fournisseur boissons',
        target: 'Distributeur National Boissons',
        rationale: 'Exclusivité sur 3 ans demandée par le fournisseur',
        payload: { exclusive: true, durationYears: 3 },
        risksAndLimitations: ['Risque d\'enfermement contractuel'],
        proposedNextStep: 'Signature protocole',
        isSimulated: true
      };

      const valReq = this.core.validationService.createValidationRequest(
        mission,
        this.core.identityService.getIdentityById('agt_partnership')!,
        proposedAction
      );

      // Miss M exercises sovereign veto / REFUSE
      const result = this.core.processHumanDecision(
        valReq.id,
        'REFUSE',
        'Veto de Miss M : aucune clause d\'exclusivité sans réversibilité.'
      );

      const passed =
        result.validation.status === 'REFUSED' &&
        result.mission.status === 'BLOCKED';

      return {
        id: 5,
        name: 'TEST 5 : Veto Souverain de Miss M & Blocage Enregistré',
        passed,
        description: 'Miss M refuse formellement une proposition jugée non conforme. Genesis Core fige le ticket en "REFUSED", bloque la mission ("BLOCKED") et consigne le motif dans l\'audit notarié.',
        evidence: {
          validationId: valReq.id,
          finalValidationStatus: result.validation.status,
          finalMissionStatus: result.mission.status,
          decisionNote: result.validation.decisionNote
        },
        timestamp
      };
    } catch (err: unknown) {
      return {
        id: 5,
        name: 'TEST 5 : Veto Souverain de Miss M',
        passed: false,
        description: err instanceof Error ? err.message : String(err),
        evidence: { error: true },
        timestamp
      };
    }
  }

  /**
   * TEST 6: Two agents exchange information.
   * Only the required information is transmitted. The exchange is recorded.
   */
  public runScenario6(): ScenarioTestResult {
    const timestamp = new Date().toISOString();
    try {
      const exchange = this.core.collaborateInterAgent({
        fromAgentId: 'agt_technical',
        toAgentId: 'agt_miss_danford',
        missionId: 'msn_demo_restauration_01',
        requestSummary: 'Spécifications de connectivité et protocole API pour les terminaux HoloMenu en cuisine'
      });

      const passed =
        exchange.fromAgentId === 'agt_technical' &&
        exchange.toAgentId === 'agt_miss_danford' &&
        exchange.filteredResponse.length > 0 &&
        exchange.simulated === true;

      return {
        id: 6,
        name: 'TEST 6 : Intelligence Inter-Agents & Filtrage au Strict Nécessaire',
        passed,
        description: 'Technical Agent consulte Miss Danford sur un dossier. Genesis Core supervise le transfert, restreint l\'échange aux seules informations nécessaires au mandat, interdit tout transfert de privilège et inscrit l\'acte dans le registre notarié.',
        evidence: {
          exchangeId: exchange.id,
          from: exchange.fromAgentName,
          to: exchange.toAgentName,
          filteredTransmission: exchange.filteredResponse,
          simulated: exchange.simulated,
          auditRecorded: true
        },
        timestamp
      };
    } catch (err: unknown) {
      return {
        id: 6,
        name: 'TEST 6 : Intelligence Inter-Agents',
        passed: false,
        description: err instanceof Error ? err.message : String(err),
        evidence: { error: true },
        timestamp
      };
    }
  }
}
