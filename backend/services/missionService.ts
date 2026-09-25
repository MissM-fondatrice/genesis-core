/**
 * GENESIS MISSION SERVICE
 * Lifecycle management for all tactical, commercial and strategic missions.
 * Enforces rich metadata: Creator, Assigned Agent, Scope, Territory, Establishment,
 * Priorities, Statuses, Timelines, Required Permissions, Validation Requirements.
 */

import {
  Mission,
  MissionPriority,
  MissionStatus,
  ProposedAction,
  SimulatedActionResult,
  MissionTimelineEvent,
  Permission
} from '../../src/types/genesis.js';
import { DataService } from './dataService.js';

export interface CreateMissionInput {
  title: string;
  description: string;
  creatorId?: string;
  creatorName?: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  priority?: MissionPriority;
  deadline?: string;
  missionScope?: string[];
  territory?: string;
  establishment?: string;
  requiredPermissions?: Permission[];
  validationRequirements?: string[];
  context?: Record<string, unknown>;
}

export class MissionService {
  private dataService: DataService;

  constructor(dataService?: DataService) {
    this.dataService = dataService || DataService.getInstance();
  }

  public getAllMissions(): Mission[] {
    return this.dataService.getMissions();
  }

  public getMissionById(id: string): Mission | undefined {
    return this.dataService.getMission(id);
  }

  public createMission(input: CreateMissionInput): Mission {
    const defaultAgent = input.assignedAgentId || 'agt_miss_danford';
    const now = new Date().toISOString();

    const initialTimelineEvent: MissionTimelineEvent = {
      id: `mtl_${Date.now()}_01`,
      timestamp: now,
      step: 'Création du mandat',
      actor: input.creatorName || 'Miss M (Fondatrice)',
      note: 'Ouverture formelle du dossier de mission stratégique.',
      status: 'TODO',
      simulated: false
    };

    const mission: Mission = {
      id: `msn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: input.title,
      description: input.description,
      creatorId: input.creatorId || 'usr_miss_m',
      creatorName: input.creatorName || 'Miss M (Fondatrice)',
      assignedAgentId: defaultAgent,
      assignedAgentName: input.assignedAgentName || (defaultAgent === 'agt_miss_danford' ? 'Miss Danford' : defaultAgent),
      priority: input.priority || 'MEDIUM',
      status: 'TODO',
      createdAt: now,
      updatedAt: now,
      deadline: input.deadline,
      missionScope: input.missionScope || ['Développement B2B', 'Prospection', 'Approvisionnement'],
      territory: input.territory || 'France & Union Européenne',
      establishment: input.establishment || 'Établissements Genesis',
      requiredPermissions: input.requiredPermissions || ['ANALYZE_COMPANY', 'CONTACT_COMPANY', 'REQUEST_QUOTE'],
      validationRequirements: input.validationRequirements || [
        'Ratification obligatoire par Miss M avant toute prise de contact',
        'Cadre budgétaire validé en amont'
      ],
      context: input.context || {},
      historySummary: [`Mission créée par l'autorité souveraine Miss M. Assigné à : ${defaultAgent}`],
      eventTimeline: [initialTimelineEvent]
    };

    return this.dataService.saveMission(mission);
  }

  public assignAgent(missionId: string, agentId: string, agentName?: string): Mission {
    const mission = this.dataService.getMission(missionId);
    if (!mission) {
      throw new Error(`Mission ${missionId} not found.`);
    }

    mission.assignedAgentId = agentId;
    if (agentName) {
      mission.assignedAgentName = agentName;
    }
    mission.historySummary = mission.historySummary || [];
    mission.historySummary.push(`Réassignée à l'agent ${agentName || agentId}`);

    mission.eventTimeline = mission.eventTimeline || [];
    mission.eventTimeline.push({
      id: `mtl_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
      step: 'Attribution du mandat',
      actor: 'Genesis Core Router',
      note: `Mission attribuée à ${agentName || agentId}.`,
      status: mission.status,
      simulated: false
    });

    return this.dataService.saveMission(mission);
  }

  public updateStatus(missionId: string, status: MissionStatus, note?: string, actor?: string): Mission {
    const mission = this.dataService.getMission(missionId);
    if (!mission) {
      throw new Error(`Mission ${missionId} not found.`);
    }

    mission.status = status;
    mission.historySummary = mission.historySummary || [];
    if (note) {
      mission.historySummary.push(`Statut: ${status} - ${note}`);
    } else {
      mission.historySummary.push(`Statut mis à jour: ${status}`);
    }

    mission.eventTimeline = mission.eventTimeline || [];
    mission.eventTimeline.push({
      id: `mtl_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
      step: `Changement d'état : ${status}`,
      actor: actor || 'Genesis Core',
      note: note || `Transition vers le statut ${status}.`,
      status,
      simulated: false
    });

    return this.dataService.saveMission(mission);
  }

