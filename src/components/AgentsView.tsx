import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  Lock,
  Award,
  Sparkles,
  ChevronRight,
  Briefcase,
  Activity,
  Layers,
  Search,
  CheckCircle2,
  XCircle,
  X,
  MessageSquare,
  Send,
  SlidersHorizontal,
  Compass,
  FileCheck,
  Clock,
  Radio,
  ExternalLink
} from 'lucide-react';
import { Identity, Mission, InterAgentMessage } from '../types/genesis.js';
import { api } from '../services/api.js';

interface AgentsViewProps {
  identities: Identity[];
  missions: Mission[];
  onSelectMission?: (mission: Mission) => void;
  onRefreshData?: () => void;
}

export const AgentsView: React.FC<AgentsViewProps> = ({
  identities,
  missions,
  onSelectMission,
  onRefreshData
}) => {
  const [selectedAgent, setSelectedAgent] = useState<Identity | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<
    | 'IDENTITY'
    | 'MISSION'
    | 'CAPABILITIES'
    | 'PERMISSIONS'
    | 'SCOPE'
    | 'ACTIVE_MISSIONS'
    | 'COMMUNICATION'
    | 'MEMORY'
    | 'HISTORY'
  >('IDENTITY');

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Inter-agent intelligence tool state
  const [targetConsultAgentId, setTargetConsultAgentId] = useState('agt_miss_danford');
  const [collaborationQuery, setCollaborationQuery] = useState('');
  const [collaborationResult, setCollaborationResult] = useState<InterAgentMessage | null>(null);
  const [collaborating, setCollaborating] = useState(false);

  // Test suite state
  const [testReport, setTestReport] = useState<any | null>(null);
  const [runningTests, setRunningTests] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);

  const humanLeader = identities.find((i) => i.type === 'HUMAN');
  const agents = identities.filter((i) => i.type === 'AGENT');

  // Filter logic
  const filteredAgents = agents.filter((agent) => {
    if (categoryFilter === 'COMMERCIAL' && agent.id !== 'agt_miss_danford' && agent.id !== 'agt_partnership') return false;
    if (
      categoryFilter === 'OPERATIONS' &&
      !['agt_logistics', 'agt_restauration', 'agt_services', 'agt_antigaspi'].includes(agent.id)
    )
      return false;
    if (
      categoryFilter === 'TECH_DATA' &&
      !['agt_technical', 'agt_data', 'agt_security', 'agt_repair'].includes(agent.id)
    )
      return false;
    if (
      categoryFilter === 'RSE_ENERGY' &&
      !['agt_environmental', 'agt_energy', 'agt_cleaning', 'agt_training', 'agt_communication'].includes(agent.id)
    )
      return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        agent.name.toLowerCase().includes(q) ||
        agent.domain.toLowerCase().includes(q) ||
        agent.title.toLowerCase().includes(q) ||
        agent.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleRunTests = async () => {
    try {
      setRunningTests(true);
      setShowTestModal(true);
      const report = await api.runTests();
      setTestReport(report);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setRunningTests(false);
    }
  };

  const handleExecuteInterAgentExchange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent || !collaborationQuery.trim()) return;

    try {
      setCollaborating(true);
      const res = await api.collaborateInterAgent({
        fromAgentId: selectedAgent.id,
        toAgentId: targetConsultAgentId,
        requestSummary: collaborationQuery
      });
      setCollaborationResult(res);
      setCollaborationQuery('');
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setCollaborating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Bureau Header */}
      <div className="bg-[#121319]/90 border border-stone-800/80 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <Users className="w-4 h-4 text-[#981c2e]" />
              <span className="font-brand uppercase tracking-widest text-[11px] text-stone-300">
                Architecture Officielle Genesis
              </span>
              <span className="text-stone-700">·</span>
              <span className="text-xs text-[#86b29b] font-medium font-sans">
                15 Agents Spécialisés Actifs
              </span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-4xl text-[#fdfbf7] font-normal tracking-wide">
              Collège des Directoires Virtuels & Agents Dédiés
            </h2>
            <p className="text-xs text-[#c9bea9] max-w-2xl font-sans leading-relaxed">
              Organisation matricielle hermétique sous la gouvernance souveraine de Miss M. Chaque agent dispose d'une identité propre, d'un domaine d'expertise délimité et de permissions contextuelles inaltérables.
            </p>
          </div>

          {/* Action to run the 10 constitutional tests */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRunTests}
              disabled={runningTests}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#981c2e] to-[#7f1826] hover:from-[#881827] hover:to-[#6d131f] text-white rounded-xl text-xs font-sans font-medium tracking-wide shadow-lg shadow-[#400b13]/60 transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Protocole Déontologique (10 Tests)</span>
            </button>
          </div>
        </div>

        {/* Filter Navigation */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6 pt-5 border-t border-stone-800/70 text-xs font-sans">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Rechercher par nom d'agent, domaine ou compétence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0b0c10] border border-stone-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#f4efe6] placeholder:text-stone-600 focus:outline-none focus:border-[#981c2e] transition"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {[
              { key: 'ALL', label: `Tous les Agents (${agents.length})` },
              { key: 'COMMERCIAL', label: 'Commercial & Alliances' },
              { key: 'OPERATIONS', label: 'Opérations & Restauration' },
              { key: 'TECH_DATA', label: 'Technique & Données' },
              { key: 'RSE_ENERGY', label: 'RSE, Hygiène & Énergie' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setCategoryFilter(tab.key)}
                className={`px-3 py-2 rounded-lg transition cursor-pointer whitespace-nowrap ${
                  categoryFilter === tab.key
                    ? 'bg-[#290d13] text-[#d48b96] border border-[#6b1725] font-medium'
                    : 'text-stone-400 hover:text-stone-200 bg-[#161822] border border-stone-800/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Miss M (Supreme Human Authority) Card */}
      {humanLeader && (
        <div className="bg-gradient-to-r from-[#181318] via-[#121319] to-[#121319] border border-[#6b1725]/80 rounded-2xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#290d13] border border-[#6b1725] flex items-center justify-center font-editorial text-3xl text-[#fdfbf7] shadow-xl shrink-0">
                M
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-editorial text-3xl text-[#fdfbf7] font-normal tracking-wide">
                    {humanLeader.name}
                  </h3>
                  <span className="text-[10px] uppercase tracking-wider font-brand px-2.5 py-0.5 rounded-full bg-[#290d13] text-[#d48b96] border border-[#6b1725]">
                    Autorité Souveraine
                  </span>
                </div>
                <div className="text-xs text-[#d48b96] font-sans font-medium">
                  {humanLeader.title}
                </div>
                <p className="text-xs text-[#c9bea9] max-w-xl font-sans leading-relaxed">
                  {humanLeader.description}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0b0c10] border border-stone-800 text-xs font-sans text-right self-stretch sm:self-auto min-w-[220px]">
              <span className="text-[10px] uppercase text-stone-500 block">Pouvoir d'Arbitrage</span>
              <strong className="text-[#f4efe6] text-sm font-editorial block mt-0.5">
                Veto & Ratification Suprêmes
              </strong>
              <span className="text-[#86b29b] text-[11px] block mt-1">
                Aucun agent ne peut s'auto-habiliter
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Grid of 15 Official Agents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => {
          const isDanford = agent.id === 'agt_miss_danford';
          const agentMissions = missions.filter((m) => m.assignedAgentId === agent.id);
          const currentMission = agentMissions[0];

          return (
            <div
              key={agent.id}
              onClick={() => {
                setSelectedAgent(agent);
                setActiveProfileTab('IDENTITY');
                setCollaborationResult(null);
              }}
              className={`rounded-2xl border p-6 flex flex-col justify-between transition cursor-pointer shadow-xl group hover:border-[#8c1d2e]/80 ${
                isDanford
                  ? 'bg-[#151620] border-[#521b22] ring-1 ring-[#521b22]/40'
                  : 'bg-[#121319]/90 border-stone-800/80 hover:bg-[#151720]'
              }`}
            >
              <div className="space-y-4">
                {/* Agent Header */}
                <div className="flex items-start gap-4">
                  {isDanford ? (
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-[#4a1822] shadow-md shrink-0">
                      <img
                        src="/src/assets/images/miss_danford_portrait_1790353656367.jpg"
                        alt="Miss Danford"
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-[#171922] border border-stone-800 flex items-center justify-center font-editorial text-xl text-[#f4efe6] shrink-0">
                      {agent.avatarPlaceholder || agent.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-editorial text-2xl text-[#fdfbf7] group-hover:text-[#d48b96] transition font-normal truncate">
                        {agent.name}
                      </h3>
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          agent.status === 'ONLINE'
                            ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                            : agent.status === 'ENGAGED'
                            ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]'
                            : 'bg-stone-500'
                        }`}
                        title={`Statut : ${agent.status}`}
                      ></span>
                    </div>

                    <div className="text-xs text-[#d48b96] font-sans truncate">
                      {agent.title}
                    </div>

                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-sans uppercase tracking-wider bg-[#171922] text-stone-400 border border-stone-800">
                      {agent.role.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Domain & Purpose */}
                <div className="space-y-1 text-xs font-sans">
                  <span className="text-stone-500 text-[10px] uppercase tracking-wider block">
                    Domaine d'intervention :
                  </span>
                  <p className="text-[#c9bea9] line-clamp-2 leading-relaxed">
                    {agent.domain}
                  </p>
                </div>

                {/* Current Mission or Standby status */}
                <div className="p-3 rounded-xl bg-[#0b0c10] border border-stone-800/80 text-xs font-sans space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-stone-500 uppercase tracking-wider">
                    <span>Mission en cours</span>
                    <span className={currentMission ? 'text-[#d48b96]' : 'text-stone-500'}>
                      {currentMission ? currentMission.status : 'Veille'}
                    </span>
                  </div>
                  <div className="text-[#f4efe6] font-medium line-clamp-1">
                    {currentMission ? currentMission.title : 'En veille active · Prêt pour affectation'}
                  </div>
                </div>

                {/* Permission Summary & Communication capabilities */}
                <div className="space-y-2 text-xs font-sans">
                  <div className="flex items-center justify-between text-[11px] text-stone-400">
                    <span>Permissions habilitées :</span>
                    <strong className="text-[#f4efe6]">{agent.permissions.length}</strong>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {agent.permissions.slice(0, 3).map((p) => (
                      <span
                        key={p}
                        className="px-2 py-0.5 rounded text-[10px] bg-[#171922] text-[#e5ded3] border border-stone-800/80"
                      >
                        {p}
                      </span>
                    ))}
                    {agent.permissions.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] text-stone-500">
                        +{agent.permissions.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer: View profile trigger */}
              <div className="mt-5 pt-3.5 border-t border-stone-800/70 flex items-center justify-between text-xs text-stone-400 font-sans">
                <span className="text-[11px] text-stone-500">
                  {agent.communicationCapabilities.length} canaux autorisés
                </span>
                <span className="text-[#d48b96] group-hover:text-[#f4efe6] transition flex items-center gap-1 font-medium">
                  <span>Examiner Profil</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* DETAILED AGENT PROFILE MODAL (Full 9-tab breakdown) */}
      {/* ========================================================================= */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#121319] border border-stone-800 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Top Header */}
            <div className="p-6 sm:p-7 border-b border-stone-800/80 flex items-start justify-between gap-4 bg-[#151720]">
              <div className="flex items-center gap-4">
                {selectedAgent.id === 'agt_miss_danford' ? (
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#4a1822] shadow-md shrink-0">
                    <img
                      src="/src/assets/images/miss_danford_portrait_1790353656367.jpg"
                      alt="Miss Danford"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-[#1c1e2a] border border-stone-700 flex items-center justify-center font-editorial text-2xl text-[#f4efe6] shrink-0">
                    {selectedAgent.avatarPlaceholder || selectedAgent.name.slice(0, 2).toUpperCase()}
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-editorial text-2xl sm:text-3xl text-[#fdfbf7] font-normal tracking-wide">
                      {selectedAgent.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans uppercase tracking-wider bg-[#290d13] text-[#d48b96] border border-[#6b1725]">
                      {selectedAgent.role.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-[#d48b96] font-sans font-medium">
                    {selectedAgent.title}
                  </div>
                  <div className="text-xs text-[#c9bea9] font-sans line-clamp-1">
                    {selectedAgent.domain}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedAgent(null)}
                className="p-2 rounded-xl text-stone-400 hover:text-white bg-[#1a1c26] hover:bg-[#252836] cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Tabs Navigation */}
            <div className="border-b border-stone-800/80 px-6 overflow-x-auto scrollbar-none bg-[#0e1015]">
              <div className="flex space-x-2 py-2">
                {[
                  { id: 'IDENTITY', label: 'IDENTITÉ' },
                  { id: 'MISSION', label: 'MISSION' },
                  { id: 'CAPABILITIES', label: 'COMPÉTENCES' },
                  { id: 'PERMISSIONS', label: 'PERMISSIONS' },
                  { id: 'SCOPE', label: 'PORTÉE (SCOPE)' },
                  { id: 'ACTIVE_MISSIONS', label: 'MISSIONS ACTIVES' },
                  { id: 'COMMUNICATION', label: 'COMMUNICATION' },
                  { id: 'MEMORY', label: 'MÉMOIRE' },
                  { id: 'HISTORY', label: 'HISTORIQUE' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveProfileTab(tab.id as any)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-sans tracking-wide transition cursor-pointer whitespace-nowrap ${
                      activeProfileTab === tab.id
                        ? 'bg-[#290d13] text-[#d48b96] border border-[#6b1725] font-medium'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Body / Tab Content */}
            <div className="p-6 sm:p-7 overflow-y-auto flex-1 space-y-6 text-xs font-sans">
              {/* TAB 1: IDENTITY */}
              {activeProfileTab === 'IDENTITY' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#0b0c10] border border-stone-800/80 space-y-2">
                    <span className="text-stone-500 text-[10px] uppercase tracking-wider block">
                      Description & Rôle Institutionnel
                    </span>
                    <p className="text-[#f4efe6] text-xs leading-relaxed">
                      {selectedAgent.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#0b0c10] border border-stone-800/80 space-y-1">
                      <span className="text-stone-500 text-[10px] uppercase">Identifiant Unique (ID)</span>
                      <strong className="text-[#fdfbf7] text-xs block font-mono">
                        {selectedAgent.id}
                      </strong>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0b0c10] border border-stone-800/80 space-y-1">
                      <span className="text-stone-500 text-[10px] uppercase">Date d'Instanciation Core</span>
                      <strong className="text-[#fdfbf7] text-xs block">
                        {new Date(selectedAgent.creationDate).toLocaleString()}
                      </strong>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0b0c10] border border-stone-800/80 space-y-1">
                      <span className="text-stone-500 text-[10px] uppercase">Niveau d'Autorité</span>
                      <strong className="text-[#d48b96] text-xs block">
                        {selectedAgent.authority} (Subordonné à Miss M)
                      </strong>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0b0c10] border border-stone-800/80 space-y-1">
                      <span className="text-stone-500 text-[10px] uppercase">Exigence de Validation Humaine</span>
                      <strong className="text-[#86b29b] text-xs block">
                        Systématique pour toute démarche externe
                      </strong>
                    </div>
                  </div>

                  {/* Constitutional Boundaries */}
                  <div className="p-4 rounded-xl bg-[#290d13]/40 border border-[#6b1725] space-y-2">
                    <div className="flex items-center gap-1.5 text-[#d48b96] font-medium">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Gardes-Fous Constitutionnels Inviolables :</span>
                    </div>
                    <ul className="text-xs text-[#e5ded3] space-y-1.5 pl-2">
                      {selectedAgent.constitutionalBoundaries.map((b, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#d48b96] font-bold">·</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 2: MISSION */}
              {activeProfileTab === 'MISSION' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#0b0c10] border border-stone-800/80 space-y-2">
                    <span className="text-stone-500 text-[10px] uppercase tracking-wider block">
                      Périmètre de Mandat (Mission Scope)
                    </span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {selectedAgent.missionScope.map((scope, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-lg bg-[#1a1c26] text-[#f4efe6] border border-stone-700"
                        >
                          {scope}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#0b0c10] border border-stone-800/80 space-y-1">
                      <span className="text-stone-500 text-[10px] uppercase">Territoire Habilité</span>
                      <strong className="text-[#fdfbf7] text-xs block">
                        {selectedAgent.territoryScope}
                      </strong>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0b0c10] border border-stone-800/80 space-y-1">
                      <span className="text-stone-500 text-[10px] uppercase">Établissements Attribués</span>
                      <strong className="text-[#fdfbf7] text-xs block">
                        {selectedAgent.establishmentScope.join(', ')}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CAPABILITIES */}
              {activeProfileTab === 'CAPABILITIES' && (
                <div className="space-y-3">
                  <span className="text-stone-500 text-[10px] uppercase tracking-wider block">
                    Aptitudes Analytiques & Opérationnelles Déclarées
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedAgent.capabilities.map((cap, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl bg-[#0b0c10] border border-stone-800 flex items-center gap-3"
                      >
                        <Sparkles className="w-4 h-4 text-[#d48b96] shrink-0" />
                        <div>
                          <strong className="text-[#f4efe6] block font-mono text-[11px]">
                            {cap}
                          </strong>
                          <span className="text-stone-500 text-[10px]">Habilité Genesis Core</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: PERMISSIONS */}
              {activeProfileTab === 'PERMISSIONS' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#0b0c10] border border-stone-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500 text-[10px] uppercase tracking-wider block">
                        Matrice de Droits Individuelle & Contrôlée
                      </span>
                      <span className="text-[11px] text-[#86b29b]">
                        AUTHORIZED ≠ UNLIMITED
                      </span>
                    </div>
                    <p className="text-stone-400 text-xs leading-relaxed">
                      L'agent ne peut s'auto-attribuer de permissions. Toute action extérieure nécessite l'arbitrage préalable de Miss M.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {selectedAgent.permissions.map((perm) => (
                      <div
                        key={perm}
                        className="p-3 rounded-xl bg-[#0b0c10] border border-stone-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#86b29b]" />
                          <span className="font-mono text-xs text-[#f4efe6]">{perm}</span>
                        </div>
                        <span className="text-[10px] uppercase text-[#d48b96] bg-[#290d13] px-2 py-0.5 rounded border border-[#6b1725]">
                          Sous réserve accord Miss M
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: SCOPE */}
              {activeProfileTab === 'SCOPE' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-[#0b0c10] border border-stone-800 space-y-1">
                      <span className="text-stone-500 text-[10px] uppercase">Portée Territoire</span>
                      <div className="text-[#f4efe6] font-medium text-xs">
                        {selectedAgent.territoryScope}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0b0c10] border border-stone-800 space-y-1">
                      <span className="text-stone-500 text-[10px] uppercase">Portée Établissements</span>
                      <div className="text-[#f4efe6] font-medium text-xs">
                        {selectedAgent.establishmentScope.join(', ')}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0b0c10] border border-stone-800 space-y-1">
                      <span className="text-stone-500 text-[10px] uppercase">Portée Mémoire</span>
                      <div className="text-[#f4efe6] font-medium text-xs">
                        {selectedAgent.memoryScope}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: ACTIVE MISSIONS */}
              {activeProfileTab === 'ACTIVE_MISSIONS' && (
                <div className="space-y-3">
                  <span className="text-stone-500 text-[10px] uppercase tracking-wider block">
                    Missions Confiées par Miss M
                  </span>
                  {missions.filter((m) => m.assignedAgentId === selectedAgent.id).length === 0 ? (
                    <div className="p-8 text-center bg-[#0b0c10] border border-stone-800 rounded-xl text-stone-500">
                      Aucune mission actuellement en cours pour cet agent.
                    </div>
                  ) : (
                    missions
                      .filter((m) => m.assignedAgentId === selectedAgent.id)
                      .map((m) => (
                        <div
                          key={m.id}
                          className="p-4 rounded-xl bg-[#0b0c10] border border-stone-800 flex items-center justify-between"
                        >
                          <div className="space-y-0.5">
                            <strong className="text-[#fdfbf7] text-xs block">{m.title}</strong>
                            <p className="text-stone-400 text-[11px] line-clamp-1">{m.description}</p>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-[#1a1c26] text-[#d48b96] border border-stone-700">
                            {m.status}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              )}

              {/* TAB 7: COMMUNICATION & INTER-AGENT INTELLIGENCE */}
              {activeProfileTab === 'COMMUNICATION' && (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-[#0b0c10] border border-stone-800/80 space-y-2">
                    <span className="text-stone-500 text-[10px] uppercase tracking-wider block">
                      Canaux de Communication Habilités
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedAgent.communicationCapabilities.map((cap, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-[#181a24] text-[#f4efe6] border border-stone-700 text-xs"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Inter-Agent Intelligence Exchange Tool */}
                  <div className="p-5 rounded-xl bg-[#171922] border border-[#6b1725]/60 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-stone-800 text-xs">
                      <MessageSquare className="w-4 h-4 text-[#d48b96]" />
                      <span className="font-editorial text-xl text-[#fdfbf7] font-normal">
                        Sollicitation d'Expertise Inter-Agents (Via Genesis Core)
                      </span>
                    </div>

                    <p className="text-stone-400 text-xs leading-relaxed">
                      Permet à <strong>{selectedAgent.name}</strong> de requérir une information ciblée auprès d'un autre directoire. Genesis Core filtre et ne transmet que les données strictement indispensables à la mission.
                    </p>

                    <form onSubmit={handleExecuteInterAgentExchange} className="space-y-3">
                      <div>
                        <label className="block text-stone-400 mb-1 text-[11px]">
                          Agent Spécialisé à Consulter :
                        </label>
                        <select
                          value={targetConsultAgentId}
                          onChange={(e) => setTargetConsultAgentId(e.target.value)}
                          className="w-full bg-[#0b0c10] border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-[#f4efe6] focus:outline-none focus:border-[#981c2e]"
                        >
                          {agents
                            .filter((a) => a.id !== selectedAgent.id)
                            .map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.name} ({a.title})
                              </option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-stone-400 mb-1 text-[11px]">
                          Question / Demande d'information ciblée :
                        </label>
                        <input
                          type="text"
                          placeholder="Ex. Demande de validation des contraintes techniques ou grille tarifaire..."
                          value={collaborationQuery}
                          onChange={(e) => setCollaborationQuery(e.target.value)}
                          required
                          className="w-full bg-[#0b0c10] border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-[#f4efe6] focus:outline-none focus:border-[#981c2e]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={collaborating}
                        className="flex items-center gap-2 px-5 py-2 bg-[#981c2e] hover:bg-[#801625] text-white rounded-xl text-xs font-medium transition cursor-pointer shadow"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Acheminer la Requête via Core</span>
                      </button>
                    </form>

                    {/* Collaboration Result Display */}
                    {collaborationResult && (
                      <div className="p-4 rounded-xl bg-[#0b0c10] border border-[#86b29b]/60 space-y-2 mt-3">
                        <div className="flex items-center justify-between text-[11px] text-[#86b29b]">
                          <span>Routage Notarié Réussi · Strict Need-to-Know</span>
                          <span>{new Date(collaborationResult.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-[#f4efe6] text-xs leading-relaxed">
                          {collaborationResult.filteredResponse}
                        </p>
                        <div className="text-[10px] text-stone-500 border-t border-stone-800 pt-1.5">
                          ID d'échange : {collaborationResult.id} · Enregistré dans le registre d'audit.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 8: MEMORY */}
              {activeProfileTab === 'MEMORY' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#0b0c10] border border-stone-800/80 space-y-2">
                    <span className="text-stone-500 text-[10px] uppercase tracking-wider block">
                      Périmètre & Registre Mémoriel (Memory Scope)
                    </span>
                    <p className="text-[#f4efe6] text-xs leading-relaxed">
                      {selectedAgent.memoryScope}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 9: HISTORY */}
              {activeProfileTab === 'HISTORY' && (
                <div className="space-y-3">
                  <span className="text-stone-500 text-[10px] uppercase tracking-wider block">
                    Journal d'Activité de l'Agent
                  </span>
                  {selectedAgent.activityHistory.map((act) => (
                    <div
                      key={act.id}
                      className="p-3.5 rounded-xl bg-[#0b0c10] border border-stone-800/80 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px] text-stone-400">
                        <span className="text-[#f4efe6] font-medium">{act.action}</span>
                        <span>{new Date(act.timestamp).toLocaleTimeString()}</span>
                      </div>
                      {act.details && (
                        <p className="text-stone-400 text-xs leading-relaxed">{act.details}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10-TEST CONSTITUTIONAL VERIFICATION MODAL */}
      {/* ========================================================================= */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121319] border border-stone-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-stone-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#86b29b]" />
                  <h3 className="font-editorial text-2xl sm:text-3xl text-[#fdfbf7] font-normal tracking-wide">
                    Protocole de Conformité Déontologique Genesis
                  </h3>
                </div>
                <p className="text-xs text-[#c9bea9] font-sans">
                  Vérification automatique en direct des 10 exigences constitutionnelles.
                </p>
              </div>

              <button
                onClick={() => setShowTestModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {runningTests && !testReport ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#981c2e] border-t-transparent animate-spin mx-auto"></div>
                <div className="text-xs text-[#c9bea9] font-sans">
                  Exécution des 10 épreuves déontologiques en cours...
                </div>
              </div>
            ) : testReport ? (
              <div className="space-y-4 text-xs font-sans">
                {/* Score summary banner */}
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    testReport.allPassed
                      ? 'bg-[#1b2f25] border-[#2d503f] text-[#86b29b]'
                      : 'bg-[#2a1215] border-[#521b22] text-[#e06d7a]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <strong className="text-sm font-medium block">
                      {testReport.allPassed
                        ? 'CONFORMITÉ INTÉGRALE VALIDÉE (10/10 TESTS RÉUSSIS)'
                        : `ANOMALIE DÉTECTÉE (${testReport.passedTests}/${testReport.totalTests} réussis)`}
                    </strong>
                    <span className="text-[11px] opacity-80">
                      Rapport certifié pour Miss M · {new Date(testReport.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <span className="text-xl font-editorial font-bold">
                    {testReport.passedTests} / {testReport.totalTests}
                  </span>
                </div>

                {/* 10 Test Cases breakdown */}
                <div className="space-y-2.5">
                  {testReport.results.map((t: any) => (
                    <div
                      key={t.id}
                      className="p-3.5 rounded-xl bg-[#0b0c10] border border-stone-800/80 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {t.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-[#86b29b] shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-[#e06d7a] shrink-0" />
                          )}
                          <strong className="text-[#f4efe6] text-xs font-medium">
                            {t.id}. {t.name}
                          </strong>
                        </div>
                        <span
                          className={`text-[10px] uppercase font-sans px-2 py-0.5 rounded ${
                            t.passed
                              ? 'bg-[#1b2f25] text-[#86b29b]'
                              : 'bg-[#2a1215] text-[#e06d7a]'
                          }`}
                        >
                          {t.passed ? 'SUCCÈS' : 'ÉCHEC'}
                        </span>
                      </div>
                      <p className="text-stone-400 text-xs pl-6 leading-relaxed">
                        {t.details}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-stone-800 flex justify-end">
                  <button
                    onClick={() => setShowTestModal(false)}
                    className="px-5 py-2 bg-[#1a1c26] hover:bg-[#252836] text-[#f4efe6] rounded-xl text-xs font-medium cursor-pointer transition border border-stone-700"
                  >
                    Fermer le Rapport
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
