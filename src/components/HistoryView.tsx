import React, { useState } from 'react';
import {
  History,
  Search,
  SlidersHorizontal,
  Clock,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  FileCheck,
  X,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { AuditEvent } from '../types/genesis.js';

interface HistoryViewProps {
  events: AuditEvent[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({ events }) => {
  const [actorFilter, setActorFilter] = useState<string>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = events.filter((e) => {
    if (actorFilter !== 'ALL' && e.actorType !== actorFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        e.action.toLowerCase().includes(q) ||
        e.eventType.toLowerCase().includes(q) ||
        e.actorName.toLowerCase().includes(q) ||
        (e.missionTitle && e.missionTitle.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'MISSION_CREATED':
        return 'Création du Mandat (Miss M)';
      case 'ANALYSIS_STARTED':
        return 'Ouverture de l\'Analyse Commerciale';
      case 'ACTION_PROPOSED':
        return 'Action Préparée & Soumise';
      case 'PERMISSION_CHECKED':
        return 'Contrôle Déontologique des Droits';
      case 'VALIDATION_REQUESTED':
        return 'Requête d\'Arbitrage Soumise à Miss M';
      case 'ACTION_AUTHORIZED':
        return 'Agrément Souverain Accordé (Miss M)';
      case 'ACTION_REFUSED':
        return 'Action Déclinée par Miss M';
      case 'SIMULATED_ACTION_EXECUTED':
        return 'Exécution Simulée · Bac à Sable';
      case 'MISSION_COMPLETED':
        return 'Mandat Clôturé & Validé';
      default:
        return type.replace(/_/g, ' ');
    }
  };

  return (
    <div className="space-y-8">
      {/* Bureau Header */}
      <div className="bg-[#121319]/90 border border-stone-800/80 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs">
              <History className="w-4 h-4 text-[#981c2e]" />
              <span className="font-brand uppercase tracking-widest text-[11px] text-stone-300">
                Livre de Bord Notarié
              </span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl text-[#fdfbf7] font-normal tracking-wide mt-1">
              Registre Inaltérable des Décisions & Actes
            </h2>
            <p className="text-xs text-[#c9bea9] mt-1 font-sans">
              Chaque acte, contrôle de droit, arbitrage souverain de Miss M et simulation est consigné avec horodatage et contexte exhaustif.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#c9bea9] bg-[#171922] px-4 py-2 rounded-xl border border-stone-800 font-sans">
            <span>Actes Enregistrés :</span>
            <strong className="text-[#fcfaf6] text-sm font-editorial">{events.length}</strong>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6 pt-5 border-t border-stone-800/70 text-xs font-sans">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Rechercher par acteur, action, intitulé de mission..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0b0c10] border border-stone-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#f4efe6] placeholder:text-stone-600 focus:outline-none focus:border-[#981c2e] transition"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { key: 'ALL', label: 'Tous les Actes' },
              { key: 'HUMAN', label: 'Miss M (Souverain)' },
              { key: 'AGENT', label: 'Directoires Virtuels' },
              { key: 'CORE_SYSTEM', label: 'Genesis Core' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActorFilter(tab.key)}
                className={`px-3 py-2 rounded-lg transition cursor-pointer whitespace-nowrap ${
                  actorFilter === tab.key
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

      {/* Main Grid: Events & Selected Event Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className={selectedEvent ? 'lg:col-span-7 space-y-3' : 'lg:col-span-12 space-y-3'}>
          {filteredEvents.length === 0 ? (
            <div className="p-16 text-center bg-[#121319]/50 border border-stone-800/70 rounded-2xl space-y-3">
              <FileCheck className="w-10 h-10 text-stone-600 mx-auto" />
              <h3 className="font-editorial text-2xl text-[#fdfbf7]">
                Aucun Événement pour ce Critère
              </h3>
              <p className="text-xs text-[#a09587] font-sans">
                Modifiez vos termes de recherche ou sélectionnez un autre acteur.
              </p>
            </div>
          ) : (
            filteredEvents.map((evt) => {
              const isSelected = selectedEvent?.id === evt.id;
              const isHuman = evt.actorType === 'HUMAN';

              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className={`rounded-2xl border p-4 sm:p-5 transition cursor-pointer flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-[#181a24] border-[#8c1d2e]/80 ring-1 ring-[#8c1d2e]/40 shadow-lg'
                      : 'bg-[#121319]/80 border-stone-800/80 hover:border-stone-700 hover:bg-[#151720]'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-sans">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-sans uppercase tracking-wider ${
                          isHuman
                            ? 'bg-[#290d13] text-[#d48b96] border border-[#6b1725]'
                            : evt.actorType === 'AGENT'
                            ? 'bg-[#171922] text-[#c9bea9] border border-stone-800'
                            : 'bg-[#0f1118] text-stone-400 border border-stone-800'
                        }`}
                      >
                        {evt.actorName}
                      </span>

                      <span className="text-stone-700">·</span>

                      <span className="text-[#f4efe6] font-medium">
                        {getEventTypeLabel(evt.eventType)}
                      </span>

                      {evt.simulated && (
                        <span className="px-2 py-0.2 rounded-full bg-[#261f14] border border-[#52441b] text-amber-300 text-[10px] uppercase font-sans">
                          SIMULÉ
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-[#c9bea9] font-sans leading-relaxed">
                      {evt.action}
                    </div>

                    {evt.missionTitle && (
                      <div className="text-[11px] text-stone-500 font-editorial italic">
                        Dossier : {evt.missionTitle}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <div className="text-[11px] text-stone-500 font-sans">
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-600" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Event Inspection Drawer */}
        {selectedEvent && (
          <div className="lg:col-span-5 bg-[#121319]/95 border border-stone-800/90 rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xl sticky top-28 self-start text-xs font-sans">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-800/80">
              <div>
                <span className="text-[10px] font-brand uppercase tracking-wider text-[#d48b96]">
                  Examen Notarié de l'Acte
                </span>
                <h3 className="font-editorial text-2xl text-[#fdfbf7] font-normal tracking-wide mt-1">
                  {getEventTypeLabel(selectedEvent.eventType)}
                </h3>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-lg text-stone-500 hover:text-stone-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#0b0c10] border border-stone-800/70 space-y-1">
                <span className="text-stone-500 text-[10px] uppercase">Acteur Dépositaire :</span>
                <div className="text-[#f4efe6] font-medium text-sm">
                  {selectedEvent.actorName} ({selectedEvent.actorType})
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0b0c10] border border-stone-800/70 space-y-1">
                <span className="text-stone-500 text-[10px] uppercase">Détail de l'Action :</span>
                <div className="text-[#e5ded3] leading-relaxed">
                  {selectedEvent.action}
                </div>
              </div>

              {selectedEvent.permissionUsed && (
                <div className="p-3.5 rounded-xl bg-[#0b0c10] border border-stone-800/70 space-y-1">
                  <span className="text-stone-500 text-[10px] uppercase">Mandat / Permission Convoquée :</span>
                  <div className="text-[#d48b96] font-medium">
                    {selectedEvent.permissionUsed}
                  </div>
                </div>
              )}

              {selectedEvent.result && (
                <div className="p-3.5 rounded-xl bg-[#0b0c10] border border-stone-800/70 space-y-1">
                  <span className="text-stone-500 text-[10px] uppercase">Constat & Conséquence :</span>
                  <div className="text-[#c9bea9] leading-relaxed">
                    {typeof selectedEvent.result === 'string'
                      ? selectedEvent.result
                      : JSON.stringify(selectedEvent.result, null, 2)}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-stone-800/60 flex items-center justify-between text-[11px] text-stone-500">
                <span>Horodatage : {new Date(selectedEvent.timestamp).toLocaleString()}</span>
                <span>ID : {selectedEvent.id.slice(0, 12)}...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
