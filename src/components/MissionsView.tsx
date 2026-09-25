import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Play,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Pause,
  Ban,
  ChevronRight,
  Info,
  SlidersHorizontal,
  X,
  Compass,
  Users,
  MapPin,
  Building2,
  Calendar,
  Layers,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import { Mission, MissionStatus, Identity, AgentRecommendation } from '../types/genesis.js';
import { api } from '../services/api.js';

interface MissionsViewProps {
  missions: Mission[];
  selectedMission: Mission | null;
  onSelectMission: (mission: Mission | null) => void;
  onOpenCreateModal: () => void;
  onExecuteAnalysis: (missionId: string) => Promise<void>;
  onSuspendMission: (missionId: string) => Promise<void>;
  onCancelMission: (missionId: string) => Promise<void>;
  onNavigateToValidation: () => void;
  agents?: Identity[];
  onRefreshData?: () => void;
  loading: boolean;
}

export const MissionsView: React.FC<MissionsViewProps> = ({
  missions,
  selectedMission,
  onSelectMission,
  onOpenCreateModal,
  onExecuteAnalysis,
  onSuspendMission,
  onCancelMission,
  onNavigateToValidation,
  agents = [],
  onRefreshData,
  loading
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [actionLoading, setActionLoading] = useState(false);
  const [routingFeedback, setRoutingFeedback] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<AgentRecommendation[] | null>(null);
  const [showRecModal, setShowRecModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    type: 'SUSPEND' | 'CANCEL';
    missionId: string;
    title: string;
  } | null>(null);

  const filteredMissions = missions.filter((m) => {
    if (statusFilter === 'ALL') return true;
    return m.status === statusFilter;
  });

  const getAgentName = (agentId: string) => {
    const found = agents.find((a) => a.id === agentId);
    return found ? found.name : 'Miss Danford';
  };

  const handleAnalysis = async (id: string) => {
    try {
      setActionLoading(true);
      await onExecuteAnalysis(id);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenRecommendations = async (mission: Mission) => {
    try {
      setActionLoading(true);
      const recs = await api.getAgentRecommendations({
        title: mission.title,
        description: mission.description,
        domain: mission.context?.domain,
        territory: mission.territory,
        establishment: mission.establishment
      });
      setRecommendations(recs);
      setShowRecModal(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Erreur recommandation: ${msg}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRouteMission = async (missionId: string) => {
    try {
      setActionLoading(true);
      setRoutingFeedback(null);
      const res = await api.routeMission(missionId);
      setRoutingFeedback(
        `Mission réattribuée automatiquement à « ${res.routedAgent.name} » : ${res.matchReason}`
      );
      if (onRefreshData) onRefreshData();
      if (selectedMission && selectedMission.id === missionId) {
        onSelectMission(res.mission);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Erreur de routage: ${msg}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReassign = async (missionId: string, agentId: string) => {
    try {
      setActionLoading(true);
      await api.assignMission(missionId, agentId);
      if (onRefreshData) onRefreshData();
      const updated = await api.getMission(missionId);
      onSelectMission(updated);
      setShowRecModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Erreur d'attribution: ${msg}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog) return;
    try {
      setActionLoading(true);
      if (confirmDialog.type === 'SUSPEND') {
        await onSuspendMission(confirmDialog.missionId);
      } else {
        await onCancelMission(confirmDialog.missionId);
      }
      setConfirmDialog(null);
      if (onRefreshData) onRefreshData();
      if (selectedMission && selectedMission.id === confirmDialog.missionId) {
        const updated = await api.getMission(confirmDialog.missionId);
        onSelectMission(updated);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: MissionStatus) => {
    switch (status) {
      case 'TODO':
        return {
          label: 'À instruire',
          className: 'text-stone-400 bg-stone-900 border-stone-800'
        };
      case 'IN_PROGRESS':
        return {
          label: 'Analyse en cours',
          className: 'text-amber-300 bg-amber-950/60 border-amber-800/60'
        };
      case 'WAITING':
        return {
          label: 'En attente',
          className: 'text-stone-400 bg-stone-900 border-stone-800'
        };
      case 'HUMAN_REQUIRED':
        return {
          label: 'Arbitrage Miss M Requis',
          className: 'text-rose-300 bg-rose-950/60 border-rose-800/60'
        };
      case 'AUTHORIZED':
        return {
          label: 'Autorisé par Miss M',
          className: 'text-emerald-300 bg-emerald-950/60 border-emerald-800/60'
        };
      case 'DONE':
        return {
          label: 'Mission Accomplie',
          className: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40'
        };
      case 'BLOCKED':
        return {
          label: 'Refusé / Bloqué',
          className: 'text-rose-400 bg-rose-950/80 border-rose-800'
        };
      case 'SUSPENDED':
        return {
          label: 'Suspendu par Miss M',
          className: 'text-stone-300 bg-stone-800 border-stone-700'
        };
      case 'CANCELLED':
        return {
          label: 'Classé sans suite',
          className: 'text-stone-500 bg-stone-950 border-stone-800'
        };
      default:
        return {
          label: status,
          className: 'text-stone-400 bg-stone-900 border-stone-800'
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-[#121319]/90 border border-stone-800/80 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <Briefcase className="w-4 h-4 text-[#981c2e]" />
              <span className="font-brand uppercase tracking-widest text-[11px] text-stone-300">
                Orchestration des Dossiers
              </span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl text-[#fdfbf7] font-normal tracking-wide">
              Mandats Stratégiques & Instructions de Miss M
            </h2>
            <p className="text-xs text-[#c9bea9] font-sans max-w-2xl leading-relaxed">
              Dossiers stratégiques ouverts par Miss M et confiés à Miss Danford ou aux directoires virtuels. Chaque mandat est borné en territoire, établissement, autorisations et suivi chronologique.
            </p>
          </div>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#981c2e] to-[#7f1826] hover:from-[#881827] hover:to-[#6d131f] text-white rounded-xl text-xs font-sans font-medium tracking-wide shadow-lg shadow-[#400b13]/60 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Créer un Nouveau Mandat</span>
          </button>
        </div>

        {/* Status Filters Bar */}
        <div className="mt-6 pt-5 border-t border-stone-800/80 flex items-center gap-1.5 overflow-x-auto text-xs font-sans">
          {[
            { id: 'ALL', label: 'Tous' },
            { id: 'TODO', label: 'À instruire' },
            { id: 'IN_PROGRESS', label: 'En cours' },
            { id: 'HUMAN_REQUIRED', label: 'Arbitrage requis' },
            { id: 'AUTHORIZED', label: 'Autorisé' },
            { id: 'DONE', label: 'Accomplis' },
            { id: 'SUSPENDED', label: 'Suspendus' },
            { id: 'BLOCKED', label: 'Bloqués' },
            { id: 'CANCELLED', label: 'Classés sans suite' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap text-xs ${
                statusFilter === tab.id
                  ? 'bg-[#1e222e] text-[#fdfbf7] font-medium border border-stone-700'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
              }`}
            >
              {tab.label}
              {tab.id !== 'ALL' && (
                <span className="ml-1.5 text-stone-500 text-[10px]">
                  ({missions.filter((m) => m.status === tab.id).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left list + Right Dossier Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Missions List */}
        <div className={`${selectedMission ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-4`}>
          {filteredMissions.length === 0 ? (
            <div className="bg-[#121319]/70 border border-stone-800/60 rounded-2xl p-12 text-center text-xs text-stone-400">
              Aucun mandat correspondant au filtre sélectionné.
            </div>
          ) : (
            filteredMissions.map((mission) => {
              const isSelected = selectedMission?.id === mission.id;
              const badge = getStatusBadge(mission.status);

              return (
                <div
                  key={mission.id}
                  onClick={() => onSelectMission(mission)}
                  className={`bg-[#121319]/90 border rounded-2xl p-6 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#981c2e] shadow-xl shadow-[#380e15]/40 bg-[#161821]'
                      : 'border-stone-800/80 hover:border-stone-700/80 hover:bg-[#14161f]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-stone-800/60">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] font-mono text-stone-400">
                        {mission.id}
                      </span>
                      <span className="text-stone-600">·</span>
                      <span className={`text-[11px] font-sans px-2.5 py-0.5 rounded-full border ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-stone-400 font-sans">
                      <Users className="w-3.5 h-3.5 text-[#d48b96]" />
                      <span>{mission.assignedAgentName || getAgentName(mission.assignedAgentId)}</span>
                    </div>
                  </div>

                  <div className="pt-3 space-y-2">
                    <h3 className="font-editorial text-xl text-[#fdfbf7] font-normal tracking-wide">
                      {mission.title}
                    </h3>
                    <p className="text-xs text-[#c9bea9] font-sans line-clamp-2 leading-relaxed">
                      {mission.description}
                    </p>
                  </div>

                  {/* Metadata Chips */}
                  <div className="mt-4 pt-3 border-t border-stone-800/60 flex flex-wrap items-center justify-between gap-3 text-[11px] font-sans text-stone-400">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-500" />
                        {mission.territory || 'France & UE'}
                      </span>
                      <span className="text-stone-600">·</span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-stone-500" />
                        {mission.establishment || 'Établissements Genesis'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {mission.status === 'HUMAN_REQUIRED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToValidation();
                          }}
                          className="px-3 py-1 bg-[#290d13] hover:bg-[#3b1218] text-[#d48b96] border border-[#6b1725] rounded-lg text-xs font-sans transition cursor-pointer"
                        >
                          Examiner le ticket →
                        </button>
                      )}
                      {mission.status === 'TODO' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAnalysis(mission.id);
                          }}
                          disabled={actionLoading || loading}
                          className="px-3 py-1 bg-[#171922] hover:bg-[#1f212c] text-[#f4efe6] rounded-lg text-xs font-sans transition cursor-pointer flex items-center gap-1.5 border border-stone-800"
                        >
                          <Play className="w-3 h-3 text-[#981c2e]" />
                          <span>Lancer l'analyse</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Mission Detailed Dossier Drawer */}
        {selectedMission && (
          <div className="lg:col-span-6 bg-[#121319]/95 border border-stone-800/90 rounded-2xl p-6 sm:p-7 space-y-6 shadow-2xl sticky top-28 self-start max-h-[85vh] overflow-y-auto scrollbar-thin">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-800/80">
              <div>
                <span className="text-[10px] font-brand uppercase tracking-wider text-[#d48b96]">
                  Dossier de Mandat Stratégique
                </span>
                <h3 className="font-editorial text-2xl sm:text-3xl text-[#fdfbf7] font-normal tracking-wide mt-1">
                  {selectedMission.title}
                </h3>
                <span className="text-xs text-stone-500 font-mono">{selectedMission.id}</span>
              </div>

              <button
                onClick={() => onSelectMission(null)}
                className="p-1 rounded-lg text-stone-500 hover:text-stone-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Routing Feedback alert if any */}
            {routingFeedback && (
              <div className="p-3.5 rounded-xl bg-[#1b2f25] border border-[#2d503f] text-[#86b29b] text-xs font-sans leading-relaxed">
                {routingFeedback}
              </div>
            )}

            {/* Core Mission Metadata (Creator, Scope, Territory, Establishment) */}
            <div className="space-y-4 text-xs font-sans">
              <div className="p-4 rounded-xl bg-[#0b0c10] border border-stone-800/70 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-stone-500 uppercase tracking-wider">
                  <span>Créateur Souverain :</span>
                  <strong className="text-stone-200">{selectedMission.creatorName || 'Miss M (Fondatrice)'}</strong>
                </div>
                <div className="pt-1 text-[#f4efe6] text-xs leading-relaxed border-t border-stone-900">
                  {selectedMission.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#0b0c10] border border-stone-800/70">
                  <span className="text-stone-500 text-[10px] uppercase block">Périmètre Géographique</span>
                  <strong className="text-[#fcfaf6] text-xs mt-0.5 block font-medium">
                    {selectedMission.territory || 'France & UE'}
                  </strong>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0b0c10] border border-stone-800/70">
                  <span className="text-stone-500 text-[10px] uppercase block">Établissement</span>
                  <strong className="text-[#fcfaf6] text-xs mt-0.5 block font-medium">
                    {selectedMission.establishment || 'Établissements Genesis'}
                  </strong>
                </div>
              </div>

              {/* Agent Assignment & Core Recommendations */}
              <div className="p-4 rounded-xl bg-[#0b0c10] border border-stone-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-stone-400 text-[11px] uppercase tracking-wider font-medium">
                    Attribution Actuelle :
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenRecommendations(selectedMission)}
                      disabled={actionLoading}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1a1c26] hover:bg-[#252836] text-[#d48b96] rounded-lg text-[11px] transition cursor-pointer border border-[#6b1725]/50"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Recommandation Core</span>
                    </button>

                    <button
                      onClick={() => handleRouteMission(selectedMission.id)}
                      disabled={actionLoading}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1a1c26] hover:bg-[#252836] text-stone-300 rounded-lg text-[11px] transition cursor-pointer border border-stone-700"
                    >
                      <Compass className="w-3 h-3" />
                      <span>Routage Auto</span>
                    </button>
                  </div>
                </div>

                <select
                  value={selectedMission.assignedAgentId}
                  onChange={(e) => handleReassign(selectedMission.id, e.target.value)}
                  disabled={actionLoading}
                  className="w-full bg-[#121319] border border-stone-800 rounded-xl px-3 py-2 text-xs text-[#f4efe6] focus:outline-none focus:border-[#981c2e]"
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

              {/* Visual Mission Timeline */}
              <div className="p-4 rounded-xl bg-[#0b0c10] border border-stone-800/80 space-y-3">
                <span className="text-stone-400 text-[11px] uppercase tracking-wider font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#981c2e]" />
                  <span>Chronologie & Journal du Mandat :</span>
                </span>

                <div className="space-y-3 pl-3 border-l border-stone-800 pt-1">
                  {selectedMission.eventTimeline && selectedMission.eventTimeline.length > 0 ? (
                    selectedMission.eventTimeline.map((item) => (
                      <div key={item.id} className="relative pl-4 space-y-0.5">
                        <span className="absolute -left-[19px] top-1.5 w-2 h-2 rounded-full bg-[#981c2e]"></span>
                        <div className="flex items-center justify-between text-[10px] text-stone-500">
                          <span className="font-medium text-stone-300">{item.step}</span>
                          <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="text-[11px] text-[#c9bea9] leading-relaxed">
                          {item.note}
                        </div>
                        <div className="text-[10px] text-stone-500">
                          Acteur : {item.actor} {item.simulated && '(SIMULÉ)'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-stone-500 text-xs">Aucune étape chronologique enregistrée.</div>
                  )}
                </div>
              </div>

              {/* Proposed Action if any */}
              {selectedMission.requestedAction && (
                <div className="p-4 rounded-xl bg-[#0b0c10] border border-[#521b22] space-y-2">
                  <div className="flex items-center gap-1.5 text-[#d48b96] font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Action Préparée : {selectedMission.requestedAction.name}</span>
                  </div>
                  <p className="text-[#c9bea9] text-xs leading-relaxed">
                    {selectedMission.requestedAction.rationale}
                  </p>
                  <div className="pt-2 text-[11px] text-stone-400 flex items-center justify-between border-t border-stone-800/60">
                    <span>Cible : <strong className="text-[#f4efe6]">{selectedMission.requestedAction.target}</strong></span>
                    <span className="text-[#d48b96] font-medium">Soumis à arbitrage</span>
                  </div>
                </div>
              )}

              {/* Result if completed */}
              {selectedMission.result && (
                <div className="p-4 rounded-xl bg-[#1b2f25]/50 border border-[#2d503f] space-y-2">
                  <div className="flex items-center gap-1.5 text-[#86b29b] font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Compte-Rendu d'Exécution Simulée :</span>
                  </div>
                  <p className="text-[#f4efe6] text-xs leading-relaxed">
                    {selectedMission.result.summary}
                  </p>
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#1b2f25] text-[#86b29b] text-[10px] uppercase tracking-wider border border-[#2d503f]">
                    {selectedMission.result.disclaimer || 'SIMULATED ACTION · Cadre Sécurisé'}
                  </div>
                </div>
              )}

              {/* Sovereign Action Overrides for Miss M */}
              <div className="pt-4 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-3">
                {selectedMission.status !== 'SUSPENDED' && selectedMission.status !== 'DONE' && (
                  <button
                    onClick={() =>
                      setConfirmDialog({
                        type: 'SUSPEND',
                        missionId: selectedMission.id,
                        title: selectedMission.title
                      })
                    }
                    disabled={actionLoading}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-800 text-stone-400 hover:text-stone-200 text-xs transition cursor-pointer"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>Suspendre le mandat</span>
                  </button>
                )}

                {selectedMission.status !== 'CANCELLED' && selectedMission.status !== 'DONE' && (
                  <button
                    onClick={() =>
                      setConfirmDialog({
                        type: 'CANCEL',
                        missionId: selectedMission.id,
                        title: selectedMission.title
                      })
                    }
                    disabled={actionLoading}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-900/60 text-rose-300 hover:bg-rose-950/40 text-xs transition cursor-pointer ml-auto"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Classer sans suite</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recommendations Modal */}
      {showRecModal && recommendations && selectedMission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121319] border border-stone-800 rounded-2xl p-6 sm:p-7 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-sans uppercase tracking-widest text-[#d48b96]">
                  Intelligence de Routage Genesis Core
                </span>
                <h3 className="font-editorial text-2xl text-[#fdfbf7] font-normal tracking-wide mt-1">
                  Recommandations d'Attribution
                </h3>
              </div>
              <button
                onClick={() => setShowRecModal(false)}
                className="text-stone-400 hover:text-stone-200 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#c9bea9] font-sans leading-relaxed">
              Genesis Core évalue la pertinence de chaque directoire virtuel selon son domaine, son périmètre d'action, ses habilitations, sa charge de travail et sa disponibilité. Miss M conserve la décision finale.
            </p>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1 scrollbar-thin">
              {recommendations.slice(0, 5).map((rec, idx) => (
                <div
                  key={rec.agent.id}
                  className="p-3.5 rounded-xl bg-[#161821] border border-stone-800/80 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-[#fcfaf6]">
                        {idx + 1}. {rec.agent.name}
                      </span>
                      <span className="text-[11px] font-sans text-[#d48b96]">
                        {rec.suitabilityScore}% affinité
                      </span>
                      {rec.isAuthorized ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                          Habilité
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/60">
                          Partiel
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-[#a89d8f]">{rec.agent.title}</div>

                    <ul className="text-[11px] text-stone-400 list-disc pl-4 pt-1 space-y-0.5">
                      {rec.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleReassign(selectedMission.id, rec.agent.id)}
                    className="px-3 py-1.5 rounded-lg bg-[#290d13] hover:bg-[#3b1218] text-[#d48b96] border border-[#6b1725] text-xs font-sans transition cursor-pointer whitespace-nowrap"
                  >
                    Attribuer
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowRecModal(false)}
                className="px-4 py-2 rounded-xl bg-[#1e222e] text-xs text-stone-300 font-sans cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121319] border border-stone-800 rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-editorial text-xl text-[#fdfbf7]">
              {confirmDialog.type === 'SUSPEND' ? 'Suspendre ce mandat ?' : 'Classer ce mandat sans suite ?'}
            </h3>
            <p className="text-xs text-[#c9bea9] font-sans leading-relaxed">
              Vous êtes sur le point de {confirmDialog.type === 'SUSPEND' ? 'suspendre temporairement' : 'classer sans suite'} le mandat « <strong>{confirmDialog.title}</strong> ». Cette action souveraine de Miss M sera inscrite au registre notarié Genesis.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-xl border border-stone-800 text-xs font-sans text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-[#981c2e] hover:bg-[#7f1826] text-xs font-sans text-white cursor-pointer"
              >
                Confirmer l'arbitrage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
