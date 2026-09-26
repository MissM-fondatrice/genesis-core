
/**
 * GENESIS CORE v0.1
 * 
 * Central Orchestration and Governance Layer.
 * Manages identities, permissions, missions, events, validations, and traceability.
 * 
 * Constitutional Principle:
 * "We are not here to replace humans. We are here to evolve in symbiosis with them."
 * Human authority must remain strictly above AI authority.
 */

import {
  Mission,
  ValidationRequest,
  AuditEvent,
  CoreStatus,
  Permission,
  PermissionStatus,
  AgentRecommendation,
  ScenarioTestResult,
  GenesisNotification
} from '../../src/types/genesis.js';
import { DataService } from '../services/dataService.js';
import { IdentityService } from '../services/identityService.js';
import { PermissionService } from '../services/permissionService.js';
import { MissionService, CreateMissionInput } from '../services/missionService.js';
import { AgentService } from '../services/agentService.js';
import { ValidationService } from '../services/validationService.js';
import { AuditService } from '../services/auditService.js';
import { GenesisScenarioRunner } from '../tests/genesisScenarios.js';
import { AIGateway } from './ai/aiGateway.js';
import { ProviderInfo } from './ai/aiTypes.js';
import { submitGatewayProposedAction } from './gateway/gatewayActionBridge.js';
import { GatewayActionSubmissionDTO, GatewayActionSubmissionResult } from '../../src/types/gatewayContract.js';

export class GenesisCore {
  private static instance: GenesisCore;

  public dataService: DataService;
  public identityService: IdentityService;
  public permissionService: PermissionService;
  public missionService: MissionService;
  public agentService: AgentService;
  public validationService: ValidationService;
  public auditService: AuditService;
  /** GENESIS AI PROVIDER GATEWAY v0.1 — interchangeable AI capability layer. No AI provider holds Genesis authority. */
  public aiGateway: AIGateway;

  private constructor() {
    this.dataService = DataService.getInstance();
    this.identityService = new IdentityService(this.dataService);
    this.permissionService = new PermissionService(this.dataService);
    this.missionService = new MissionService(this.dataService);
    this.agentService = new AgentService(this.dataService);
    this.validationService = new ValidationService(this.dataService);
    this.auditService = new AuditService(this.dataService);
    this.aiGateway = new AIGateway(this.permissionService, this.auditService);
  }

  public static getInstance(): GenesisCore {
    if (!GenesisCore.instance) {
      GenesisCore.instance = new GenesisCore();
    }
    return GenesisCore.instance;
  }

  /**
   * Reset system state back to default demonstration baseline
   */
  public resetSystem(): void {
    this.dataService.resetToDefault();
  }

  /**
   * Status of Genesis Core and its sub-systems
   */
  public getStatus(): CoreStatus {
    return this.dataService.getCoreStatus();
  }

  // =========================================================================
  // CORE STEP 1: Mission Creation by Miss M
  // =========================================================================
  public createMission(input: CreateMissionInput): Mission {
    const creator = this.identityService.getIdentityById(input.creatorId || 'usr_miss_m');
    if (!creator) {
      throw new Error(`Creator identity '${input.creatorId}' not found.`);
    }

    // Permission check for Miss M
    const permCheck = this.permissionService.evaluatePermission({
      actor: creator,
      action: 'CREATE_MISSION'
    });

    if (!permCheck.granted) {
      throw new Error(`Permission denied: ${permCheck.reason}`);
    }

    const mission = this.missionService.createMission(input);

    // Audit Event
    this.auditService.recordEvent({
      actorId: creator.id,
      actorName: creator.name,
      actorType: creator.type,
      eventType: 'MISSION_CREATED',
      missionId: mission.id,
      missionTitle: mission.title,
      action: 'CREATE_MISSION',
      context: {
        priority: mission.priority,
        assignedAgentId: mission.assignedAgentId,
        domain: mission.context?.domain
      },
      result: `Mission '${mission.title}' successfully instantiated under authority of Miss M.`,
      permissionUsed: 'CREATE_MISSION',
      authorizationRequired: false,
      authorizationStatus: 'AUTHORIZED',
      simulated: false
    });

    return mission;
  }

