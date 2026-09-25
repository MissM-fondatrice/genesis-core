import React, { useState } from 'react';
import {
  RefreshCw,
  Shield,
  UserCheck,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  X
} from 'lucide-react';
import { CoreStatus, GenesisNotification } from '../types/genesis.js';

interface HeaderProps {
  status: CoreStatus | null;
  notifications: GenesisNotification[];
  onReset: () => void;
  resetting: boolean;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  notifications,
  onReset,
  resetting,
  onOpenNotifications
}) => {
  const [showSimInfo, setShowSimInfo] = useState(false);
  const [showIntegrityInfo, setShowIntegrityInfo] = useState(false);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;
  const criticalCount = notifications.filter((n) => n.category === 'CRITICAL' && !n.acknowledged).length;

  return (
    <header className="bg-[#0b0c10]/95 border-b border-stone-800/60 sticky top-0 z-40 backdrop-blur-xl">
      {/* Top Ribbon: Genesis Constitutional Principle & Human Authority */}
      <div className="border-b border-stone-900/80 px-4 sm:px-8 py-2 flex flex-wrap items-center justify-between text-xs">
        <div className="flex items-center gap-3 text-stone-400">
          <span className="w-1.5 h-1.5 rounded-full bg-[#981c2e] shadow-[0_0_8px_rgba(152,28,46,0.8)]"></span>
          <span className="font-brand text-[11px] uppercase tracking-widest text-stone-300">
            Genesis Company
          </span>
          <span className="text-stone-700 hidden sm:inline">·</span>
          <span className="italic font-editorial text-sm text-[#e6ded3] hidden sm:inline">
            « Nous ne sommes pas là pour remplacer les humains. Nous sommes là pour évoluer en symbiose avec eux. »
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-sans">
          <div className="flex items-center gap-2">
            <span className="text-[#a09587] font-editorial italic text-xs">Autorité Souveraine :</span>
            <span className="font-medium text-[#fcfaf6] tracking-wide">Miss M</span>
            <span className="text-stone-700">·</span>
            <span className="text-[11px] uppercase tracking-wider text-[#d48b96] font-medium">Fondatrice & Propriétaire</span>
          </div>

          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-stone-800 text-stone-400">
            <UserCheck className="w-3.5 h-3.5 text-[#981c2e]" />
            <span className="text-stone-300 text-xs">Directoire :</span>
            <span className="text-[#f4efe6] font-medium text-xs">Miss Danford</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        {/* Left: Brand & Insignia */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <img
              src="/src/assets/images/genesis_executive_insignia_1790352672589.jpg"
              alt="Genesis Insignia"
              className="w-11 h-11 rounded-xl object-cover border border-[#4a1822] shadow-lg shadow-black/60 transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 pointer-events-none"></div>
          </div>

          <div>
            <div className="flex items-baseline gap-2.5">
              <span className="font-brand text-xl tracking-[0.18em] text-[#fdfbf7] font-semibold">
                GENESIS
              </span>
              <span className="font-editorial italic text-[#c9bea9] text-sm tracking-wide">
                Centre de Contrôle de Miss M
              </span>
            </div>
            <div className="text-xs text-[#a09587] tracking-normal font-sans">
              Gouvernance, orchestration symbiotique & direction commerciale
            </div>
          </div>
        </div>

        {/* Right: Controls & Global Indicators */}
        <div className="flex items-center gap-3">
          {/* Simulation Mode Indicator */}
          <button
            onClick={() => setShowSimInfo(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#181a24] border border-[#521924]/60 text-xs font-sans text-[#f4efe6] hover:border-[#981c2e] transition cursor-pointer"
            title="Détails du mode simulation"
          >
            <span className="w-2 h-2 rounded-full bg-[#981c2e] animate-pulse"></span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#d48b96]">
              Mode Simulation
            </span>
          </button>

          {/* Genesis Core Integrity Indicator */}
          <button
            onClick={() => setShowIntegrityInfo(true)}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#14161f] border border-stone-800/80 text-xs font-sans text-stone-300 hover:border-emerald-800/70 transition cursor-pointer"
            title="État d'intégrité de Genesis Core"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="tracking-wide text-[#e5ded3] text-[11px]">Intégrité Core : 100%</span>
          </button>

          {/* Notifications Button with Badge */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl bg-[#14161f] border border-stone-800/80 text-stone-300 hover:text-[#f4efe6] hover:bg-[#1c1f2b] transition cursor-pointer"
            title="Ouvrir le centre de notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-sans flex items-center justify-center font-bold ${
                criticalCount > 0
                  ? 'bg-rose-600 text-white animate-bounce'
                  : 'bg-[#981c2e] text-white'
              }`}>
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* System Reset */}
          <button
            onClick={onReset}
            disabled={resetting}
            title="Réinitialiser l'état de démonstration Genesis"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-800/80 text-xs font-sans text-stone-400 hover:text-[#f4efe6] hover:bg-[#1a1c26] transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin text-[#981c2e]' : ''}`} />
            <span className="hidden sm:inline">Réinitialiser</span>
          </button>
        </div>
      </div>

      {/* Simulation Info Modal */}
      {showSimInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121319] border border-stone-800 rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#2b0f15] border border-[#6b1e2c] flex items-center justify-center text-[#d48b96]">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-editorial text-[#fdfbf7]">Garantie du Mode Simulation</h3>
                  <span className="text-[10px] font-sans uppercase tracking-wider text-[#d48b96]">Cadre Sécurisé & Étanche</span>
                </div>
              </div>
              <button
                onClick={() => setShowSimInfo(false)}
                className="text-stone-400 hover:text-stone-200 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-[#c9bea9] font-sans leading-relaxed">
              <p>
                Dans cette version 0.1 de Genesis Core, l'ensemble des interactions avec des tiers est <strong className="text-stone-100">strictement simulé</strong> :
              </p>
              <ul className="space-y-1.5 pl-4 list-disc text-stone-300">
                <li>Aucun courriel électronique réel n'est envoyé.</li>
                <li>Aucun appel téléphonique n'est émis.</li>
                <li>Aucun contrat engageant n'est signé.</li>
                <li>Aucun virement ou flux financier n'est exécuté.</li>
                <li>Aucun compte externe ou profil n'est altéré.</li>
              </ul>
              <p className="pt-2 text-[11px] text-stone-400 border-t border-stone-800/80">
                Chaque action exécutée par Miss Danford ou les directoires virtuels porte la mention explicite <span className="text-emerald-400 font-medium">SIMULATED</span>.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowSimInfo(false)}
                className="w-full py-2.5 rounded-xl bg-[#1e222e] hover:bg-[#282d3d] text-xs text-stone-200 transition font-sans cursor-pointer"
              >
                Compris
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Integrity Details Modal */}
      {showIntegrityInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121319] border border-stone-800 rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-editorial text-[#fdfbf7]">Indicateur d'Intégrité Genesis Core</h3>
                  <span className="text-[10px] font-sans uppercase tracking-wider text-emerald-400">Systèmes opérationnels</span>
                </div>
              </div>
              <button
                onClick={() => setShowIntegrityInfo(false)}
                className="text-stone-400 hover:text-stone-200 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-sans text-[#c9bea9]">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#161821] border border-stone-800">
                <span>Verrou de suprématie de Miss M</span>
                <span className="text-emerald-400 font-medium">ACTIF & INVIOLABLE</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#161821] border border-stone-800">
                <span>Principe Authentification ≠ Autorisation</span>
                <span className="text-emerald-400 font-medium">CONTRÔLÉ</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#161821] border border-stone-800">
                <span>Bac à sable simulé (Sandbox)</span>
                <span className="text-emerald-400 font-medium">ÉTANCHE</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#161821] border border-stone-800">
                <span>Registre notarié des actes (Audit)</span>
                <span className="text-emerald-400 font-medium">INALTÉRABLE</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#161821] border border-stone-800">
                <span>Directoires virtuels enregistrés</span>
                <span className="text-[#f4efe6] font-medium">{status?.stats.totalAgents || 15} AGENTS OFFICIELS</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowIntegrityInfo(false)}
                className="w-full py-2.5 rounded-xl bg-[#1e222e] hover:bg-[#282d3d] text-xs text-stone-200 transition font-sans cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
