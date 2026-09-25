import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  Award,
  ChevronRight,
  Sliders,
  Play,
  RotateCcw,
  AlertTriangle,
  FileCheck,
  X,
  ChevronDown,
  Info,
  Shield,
  Activity,
  Users,
  Briefcase,
  Clock,
  ExternalLink
} from 'lucide-react';
import {
  CoreStatus,
  Identity,
  Permission,
  PermissionStatus,
  ScenarioTestResult,
  AuditEvent,
  Mission,
  ValidationRequest
} from '../types/genesis.js';
import { api } from '../services/api.js';

interface CoreStatusViewProps {
  status: CoreStatus | null;
  agents: Identity[];
  missions: Mission[];
  validations: ValidationRequest[];
  events: AuditEvent[];
  onRefreshData?: () => void;
}

export const CoreStatusView: React.FC<CoreStatusViewProps> = ({
  status,
  agents,
  missions,
  validations,
  events,
  onRefreshData
}) => {
  // Navigation within Core control center
  const [coreSection, setCoreSection] = useState<'OVERVIEW' | 'PERMISSIONS' | 'SCENARIOS' | 'AUDIT'>('OVERVIEW');

  // Permission management state
  const [selectedAgentId, setSelectedAgentId] = useState<string>('agt_miss_danford');
  const [editingPerm, setEditingPerm] = useState<Permission | null>(null);
  const [newStatus, setNewStatus] = useState<PermissionStatus>('VALIDATION_REQUIRED');
  const [newScope, setNewScope] = useState('');
  const [savingPerm, setSavingPerm] = useState(false);

  // Scenario test suite state
  const [scenarios, setScenarios] = useState<ScenarioTestResult[]>([]);
  const [runningScenarios, setRunningScenarios] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioTestResult | null>(null);

  // Expandable details state for non-technical friendliness
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      const res = await api.getScenarios();
      setScenarios(res);
    } catch {
      // Scenarios not yet loaded or initialized
    }
  };

  const handleRunAllScenarios = async () => {
    try {
      setRunningScenarios(true);
      const res = await api.getScenarios();
      setScenarios(res);
      if (onRefreshData) onRefreshData();
    } finally {
      setRunningScenarios(false);
    }
  };

  const handleRunSingleScenario = async (id: number) => {
    try {
      setRunningScenarios(true);
      const result = await api.runScenario(id);
      setScenarios((prev) => {
        const idx = prev.findIndex((s) => s.id === id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = result;
          return updated;
        }
        return [...prev, result];
      });
      setSelectedScenario(result);
      if (onRefreshData) onRefreshData();
    } finally {
      setRunningScenarios(false);
    }
  };

  const handleOpenEditPerm = (perm: Permission, currentEntry?: { status: PermissionStatus; scope: string }) => {
    setEditingPerm(perm);
    setNewStatus(currentEntry?.status || 'VALIDATION_REQUIRED');
    setNewScope(currentEntry?.scope || 'Périmètre autorisé sous supervision');
  };

  const handleSavePermission = async () => {
    if (!editingPerm || !selectedAgent) return;
    try {
      setSavingPerm(true);
      await api.updateAgentPermission(selectedAgent.id, {
        permission: editingPerm,
        status: newStatus,
        scope: newScope,
        callerId: 'usr_miss_m'
      });
      setEditingPerm(null);
      if (onRefreshData) onRefreshData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Erreur d'habilitation : ${msg}`);
    } finally {
      setSavingPerm(false);
    }
  };

  const securityEvents = events.filter((e) => e.eventType === 'SECURITY_ALERT');
  const activeMissionsCount = missions.filter((m) => m.status !== 'DONE' && m.status !== 'CANCELLED').length;
  const pendingValidationsCount = validations.filter((v) => v.status === 'PENDING').length;

  return (
    <div className="space-y-8">
      {/* Bureau Header */}
      <div className="bg-[#121319]/90 border border-stone-800/80 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <Layers className="w-4 h-4 text-[#981c2e]" />
              <span className="font-brand uppercase tracking-widest text-[11px] text-stone-300">
                Centre de Gouvernance & Orchestration
              </span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl text-[#fdfbf7] font-normal tracking-wide">
              Genesis Core — Centre de Contrôle de Miss M
            </h2>
            <p className="text-xs text-[#c9bea9] font-sans max-w-2xl leading-relaxed">
              Supervision de la doctrine constitutionnelle, étanchéité du bac à sable simulé et gestion centrale des habilitations. Les mécanismes complexes sont protégés par le Core ; Miss M dispose d'une visibilité claire et directe.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#0b0c10] p-1.5 rounded-xl border border-stone-800 text-xs font-sans">
            <button
              onClick={() => setCoreSection('OVERVIEW')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                coreSection === 'OVERVIEW'
                  ? 'bg-[#290d13] text-[#d48b96] font-medium border border-[#6b1725]'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Vue Synthétique
            </button>
            <button
              onClick={() => setCoreSection('PERMISSIONS')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                coreSection === 'PERMISSIONS'
                  ? 'bg-[#290d13] text-[#d48b96] font-medium border border-[#6b1725]'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Habilitations & Portées
            </button>
            <button
              onClick={() => setCoreSection('SCENARIOS')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                coreSection === 'SCENARIOS'
                  ? 'bg-[#290d13] text-[#d48b96] font-medium border border-[#6b1725]'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Banc d'Épreuve (Scénarios 1–6)
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: OVERVIEW CONTROL CENTER */}
      {coreSection === 'OVERVIEW' && (
        <div className="space-y-8">
          {/* Top 9 Core Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. SYSTEM STATUS */}
            <div className="bg-[#121319]/90 border border-stone-800/80 rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-sans uppercase tracking-wider text-stone-400">
                  1. État du Système
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
              </div>
              <div className="font-editorial text-2xl text-[#fdfbf7]">
                {status?.status === 'OPERATIONAL' ? 'Opérationnel & Sécurisé' : status?.status || 'Opérationnel'}
              </div>
              <p className="text-xs text-[#c9bea9] font-sans leading-relaxed">
                Version {status?.version || 'v0.1-alpha'}. Mode simulation actif sur 100% des connecteurs.
              </p>
              <button
                onClick={() => setExpandedCard(expandedCard === 'SYS' ? null : 'SYS')}
                className="text-[11px] text-[#d48b96] hover:underline flex items-center gap-1 font-sans cursor-pointer"
              >
                <span>Détails de configuration</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${expandedCard === 'SYS' ? 'rotate-180' : ''}`} />
              </button>
              {expandedCard === 'SYS' && (
                <div className="pt-2 text-[11px] text-stone-400 space-y-1 font-mono border-t border-stone-800/60">
                  <div>Back-end : Express + TSX Engine</div>
                  <div>Middleware : Vite SSR proxy v0.1</div>
                  <div>Persistance : In-memory transactional repository</div>
                </div>
              )}
            </div>

            {/* 2. IDENTITY STATUS */}
            <div className="bg-[#121319]/90 border border-stone-800/80 rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-sans uppercase tracking-wider text-stone-400">
                  2. Souveraineté & Identités
                </span>
                <ShieldCheck className="w-4 h-4 text-[#981c2e]" />
              </div>
              <div className="font-editorial text-2xl text-[#fdfbf7]">
                Miss M (Souveraine)
              </div>
              <p className="text-xs text-[#c9bea9] font-sans leading-relaxed">
                Droit de veto inconditionnel garanti. Les directoires virtuels ne peuvent ni impersonner ni outrepasser Miss M.
              </p>
              <button
                onClick={() => setExpandedCard(expandedCard === 'ID' ? null : 'ID')}
                className="text-[11px] text-[#d48b96] hover:underline flex items-center gap-1 font-sans cursor-pointer"
              >
                <span>Vérification des rôles</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${expandedCard === 'ID' ? 'rotate-180' : ''}`} />
              </button>
              {expandedCard === 'ID' && (
                <div className="pt-2 text-[11px] text-stone-400 space-y-1 font-mono border-t border-stone-800/60">
                  <div>Autorité suprême : FINAL_HUMAN_AUTHORITY</div>
                  <div>Directrice Commerciale : Miss Danford</div>
                  <div>Rôles opérationnels : 14 agents spécialisés</div>
                </div>
              )}
            </div>

            {/* 3. PERMISSION STATUS */}
            <div className="bg-[#121319]/90 border border-stone-800/80 rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-sans uppercase tracking-wider text-stone-400">
                  3. Régime des Permissions
                </span>
                <Lock className="w-4 h-4 text-[#d48b96]" />
              </div>
              <div className="font-editorial text-2xl text-[#fdfbf7]">
                Authentification ≠ Autorisation
              </div>
              <p className="text-xs text-[#c9bea9] font-sans leading-relaxed">
                Chaque acte fait l'objet d'un contrôle de mandat, de périmètre et de validation humaine préalable.
              </p>
              <button
                onClick={() => setExpandedCard(expandedCard === 'PERM' ? null : 'PERM')}
                className="text-[11px] text-[#d48b96] hover:underline flex items-center gap-1 font-sans cursor-pointer"
              >
                <span>Règle d'inviolabilité</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${expandedCard === 'PERM' ? 'rotate-180' : ''}`} />
              </button>
              {expandedCard === 'PERM' && (
                <div className="pt-2 text-[11px] text-stone-400 space-y-1 font-mono border-t border-stone-800/60">
                  <div>Auto-attribution : STRICTEMENT PROHIBÉE</div>
                  <div>Modification : Réservée au jeton de Miss M</div>
                  <div>Régime externe : VALIDATION_REQUIRED</div>
                </div>
              )}
            </div>

            {/* 4. ACTIVE MISSIONS */}
            <div className="bg-[#121319]/90 border border-stone-800/80 rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-sans uppercase tracking-wider text-stone-400">
                  4. Mandats en Cours
                </span>
                <Briefcase className="w-4 h-4 text-stone-400" />
              </div>
              <div className="font-editorial text-2xl text-[#fdfbf7]">
                {activeMissionsCount} actif{activeMissionsCount > 1 ? 's' : ''} / {missions.length} au total
              </div>
              <p className="text-xs text-[#c9bea9] font-sans leading-relaxed">
                Suivi du cycle de vie opérationnel, synchronisé avec les directoires virtuels.
              </p>
            </div>

            {/* 5. PENDING VALIDATIONS */}
            <div className="bg-[#121319]/90 border border-stone-800/80 rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-sans uppercase tracking-wider text-stone-400">
                  5. Arbitrages en Attente
                </span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="font-editorial text-2xl text-[#fdfbf7]">
                {pendingValidationsCount} requête{pendingValidationsCount > 1 ? 's' : ''}
              </div>
              <p className="text-xs text-[#c9bea9] font-sans leading-relaxed">
                Soumises à Miss M pour ratification avant toute démarche dans le bac à sable simulé.
              </p>
            </div>

            {/* 6. ACTIVE AGENTS */}
            <div className="bg-[#121319]/90 border border-stone-800/80 rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-sans uppercase tracking-wider text-stone-400">
                  6. Directoires Virtuels
                </span>
                <Users className="w-4 h-4 text-stone-400" />
              </div>
              <div className="font-editorial text-2xl text-[#fdfbf7]">
                {agents.filter((a) => a.type === 'AGENT').length} Agents Officiels
              </div>
              <p className="text-xs text-[#c9bea9] font-sans leading-relaxed">
                Miss Danford (Commercial) + 14 agents spécialisés dans leurs domaines hermétiques.
              </p>
            </div>

            {/* 7. SECURITY EVENTS */}
            <div className="bg-[#121319]/90 border border-stone-800/80 rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-sans uppercase tracking-wider text-stone-400">
                  7. Incidents de Sécurité
                </span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="font-editorial text-2xl text-[#fdfbf7]">
                {securityEvents.length} interception{securityEvents.length > 1 ? 's' : ''}
              </div>
              <p className="text-xs text-[#c9bea9] font-sans leading-relaxed">
                Toute tentative d'action non habilitée ou d'auto-attribution est neutralisée par le Core.
              </p>
            </div>

            {/* 8. RECENT AUDIT EVENTS */}
            <div className="bg-[#121319]/90 border border-stone-800/80 rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-sans uppercase tracking-wider text-stone-400">
                  8. Registre Notarié (Audit)
                </span>
                <FileCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="font-editorial text-2xl text-[#fdfbf7]">
                {events.length} actes enregistrés
              </div>
              <p className="text-xs text-[#c9bea9] font-sans leading-relaxed">
                Journalisation chronologique infalsifiable des propositions, arbitrages et simulations.
              </p>
            </div>

            {/* 9. SYSTEM HEALTH */}
            <div className="bg-[#121319]/90 border border-stone-800/80 rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-sans uppercase tracking-wider text-stone-400">
                  9. Santé Déontologique
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="font-editorial text-2xl text-[#fdfbf7]">
                100% Conforme
              </div>
              <p className="text-xs text-[#c9bea9] font-sans leading-relaxed">
                Garantie de non-remplacement humain & stricte doctrine symbiotique active.
              </p>
            </div>
          </div>

          {/* Quick Access to Permission Management and Scenarios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#121319]/90 border border-stone-800/80 rounded-2xl p-6 space-y-3">
              <h3 className="font-editorial text-xl text-[#fdfbf7]">Centre des Habilitations de Miss M</h3>
              <p className="text-xs text-[#c9bea9] font-sans leading-relaxed">
                Consultez et ajustez individuellement le statut des permissions de chaque agent virtuel (Autorisé, Non Autorisé, Validation Requise) et modifiez leurs périmètres d'intervention.
              </p>
              <button
                onClick={() => setCoreSection('PERMISSIONS')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1e222e] hover:bg-[#282d3d] text-xs font-sans text-stone-200 transition cursor-pointer"
              >
                <span>Gérer les Habilitations</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#d48b96]" />
              </button>
            </div>

            <div className="bg-[#121319]/90 border border-stone-800/80 rounded-2xl p-6 space-y-3">
              <h3 className="font-editorial text-xl text-[#fdfbf7]">Banc d'Épreuve Déontologique (Tests 1 à 6)</h3>
              <p className="text-xs text-[#c9bea9] font-sans leading-relaxed">
                Exécutez interactivement les 6 scénarios constitutionnels : proposition simulée de Miss Danford, blocage d'actes non habilités, tentative d'auto-attribution, veto souverain et filtrage inter-agents.
              </p>
              <button
                onClick={() => setCoreSection('SCENARIOS')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#290d13] hover:bg-[#3d121c] text-xs font-sans text-[#d48b96] border border-[#6b1725] transition cursor-pointer"
              >
                <span>Lancer le Banc d'Épreuve</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#d48b96]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: PERMISSION CENTER */}
      {coreSection === 'PERMISSIONS' && (
        <div className="space-y-6">
          <div className="bg-[#121319]/90 border border-stone-800/80 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-editorial text-2xl text-[#fdfbf7]">
                  Matrice des Habilitations par Agent
                </h3>
                <p className="text-xs text-[#c9bea9] font-sans leading-relaxed mt-0.5">
                  « AUTORISÉ » ne signifie jamais « ILLIMITÉ ». Chaque habilitation dispose d'un périmètre d'action strict. Seule Miss M peut altérer cette matrice.
                </p>
              </div>

              {/* Agent Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400 font-sans">Agent :</span>
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="bg-[#161821] border border-stone-800 rounded-xl px-3 py-2 text-xs text-[#f4efe6] focus:outline-none focus:border-[#981c2e]"
                >
                  {agents
                    .filter((a) => a.type === 'AGENT')
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.title})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Selected Agent Identity Pill */}
            {selectedAgent && (
              <div className="p-4 rounded-xl bg-[#161821] border border-stone-800/70 flex flex-wrap items-center justify-between gap-4 text-xs font-sans">
                <div>
                  <div className="font-medium text-[#fcfaf6] text-sm">{selectedAgent.name}</div>
                  <div className="text-stone-400 text-xs">{selectedAgent.title}</div>
                  <div className="text-[11px] text-stone-500 font-mono mt-0.5">ID: {selectedAgent.id}</div>
                </div>

                <div className="text-right">
                  <div className="text-stone-400 text-[11px]">Rattachement :</div>
                  <strong className="text-stone-200">Miss M (Autorité Souveraine)</strong>
                </div>
              </div>
            )}

            {/* Permissions List */}
            {selectedAgent && (
              <div className="space-y-3 pt-2">
                <span className="text-stone-400 text-[11px] uppercase tracking-wider font-medium block">
                  Permissions & Portées Définies :
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    'CONTACT_COMPANY',
                    'REQUEST_QUOTE',
                    'REQUEST_APPOINTMENT',
                    'NEGOTIATE_WITHIN_MANDATE',
                    'CREATE_PARTNERSHIP_PROPOSAL',
                    'ANALYZE_COMPANY',
                    'SEND_PROFESSIONAL_MESSAGE',
                    'EXECUTE_EXTERNAL_ACTION'
                  ].map((permKey) => {
                    const perm = permKey as Permission;
                    const profile = selectedAgent.permissionProfiles?.[perm];
                    const isAuthorized = profile?.status === 'AUTHORIZED';
                    const isValidationRequired = profile?.status === 'VALIDATION_REQUIRED';
                    const isNotAuthorized = !profile || profile?.status === 'NOT_AUTHORIZED';

                    return (
                      <div
                        key={perm}
                        className="p-4 rounded-xl bg-[#14161f] border border-stone-800/80 space-y-2 flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-xs text-[#fcfaf6] font-mono">
                              {perm}
                            </span>

                            {isAuthorized && (
                              <span className="text-[10px] font-sans px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                                AUTORISÉ
                              </span>
                            )}
                            {isValidationRequired && (
                              <span className="text-[10px] font-sans px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800/60">
                                VALIDATION REQUISE
                              </span>
                            )}
                            {isNotAuthorized && (
                              <span className="text-[10px] font-sans px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800/60">
                                NON AUTORISÉ
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-[#c9bea9] font-sans leading-relaxed">
                            Portée : {profile?.scope || 'Non habilité pour cet agent'}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-stone-800/60 flex justify-end">
                          <button
                            onClick={() => handleOpenEditPerm(perm, profile)}
                            className="text-xs text-[#d48b96] hover:text-[#f4b6c1] font-sans cursor-pointer"
                          >
                            Modifier pour Miss M →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: TEST SCENARIOS (1 to 6) */}
      {coreSection === 'SCENARIOS' && (
        <div className="space-y-6">
          <div className="bg-[#121319]/90 border border-stone-800/80 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-editorial text-2xl text-[#fdfbf7]">
                  Banc d'Épreuve Déontologique — Scénarios Constitutionnels
                </h3>
                <p className="text-xs text-[#c9bea9] font-sans leading-relaxed mt-0.5 max-w-2xl">
                  Ces scénarios internes valident l'intégrité de l'orchestration Genesis Core : respect absolu de la souveraineté de Miss M, blocage immédiat des actes non habilités et inviolabilité des permissions.
                </p>
              </div>

              <button
                onClick={handleRunAllScenarios}
                disabled={runningScenarios}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#981c2e] to-[#7f1826] text-white text-xs font-sans font-medium transition cursor-pointer"
              >
                <Play className={`w-3.5 h-3.5 ${runningScenarios ? 'animate-spin' : ''}`} />
                <span>Exécuter les 6 Scénarios</span>
              </button>
            </div>

            {/* Scenarios Grid */}
            <div className="space-y-3 pt-3">
              {[1, 2, 3, 4, 5, 6].map((num) => {
                const scenario = scenarios.find((s) => s.id === num);
                const title =
                  num === 1
                    ? 'TEST 1 : Proposition de contact fournisseur par Miss Danford (Mode simulation certifié)'
                    : num === 2
                    ? 'TEST 2 : Tentative d\'action non habilitée par un agent (Blocage Core & Audit)'
                    : num === 3
                    ? 'TEST 3 : Tentative d\'auto-attribution de permission par un agent (Neutralisation)'
                    : num === 4
                    ? 'TEST 4 : Ratification d\'une validation par Miss M (Transition d\'état & Exécution simulée)'
                    : num === 5
                    ? 'TEST 5 : Refus formel d\'une action par Miss M (Veto souverain & Classement sans suite)'
                    : 'TEST 6 : Échange d\'informations inter-agents (Filtrage au strict nécessaire & Traçabilité)';

                return (
                  <div
                    key={num}
                    className="p-4 rounded-xl bg-[#161821] border border-stone-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:border-stone-700"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-[#fcfaf6]">{title}</span>
                        {scenario && (
                          <span
                            className={`text-[10px] font-sans px-2.5 py-0.5 rounded-full ${
                              scenario.passed
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                                : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                            }`}
                          >
                            {scenario.passed ? 'CONFORME' : 'ÉCHEC'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#c9bea9] font-sans leading-relaxed">
                        {scenario?.description || 'En attente d\'exécution.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {scenario && (
                        <button
                          onClick={() => setSelectedScenario(scenario)}
                          className="px-3 py-1.5 rounded-lg border border-stone-700 text-xs font-sans text-stone-300 hover:text-white transition cursor-pointer"
                        >
                          Détails des preuves
                        </button>
                      )}
                      <button
                        onClick={() => handleRunSingleScenario(num)}
                        disabled={runningScenarios}
                        className="px-3 py-1.5 rounded-lg bg-[#290d13] hover:bg-[#3b1218] text-[#d48b96] border border-[#6b1725] text-xs font-sans transition cursor-pointer"
                      >
                        Tester
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Permission Edit Modal */}
      {editingPerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121319] border border-stone-800 rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-sans uppercase tracking-widest text-[#d48b96]">
                  Gouvernance Souveraine Miss M
                </span>
                <h3 className="font-editorial text-2xl text-[#fdfbf7] font-normal tracking-wide mt-1">
                  Ajuster l'Habilitation
                </h3>
              </div>
              <button
                onClick={() => setEditingPerm(null)}
                className="text-stone-400 hover:text-stone-200 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div>
                <span className="text-stone-400">Agent ciblé :</span>
                <strong className="text-stone-100 block text-sm mt-0.5">{selectedAgent?.name}</strong>
              </div>

              <div>
                <span className="text-stone-400">Permission :</span>
                <div className="font-mono text-xs text-[#d48b96] mt-0.5">{editingPerm}</div>
              </div>

              <div className="space-y-1">
                <label className="text-stone-300">Statut d'autorisation :</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as PermissionStatus)}
                  className="w-full bg-[#161821] border border-stone-800 rounded-xl px-3 py-2 text-xs text-[#f4efe6]"
                >
                  <option value="AUTHORIZED">AUTORISÉ</option>
                  <option value="VALIDATION_REQUIRED">VALIDATION REQUISE (Par Miss M)</option>
                  <option value="NOT_AUTHORIZED">NON AUTORISÉ (Bloqué)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-stone-300">Portée / Périmètre d'application :</label>
                <input
                  type="text"
                  value={newScope}
                  onChange={(e) => setNewScope(e.target.value)}
                  className="w-full bg-[#161821] border border-stone-800 rounded-xl px-3 py-2 text-xs text-[#f4efe6]"
                  placeholder="Ex : Fournisseurs CHR européens agréés"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
              <button
                onClick={() => setEditingPerm(null)}
                disabled={savingPerm}
                className="px-4 py-2 rounded-xl border border-stone-800 text-xs font-sans text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleSavePermission}
                disabled={savingPerm}
                className="px-4 py-2 rounded-xl bg-[#981c2e] hover:bg-[#7f1826] text-white text-xs font-sans cursor-pointer"
              >
                {savingPerm ? 'Enregistrement notarié...' : 'Appliquer la consigne'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scenario Evidence Modal */}
      {selectedScenario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121319] border border-stone-800 rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-sans uppercase tracking-widest text-[#d48b96]">
                  Preuve Notariée du Scénario {selectedScenario.id}
                </span>
                <h3 className="font-editorial text-2xl text-[#fdfbf7] font-normal tracking-wide mt-1">
                  Rapport de Conformité
                </h3>
              </div>
              <button
                onClick={() => setSelectedScenario(null)}
                className="text-stone-400 hover:text-stone-200 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-sans text-[#c9bea9] leading-relaxed">
              <p><strong>Épreuve :</strong> {selectedScenario.name}</p>
              <p><strong>Détails :</strong> {selectedScenario.description}</p>
              <div className="p-3 rounded-xl bg-[#0b0c10] border border-stone-800 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-40">
                <pre>{JSON.stringify(selectedScenario.evidence, null, 2)}</pre>
              </div>
              <div className="text-[10px] text-stone-500">
                Horodatage d'audit : {selectedScenario.timestamp}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedScenario(null)}
                className="px-4 py-2 rounded-xl bg-[#1e222e] text-xs font-sans text-stone-200 cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
