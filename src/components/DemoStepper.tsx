import React from 'react';
import {
  Play,
  Check,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { Mission, ValidationRequest } from '../types/genesis.js';

interface DemoStepperProps {
  demoMission?: Mission;
  pendingValidation?: ValidationRequest;
  onExecuteAnalysis: (missionId: string) => Promise<void>;
  onAuthorizeValidation: (validationId: string) => Promise<void>;
  onReset: () => void;
  loading: boolean;
}

export const DemoStepper: React.FC<DemoStepperProps> = ({
  demoMission,
  pendingValidation,
  onExecuteAnalysis,
  onAuthorizeValidation,
  onReset,
  loading
}) => {
  let currentStep = 1;

  if (!demoMission) {
    currentStep = 1;
  } else if (demoMission.status === 'DONE') {
    currentStep = 11;
  } else if (demoMission.status === 'BLOCKED') {
    currentStep = 7;
  } else if (demoMission.status === 'HUMAN_REQUIRED') {
    currentStep = 6;
  } else if (demoMission.status === 'IN_PROGRESS') {
    currentStep = 3;
  } else if (demoMission.status === 'TODO') {
    currentStep = 2;
  }

  const steps = [
    { num: 1, title: 'Création par Miss M', desc: 'Mandat stratégique posé' },
    { num: 2, title: 'Attribution agent', desc: 'Routage vers Miss Danford' },
    { num: 3, title: 'Analyse sectorielle', desc: 'Cahier des charges & marché' },
    { num: 4, title: 'Proposition commerciale', desc: 'Prise de contact ciblée' },
    { num: 5, title: 'Contrôle des permissions', desc: 'Vérification constitutionnelle' },
    { num: 6, title: 'Arbitrage requis', desc: 'Soumission à Miss M' },
    { num: 7, title: 'Autorisation Miss M', desc: 'Décision souveraine humaine' },
    { num: 8, title: 'Exécution simulée', desc: 'Bac à sable sécurisé' },
    { num: 9, title: 'Enregistrement résultat', desc: 'Rapport technique généré' },
    { num: 10, title: 'Mission accomplie', desc: 'Statut finalisé' },
    { num: 11, title: 'Mémoire notariée', desc: 'Traçabilité intégrale' }
  ];

  return (
    <div className="bg-[#121319]/90 border border-stone-800/80 rounded-2xl p-6 sm:p-7 shadow-xl shadow-black/40 relative overflow-hidden">
      {/* Subtle top ambient hairline */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#981c2e]/60 to-transparent"></div>

      {/* Header of Stepper */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-stone-800/70">
        <div>
          <div className="flex items-center gap-2 text-xs font-sans">
            <span className="text-[#d48b96] font-brand tracking-widest uppercase text-[11px]">
              Protocole Démonstrateur
            </span>
            <span className="text-stone-700">·</span>
            <span className="text-[#c9bea9] font-editorial italic text-sm">
              Cycle complet en 11 étapes souveraines
            </span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl text-[#fdfbf7] font-normal tracking-wide mt-1">
            Recherche d'un fournisseur pour établissement de restauration
          </h2>
          <p className="text-xs text-[#a09587] mt-1 font-sans">
            Observation pas-à-pas de l'orchestration Genesis : de l'intention de Miss M à l'exécution simulée supervisée.
          </p>
        </div>

        {/* Executive Action Trigger */}
        <div className="flex items-center gap-3">
          {demoMission?.status === 'TODO' && (
            <button
              onClick={() => onExecuteAnalysis(demoMission.id)}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#981c2e] to-[#7f1826] hover:from-[#881827] hover:to-[#6d131f] text-white rounded-xl text-xs font-sans font-medium tracking-wide shadow-lg shadow-[#400b13]/60 transition cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Lancer l'Analyse de Miss Danford</span>
            </button>
          )}

          {demoMission?.status === 'HUMAN_REQUIRED' && pendingValidation && (
            <button
              onClick={() => onAuthorizeValidation(pendingValidation.id)}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#981c2e] to-[#7f1826] hover:from-[#881827] hover:to-[#6d131f] text-white rounded-xl text-xs font-sans font-medium tracking-wide shadow-lg shadow-[#400b13]/60 transition cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Autoriser Formellement (Miss M)</span>
            </button>
          )}

          {demoMission?.status === 'DONE' && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1b2f25] border border-[#2d503f] text-[#86b29b] text-xs font-sans">
                <Check className="w-3.5 h-3.5" />
                <span>Cycle de Démonstration Réalisé avec Succès</span>
              </div>
              <button
                onClick={onReset}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#171922] hover:bg-[#1f212c] text-[#f4efe6] border border-stone-800 transition text-xs font-sans cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Réinitialiser</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modern Refined Stepper Progress Rail */}
      <div className="pt-6">
        <div className="flex items-center justify-between text-xs text-[#c9bea9] mb-4 font-sans">
          <span>Progression : Étape {currentStep} sur 11</span>
          <span className="font-editorial italic text-sm text-[#f4efe6]">
            {steps[currentStep - 1]?.title}
          </span>
        </div>

        {/* The 11 Steps Horizontal Grid / Scroller */}
        <div className="grid grid-cols-11 gap-1.5 sm:gap-2">
          {steps.map((st) => {
            const isCompleted = currentStep > st.num || currentStep === 11;
            const isCurrent = currentStep === st.num;

            return (
              <div key={st.num} className="space-y-2 text-center group">
                {/* Step indicator pill */}
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isCompleted
                      ? 'bg-[#86b29b]'
                      : isCurrent
                      ? 'bg-[#981c2e] shadow-[0_0_10px_rgba(152,28,46,0.8)]'
                      : 'bg-[#1e202a]'
                  }`}
                ></div>

                <div className="hidden md:block">
                  <div
                    className={`text-[10px] font-sans font-medium line-clamp-1 ${
                      isCurrent
                        ? 'text-[#fdfbf7]'
                        : isCompleted
                        ? 'text-[#86b29b]'
                        : 'text-stone-500'
                    }`}
                  >
                    {st.title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
