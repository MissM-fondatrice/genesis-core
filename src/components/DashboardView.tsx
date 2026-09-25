import React from 'react';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Clock,
  Sparkles,
  Award,
  UserCheck,
  AlertTriangle,
  FolderArchive,
  Layers,
  FileCheck
} from 'lucide-react';
import {
  Mission,
  ValidationRequest,
  AuditEvent,
  CoreStatus,
  Identity
} from '../types/genesis.js';
import { NavTab } from './Navigation.js';

interface DashboardViewProps {
  status: CoreStatus | null;
  missions: Mission[];
  validations: ValidationRequest[];
  events: AuditEvent[];
  agents: Identity[];
  onNavigate: (tab: NavTab) => void;
  onSelectMission: (mission: Mission) => void;
  onSelectValidation: (val: ValidationRequest) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  status,
  missions,
  validations,
  events,
  agents,
  onNavigate,
  onSelectMission,
  onSelectValidation
}) => {
  const pendingValidations = validations.filter((v) => v.status === 'PENDING');
  const activeMissions = missions.filter((m) => m.status !== 'DONE' && m.status !== 'CANCELLED');
  const danfordAgent = agents.find((a) => a.id === 'agt_miss_danford');
  const danfordMissions = missions.filter((m) => m.assignedAgentId === 'agt_miss_danford');

  return (
    <div className="space-y-8">
      {/* Executive Lounge Hero Banner: Atmospheric Private Office Setting */}
      <div className="relative rounded-2xl overflow-hidden border border-stone-800/80 shadow-2xl bg-[#121319]">
        {/* Background Image with warm gradient overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/genesis_luxury_office_1790353668191.jpg"
            alt="Genesis Executive Suite"
            className="w-full h-full object-cover opacity-25 filter blur-[0.5px]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c10] via-[#0b0c10]/85 to-transparent"></div>
        </div>

        <div className="relative z-10 p-6 sm:p-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#981c2e] shadow-[0_0_8px_rgba(152,28,46,0.8)]"></span>
            <span className="font-brand uppercase tracking-widest text-[11px] text-[#d48b96]">
              Cabinet Particulier de Miss M
            </span>
          </div>

          <h1 className="font-editorial text-3xl sm:text-5xl text-[#fdfbf7] font-normal tracking-wide leading-tight">
            Espace Stratégique & de Gouvernance Symbiotique
          </h1>

          <p className="text-xs sm:text-sm text-[#c9bea9] font-sans leading-relaxed max-w-2xl">
            Bienvenue Miss M. Cet espace privé rassemble l'ensemble des dossiers instruits par vos directoires virtuels. Miss Danford et vos agents préparent les analyses et soumettent chaque décision engageante à votre arbitrage souverain.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('MISS_DANFORD')}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#981c2e] to-[#7f1826] hover:from-[#881827] hover:to-[#6d131f] text-white rounded-xl text-xs font-sans font-medium tracking-wide shadow-lg shadow-[#400b13]/60 transition cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Consulter Miss Danford</span>
            </button>

            <button
              onClick={() => onNavigate('VALIDATIONS')}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#171922] hover:bg-[#1f212c] text-[#f4efe6] border border-stone-800 rounded-xl text-xs font-sans font-medium transition cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#d48b96]" />
              <span>Voir les Décisions en Attente ({pendingValidations.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* PRIORITÉ 1 : DÉCISIONS REQUÉRANT L'ARBITRAGE DE MISS M */}
      {pendingValidations.length > 0 && (
        <div className="bg-[#181318]/90 border border-[#6b1725]/80 rounded-2xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#4d131d]/70">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-[#290d13] text-[#d48b96] border border-[#6b1725]">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[10px] font-brand uppercase tracking-wider text-[#d48b96]">
                  Validation Requise · Primauté Humaine
                </span>
                <h3 className="font-editorial text-2xl text-[#fdfbf7] font-normal tracking-wide mt-0.5">
                  Arbitrage Sollicité auprès de Miss M ({pendingValidations.length})
                </h3>
              </div>
            </div>

            <button
              onClick={() => onNavigate('VALIDATIONS')}
              className="text-xs text-[#d48b96] hover:text-[#f4efe6] font-sans font-medium flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
            >
              <span>Accéder au Bureau de Décision</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 pt-4">
            {pendingValidations.map((v) => (
              <div
                key={v.id}
                onClick={() => onSelectValidation(v)}
                className="p-4 rounded-xl bg-[#0f0a0d] border border-[#4d131d]/80 hover:border-[#8c1d2e] transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-sans">
                    <span className="text-[#d48b96] font-medium font-editorial text-base">
                      {v.agentName}
                    </span>
                    <span className="text-stone-700">·</span>
                    <span className="text-[#f4efe6] font-medium">{v.proposedAction.name}</span>
                    <span className="text-stone-700">·</span>
                    <span className="text-[10px] uppercase tracking-wider text-[#86b29b] bg-[#17261e] px-2 py-0.5 rounded-full border border-[#274434]">
                      Action Simulée
                    </span>
                  </div>
                  <p className="text-xs text-[#c9bea9] font-sans leading-relaxed line-clamp-1">
                    {v.proposedAction.rationale}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-sans text-amber-400 font-medium">
                    Signature en attente
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#d48b96] group-hover:translate-x-1 transition" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRIORITÉ 2 & 3 : MISS DANFORD BRIEFS & DOSSIERS ACTIFS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Miss Danford Executive Briefing */}
        <div className="lg:col-span-6 bg-[#121319]/90 border border-stone-800/80 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-3.5 border-b border-stone-800/70">
            <div className="flex items-center gap-3">
              <img
                src="/src/assets/images/miss_danford_portrait_1790353656367.jpg"
                alt="Miss Danford"
                className="w-10 h-10 rounded-xl object-cover border border-[#4a1822]"
              />
              <div>
                <span className="text-[10px] font-brand uppercase tracking-wider text-[#d48b96]">
                  Direction Commerciale Virtuelle
                </span>
                <h3 className="font-editorial text-2xl text-[#fdfbf7] font-normal tracking-wide">
                  Activité de Miss Danford
                </h3>
              </div>
            </div>

            <button
              onClick={() => onNavigate('MISS_DANFORD')}
              className="text-xs text-stone-400 hover:text-stone-200 font-sans transition flex items-center gap-1 cursor-pointer"
            >
              <span>Salon Privé</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5 text-xs font-sans">
            <div className="p-4 rounded-xl bg-[#0b0c10] border border-stone-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-stone-400">
                <span className="text-[#d48b96] font-medium uppercase tracking-wider">
                  Dernière recommandation
                </span>
                <span>Aujourd'hui à 10:32</span>
              </div>
              <p className="text-[#f4efe6] text-xs leading-relaxed">
                « Fournisseur EuroKitchen Pro validé sur la charte technique. La proposition de mise en relation simulée est prête pour l'arbitrage formel de Miss M. »
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#0b0c10] border border-stone-800/70 space-y-1">
                <span className="text-stone-500 text-[10px] uppercase">Dossiers suivis</span>
                <strong className="text-[#fcfaf6] text-lg font-editorial block">
                  {danfordMissions.length}
                </strong>
                <span className="text-[#86b29b] text-[11px]">100% conformité</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0b0c10] border border-stone-800/70 space-y-1">
                <span className="text-stone-500 text-[10px] uppercase">Statut d'autonomie</span>
                <strong className="text-[#fcfaf6] text-sm font-editorial block mt-0.5">
                  Analytique
                </strong>
                <span className="text-stone-400 text-[11px]">Accord Miss M exigé</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Active Missions Overview */}
        <div className="lg:col-span-6 bg-[#121319]/90 border border-stone-800/80 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-3.5 border-b border-stone-800/70">
            <div>
              <span className="text-[10px] font-brand uppercase tracking-wider text-stone-400">
                Mandats Opérationnels
              </span>
              <h3 className="font-editorial text-2xl text-[#fdfbf7] font-normal tracking-wide mt-0.5">
                Missions en Cours ({activeMissions.length})
              </h3>
            </div>

            <button
              onClick={() => onNavigate('MISSIONS')}
              className="text-xs text-stone-400 hover:text-stone-200 font-sans transition flex items-center gap-1 cursor-pointer"
            >
              <span>Tous les Mandats</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {missions.slice(0, 3).map((m) => (
              <div
                key={m.id}
                onClick={() => onSelectMission(m)}
                className="p-3.5 rounded-xl bg-[#0b0c10] border border-stone-800/80 hover:border-stone-700 transition cursor-pointer flex items-center justify-between group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-sans">
                    <span className="font-medium text-[#f4efe6] group-hover:text-[#d48b96] transition">
                      {m.title}
                    </span>
                    <span className="text-stone-700">·</span>
                    <span
                      className={`text-[11px] ${
                        m.status === 'DONE'
                          ? 'text-[#86b29b]'
                          : m.status === 'HUMAN_REQUIRED'
                          ? 'text-amber-400 font-medium'
                          : 'text-[#d48b96]'
                      }`}
                    >
                      {m.status === 'DONE'
                        ? 'Accomplie'
                        : m.status === 'HUMAN_REQUIRED'
                        ? 'Arbitrage requis'
                        : 'En cours'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9e9386] line-clamp-1 font-sans">
                    {m.description}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-600 group-hover:text-stone-300 transition shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRIORITÉ 4 & 5 : ORGANISATION DES AGENTS & ÉTAT GENESIS CORE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-sans">
        <div className="p-5 rounded-2xl bg-[#121319]/90 border border-stone-800/80 space-y-2">
          <div className="flex items-center gap-2 text-stone-400 text-xs">
            <Award className="w-4 h-4 text-[#981c2e]" />
            <span className="uppercase tracking-wider text-[10px] font-brand">Autorité Suprême</span>
          </div>
          <div className="font-editorial text-2xl text-[#fdfbf7]">Miss M</div>
          <p className="text-[#a09587] leading-relaxed">
            Fondatrice et autorité souveraine finale. Aucun agent ne peut ratifier d'engagement extérieur sans son accord formel.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#121319]/90 border border-stone-800/80 space-y-2">
          <div className="flex items-center gap-2 text-stone-400 text-xs">
            <UserCheck className="w-4 h-4 text-[#981c2e]" />
            <span className="uppercase tracking-wider text-[10px] font-brand">Collège d'Agents</span>
          </div>
          <div className="font-editorial text-2xl text-[#fdfbf7]">{agents.length} Acteurs Référencés</div>
          <p className="text-[#a09587] leading-relaxed">
            Directoires virtuels et agents spécialisés opérant sous la supervision constitutionnelle hermétique de Genesis Core.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#121319]/90 border border-stone-800/80 space-y-2">
          <div className="flex items-center gap-2 text-stone-400 text-xs">
            <Layers className="w-4 h-4 text-[#981c2e]" />
            <span className="uppercase tracking-wider text-[10px] font-brand">Genesis Core v0.1</span>
          </div>
          <div className="font-editorial text-2xl text-[#fdfbf7]">Orchestrateur Actif</div>
          <p className="text-[#a09587] leading-relaxed">
            Gouvernance, routage des missions, évaluation déontologique des permissions et grand livre d'audit notarié.
          </p>
        </div>
      </div>
    </div>
  );
};
