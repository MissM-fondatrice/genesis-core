/**
 * GENESIS CORE ⇄ GENESIS AI GATEWAY — Bridge Contract
 *
 * Declares the input DTO an external AI capability (via the Genesis AI
 * Provider Gateway, or any future equivalent) uses to submit a *proposed*
 * action to Genesis Core. Genesis Core remains the sole authority: this DTO
 * is only ever treated as a proposal, never as an authorization or an
 * executed fact.
 *
 * Non-negotiable invariants enforced by the bridge (backend/core/gateway/
 * gatewayActionBridge.ts), not by this file:
 *  - isSimulated is always forced to true server-side, regardless of the
 *    value submitted here.
 *  - actionType is validated against the real Permission union before it
 *    ever reaches PermissionService.
 *  - agentId must match the mission's actually assigned agent.
 */

import { Permission } from './genesis.js';

export interface GatewayActionSubmissionDTO {
  missionId: string;
  agentId: string;
  actionType: string;
  name: string;
  target: string;
  rationale: string;
  payload: Record<string, unknown>;
  isSimulated: boolean;
  verifiedData: string[];
  uncertainData: string[];
  risks: string[];
  alternatives: string[];
}

/**
 * Mirrors the existing GenesisCore.processMissionAnalysis(...) return shape,
 * so any frontend/consumer code already handling that response can handle
 * this one identically.
 */
export interface GatewayActionSubmissionResult {
  mission: import('./genesis.js').Mission;
  validationRequest?: import('./genesis.js').ValidationRequest;
  requiresHuman: boolean;
  /** Present only when the submission was rejected before reaching PermissionService. */
  rejected?: {
    reason: string;
    code: 'MISSION_NOT_FOUND' | 'AGENT_MISMATCH' | 'INVALID_ACTION_TYPE';
  };
}

export type { Permission };