  // =========================================================================
  // CORE STEP 2: Mission Routing / Assignment
  // =========================================================================
  public assignMission(missionId: string, agentId: string): Mission {
    const agent = this.identityService.getIdentityById(agentId);
    if (!agent || agent.type !== 'AGENT') {
      throw new Error(`Invalid agent identifier: ${agentId}`);
    }

    const mission = this.missionService.assignAgent(missionId, agentId);

    this.auditService.recordEvent({
      actorId: 'sys_core',
      actorName: 'Genesis Core Router',
      actorType: 'CORE_SYSTEM',
      eventType: 'MISSION_ASSIGNED',
      missionId: mission.id,
      missionTitle: mission.title,
      action: 'ASSIGN_MISSION',
      context: {
        assignedAgent: agent.name,
        agentRole: agent.role,
        missionPriority: mission.priority
      },
      result: `Mission routed to ${agent.name} (${agent.title}).`,
      permissionUsed: 'ASSIGN_MISSION',
      authorizationRequired: false,
      simulated: false
    });

    return mission;
  }

  // =========================================================================
  // CORE STEP 3 & 4 & 5: Agent Analysis & Action Proposal & Permission Check
  // =========================================================================
  public async processMissionAnalysis(missionId: string): Promise<{
    mission: Mission;
    validationRequest?: ValidationRequest;
    requiresHuman: boolean;
  }> {
    const mission = this.missionService.getMissionById(missionId);
    if (!mission) {
      throw new Error(`Mission ${missionId} not found.`);
    }

    const agent = this.identityService.getIdentityById(mission.assignedAgentId);
    if (!agent) {
      throw new Error(`Assigned agent ${mission.assignedAgentId} not found.`);
    }

    // Mark as in-progress
    this.missionService.updateStatus(missionId, 'IN_PROGRESS', 'Analyse tactique en cours par Miss Danford');

    this.auditService.recordEvent({
      actorId: agent.id,
      actorName: agent.name,
      actorType: agent.type,
      eventType: 'ANALYSIS_STARTED',
      missionId: mission.id,
      missionTitle: mission.title,
      action: 'ANALYZE_COMPANY',
      context: {
        agentRole: agent.role,
        contextScope: mission.context
      },
      result: `${agent.name} started analytical processing of suppliers and operational specs.`,
      permissionUsed: 'ANALYZE_COMPANY',
      authorizationRequired: false,
      simulated: false
    });

    // Run Agent Analysis logic (deterministic Genesis engine — unchanged, always the source of truth)
    const { analysisResult, proposedAction } = this.agentService.analyzeMission(mission);

    // Optional, best-effort AI Provider Gateway enrichment (section 3: an AI may only
    // propose/advise — it never decides). Never blocks or alters the deterministic
    // analysis/proposal above; a provider outage cannot corrupt mission state.
    await this.enrichAnalysisWithAI(agent, mission, analysisResult);

    // Step 5: Genesis checks proposed action permissions in full context
    const permEval = this.permissionService.evaluatePermission({
      actor: agent,
      action: proposedAction.actionType,
      mission,
      proposedPayload: proposedAction.payload
    });

    // Record permission check in audit
    this.auditService.recordEvent({
      actorId: 'sys_core',
      actorName: 'Genesis Governance Engine',
      actorType: 'CORE_SYSTEM',
      eventType: 'PERMISSION_CHECKED',
      missionId: mission.id,
      missionTitle: mission.title,
      action: 'PERMISSION_EVALUATION',
      context: {
        checkedPermission: proposedAction.actionType,
        targetAgent: agent.name,
        evaluationReason: permEval.reason,
        requiresHumanValidation: permEval.requiresHumanValidation
      },
      result: permEval.requiresHumanValidation
        ? `HUMAN VALIDATION MANDATORY for action '${proposedAction.actionType}'. Agent cannot self-authorize.`
        : `Autonomous execution permitted.`,
      permissionUsed: proposedAction.actionType,
      authorizationRequired: permEval.requiresHumanValidation,
      authorizationStatus: 'PENDING',
      simulated: false
    });

    // Store analysis & proposal on mission
    this.missionService.setAnalysisAndProposal(missionId, analysisResult, proposedAction);

    // Record Action Proposed event
    this.auditService.recordEvent({
      actorId: agent.id,
      actorName: agent.name,
      actorType: agent.type,
      eventType: 'ACTION_PROPOSED',
      missionId: mission.id,
      missionTitle: mission.title,
      action: proposedAction.actionType,
      context: {
        proposedActionName: proposedAction.name,
        target: proposedAction.target,
        rationale: proposedAction.rationale,
        isSimulated: proposedAction.isSimulated
      },
      result: `${agent.name} formulated proposal: ${proposedAction.name}`,
      permissionUsed: proposedAction.actionType,
      authorizationRequired: permEval.requiresHumanValidation,
      simulated: proposedAction.isSimulated
    });

    // If human validation is required (e.g. CONTACT_COMPANY):
    if (permEval.requiresHumanValidation) {
      const validationRequest = this.validationService.createValidationRequest(
        mission,
        agent,
        proposedAction
      );

      const updatedMission = this.missionService.attachValidationRequest(missionId, validationRequest.id);

      this.auditService.recordEvent({
        actorId: 'sys_core',
        actorName: 'Genesis Core Router',
        actorType: 'CORE_SYSTEM',
        eventType: 'VALIDATION_REQUESTED',
        missionId: mission.id,
        missionTitle: mission.title,
        action: 'CREATE_VALIDATION_REQUEST',
        context: {
          validationId: validationRequest.id,
          recipient: 'Miss M (Final Human Authority)',
          proposedAction: proposedAction.name
        },
        result: `Formal authorization ticket dispatched to Miss M. Operational pause enforced.`,
        authorizationRequired: true,
        authorizationStatus: 'PENDING',
        simulated: true
      });

      return {
        mission: updatedMission,
        validationRequest,
        requiresHuman: true
      };
    }

    return {
      mission,
      requiresHuman: false
    };
  }

