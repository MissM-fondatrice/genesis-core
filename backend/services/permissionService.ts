/**
 * GENESIS PERMISSION SERVICE
 * Contextual permission evaluation engine & Security Authority.
 * 
 * Constitutional Principle:
 * "AUTHENTICATION ≠ AUTHORIZATION"
 * An authenticated identity does not automatically have permission to act.
 * Genesis Core verifies:
 * 1. IDENTITY
 * 2. MISSION CONTEXT
 * 3. PERMISSION
 * 4. SCOPE
 * 5. VALIDATION REQUIREMENT
 * 
 * Guarantees:
 * - Only Miss M can modify agent permissions.
 * - Agents cannot modify their own permissions or grant themselves privileges.
 * - Sensitive external actions mandate human authorization before simulated execution.
 */

import {
  Permission,
  PermissionStatus,
  PermissionEvaluation,
  Mission,
  Identity
} from '../../src/types/genesis.js';
import { DataService } from './dataService.js';

export interface PermissionContext {
  actor: Identity;
  action: Permission;
  mission?: Mission;
  scope?: string;
  proposedPayload?: Record<string, unknown>;
}

export class PermissionService {
  private dataService: DataService;

  constructor(dataService?: DataService) {
    this.dataService = dataService || DataService.getInstance();
  }

  /**
   * Actions that by constitutional definition MUST require explicit human approval (Miss M)
   * before execution by any virtual agent.
   */
  private readonly SENSITIVE_ACTIONS_REQUIRING_HUMAN: Set<Permission> = new Set([
    'CONTACT_COMPANY',
    'SEND_EMAIL',
    'MAKE_PHONE_CALL',
    'SEND_PROFESSIONAL_MESSAGE',
    'REQUEST_QUOTE',
    'REQUEST_APPOINTMENT',
    'NEGOTIATE_WITHIN_MANDATE',
    'CREATE_PARTNERSHIP_PROPOSAL',
    'EXECUTE_EXTERNAL_ACTION'
  ]);

  /**
   * Actions reserved exclusively to Miss M (Founder).
   */
  private readonly HUMAN_ONLY_GOVERNANCE_PERMISSIONS: Set<Permission> = new Set([
    'APPROVE_ACTION',
    'REFUSE_ACTION',
    'SUSPEND_MISSION',
    'CANCEL_MISSION',
    'CREATE_MISSION',
    'ASSIGN_MISSION',
    'MANAGE_PERMISSIONS'
  ]);

  /**
   * Evaluate a requested action in full context (AUTHENTICATION ≠ AUTHORIZATION)
   */
  public evaluatePermission(context: PermissionContext): PermissionEvaluation {
    const { actor, action, mission } = context;

    // Rule 1: Identity validity check
    if (!actor) {
      return {
        granted: false,
        requiredPermission: action,
        requiresHumanValidation: true,
        reason: 'DENIED: Identité inconnue ou non-authentifiée.',
        actorId: 'unknown',
        evaluatedAt: new Date().toISOString()
      };
    }

    // Rule 2: Miss M (Founder / FINAL_HUMAN_AUTHORITY) has full sovereign authority
    if (actor.authority === 'FINAL_HUMAN_AUTHORITY' && actor.role === 'FOUNDER') {
      return {
        granted: true,
        requiredPermission: action,
        requiresHumanValidation: false,
        reason: `GRANTED: Action autorisée sous l'autorité souveraine de ${actor.name} (Fondatrice).`,
        actorId: actor.id,
        evaluatedAt: new Date().toISOString()
      };
    }

    // Rule 3: Guard against any Agent attempting Human Governance Actions
    if (actor.type === 'AGENT' && this.HUMAN_ONLY_GOVERNANCE_PERMISSIONS.has(action)) {
      return {
        granted: false,
        requiredPermission: action,
        requiresHumanValidation: true,
        reason: `REFUS CONSTITUTIONNEL IMMÉDIAT : L'agent '${actor.name}' ne peut exécuter l'action souveraine '${action}'. Réservé à Miss M.`,
        actorId: actor.id,
        evaluatedAt: new Date().toISOString()
      };
    }

    // Rule 4: An agent cannot grant itself permissions or modify constitutional rules
    if (action === 'MANAGE_PERMISSIONS' || action.includes('PERMISSION') || action.includes('OVERRIDE')) {
      return {
        granted: false,
        requiredPermission: action,
        requiresHumanValidation: true,
        reason: `VIOLATION DÉONTOLOGIQUE : L'agent '${actor.name}' ne peut modifier de permissions. Seule Miss M détient ce pouvoir.`,
        actorId: actor.id,
        evaluatedAt: new Date().toISOString()
      };
    }

    // Rule 5: Mission state validation
    if (mission) {
      if (mission.status === 'CANCELLED' || mission.status === 'SUSPENDED') {
        return {
          granted: false,
          requiredPermission: action,
          requiresHumanValidation: true,
          reason: `REFUS OPÉRATIONNEL : Le mandat '${mission.title}' est actuellement suspendu ou classé sans suite par Miss M.`,
          actorId: actor.id,
          evaluatedAt: new Date().toISOString()
        };
      }
    }

    // Rule 6: Specific agent capability / permission profile check
    const permProfile = actor.permissionProfiles?.[action];
    const hasBasePermission = actor.permissions.includes(action);

    if (permProfile) {
      if (permProfile.status === 'NOT_AUTHORIZED') {
        return {
          granted: false,
          requiredPermission: action,
          requiresHumanValidation: true,
          reason: `REFUS D'HABILITATION : L'action '${action}' est explicitement configurée sur "NON AUTORISÉE" pour '${actor.name}'.`,
          actorId: actor.id,
          evaluatedAt: new Date().toISOString()
        };
      }

      if (permProfile.status === 'VALIDATION_REQUIRED') {
        return {
          granted: false,
          requiredPermission: action,
          requiresHumanValidation: true,
          reason: `ARBITRAGE HUMAIN REQUIS : La permission '${action}' pour '${actor.name}' est sous mandat "VALIDATION REQUISE" (Périmètre : ${permProfile.scope}).`,
          actorId: actor.id,
          evaluatedAt: new Date().toISOString()
        };
      }
    } else if (!hasBasePermission) {
      return {
        granted: false,
        requiredPermission: action,
        requiresHumanValidation: true,
        reason: `REFUS D'HABILITATION : L'agent '${actor.name}' ne détient pas la permission '${action}' dans son mandat.`,
        actorId: actor.id,
        evaluatedAt: new Date().toISOString()
      };
    }

    // Rule 7: External and binding actions MANDATE Human Authorization from Miss M
    if (this.SENSITIVE_ACTIONS_REQUIRING_HUMAN.has(action)) {
      return {
        granted: false, // Not granted autonomously!
        requiredPermission: action,
        requiresHumanValidation: true, // Must prompt Miss M!
        reason: `ARBITRAGE HUMAIN OBLIGATOIRE : L'action '${action}' est une démarche extérieure engageante. Genesis Core saisit Miss M pour ratification avant toute simulation.`,
        actorId: actor.id,
        evaluatedAt: new Date().toISOString()
      };
    }

    // Rule 8: Internal analytical action within allowed scope
    return {
      granted: true,
      requiredPermission: action,
      requiresHumanValidation: false,
      reason: `ACCORD ANALYTIQUE : Action '${action}' autorisée dans le périmètre de recherche interne de l'agent '${actor.name}'.`,
      actorId: actor.id,
      evaluatedAt: new Date().toISOString()
    };
  }

