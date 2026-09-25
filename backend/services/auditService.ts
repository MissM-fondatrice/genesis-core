/**
 * GENESIS AUDIT SERVICE
 * Immutable-style chronological event ledger.
 * Records every mission lifecycle event, permission check, human approval, and simulated action.
 */

import { AuditEvent, ActorType, EventType, Permission } from '../../src/types/genesis.js';
import { DataService } from './dataService.js';

export interface CreateEventParams {
  actorId: string;
  actorName: string;
  actorType: ActorType;
  eventType: EventType;
  missionId?: string;
  missionTitle?: string;
  action: string;
  context: Record<string, unknown>;
  result?: Record<string, unknown> | string;
  permissionUsed?: Permission;
  authorizationRequired?: boolean;
  authorizationStatus?: 'PENDING' | 'AUTHORIZED' | 'REFUSED' | 'BYPASSED_FORBIDDEN' | 'NOT_APPLICABLE';
  simulated?: boolean;
  metadata?: Record<string, unknown>;
}

export class AuditService {
  private dataService: DataService;

  constructor(dataService?: DataService) {
    this.dataService = dataService || DataService.getInstance();
  }

  public recordEvent(params: CreateEventParams): AuditEvent {
    const event: AuditEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      actorId: params.actorId,
      actorName: params.actorName,
      actorType: params.actorType,
      eventType: params.eventType,
      missionId: params.missionId,
      missionTitle: params.missionTitle,
      action: params.action,
      context: params.context,
      result: params.result,
      permissionUsed: params.permissionUsed,
      authorizationRequired: params.authorizationRequired ?? false,
      authorizationStatus: params.authorizationStatus ?? 'NOT_APPLICABLE',
      simulated: params.simulated ?? false,
      metadata: params.metadata
    };

    return this.dataService.addEvent(event);
  }

  public getHistory(limit = 100): AuditEvent[] {
    return this.dataService.getEvents(limit);
  }

  public getEvents(limit = 100): AuditEvent[] {
    return this.dataService.getEvents(limit);
  }

  public getHistoryForMission(missionId: string): AuditEvent[] {
    return this.dataService.getEvents(200).filter((e) => e.missionId === missionId);
  }
}
