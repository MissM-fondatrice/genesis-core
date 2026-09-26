/**
 * GENESIS FRONTEND API CLIENT
 */

import {
  Mission,
  ValidationRequest,
  AuditEvent,
  CoreStatus,
  Identity
} from '../types/genesis.js';

export const api = {
  async getStatus(): Promise<CoreStatus> {
    const res = await fetch('/api/core/status');
    if (!res.ok) throw new Error('Failed to fetch Genesis Core status');
    return res.json();
  },

  async resetCore(): Promise<{ message: string; status: CoreStatus }> {
    const res = await fetch('/api/core/reset', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset Genesis Core');
    return res.json();
  },

  async getIdentities(): Promise<Identity[]> {
    const res = await fetch('/api/identities');
    if (!res.ok) throw new Error('Failed to fetch identities');
    return res.json();
  },

  async getAgents(): Promise<Identity[]> {
    const res = await fetch('/api/agents');
    if (!res.ok) throw new Error('Failed to fetch agents');
    return res.json();
  },

  async getMissions(): Promise<Mission[]> {
    const res = await fetch('/api/missions');
    if (!res.ok) throw new Error('Failed to fetch missions');
    return res.json();
  },

  async getMission(id: string): Promise<Mission> {
    const res = await fetch(`/api/missions/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch mission ${id}`);
    return res.json();
  },

  async createMission(data: {
    title: string;
    description: string;
    priority?: string;
    deadline?: string;
    assignedAgentId?: string;
    context?: Record<string, unknown>;
  }): Promise<Mission> {
    const res = await fetch('/api/missions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create mission' }));
      throw new Error(err.error || 'Failed to create mission');
    }
    return res.json();
  },

  async assignMission(missionId: string, agentId: string): Promise<Mission> {
    const res = await fetch(`/api/missions/${missionId}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId })
    });
    if (!res.ok) throw new Error('Failed to assign mission');
    return res.json();
  },

  async triggerAnalysis(missionId: string): Promise<{
    mission: Mission;
    validationRequest?: ValidationRequest;
    requiresHuman: boolean;
  }> {
    const res = await fetch(`/api/missions/${missionId}/analyze`, { method: 'POST' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Analysis failed' }));
      throw new Error(err.error || 'Analysis failed');
    }
    return res.json();
  },

  async getValidations(status?: 'PENDING'): Promise<ValidationRequest[]> {
    const url = status ? `/api/validations?status=${status}` : '/api/validations';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch validations');
    return res.json();
  },

  async decideValidation(
    validationId: string,
    decision: 'AUTHORIZE' | 'REFUSE' | 'REQUEST_MORE_INFO' | 'SUSPEND',
    note?: string
  ): Promise<{
    validation: ValidationRequest;
    mission: Mission;
    executionResult?: unknown;
  }> {
    const res = await fetch(`/api/validations/${validationId}/decide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, note })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Validation decision failed' }));
      throw new Error(err.error || 'Validation decision failed');
    }
    return res.json();
  },

  async updateAgentPermission(
    agentId: string,
    data: {
      permission: string;
      status: string;
      scope?: string;
      callerId?: string;
    }
  ): Promise<Identity> {
    const res = await fetch(`/api/agents/${agentId}/permissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update agent permissions' }));
      throw new Error(err.error || 'Failed to update agent permissions');
    }
    return res.json();
  },

  async getAgentRecommendations(data: {
    title: string;
    description: string;
    domain?: string;
    territory?: string;
    establishment?: string;
    requiredPermissions?: string[];
  }): Promise<import('../types/genesis.js').AgentRecommendation[]> {
    const res = await fetch('/api/missions/recommend-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to get agent recommendations');
    return res.json();
  },

  async getNotifications(): Promise<import('../types/genesis.js').GenesisNotification[]> {
    const res = await fetch('/api/notifications');
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to mark notification read');
    return res.json();
  },

  async acknowledgeNotification(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/notifications/${id}/acknowledge`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to acknowledge notification');
    return res.json();
  },

  async getScenarios(): Promise<import('../types/genesis.js').ScenarioTestResult[]> {
    const res = await fetch('/api/scenarios');
    if (!res.ok) throw new Error('Failed to fetch scenario tests');
    return res.json();
  },

  async runScenario(id: number): Promise<import('../types/genesis.js').ScenarioTestResult> {
    const res = await fetch(`/api/scenarios/run/${id}`, { method: 'POST' });
    if (!res.ok) throw new Error(`Failed to run scenario ${id}`);
    return res.json();
  },

  async suspendMission(missionId: string, reason: string): Promise<Mission> {
    const res = await fetch(`/api/missions/${missionId}/suspend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    if (!res.ok) throw new Error('Failed to suspend mission');
    return res.json();
  },

  async cancelMission(missionId: string, reason: string): Promise<Mission> {
    const res = await fetch(`/api/missions/${missionId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    if (!res.ok) throw new Error('Failed to cancel mission');
    return res.json();
  },

  async getEvents(limit = 100, missionId?: string): Promise<AuditEvent[]> {
    const url = missionId
      ? `/api/events?limit=${limit}&missionId=${encodeURIComponent(missionId)}`
      : `/api/events?limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch audit events');
    return res.json();
  },

  async getAgent(id: string): Promise<Identity> {
    const res = await fetch(`/api/agents/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch agent ${id}`);
    return res.json();
  },

  async routeMission(missionId: string): Promise<{
    mission: Mission;
    routedAgent: Identity;
    matchReason: string;
    confidence: number;
  }> {
    const res = await fetch(`/api/missions/${missionId}/route`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to route mission');
    return res.json();
  },

  async collaborateInterAgent(data: {
    fromAgentId: string;
    toAgentId: string;
    missionId?: string;
    requestSummary: string;
  }): Promise<import('../types/genesis.js').InterAgentMessage> {
    const res = await fetch('/api/agents/collaborate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to execute inter-agent collaboration');
    return res.json();
  },

  async runTests(): Promise<any> {
    const res = await fetch('/api/tests/run', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to run test suite');
    return res.json();
  },

  async getTestStatus(): Promise<any> {
    const res = await fetch('/api/tests/status');
    if (!res.ok) throw new Error('Failed to get test status');
    return res.json();
  },

  // GENESIS AI PROVIDER GATEWAY v0.1 — key-free status listing only.
  async getAIProviders(): Promise<import('../types/genesis.js').AIProviderStatusView[]> {
    const res = await fetch('/api/ai/providers');
    if (!res.ok) throw new Error('Failed to fetch AI provider status');
    return res.json();
  }
};