  /**
   * Only Miss M can modify agent permissions.
   * If an agent calls this method, Genesis Core blocks it and records a security incident.
   */
  public modifyAgentPermission(
    agentId: string,
    permission: Permission,
    newStatus: PermissionStatus,
    scope: string,
    callerId: string
  ): Identity {
    const caller = this.dataService.getIdentity(callerId);
    const targetAgent = this.dataService.getIdentity(agentId);

    if (!targetAgent || targetAgent.type !== 'AGENT') {
      throw new Error(`Target agent '${agentId}' not found.`);
    }

    // STRICT CHECK: Only Miss M (usr_miss_m) can modify permissions
    if (!caller || caller.authority !== 'FINAL_HUMAN_AUTHORITY' || caller.role !== 'FOUNDER') {
      // Record security violation attempt
      this.dataService.recordEvent({
        id: `evt_sec_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        timestamp: new Date().toISOString(),
        actorId: callerId,
        actorName: caller ? caller.name : callerId,
        actorType: 'AGENT',
        eventType: 'SECURITY_ALERT',
        action: 'MANAGE_PERMISSIONS',
        context: {
          attemptedBy: caller ? caller.name : callerId,
          targetAgent: targetAgent.name,
          attemptedPermission: permission,
          newStatus
        },
        result: `ALERTE SÉCURITÉ : Tentative illégale de modification de permission par un non-souverain (${caller ? caller.name : callerId}). Rejeté par Genesis Core.`,
        permissionUsed: 'MANAGE_PERMISSIONS',
        authorizationRequired: true,
        authorizationStatus: 'BYPASSED_FORBIDDEN',
        simulated: false
      });

      throw new Error(
        `CONSTITUTIONAL BREACH: Only Miss M (Founder) can modify agent permissions. Caller '${callerId}' was rejected.`
      );
    }

    // Apply update to agent
    targetAgent.permissionProfiles = targetAgent.permissionProfiles || {};
    targetAgent.permissionProfiles[permission] = {
      permission,
      status: newStatus,
      scope,
      modifiedAt: new Date().toISOString(),
      modifiedBy: caller.name
    };

    // Update permissions array
    if (newStatus === 'NOT_AUTHORIZED') {
      targetAgent.permissions = targetAgent.permissions.filter((p) => p !== permission);
    } else {
      if (!targetAgent.permissions.includes(permission)) {
        targetAgent.permissions.push(permission);
      }
    }

    this.dataService.saveIdentity(targetAgent);

    // Record audit event
    this.dataService.recordEvent({
      id: `evt_perm_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
      actorId: caller.id,
      actorName: caller.name,
      actorType: 'HUMAN',
      eventType: 'PERMISSION_MODIFIED',
      action: 'MANAGE_PERMISSIONS',
      context: {
        agent: targetAgent.name,
        permission,
        newStatus,
        scope,
        modifiedBy: caller.name
      },
      result: `Permission '${permission}' pour '${targetAgent.name}' mise à jour vers '${newStatus}' par Miss M.`,
      permissionUsed: 'MANAGE_PERMISSIONS',
      authorizationRequired: true,
      authorizationStatus: 'AUTHORIZED',
      simulated: false
    });

    return targetAgent;
  }
}
