/**
 * GENESIS CORE v0.1 - Type Definitions
 * 
 * Constitutional Principle:
 * "We are not here to replace humans. We are here to evolve in symbiosis with them."
 * Human authority must remain strictly above AI authority.
 */

export type AuthorityLevel = 
  | 'FINAL_HUMAN_AUTHORITY' 
  | 'VIRTUAL_AGENT' 
  | 'SPECIALIZED_AGENT' 
  | 'SYSTEM';

export type RoleType = 
  | 'FOUNDER' 
  | 'VIRTUAL_COMMERCIAL_DIRECTOR' 
  | 'SPECIALIZED_AGENT' 
  | 'SYSTEM_ORCHESTRATOR';

export type Permission =
  // Human founder permissions
  | 'VIEW_DASHBOARD'
  | 'VIEW_AGENT'
  | 'CREATE_MISSION'
  | 'ASSIGN_MISSION'
  | 'VIEW_HISTORY'
  | 'CREATE_VALIDATION_REQUEST'
  | 'APPROVE_ACTION'
  | 'REFUSE_ACTION'
  | 'SUSPEND_MISSION'
  | 'CANCEL_MISSION'
  | 'MANAGE_PERMISSIONS'
  // Agent & Operational communication permissions
  | 'ANALYZE_COMPANY'
  | 'CONTACT_COMPANY'
  | 'SEND_EMAIL'
  | 'MAKE_PHONE_CALL'
  | 'SEND_PROFESSIONAL_MESSAGE'
  | 'REQUEST_QUOTE'
  | 'REQUEST_APPOINTMENT'
  | 'NEGOTIATE_WITHIN_MANDATE'
  | 'CREATE_PARTNERSHIP_PROPOSAL'
  | 'EXECUTE_EXTERNAL_ACTION';

export type PermissionStatus = 'AUTHORIZED' | 'NOT_AUTHORIZED' | 'VALIDATION_REQUIRED';

export interface PermissionProfileEntry {
  permission: Permission;
  status: PermissionStatus;
  scope: string;
  modifiedAt?: string;
  modifiedBy?: string;
}

export type MissionPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type MissionStatus =
  | 'TODO'
  | 'IN_PROGRESS'
  | 'WAITING'
  | 'HUMAN_REQUIRED'
  | 'AUTHORIZED'
  | 'DONE'
  | 'BLOCKED'
  | 'SUSPENDED'
  | 'CANCELLED';

export type ActorType = 'HUMAN' | 'AGENT' | 'CORE_SYSTEM';

export type EventType =
  | 'MISSION_CREATED'
  | 'MISSION_ASSIGNED'
  | 'ANALYSIS_STARTED'
  | 'ACTION_PROPOSED'
  | 'PERMISSION_CHECKED'
  | 'VALIDATION_REQUESTED'
  | 'ACTION_AUTHORIZED'
  | 'ACTION_REFUSED'
  | 'MORE_INFO_REQUESTED'
  | 'SIMULATED_ACTION_EXECUTED'
  | 'MISSION_COMPLETED'
  | 'MISSION_BLOCKED'
  | 'MISSION_SUSPENDED'
  | 'MISSION_CANCELLED'
  | 'INTER_AGENT_COMMUNICATION'
  | 'PERMISSION_MODIFIED'
  | 'SECURITY_ALERT';

export interface AgentActivityRecord {
  id: string;
  timestamp: string;
  action: string;
  missionId?: string;
  missionTitle?: string;
  details?: string;
}

export interface Identity {
  id: string;
  name: string;
  role: RoleType | string;
  title: string;
  domain: string;
  description: string;
  authority: AuthorityLevel;
  type: ActorType;
  avatarPlaceholder?: string;
  status: 'ONLINE' | 'STANDBY' | 'ENGAGED' | 'MAINTENANCE';
  capabilities: string[];
  permissions: Permission[];
  permissionProfiles?: Record<string, PermissionProfileEntry>;
  missionScope: string[];
  territoryScope: string;
  establishmentScope: string[];
  memoryScope: string;
  communicationCapabilities: string[];
  humanValidationRequirements: string[];
  creationDate: string;
  activityHistory: AgentActivityRecord[];
  constitutionalBoundaries: string[];
}

export interface InterAgentMessage {
  id: string;
  timestamp: string;
  fromAgentId: string;
  fromAgentName: string;
  toAgentId: string;
  toAgentName: string;
  missionId?: string;
  requestSummary: string;
  filteredResponse: string;
  transferredContext: Record<string, unknown>;
  simulated: boolean;
}