  public suspendMission(missionId: string, reason?: string, by?: string): Mission {
    return this.updateStatus(
      missionId,
      'SUSPENDED',
      reason || 'Mandat temporairement suspendu par Miss M',
      by || 'Miss M'
    );
  }

  public cancelMission(missionId: string, reason?: string, by?: string): Mission {
    return this.updateStatus(
      missionId,
      'CANCELLED',
      reason || 'Mandat annulé et archivé sans suite par Miss M',
      by || 'Miss M'
    );
  }

  public setAnalysisAndProposal(
    missionId: string,
    analysis: Mission['analysisResult'],
    proposal: ProposedAction
  ): Mission {
    const mission = this.dataService.getMission(missionId);
    if (!mission) {
      throw new Error(`Mission ${missionId} not found.`);
    }

    mission.analysisResult = analysis;
    mission.requestedAction = proposal;
    mission.requiredPermission = proposal.actionType;
    mission.historySummary = mission.historySummary || [];
    mission.historySummary.push(`Analyse complétée par l'agent. Action proposée: ${proposal.name}`);

    mission.eventTimeline = mission.eventTimeline || [];
    mission.eventTimeline.push({
      id: `mtl_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
      step: 'Analyse & Proposition tactique',
      actor: mission.assignedAgentName || 'Agent assigné',
      note: `Proposition formulée : "${proposal.name}" sur ${proposal.target}.`,
      status: 'IN_PROGRESS',
      simulated: false
    });

    return this.dataService.saveMission(mission);
  }

  public attachValidationRequest(missionId: string, validationId: string): Mission {
    const mission = this.dataService.getMission(missionId);
    if (!mission) {
      throw new Error(`Mission ${missionId} not found.`);
    }

    mission.validationRequestId = validationId;
    mission.status = 'HUMAN_REQUIRED';
    mission.historySummary = mission.historySummary || [];
    mission.historySummary.push(`Demande de validation transmise à Miss M [Ticket: ${validationId}]`);

    mission.eventTimeline = mission.eventTimeline || [];
    mission.eventTimeline.push({
      id: `mtl_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
      step: 'Arbitrage souverain sollicité',
      actor: 'Genesis Core Router',
      note: 'Pause opérationnelle. Dossier soumis à Miss M.',
      status: 'HUMAN_REQUIRED',
      simulated: false
    });

    return this.dataService.saveMission(mission);
  }

  public completeMissionWithResult(missionId: string, result: SimulatedActionResult): Mission {
    const mission = this.dataService.getMission(missionId);
    if (!mission) {
      throw new Error(`Mission ${missionId} not found.`);
    }

    mission.status = 'DONE';
    mission.result = result;
    mission.historySummary = mission.historySummary || [];
    mission.historySummary.push(`Mission finalisée avec succès (Exécution simulée certifiée)`);

    mission.eventTimeline = mission.eventTimeline || [];
    mission.eventTimeline.push({
      id: `mtl_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
      step: 'Exécution simulée & Finalisation',
      actor: 'Genesis Simulated Execution Sandbox',
      note: `${result.summary} (Action 100% simulée).`,
      status: 'DONE',
      simulated: true
    });

    return this.dataService.saveMission(mission);
  }
}
