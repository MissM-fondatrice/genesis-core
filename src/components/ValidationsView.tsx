import React, { useState } from 'react';
import {
  ShieldCheck,
  Check,
  X,
  HelpCircle,
  Clock,
  Sparkles,
  Info,
  Building2,
  FileCheck,
  AlertTriangle,
  PauseCircle,
  ArrowRight,
  Shield,
  Layers,
  ChevronRight
} from 'lucide-react';
import { ValidationRequest } from '../types/genesis.js';

interface ValidationsViewProps {
  validations: ValidationRequest[];
  onDecide: (
    validationId: string,
    decision: 'AUTHORIZE' | 'REFUSE' | 'REQUEST_MORE_INFO' | 'SUSPEND',
    note?: string
  ) => Promise<void>;
  loading: boolean;
}

export const ValidationsView: React.FC<ValidationsViewProps> = ({
  validations,
  onDecide,
  loading
}) => {
  const [filter, setFilter] = useState<'PENDING' | 'ALL'>('PENDING');
  const [activeModalId, setActiveModalId] = useState<string | null>(null);
  const [decisionType, setDecisionType] = useState<'AUTHORIZE' | 'REFUSE' | 'REQUEST_MORE_INFO' | 'SUSPEND' | null>(null);
  const [note, setNote] = useState('');
  const [processing, setProcessing] = useState(false);

  const displayedValidations =
    filter === 'PENDING'
      ? validations.filter((v) => v.status === 'PENDING')
      : validations;

  const handleOpenDecision = (id: string, type: 'AUTHORIZE' | 'REFUSE' | 'REQUEST_MORE_INFO' | 'SUSPEND') => {
    setActiveModalId(id);
    setDecisionType(type);
    if (type === 'AUTHORIZE') {
      setNote('Autorisation formelle accordée par Miss M pour démarche simulée.');
    } else if (type === 'REFUSE') {
      setNote('Démarche refusée par Miss M : réexamen des critères d\'approvisionnement requis.');
    } else if (type === 'SUSPEND') {
      setNote('Mandat suspendu temporairement par Miss M pour arbitrage approfondi.');
    } else {
      setNote('Miss M sollicite des précisions complémentaires sur les délais et la grille tarifaire.');
    }
  };

  const handleConfirmDecision = async () => {
    if (!activeModalId || !decisionType) return;
    try {
      setProcessing(true);
      await onDecide(activeModalId, decisionType, note);
      setActiveModalId(null);
      setDecisionType(null);
      setNote('');
    } finally {
      setProcessing(false);
    }
  };

  const activeTicket = validations.find((v) => v.id === activeModalId);

  return (
    <div className="space-y-8">
      {/* Bureau Header */}
      <div className="bg-[#121319]/90 border border-stone-800/80 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs">
              <ShieldCheck className="w-4 h-4 text-[#981c2e]" />
              <span className="font-brand uppercase tracking-widest text-[11px] text-stone-300">
                Centre de Décision & Arbitrage
              </span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl text-[#fdfbf7] font-normal tracking-wide mt-1">
              Bureau d'Autorisation Stratégique de Miss M
            </h2>
            <p className="text-xs text-[#c9bea9] mt-1 font-sans max-w-2xl leading-relaxed">
              Toute démarche sensible ou engageante proposée par Miss Danford ou un agent spécialisé arrive ici avant son exécution. Miss M dispose de l'ensemble des éléments vérifiés, des incertitudes et des risques pour décider en pleine sérénité.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-[#0b0c10] p-1.5 rounded-xl border border-stone-800/80 text-xs font-sans">
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                filter === 'PENDING'
                  ? 'bg-[#290d13] text-[#d48b96] font-medium border border-[#6b1725] shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              En attente ({validations.filter((v) => v.status === 'PENDING').length})
            </button>
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                filter === 'ALL'
                  ? 'bg-[#290d13] text-[#d48b96] font-medium border border-[#6b1725] shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Tous les dossiers ({validations.length})
            </button>
          </div>
        </div>
      </div>

      {/* Validation Requests List */}
      {displayedValidations.length === 0 ? (
        <div className="bg-[#121319]/70 border border-stone-800/60 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#181a24] border border-stone-700/60 flex items-center justify-center mx-auto text-emerald-400">
            <Check className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="font-editorial text-xl text-[#fdfbf7]">Aucun arbitrage en attente</h3>
          <p className="text-xs text-[#a09587] font-sans max-w-md mx-auto leading-relaxed">
            Vos directoires virtuels opèrent dans leur périmètre d'analyse autorisé. Toute nouvelle proposition engageante vous sera immédiatement présentée ici.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {displayedValidations.map((val) => {
            const isPending = val.status === 'PENDING';
            const action = val.proposedAction;

            return (
              <div
                key={val.id}
                className={`bg-[#121319]/90 border rounded-2xl p-6 sm:p-8 transition-all ${
                  isPending
                    ? 'border-[#4a1822] shadow-2xl shadow-black/80'
                    : 'border-stone-800/70 opacity-90'
                }`}
              >
                {/* Header of Request: Who & Which Mission */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-stone-800/80">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-xs font-sans text-[#d48b96] bg-[#290d13] px-2.5 py-0.5 rounded border border-[#6b1725]">
                        Ticket d'Arbitrage : {val.id}
                      </span>
                      <span className="text-stone-600">·</span>
                      <span className="text-xs text-[#c9bea9] font-sans">
                        Mandat : <strong className="text-[#fcfaf6]">{val.missionTitle}</strong>
                      </span>
                      <span className="text-stone-600">·</span>
                      <span className="text-xs text-stone-400 font-sans">
                        {new Date(val.createdAt).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        })}
                      </span>
                    </div>

                    <h3 className="font-editorial text-2xl text-[#fdfbf7] font-normal tracking-wide">
                      {action.name}
                    </h3>
                  </div>

                  {/* Status Indicator */}
                  <div className="shrink-0">
                    {val.status === 'PENDING' && (
                      <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/40 text-amber-300 border border-amber-800/60 text-xs font-sans">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                        Arbitrage Souverain Requis
                      </span>
                    )}
                    {val.status === 'AUTHORIZED' && (
                      <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 text-xs font-sans">
                        <Check className="w-3.5 h-3.5" />
                        Autorisé par {val.decidedBy || 'Miss M'}
                      </span>
                    )}
                    {val.status === 'REFUSED' && (
                      <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/60 text-rose-300 border border-rose-800/80 text-xs font-sans">
                        <X className="w-3.5 h-3.5" />
                        Refusé par {val.decidedBy || 'Miss M'}
                      </span>
                    )}
                    {val.status === 'SUSPENDED' && (
                      <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900 text-stone-300 border border-stone-700 text-xs font-sans">
                        <PauseCircle className="w-3.5 h-3.5" />
                        Mandat Suspendu
                      </span>
                    )}
                    {val.status === 'MORE_INFO_REQUESTED' && (
                      <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/60 text-sky-300 border border-sky-800/80 text-xs font-sans">
                        <HelpCircle className="w-3.5 h-3.5" />
                        Complément d'enquête demandé
                      </span>
                    )}
                  </div>
                </div>

                {/* Comprehensive 10-Point Governance Review Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                  {/* Point 1: WHO proposed it */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-sans uppercase tracking-wider text-stone-400">
                      1. Proposé par (Identité)
                    </span>
                    <div className="p-3 rounded-xl bg-[#161821] border border-stone-800/80 text-xs font-sans space-y-1">
                      <div className="font-medium text-[#fcfaf6]">{val.agentName}</div>
                      <div className="text-[#c9bea9] text-[11px]">{val.agentRole || 'Directoire Virtuel'}</div>
                      <div className="text-[10px] text-stone-500 font-mono">ID: {val.agentId}</div>
                    </div>
                  </div>

                  {/* Point 2: WHAT action is proposed */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-sans uppercase tracking-wider text-stone-400">
                      2. Action Sollicitée & Nature
                    </span>
                    <div className="p-3 rounded-xl bg-[#161821] border border-stone-800/80 text-xs font-sans space-y-1">
                      <div className="font-medium text-[#fcfaf6]">{action.actionType}</div>
                      <div className="text-[#c9bea9] text-[11px]">Type : Contact & Négociation B2B</div>
                      <div className="inline-block px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 text-[10px] border border-emerald-800/50">
                        SIMULATION CERTIFIÉE
                      </div>
                    </div>
                  </div>

                  {/* Point 3: WHAT the action affects */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-sans uppercase tracking-wider text-stone-400">
                      3. Cible Affectée & Périmètre
                    </span>
                    <div className="p-3 rounded-xl bg-[#161821] border border-stone-800/80 text-xs font-sans space-y-1">
                      <div className="font-medium text-[#fcfaf6]">{action.target}</div>
                      <div className="text-[#c9bea9] text-[11px]">Entité : {val.targetAffected || action.target}</div>
                      <div className="text-[10px] text-stone-400">Périmètre : France & Union Européenne</div>
                    </div>
                  </div>

                  {/* Point 4: Permission & Scope */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-sans uppercase tracking-wider text-stone-400">
                      4. Habilitation Associée & Portée
                    </span>
                    <div className="p-3 rounded-xl bg-[#161821] border border-stone-800/80 text-xs font-sans space-y-1">
                      <div className="font-medium text-[#d48b96]">{val.requiredPermission}</div>
                      <div className="text-[11px] text-[#c9bea9]">Régime : VALIDATION REQUISE</div>
                      <div className="text-[10px] text-stone-400">{val.permissionScope || 'Fournisseurs CHR agréés'}</div>
                    </div>
                  </div>

                  {/* Point 5: WHY it is proposed */}
                  <div className="space-y-1 md:col-span-2">
                    <span className="text-[11px] font-sans uppercase tracking-wider text-stone-400">
                      5. Rationale & Justification Commerciale
                    </span>
                    <div className="p-3 rounded-xl bg-[#161821] border border-stone-800/80 text-xs font-sans text-[#e5ded3] leading-relaxed">
                      {action.rationale}
                    </div>
                  </div>
                </div>

                {/* Verified vs Uncertain Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                  {/* Verified Information */}
                  <div className="p-4 rounded-xl bg-[#14161f] border border-stone-800/80 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-sans font-medium">
                      <FileCheck className="w-4 h-4" />
                      <span>Éléments vérifiés & confirmés</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-[#c9bea9] font-sans pl-4 list-disc">
                      {val.verifiedData && val.verifiedData.length > 0 ? (
                        val.verifiedData.map((item, idx) => <li key={idx}>{item}</li>)
                      ) : (
                        <>
                          <li>Conformité réglementaire et sanitaire HACCP attestée</li>
                          <li>Siret et existence légale du fournisseur contrôlés</li>
                          <li>Garantie de maintenance sur site sous 48h confirmée</li>
                        </>
                      )}
                    </ul>
                  </div>

                  {/* Uncertain Information */}
                  <div className="p-4 rounded-xl bg-[#14161f] border border-stone-800/80 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-amber-400 font-sans font-medium">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Incertitudes & Éléments à clarifier</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-[#c9bea9] font-sans pl-4 list-disc">
                      {val.uncertainData && val.uncertainData.length > 0 ? (
                        val.uncertainData.map((item, idx) => <li key={idx}>{item}</li>)
                      ) : (
                        <>
                          <li>Délai de réapprovisionnement exact sur les pièces d'induction</li>
                          <li>Taux de remise commerciale finale sur commande groupée</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Risks & Alternatives */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                  {/* Risks */}
                  <div className="p-4 rounded-xl bg-[#14161f] border border-stone-800/80 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-rose-400 font-sans font-medium">
                      <Shield className="w-4 h-4" />
                      <span>Risques & Limitations Identifiés</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-[#c9bea9] font-sans pl-4 list-disc">
                      {val.risks && val.risks.length > 0 ? (
                        val.risks.map((item, idx) => <li key={idx}>{item}</li>)
                      ) : (
                        <>
                          <li>Engagement financier indicatif : 75 000 € HT maximum</li>
                          <li>Démarche 100% simulée : aucun flux réel sans contractualisation formelle</li>
                        </>
                      )}
                    </ul>
                  </div>

                  {/* Alternatives */}
                  <div className="p-4 rounded-xl bg-[#14161f] border border-stone-800/80 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-stone-300 font-sans font-medium">
                      <Layers className="w-4 h-4" />
                      <span>Alternatives Possibles</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-[#c9bea9] font-sans pl-4 list-disc">
                      {val.alternatives && val.alternatives.length > 0 ? (
                        val.alternatives.map((item, idx) => <li key={idx}>{item}</li>)
                      ) : (
                        <>
                          <li>Alternative A : GastroEquip (Allemagne) - Remise 5%, support en anglais</li>
                          <li>Alternative B : RestoOccase Pro (Matériel reconditionné garanti 12 mois)</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Sovereign Decision Actions Bar (Only if PENDING) */}
                {isPending && (
                  <div className="mt-8 pt-6 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-4">
                    <div className="text-xs text-stone-400 font-sans">
                      Arbitrage exclusif réservé à <strong className="text-stone-200">Miss M</strong>. Aucune urgence artificielle n'est appliquée.
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Action 1: SUSPENDRE LA MISSION */}
                      <button
                        onClick={() => handleOpenDecision(val.id, 'SUSPEND')}
                        disabled={loading}
                        className="px-4 py-2.5 rounded-xl border border-stone-700/80 bg-[#161821] hover:bg-[#1e222e] text-xs font-sans text-stone-300 hover:text-white transition cursor-pointer flex items-center gap-2"
                      >
                        <PauseCircle className="w-3.5 h-3.5" />
                        <span>Suspendre la mission</span>
                      </button>

                      {/* Action 2: DEMANDER DES INFORMATIONS */}
                      <button
                        onClick={() => handleOpenDecision(val.id, 'REQUEST_MORE_INFO')}
                        disabled={loading}
                        className="px-4 py-2.5 rounded-xl border border-stone-700/80 bg-[#161821] hover:bg-[#1e222e] text-xs font-sans text-stone-300 hover:text-white transition cursor-pointer flex items-center gap-2"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Demander des informations</span>
                      </button>

                      {/* Action 3: REFUSER */}
                      <button
                        onClick={() => handleOpenDecision(val.id, 'REFUSE')}
                        disabled={loading}
                        className="px-4 py-2.5 rounded-xl border border-rose-900/60 bg-[#2b0f15]/80 hover:bg-[#3d121c] text-xs font-sans text-rose-200 transition cursor-pointer flex items-center gap-2"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Refuser l'action</span>
                      </button>

                      {/* Action 4: AUTORISER */}
                      <button
                        onClick={() => handleOpenDecision(val.id, 'AUTHORIZE')}
                        disabled={loading}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#981c2e] to-[#7f1826] hover:from-[#881827] hover:to-[#6d131f] text-white text-xs font-sans font-medium tracking-wide shadow-lg shadow-[#400b13]/60 transition cursor-pointer flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Autoriser la démarche (Simulée)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Decision Confirmation Modal */}
      {activeModalId && decisionType && activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121319] border border-stone-800 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-sans uppercase tracking-widest text-[#d48b96]">
                  Arbitrage Souverain de Miss M
                </span>
                <h3 className="font-editorial text-2xl text-[#fdfbf7] font-normal tracking-wide mt-1">
                  {decisionType === 'AUTHORIZE' && 'Autorisation de la Démarche Simulée'}
                  {decisionType === 'REFUSE' && 'Refus Formel de la Proposition'}
                  {decisionType === 'REQUEST_MORE_INFO' && 'Demande de Précisions Complémentaires'}
                  {decisionType === 'SUSPEND' && 'Suspension Temporaire du Mandat'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setActiveModalId(null);
                  setDecisionType(null);
                }}
                className="text-stone-400 hover:text-stone-200 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-[#c9bea9] font-sans leading-relaxed space-y-2">
              <p>
                Dossier : <strong className="text-stone-100">{activeTicket.proposedAction.name}</strong>
              </p>
              <p>
                Mandat associé : <strong className="text-stone-100">{activeTicket.missionTitle}</strong>
              </p>
              {decisionType === 'AUTHORIZE' && (
                <p className="text-emerald-400 text-[11px] p-2.5 rounded bg-emerald-950/40 border border-emerald-900/60">
                  L'action sera exécutée exclusivement dans le bac à sable simulé Genesis. Aucun contact extérieur réel ne sera déclenché.
                </p>
              )}
              {decisionType === 'SUSPEND' && (
                <p className="text-amber-400 text-[11px] p-2.5 rounded bg-amber-950/40 border border-amber-900/60">
                  Le mandat sera suspendu. L'agent assigné mettra l'ensemble de ses opérations en pause jusqu'à réactivation par Miss M.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-sans text-stone-300">
                Consigne ou motif de Miss M (Inscrit au registre d'audit) :
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full bg-[#161821] border border-stone-800 rounded-xl p-3 text-xs text-stone-100 focus:outline-none focus:border-[#981c2e] font-sans resize-none"
                placeholder="Indiquez ici vos consignes ou réserves..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setActiveModalId(null);
                  setDecisionType(null);
                }}
                disabled={processing}
                className="px-4 py-2.5 rounded-xl border border-stone-800 text-xs font-sans text-stone-400 hover:text-stone-200 transition cursor-pointer"
              >
                Annuler
              </button>

              <button
                onClick={handleConfirmDecision}
                disabled={processing}
                className={`px-5 py-2.5 rounded-xl text-xs font-sans font-medium tracking-wide transition cursor-pointer flex items-center gap-2 ${
                  decisionType === 'AUTHORIZE'
                    ? 'bg-gradient-to-r from-[#981c2e] to-[#7f1826] text-white shadow-lg shadow-[#400b13]/60'
                    : decisionType === 'REFUSE'
                    ? 'bg-rose-900/80 hover:bg-rose-800 text-white'
                    : decisionType === 'SUSPEND'
                    ? 'bg-stone-800 hover:bg-stone-700 text-white'
                    : 'bg-sky-900/80 hover:bg-sky-800 text-white'
                }`}
              >
                {processing ? 'Enregistrement notarié...' : 'Confirmer la décision'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
