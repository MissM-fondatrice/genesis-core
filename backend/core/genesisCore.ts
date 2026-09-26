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
