/**
 * GENESIS AI PROVIDER GATEWAY v0.1 — Normalized Types
 *
 * Constitutional principle carried over from Genesis Core:
 * An AI provider is an interchangeable capability, never an authority.
 * Genesis Core decides what can be executed; a provider can only propose.
 *
 * This module defines the normalized request/response contracts so that
 * the rest of Genesis never needs to know which SDK (Gemini, Anthropic,
 * OpenAI, or any future provider) actually served a given call.
 */

import { Permission, Mission } from '../../../src/types/genesis.js';

export type ProviderId = 'gemini' | 'claude' | 'openai';

export type ProviderStatus =
  | 'AVAILABLE'
  | 'NOT_CONFIGURED'
  | 'UNAVAILABLE'
  | 'DISABLED'
  | 'SIMULATED';

export interface ProviderInfo {
  providerId: ProviderId | 'simulated';
  name: string;
  status: ProviderStatus;
  models: string[];
  capabilities: string[];
  simulationMode: boolean;
  lastCheckedAt: string;
  restrictions: string[];
}

export type AIErrorCode =
  | 'PROVIDER_UNAVAILABLE'
  | 'PROVIDER_NOT_CONFIGURED'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'TIMEOUT'
  | 'RATE_LIMIT'
  | 'INVALID_REQUEST'
  | 'MODEL_UNAVAILABLE'
  | 'TOOL_NOT_AUTHORIZED'
  | 'CONTEXT_NOT_AUTHORIZED'
  | 'VALIDATION_REQUIRED'
  | 'UNKNOWN_ERROR';

export interface AIError {
  code: AIErrorCode;
  message: string;
  providerId?: ProviderId | 'simulated';
}

export interface GenesisAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GenesisAuthorizedContext {
  objective: string;
  missionId?: string;
  missionTitle?: string;
  domain?: string;
  territory?: string;
  establishment?: string;
  constraints?: string[];
  relevantPermissions?: Permission[];
  validationStatus?: Mission['status'];
  necessaryHistory?: string[];
  provenance: 'GENESIS_AUTHORIZED_CONTEXT';
}

export interface GenesisAIRequest {
  requestId: string;
  missionId?: string;
  agentId: string;
  taskType: string;
  objective: string;
  systemContext: GenesisAuthorizedContext;
  authorizedData?: Record<string, unknown>;
  messages: GenesisAIMessage[];
  authorizedTools: Permission[];
  constraints: string[];
  sensitivityLevel: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL';
  validationStatus: 'NOT_REQUIRED' | 'PENDING' | 'AUTHORIZED';
  preferredProvider?: ProviderId;
  model?: string;
}

export interface GenesisAIUsage {
  inputTokens?: number;
  outputTokens?: number;
}

export interface GenesisAIToolCall {
  tool: Permission;
  arguments: Record<string, unknown>;
  authorized: boolean;
}

export type GenesisAIStatus = 'OK' | 'ERROR' | 'BLOCKED';

export interface GenesisAIResponse {
  requestId: string;
  provider: ProviderId | 'simulated';
  model: string;
  response: string;
  status: GenesisAIStatus;
  usage?: GenesisAIUsage;
  latencyMs: number;
  toolCalls: GenesisAIToolCall[];
  warnings: string[];
  error?: AIError;
  timestamp: string;
  simulated: boolean;
  auditMetadata: {
    requestId: string;
    provenance: 'ESTIMATED';
    fallbackChain: (ProviderId | 'simulated')[];
  };
}