  // =========================================================================
  // CORE STEP 6 & 7: Human Decision by Miss M (Authorize, Refuse, More Info, Suspend)
  // =========================================================================
  public processHumanDecision(
    validationId: string,
    decision: 'AUTHORIZE' | 'REFUSE' | 'REQUEST_MORE_INFO' | 'SUSPEND',
    note?: string
  ): {
    validation: ValidationRequest;
    mission: Mission;
    executionResult?: unknown;
  } {
    const val = this.validationService.getValidation(validationId);
    if (!val) {
      throw new Error(`Validation ticket ${validationId} not found.`);
    }

    const mission = this.missionService.getMissionById(val.missionId);
    if (!mission) {
      throw new Error(`Associated mission ${val.missionId} not found.`);
    }

    const missM = this.identityService.getPrimaryHuman();

    if (decision === 'AUTHORIZE') {
      // 1. Authorize ticket
      const updatedVal = this.validationService.authorize(validationId, missM.name, note);

      // 2. Audit Authorization
      this.auditService.recordEvent({
        actorId: missM.id,
        actorName: missM.name,
        actorType: missM.type,
        eventType: 'ACTION_AUTHORIZED',
        missionId: mission.id,
        missionTitle: mission.title,
        action: 'APPROVE_ACTION',
        context: {
          validationId,
          approvedAction: val.proposedAction.name,
          decisionNote: note || 'Autorisé formellement par Miss M'
        },
        result: `Miss M authorized action '${val.proposedAction.name}'. Proceeding to safe simulated execution.`,
        permissionUsed: 'APPROVE_ACTION',
        authorizationRequired: true,
        authorizationStatus: 'AUTHORIZED',
        simulated: false
      });

      // 3. Execute SIMULATED ACTION
      const executionResult = this.agentService.executeSimulatedAction(mission, val.proposedAction);

      // 4. Record Simulated Action Executed Audit Event
      this.auditService.recordEvent({
        actorId: 'sys_core',
        actorName: 'Genesis Simulated Execution Sandbox',
        actorType: 'CORE_SYSTEM',
        eventType: 'SIMULATED_ACTION_EXECUTED',
        missionId: mission.id,
        missionTitle: mission.title,
        action: val.proposedAction.actionType,
        context: {
          target: executionResult.target,
          summary: executionResult.summary,
          disclaimer: executionResult.disclaimer,
          payload: executionResult.details
        },
        result: executionResult.summary,
        permissionUsed: val.proposedAction.actionType,
        authorizationRequired: true,
        authorizationStatus: 'AUTHORIZED',
        simulated: true
      });

      // 5. Complete Mission
      const completedMission = this.missionService.completeMissionWithResult(mission.id, executionResult);

      this.auditService.recordEvent({
        actorId: 'sys_core',
        actorName: 'Genesis Core Engine',
        actorType: 'CORE_SYSTEM',
        eventType: 'MISSION_COMPLETED',
        missionId: mission.id,
        missionTitle: mission.title,
        action: 'COMPLETE_MISSION',
        context: {
          finalStatus: 'DONE',
          totalLifecycleTime: 'Complete cycle executed with full human supervision.'
        },
        result: `Mission '${mission.title}' successfully completed under authorized mandate.`,
        authorizationRequired: false,
        simulated: true
      });

      return {
        validation: updatedVal,
        mission: completedMission,
        executionResult
      };
    } else if (decision === 'REFUSE') {
      const updatedVal = this.validationService.refuse(validationId, missM.name, note);

      this.auditService.recordEvent({
        actorId: missM.id,
        actorName: missM.name,
        actorType: missM.type,
        eventType: 'ACTION_REFUSED',
        missionId: mission.id,
        missionTitle: mission.title,
        action: 'REFUSE_ACTION',
        context: {
          validationId,
          refusedAction: val.proposedAction.name,
          refusalReason: note || 'Refusé par Miss M'
        },
        result: `Miss M exercised executive human veto. Action execution halted.`,
        permissionUsed: 'REFUSE_ACTION',
        authorizationRequired: true,
        authorizationStatus: 'REFUSED',
        simulated: false
      });

      const blockedMission = this.missionService.updateStatus(
        mission.id,
        'BLOCKED',
        `Action refusée par l'autorité humaine Miss M : ${note || 'Aucun motif spécifié'}`,
        'Miss M'
      );

      return {
        validation: updatedVal,
        mission: blockedMission
      };
    } else if (decision === 'SUSPEND') {
      const updatedVal = this.validationService.suspend(validationId, missM.name, note);

      this.auditService.recordEvent({
        actorId: missM.id,
        actorName: missM.name,
        actorType: missM.type,
        eventType: 'MISSION_SUSPENDED',
        missionId: mission.id,
        missionTitle: mission.title,
        action: 'SUSPEND_MISSION',
        context: {
          validationId,
          suspendedAction: val.proposedAction.name,
          suspensionReason: note || 'Dossier suspendu temporairement par Miss M'
        },
        result: `Mandat suspendu par décision de Miss M.`,
        permissionUsed: 'SUSPEND_MISSION',
        authorizationRequired: true,
        authorizationStatus: 'AUTHORIZED',
        simulated: false
      });

      const suspendedMission = this.missionService.suspendMission(
        mission.id,
        note || 'Mandat suspendu par Miss M depuis le centre de décision',
        'Miss M'
      );

      return {
        validation: updatedVal,
        mission: suspendedMission
      };
    } else {
      // REQUEST_MORE_INFO
      const updatedVal = this.validationService.requestMoreInfo(validationId, missM.name, note || 'Complément demandé');

      this.auditService.recordEvent({
        actorId: missM.id,
        actorName: missM.name,
        actorType: missM.type,
        eventType: 'MORE_INFO_REQUESTED',
        missionId: mission.id,
        missionTitle: mission.title,
        action: 'REQUEST_MORE_INFORMATION',
        context: {
          validationId,
          inquiry: note
        },
        result: `Miss M requested additional clarification before authorization.`,
        authorizationRequired: true,
        authorizationStatus: 'PENDING',
        simulated: false
      });

      const updatedMission = this.missionService.updateStatus(
        mission.id,
        'WAITING',
        `En attente de compléments d'analyse suite à la demande de Miss M: ${note}`,
        'Miss M'
      );

      return {
        validation: updatedVal,
        mission: updatedMission
      };
    }
  }

