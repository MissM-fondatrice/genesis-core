/**
 * GENESIS CORE ⇄ GENESIS AI GATEWAY — Action Submission Bridge
 *
 * This module does not decide anything on its own. It only:
 *  1. Validates the incoming DTO against real Genesis identities/missions.
 *  2. Forces the action into simulation (never trusts an external "isSimulated").
 *  3. Hands the resulting ProposedAction to the exact same, unmodified
 *     PermissionService / MissionService / ValidationService / AuditService
 *     calls that GenesisCore.processMissionAnalysis already uses internally.
 *
 * No permission, no constitutional rule, no agent, and no authority level is
 * created, altered, or bypassed here. Miss M's final authority is untouched:
 * any action requiring human validation still stops at ValidationService,
 * exactly as before.
 */

import {
  Mission,
  Permission,
  ProposedAction,
  ValidationRequest
} from '../../../src/types/genesis.js';
import {
  GatewayActionSubmissionDTO,
  GatewayActionSubmissionResult
} from '../../../src/types/gatewayContract.js';
import { IdentityService } from '../../services/identityService.js';
import { PermissionService } from '../../services/permissionService.js';
import { MissionService } from '../../services/missionService.js';
import { ValidationService } from '../../services/validationService.js';
import { AuditService } from '../../services/auditService.js';

/**
 * Runtime mirror of the `Permission` union in src/types/genesis.ts.
 * TypeScript unions have no runtime representation, so an external string
 * must be checked against this explicit list before it is ever treated as
 * a real Permission. Keep in sync with that union if it changes.
 */
const KNOWN_PERMISSIONS: Permission[] = [
  'VIEW_DASHBOARD',
  'VIEW_AGENT',
  'CREATE_MISSION',
  'ASSIGN_MISSION',
  'VIEW_HISTORY',
  'CREATE_VALIDATION_REQUEST',
  'APPROVE_ACTION',
  'REFUSE_ACTION',
  'SUSPEND_MISSION',
  'CANCEL_MISSION',
  'MANAGE_PERMISSIONS',
  'ANALYZE_COMPANY',
  'CONTACT_COMPANY',
  'SEND_EMAIL',
  'MAKE_PHONE_CALL',
  'SEND_PROFESSIONAL_MESSAGE',
  'REQUEST_QUOTE',
  'REQUEST_APPOINTMENT',
  'NEGOTIATE_WITHIN_MANDATE',
  'CREATE_PARTNERSHIP_PROPOSAL',
  'EXECUTE_EXTERNAL_ACTION'
];

function isKnownPermission(value: string): value is Permission {
  return (KNOWN_PERMISSIONS as string[]).includes(value);
}

export interface GatewayActionBridgeDeps {
  identityService: IdentityService;
  permissionService: PermissionService;
  missionService: MissionService;
  validationService: ValidationService;
  auditService: AuditService;
}

export function submitGatewayProposedAction(
  deps: GatewayActionBridgeDeps,
  dto: GatewayActionSubmissionDTO
): GatewayActionSubmissionResult {
  const { identityService, permissionService, missionService, validationService, auditService } = deps;

  // ---------------------------------------------------------------
  // STEP 1 — Mission must exist.
  // ---------------------------------------------------------------
  const mission = missionService.getMissionById(dto.missionId);
  if (!mission) {
    throw Object.assign(new Error(`Mission '${dto.missionId}' not found.`), {
      rejectionCode: 'MISSION_NOT_FOUND'
    });
  }

  // ---------------------------------------------------------------
  // STEP 2 — Anti-spoofing: the submitting agent must be the one actually
  // assigned to this mission. An external caller cannot act "as" an agent
  // it was not routed through.
  // ---------------------------------------------------------------
  if (dto.agentId !== mission.assignedAgentId) {
    auditService.recordEvent({
      actorId: dto.agentId,
      actorName: dto.agentId,
      actorType: 'AGENT',
      eventType: 'GATEWAY_ACTION_SUBMITTED',
      missionId: mission.id,
      missionTitle: mission.title,
      action: 'GATEWAY_SUBMIT_PROPOSED_ACTION',
      context: { submittedAgentId: dto.agentId, actualAssignedAgentId: mission.assignedAgent