export interface PermissionEvaluation {
  granted: boolean;
  requiredPermission: Permission;
  requiresHumanValidation: boolean;
  reason: string;
  actorId: string;
  evaluatedAt: string;
}

export interface ProposedAction {
  actionType: Permission;
  name: string;
  target: string;
  rationale: string;
  payload: Record<string, unknown>;
  risksAndLimitations: string[];
  proposedNextStep: string;
  isSimulated: boolean;
  // Enhanced governance attributes
  targetEntity?: string;
  impactScope?: string;
  verifiedData?: string[];
  uncertainData?: string[];
  risks?: string[];
  alternatives?: string[];
}

export interface ValidationRequest {
  id: string;
  missionId: string;
  missionTitle: string;
  agentId: string;
  agentName: string;
  agentRole?: string;
  proposedAction: ProposedAction;
  requiredPermission: Permission;
  permissionScope?: string;
  targetAffected?: string;
  status: 'PENDING' | 'AUTHORIZED' | 'REFUSED' | 'MORE_INFO_REQUESTED' | 'SUSPENDED';
  createdAt: string;
  decidedAt?: string;
  decisionNote?: string;
  decidedBy?: string;
  isSimulated: boolean;
  // Explanatory governance fields for Miss M
  verifiedData: string[];
  uncertainData: string[];
  risks: string[];
  alternatives: string[];
}

export interface SimulatedActionResult {
  executedAt: string;
  actionType: Permission;
  target: string;
  summary: string;
  details: Record<string, unknown>;
  disclaimer: string;
}

export interface MissionTimelineEvent {
  id: string;
  timestamp: string;
  step: string;
  actor: string;
  note: string;
  status: MissionStatus;
  simulated?: boolean;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName?: string;
  assignedAgentId: string;
  assignedAgentName?: string;
  missionScope: string[];
  territory: string;
  establishment: string;
  priority: MissionPriority;
  status: MissionStatus;
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  context: {
    domain?: string;
    targetIndustry?: string;
    budgetThreshold?: number;
    specialInstructions?: string;
    territory?: string;
    establishment?: string;
    [key: string]: unknown;
  };
  analysisResult?: {
    summary: string;
    identifiedTargets: Array<{ name: string; relevance: string; category: string }>;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    commercialRecommendation: string;
  };
  requestedAction?: ProposedAction;
  requiredPermission?: Permission;
  requiredPermissions?: Permission[];
  validationRequirements?: string[];
  validationRequestId?: string;
  result?: SimulatedActionResult;
  historySummary?: string[];
  eventTimeline?: MissionTimelineEvent[];
}

export interface AuditEvent {
  id: string;
  timestamp: string;
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
  authorizationRequired: boolean;
  authorizationStatus?: 'PENDING' | 'AUTHORIZED' | 'REFUSED' | 'BYPASSED_FORBIDDEN' | 'NOT_APPLICABLE';
  simulated: boolean;
  metadata?: Record<string, unknown>;
}

export type NotificationCategory = 'INFO' | 'IMPORTANT' | 'ACTION_REQUIRED' | 'CRITICAL';

export interface GenesisNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  recipientId: string;
  recipientName: string;
  timestamp: string;
  read: boolean;
  acknowledged: boolean;
  requiresAcknowledgement: boolean;
  missionId?: string;
  validationId?: string;
  agentId?: string;
}

export interface AgentRecommendation {
  agent: Identity;
  suitabilityScore: number;
  reasons: string[];
  isAuthorized: boolean;
  currentWorkload: number;
}

export interface ScenarioTestResult {
  id: number;
  name: string;
  passed: boolean;
  description: string;
  evidence: Record<string, unknown>;
  timestamp: string;
}

export interface CoreStatus {
  version: string;
  name: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'MAINTENANCE';
  simulationModeActive: boolean;
  humanAuthority: {
    primaryHolder: string;
    role: string;
    level: string;
    isEnforced: boolean;
  };
  services: {
    orchestration: boolean;
    identity: boolean;
    permissions: boolean;
    missions: boolean;
    agents: boolean;
    validations: boolean;
    audit: boolean;
    data: boolean;
    notifications: boolean;
  };
  stats: {
    totalMissions: number;
    activeMissions: number;
    pendingValidations: number;
    totalEvents: number;
    totalAgents: number;
    simulatedActionsCount: number;
    unreadNotifications: number;
    securityEventsCount: number;
  };
  constitutionalPrinciples: string[];
  systemHealth: {
    doctrineAdherence: string;
    humanSupremacyLock: boolean;
    sandboxIntegrity: boolean;
    auditIntegrity: boolean;
  };
}