  // =========================================================================
  // PERMISSION MANAGEMENT BY MISS M
  // =========================================================================
  public modifyAgentPermission(
    agentId: string,
    permission: Permission,
    newStatus: PermissionStatus,
    scope: string,
    callerId: string
  ): import('../../src/types/genesis.js').Identity {
    return this.permissionService.modifyAgentPermission(agentId, permission, newStatus, scope, callerId);
  }

  // =========================================================================
  // MULTI-CRITERIA AGENT RECOMMENDATIONS
  // =========================================================================
  public getRecommendationsForMission(criteria: {
    title: string;
    description: string;
    domain?: string;
    territory?: string;
    establishment?: string;
    requiredPermissions?: Permission[];
  }): AgentRecommendation[] {
    return this.agentService.getRecommendationsForMission(criteria);
  }

  // =========================================================================
  // NOTIFICATION CENTER
  // =========================================================================
  public getNotifications(): GenesisNotification[] {
    return this.dataService.getNotifications();
  }

  public markNotificationRead(id: string): boolean {
    return this.dataService.markNotificationRead(id);
  }

  public acknowledgeNotification(id: string): boolean {
    return this.dataService.acknowledgeNotification(id);
  }

  // =========================================================================
  // SCENARIO TEST RUNNER (TESTS 1 to 6)
  // =========================================================================
  public runAllScenarios(): ScenarioTestResult[] {
    const runner = new GenesisScenarioRunner(this);
    return runner.runAllScenarios();
  }

