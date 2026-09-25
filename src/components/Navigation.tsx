import React from 'react';
import {
  Compass,
  UserCheck,
  Briefcase,
  ShieldCheck,
  Users,
  FolderArchive,
  ScrollText,
  Layers
} from 'lucide-react';

export type NavTab =
  | 'ACCUEIL'
  | 'MISS_DANFORD'
  | 'MISSIONS'
  | 'VALIDATIONS'
  | 'AGENTS'
  | 'FICHIERS'
  | 'HISTORIQUE'
  | 'CORE_STATUS';

interface NavigationProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  pendingValidationsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  pendingValidationsCount
}) => {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'ACCUEIL',
      label: 'ACCUEIL',
      icon: <Compass className="w-4 h-4 stroke-[1.5]" />
    },
    {
      id: 'MISS_DANFORD',
      label: 'MISS DANFORD',
      icon: <UserCheck className="w-4 h-4 stroke-[1.5]" />
    },
    {
      id: 'MISSIONS',
      label: 'MISSIONS',
      icon: <Briefcase className="w-4 h-4 stroke-[1.5]" />
    },
    {
      id: 'VALIDATIONS',
      label: 'VALIDATIONS',
      icon: <ShieldCheck className="w-4 h-4 stroke-[1.5]" />,
      badge: pendingValidationsCount
    },
    {
      id: 'AGENTS',
      label: 'AGENTS',
      icon: <Users className="w-4 h-4 stroke-[1.5]" />
    },
    {
      id: 'FICHIERS',
      label: 'FICHIERS',
      icon: <FolderArchive className="w-4 h-4 stroke-[1.5]" />
    },
    {
      id: 'HISTORIQUE',
      label: 'HISTORIQUE',
      icon: <ScrollText className="w-4 h-4 stroke-[1.5]" />
    },
    {
      id: 'CORE_STATUS',
      label: 'GENESIS CORE',
      icon: <Layers className="w-4 h-4 stroke-[1.5]" />
    }
  ];

  return (
    <nav className="bg-[#0e0f15]/95 border-b border-stone-800/60 sticky top-20 z-30 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center space-x-1 sm:space-x-3 overflow-x-auto py-2.5 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-sans tracking-wide transition-all duration-200 cursor-pointer whitespace-nowrap group ${
                  isActive
                    ? 'text-stone-100 font-medium bg-[#1a1c26]/80 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/40'
                }`}
              >
                <span
                  className={`transition-colors duration-200 ${
                    isActive ? 'text-[#a62639]' : 'text-stone-500 group-hover:text-stone-300'
                  }`}
                >
                  {tab.icon}
                </span>

                <span className="tracking-[0.08em] uppercase text-[11px]">
                  {tab.label}
                </span>

                {/* Pending Validation Badge */}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="flex items-center justify-center min-w-4.5 h-4.5 px-1.5 text-[10px] font-sans font-medium rounded-full bg-[#8c1d2e] text-stone-100 shadow-sm">
                    {tab.badge}
                  </span>
                )}

                {/* Subtle Refined Active Indicator Line */}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-transparent via-[#a62639] to-transparent rounded-full shadow-[0_0_8px_rgba(166,38,57,0.5)]"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
