/**
 * GENESIS AI PROVIDER GATEWAY v0.1
 *
 * MISS M → GENESIS APP → GENESIS CORE → AI PROVIDER GATEWAY → PROVIDERS IA
 *
 * This is the single entry point the rest of Genesis uses to reach any AI
 * provider. It never lets a provider bypass Genesis Core's governance:
 *
 *  - Every call is gated by PermissionService.evaluatePermission (identity,
 *    mission state, permission profile — the exact same engine Genesis Core
 *    already uses for everything else).
 *  - Every tool the AI is allowed to *mention* is checked individually; an
 *    agent without SEND_EMAIL can never reach Claude/Gemini/OpenAI with
 *    SEND_EMAIL enabled as an authorized tool (section 16).
 *  - Only a normalized, filtered context is ever transmitted to a provider
 *    (section 14) — never raw internal Genesis state.
 *  - Every call — success, failure, fallback, or block — is audited via the
 *    existing AuditService (section 18).
 *  - A provider that is down or not configured degrades to the next
 *    provider, then to the Genesis simulation sandbox — Genesis Core keeps
 *    functioning either way (section 13 and 19).
 *  - This class never executes an external action. It only ever returns
 *    advisory text/proposals; execution remains fully owned by the existing
 *    mission/validation/audit flow in GenesisCore, and stays simulated for
 *    this version (section 16, last line).
 */

import { Identity, Mission, Permission } from '../../../src/types/genesis.js';
import { PermissionService } from '../../services/permissionService.js';
import { AuditService } from '../../services/auditService.js';
import { ProviderRegistry } from './providerRegistry.js';
import {
  GenesisAIMessage,
  GenesisAIRequest,
  GenesisAIResponse,
  GenesisAuthorizedContext,
  ProviderId
} from './aiTypes.js';

export interface AIGenerateParams {
  /** The identity (human or agent) on whose behalf this call is made. */
  actor: Identity;
  /** The Genesis permission that gates using the AI Gateway for this purpose (e.g. 'ANALYZE_COMPANY'). */
  action: Permission;
  mission?: Mission;
  taskType: string;
  objective: string;
  messages: GenesisAIMessage[];
  authorizedData?: Record<string, unknown>;
  /** External-action permissions the AI response may propose using as a tool call. Each is checked individually. */
  toolsRequested?: Permission[];
  constraints?: string[];
  sensitivityLevel?: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL';
  preferredProvider?: ProviderId;
  model?: string;
}

const DEFAULT_FALLBACK_CHAIN: ProviderId[] = ['claude', 'gemini', 'openai'];

export class AIGateway {
  private registry: ProviderRegistry;
  private permissionService: PermissionService;
  private auditService: AuditService;

  constructor(permissionService: PermissionService, auditService: AuditService) {
    this.registry = new ProviderRegistry();
    this.permissionService = permissionService;
    this.auditService = auditService;
  }

  public getProvidersStatus() {
    return this.registry.getStatusList();
  }

  public async generate(params: AIGenerateParams): Promise<GenesisAIResponse> {
    const requestId = `air_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const sensitivityLevel = params.sensitivityLevel || 'INTERNAL';

    // ---------------------------------------------------------------
    // STEP 1 — GOVERNANCE GATE: identical engine used everywhere else.
    // ---------------------------------------------------------------
    const permEval = this.permissionService.evaluatePermission({
      actor: params.actor,
      action: params.action,
      mission: params.mission
    });

    if (!permEval.granted) {
      this.auditService.recordEvent({
        actorId: params.actor.id,
        actorName: params.actor.name,
        actorType: params.actor.type,
        eventType: 'AI_REQUEST_SENT',
        missionId: params.mission?.id,
        missionTitle: params.mission?.title,
        action: params.action,
        context: { requestId, taskType: params.taskType, reason: permEval.reason },
        result: `AI Gateway request BLOCKED before reaching any provider: ${permEval.reason}`,
        permissionUsed: params.action,
        authorizationRequired: true,
        authorizationStatus: 'REFUSED',
        simulated: false
      });

      throw new Error(`AI Gateway: permission denied for '${params.action}' — ${permEval.reason}`);
    }

    // ---------------------------------------------------------------
    // STEP 2 — TOOL AUTHORIZATION: filter, never trust the caller list.
    // ---------------------------------------------------------------
    const requestedTools = params.toolsRequested || [];
    const authorizedTools: Permission[] = [];
    const blockedTools: { tool: Permission; reason: string }[] = [];

    for (const tool of requestedTools) {
      const toolEval = this.permissionService.evaluatePermission({
        actor: params.actor,
        action: tool,
        mission: params.mission
      });
      if (toolEval.granted) {
        authorizedTools.push(tool);
      } else {
        blockedTools.push({ tool, reason: toolEval.reason });
      }
    }

    if (blockedTools.length > 0) {
      this.auditService.recordEvent({
        actorId: params.actor.id,
        actorName: params.actor.name,
        actorType: params.actor.type,
        eventType: 'AI_TOOL_CALL_BLOCKED',
        missionId: params.mission?.id,
        missionTitle: params.mission?.title,
        action: params.action,
        context: {
          requestId,
          blockedTools: blockedTools.map((b) => ({ tool: b.tool, reason: b.reason }))
        },
        result: `Genesis Core stripped ${blockedTools.length} unauthorized tool(s) before contacting any AI provider. An AI provider can never become a bypass route.`,
        authorizationRequired: true,
        authorizationStatus: 'REFUSED',
        simulated: false
      });
    }

    // ---------------------------------------------------------------
    // STEP 3 — NORMALIZED, FILTERED CONTEXT (never raw internal state).
    // ---------------------------------------------------------------
    const systemContext: GenesisAuthorizedContext = {
      objective: params.objective,
      missionId: params.mission?.id,
      missionTitle: params.mission?.title,
      domain: params.mission?.context?.domain as string | undefined,
      territory: params.mission?.territory,
      establishment: params.mission?.establishment,
      constraints: params.constraints || [],
      relevantPermissions: authorizedTools,
      validationStatus: params.mission?.status,
      necessaryHistory: params.mission?.historySummary?.slice(-3) || [],
      provenance: 'GENESIS_AUTHORIZED_CONTEXT'
    };

    const request: GenesisAIRequest = {
      requestId,
      missionId: params.mission?.id,
      agentId: params.actor.id,
      taskType: params.taskType,
      objective: params.objective,
      systemContext,
      authorizedD