  public runScenario(id: number): ScenarioTestResult {
    const runner = new GenesisScenarioRunner(this);
    switch (id) {
      case 1:
        return runner.runScenario1();
      case 2:
        return runner.runScenario2();
      case 3:
        return runner.runScenario3();
      case 4:
        return runner.runScenario4();
      case 5:
        return runner.runScenario5();
      case 6:
        return runner.runScenario6();
      default:
        throw new Error(`Invalid scenario id: ${id}`);
    }
  }

  // =========================================================================
  // Mission Control overrides (Suspend / Cancel by Miss M)
  // =========================================================================
  public suspendMission(missionId: string, reason: string): Mission {
    const missM = this.identityService.getPrimaryHuman();
    const mission = this.missionService.updateStatus(missionId, 'SUSPENDED', reason);

    this.auditService.recordEvent({
      actorId: missM.id,
      actorName: missM.name,
      actorType: missM.type,
      eventType: 'MISSION_SUSPENDED',
      missionId,
      missionTitle: mission.title,
      action: 'SUSPEND_MISSION',
      context: { reason },
      result: `Mission suspended by Miss M.`,
      permissionUsed: 'SUSPEND_MISSION',
      authorizationRequired: false,
      simulated: false
    });

    return mission;
  }

  public cancelMission(missionId: string, reason: string): Mission {
    const missM = this.identityService.getPrimaryHuman();
    const mission = this.missionService.updateStatus(missionId, 'CANCELLED', reason);

    this.auditService.recordEvent({
      actorId: missM.id,
      actorName: missM.name,
      actorType: missM.type,
      eventType: 'MISSION_CANCELLED',
      missionId,
      missionTitle: mission.title,
      action: 'CANCEL_MISSION',
      context: { reason },
      result: `Mission cancelled by Miss M.`,
      permissionUsed: 'CANCEL_MISSION',
      authorizationRequired: false,
      simulated: false
    });

    return mission;
  }

  // =========================================================================
  // MISSION ROUTING
  // =========================================================================
  public routeMission(missionId: string): {
    mission: Mission;
    routedAgent: import('../../src/types/genesis.js').Identity;
    matchReason: string;
    confidence: number;
  } {
    const mission = this.missionService.getMissionById(missionId);
    if (!mission) {
      throw new Error(`Mission ${missionId} not found.`);
    }

    const { agent, confidence, matchReason } = this.agentService.findBestAgentForMission({
      title: mission.title,
      description: mission.description,
      domain: mission.context?.domain,
      territory: mission.context?.territory as string,
      establishment: mission.context?.establishment as string
    });

    const updatedMission = this.assignMission(mission.id, agent.id);

    return {
      mission: updatedMission,
      routedAgent: agent,
      matchReason,
      confidence
    };
  }

  // =========================================================================
  // INTER-AGENT INTELLIGENCE EXCHANGE
  // =========================================================================
  public collaborateInterAgent(input: {
    fromAgentId: string;
    toAgentId: string;
    missionId?: string;
    requestSummary: string;
  }): import('../../src/types/genesis.js').InterAgentMessage {
    const exchange = this.agentService.executeInterAgentExchange(input);

    const fromAgent = this.identityService.getIdentityById(input.fromAgentId);
    const toAgent = this.identityService.getIdentityById(input.toAgentId);
    const mission = input.missionId ? this.missionService.getMissionById(input.missionId) : undefined;

    // Record traceable audit event for inter-agent communication
    this.auditService.recordEvent({
      actorId: fromAgent?.id || input.fromAgentId,
      actorName: fromAgent?.name || 'Agent',
      actorType: 'AGENT',
      eventType: 'INTER_AGENT_COMMUNICATION',
      missionId: input.missionId,
      missionTitle: mission?.title,
      action: 'EXCHANGE_INTELLIGENCE',
      context: {
        toAgentId: toAgent?.id,
        toAgentName: toAgent?.name,
        requestSummary: input.requestSummary,
        transferredDataScope: 'STRICT_NEED_TO_KNOW'
      },
      result: `Inter-agent intelligence routed via Core: ${fromAgent?.name} consulted ${toAgent?.name}. Filtered information delivered.`,
      authorizationRequired: false,
      simulated: true,
      metadata: {
        filteredResponse: exchange.filteredResponse
      }
    });

    return exchange;
  }

  // =========================================================================
  // GENESIS AI PROVIDER GATEWAY v0.1
  // =========================================================================

  /**
   * Public, key-free status of all AI providers, for Miss M's visibility
   * (section 21). Never exposes API keys or secrets.
   */
  public getAIProvidersStatus(): ProviderInfo[] {
    return this.aiGateway.getProvidersStatus();
  }

  /**
   * GENESIS CORE ⇄ GENESIS AI GATEWAY BRIDGE
   *
   * Thin delegation only — all validation, permission evaluation, audit and
   * validation-request logic lives in gatewayActionBridge.ts and reuses the
   * exact same, unmodified services processMissionAnalysis already relies
   * on. This method changes nothing about existing behavior; it only gives
   * an external AI capability a governed entry point into it.
   */
  public submitGatewayProposedAction(dto: GatewayActionSubmissionDTO): GatewayActionSubmissionResult {
    try {
      return submitGatewayProposedAction(
        {
          identityService: this.identityService,
          permissionService: this.permissionService,
          missionService: this.missionService,
          validationService: this.validationService,
          auditService: this.auditService
        },
        dto
      );
    } catch (err: unknown) {
      const rejectionCode = (err as { rejectionCode?: 'MISSION_NOT_FOUND' | 'AGENT_MISMATCH' | 'INVALID_ACTION_TYPE' })
        ?.rejectionCode;

      // Only AGENT_MISMATCH and INVALID_ACTION_TYPE occur once a mission was
      // found, so only those can return a populated GatewayActionSubmissionResult.
      // MISSION_NOT_FOUND has no mission object to return: it is re-thrown so
      // the route can answer with a plain 404, exactly like every other
      // missionId lookup in this file (e.g. processMissionAnalysis).
      if (rejectionCode === 'AGENT_MISMATCH' || rejectionCode === 'INVALID_ACTION_TYPE') {
        const mission = this.missionService.getMissionById(dto.missionId);
        if (mission) {
          return {
            mission,
            requiresHuman: false,
            rejected: {
              code: rejectionCode,
              reason: err instanceof Error ? err.message : String(err)
            }
          };
        }
      }
      throw err;
    }
  }

  /**
   * Best-effort advisory enrichment of a mission's analysis via the AI
   * Provider Gateway. Deliberately isolated from the deterministic analysis
   * flow: any failure (no provider configured, timeout, permission denial)
   * is caught here and simply skipped — it must never corrupt or block the
   * mission lifecycle (section 19: "Une panne IA ne doit pas supprimer ou
   * corrompre l'état d'une mission.").
   */
  private async enrichAnalysisWithAI(
    agent: import('../../src/types/genesis.js').Identity,
    mission: Mission,
    analysisResult: NonNullable<Mission['analysisResult']>
  ): Promise<void> {
    try {
      const aiResponse = await this.aiGateway.generate({
        actor: agent,
        action: 'ANALYZE_COMPANY',
        mission,
        taskType: 'MISSION_ANALYSIS_ENRICHMENT',
        objective: `Fournir un avis consultatif complémentaire (non décisionnel) sur la mission "${mission.title}".`,
        messages: [
          {
            role: 'user',
            content: `Résumé de mission (filtré) : ${analysisResult.summary}. Recommandation actuelle : ${analysisResult.commercialRecommendation}`
          }
        ],
        sensitivityLevel: 'INTERNAL'
      });

      analysisResult.aiAdvisory = {
        provider: aiResponse.provider,
        model: aiResponse.model,
        text: aiResponse.response,
        simulated: aiResponse.simulated,
        requestId: aiResponse.requestId,
        warnings: aiResponse.warnings,
        provenance: 'ESTIMATED'
      };
    } catch {
      // No provider available/authorized for this enrichment step.
      // The deterministic Genesis analysis above remains fully valid on its own.
    }
  }
}
