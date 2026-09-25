import React, { useState } from 'react';
import {
  Send,
  Lock,
  ChevronRight,
  ShieldCheck,
  Award,
  Sparkles,
  BookOpen,
  MessageSquare,
  Building,
  ArrowRight,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { Identity, Mission, AuditEvent } from '../types/genesis.js';

interface MissDanfordViewProps {
  danfordIdentity?: Identity;
  missions: Mission[];
  events: AuditEvent[];
  onCreateMission: (title: string, description: string, priority: string) => Promise<void>;
  onSelectMission: (mission: Mission) => void;
  loading: boolean;
}

export const MissDanfordView: React.FC<MissDanfordViewProps> = ({
  danfordIdentity,
  missions,
  events,
  onCreateMission,
  onSelectMission,
  loading
}) => {
  const [directiveTitle, setDirectiveTitle] = useState('');
  const [directiveDesc, setDirectiveDesc] = useState('');
  const [priority, setPriority] = useState('HIGH');
  const [transmitting, setTransmitting] = useState(false);
  const [conversationNote, setConversationNote] = useState('');

  // Structured executive dialog log with Miss M
  const [executiveNotes, setExecutiveNotes] = useState<
    { sender: 'MISS_M' | 'MISS_DANFORD'; text: string; time: string }[]
  >([
    {
      sender: 'MISS_DANFORD',
      text: 'Bonjour Miss M. Je poursuis l\'instruction du dossier d\'approvisionnement en matériel de restauration gastronomique. Les options européennes répondant à vos exigences d\'excellence et de conformité HACCP ont été présélectionnées. Je prépare actuellement la proposition formelle que je soumettrai à votre approbation avant tout contact.',
      time: '10:14'
    },
    {
      sender: 'MISS_M',
      text: 'Parfait Miss Danford. Veillez à ce que le fournisseur sélectionné propose impérativement une garantie de maintenance sur site sous 48h.',
      time: '10:28'
    },
    {
      sender: 'MISS_DANFORD',
      text: 'C\'est bien noté. J\'ai intégré cette clause dans la grille d\'évaluation commerciale. EuroKitchen Pro est le candidat le plus robuste sur ce critère. Dès que vous validerez la demande de mise en relation, j\'exécuterai la prise de contact dans le bac à sable simulé Genesis.',
      time: '10:32'
    }
  ]);

  const danfordMissions = missions.filter((m) => m.assignedAgentId === 'agt_miss_danford');
  const pendingForDanford = missions.find(
    (m) => m.assignedAgentId === 'agt_miss_danford' && m.status === 'HUMAN_REQUIRED'
  );

  const handleTransmitDirective = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directiveTitle || !directiveDesc) return;

    try {
      setTransmitting(true);
      await onCreateMission(directiveTitle, directiveDesc, priority);
      // Append note to executive dialog
      setExecutiveNotes((prev) => [
        ...prev,
        {
          sender: 'MISS_M',
          text: `Nouveau mandat confié : « ${directiveTitle} » — ${directiveDesc}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          sender: 'MISS_DANFORD',
          text: `Bien reçu Miss M. Je prends immédiatement en charge l'étude de ce dossier. Une analyse comparative vous sera remise dès finalisation.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setDirectiveTitle('');
      setDirectiveDesc('');
    } finally {
      setTransmitting(false);
    }
  };

  const handleSendConversationNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversationNote.trim()) return;

    const userText = conversationNote;
    setExecutiveNotes((prev) => [
      ...prev,
      {
        sender: 'MISS_M',
        text: userText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setConversationNote('');

    // Thoughtful simulated professional reply from Miss Danford
    setTimeout(() => {
      setExecutiveNotes((prev) => [
        ...prev,
        {
          sender: 'MISS_DANFORD',
          text: `Bien reçu, Miss M. Vos directives sur « ${userText.slice(0, 45)}... » sont intégrées à mes analyses. Aucune démarche extérieure ne sera engagée sans votre blanc-seing.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 700);
  };

  return (
    <div className="space-y-8">
      {/* Cabinet Header & High-End Executive Presentation of Miss Danford */}
      <div className="bg-[#121319]/90 border border-stone-800/80 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
            {/* Miss Danford Executive Portrait */}
            <div className="relative group shrink-0">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border border-[#4a1822] shadow-2xl shadow-black/80 relative">
                <img
                  src="/src/assets/images/miss_danford_portrait_1790353656367.jpg"
                  alt="Miss Danford"
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </div>
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#181a24] border border-stone-700/80 text-[10px] text-[#e5ded3] font-sans shadow-md whitespace-nowrap">
                Directoire Virtuel
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-editorial text-3xl sm:text-4xl text-[#fdfbf7] font-normal tracking-wide">
                  Miss Danford
                </h2>
                <span className="text-[11px] font-sans uppercase tracking-wider text-[#d48b96] bg-[#290d13]/70 border border-[#6b1725]/60 px-3 py-0.5 rounded-full">
                  Directrice Commerciale Virtuelle
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#c9bea9] font-sans leading-relaxed max-w-xl">
                Collaboratrice commerciale virtuelle de haut rang au sein de Genesis Company. Conduite d'enquêtes de marché rigoureuses, identification des partenaires stratégiques et formulation de propositions d'actions soumises à la ratification exclusive de Miss M.
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-400 pt-1 font-sans">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"></span>
                  En poste · Prête pour arbitrage
                </span>
                <span className="text-stone-700">·</span>
                <span>Rattachement : <strong className="text-[#f4efe6]">Miss M (Rapport direct)</strong></span>
                <span className="text-stone-700">·</span>
                <span>Périmètre : <strong className="text-[#f4efe6]">Développement B2B & Achats</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Badge */}
          <div className="bg-[#171922] p-5 rounded-xl border border-stone-800/80 self-stretch lg:self-auto flex lg:flex-col justify-between items-center lg:items-end gap-3 min-w-[200px]">
            <span className="text-[11px] uppercase tracking-wider text-[#a09587] font-sans">
              Mandats Ouverts
            </span>
            <span className="font-editorial text-4xl text-[#fcfaf6] font-normal">
              {danfordMissions.length}
            </span>
            <span className="text-[11px] text-[#86b29b] font-sans flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% gouvernance humaine
            </span>
          </div>
        </div>

        {/* Institutional Safeguards Banner */}
        <div className="mt-8 pt-6 border-t border-stone-800/60 grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs font-sans">
          <div className="p-3.5 rounded-xl bg-[#0d0e13]/80 border border-stone-800/70 flex items-start gap-3">
            <Lock className="w-3.5 h-3.5 text-[#a62639] mt-0.5 shrink-0" />
            <div>
              <strong className="text-[#f4efe6] block mb-0.5">Aucune auto-attribution de droits</strong>
              <span className="text-[#9e9386] text-[11px] leading-relaxed">
                Miss Danford ne peut ni élargir ses privilèges ni outrepasser ses mandats préétablis.
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0d0e13]/80 border border-stone-800/70 flex items-start gap-3">
            <Lock className="w-3.5 h-3.5 text-[#a62639] mt-0.5 shrink-0" />
            <div>
              <strong className="text-[#f4efe6] block mb-0.5">Impossibilité d'usurpation</strong>
              <span className="text-[#9e9386] text-[11px] leading-relaxed">
                L'autorité souveraine de Miss M est inaliénable et ne saurait être exercée par un agent.
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0d0e13]/80 border border-stone-800/70 flex items-start gap-3">
            <Lock className="w-3.5 h-3.5 text-[#a62639] mt-0.5 shrink-0" />
            <div>
              <strong className="text-[#f4efe6] block mb-0.5">Cadre simulé certifié</strong>
              <span className="text-[#9e9386] text-[11px] leading-relaxed">
                Toute prise de contact ou négociation s'effectue dans un environnement sécurisé sans engagement externe réel.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Executive Exchange & Mandate Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Private Executive Conversation with Miss Danford */}
        <div className="lg:col-span-7 bg-[#121319]/90 border border-stone-800/80 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-stone-800/70">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-[#981c2e]" />
                <h3 className="font-editorial text-2xl text-[#fdfbf7] tracking-wide">
                  Échange Exécutif Privé avec Miss Danford
                </h3>
              </div>
              <span className="text-xs font-editorial italic text-[#a09587]">
                Canal confidentiel Miss M
              </span>
            </div>

            {/* Conversation Flow */}
            <div className="space-y-4 py-4 max-h-[380px] overflow-y-auto pr-2">
              {executiveNotes.map((msg, idx) => {
                const isMissM = msg.sender === 'MISS_M';
                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${isMissM ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div className="flex items-center gap-2 text-[11px] text-stone-400 font-sans">
                      <span className={isMissM ? 'text-[#f4efe6] font-medium' : 'text-[#d48b96] font-medium'}>
                        {isMissM ? 'Miss M' : 'Miss Danford'}
                      </span>
                      <span>·</span>
                      <span>{msg.time}</span>
                    </div>

                    <div
                      className={`max-w-[88%] rounded-2xl p-4 text-xs font-sans leading-relaxed shadow-md ${
                        isMissM
                          ? 'bg-[#212431] text-[#fcfaf6] border border-stone-700/80 rounded-tr-sm'
                          : 'bg-[#181a24] text-[#e5ded3] border border-stone-800 rounded-tl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Direct Input for Miss M */}
          <form onSubmit={handleSendConversationNote} className="pt-3 border-t border-stone-800/70">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Transmettre une instruction ou une remarque à Miss Danford..."
                value={conversationNote}
                onChange={(e) => setConversationNote(e.target.value)}
                className="flex-1 bg-[#0b0c10] border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-[#f4efe6] placeholder:text-stone-600 focus:outline-none focus:border-[#981c2e] transition"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-[#981c2e] hover:bg-[#801625] text-white rounded-xl text-xs font-sans font-medium transition cursor-pointer shadow-md flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmettre</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Direct Mandate Formulation & Active Cases */}
        <div className="lg:col-span-5 space-y-8">
          {/* New Strategic Mandate Form */}
          <div className="bg-[#121319]/90 border border-stone-800/80 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xl">
            <div className="pb-3 border-b border-stone-800/70">
              <span className="text-[10px] font-brand uppercase tracking-wider text-[#d48b96]">
                Instruction Stratégique Directe
              </span>
              <h3 className="font-editorial text-2xl text-[#fdfbf7] tracking-wide mt-0.5">
                Confier un Nouveau Mandat
              </h3>
            </div>

            <form onSubmit={handleTransmitDirective} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[#c9bea9] font-medium mb-1.5">
                  Objet du Mandat
                </label>
                <input
                  type="text"
                  placeholder="Ex. Recherche fournisseur matériel restauration"
                  value={directiveTitle}
                  onChange={(e) => setDirectiveTitle(e.target.value)}
                  required
                  className="w-full bg-[#0b0c10] border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-[#f4efe6] placeholder:text-stone-600 focus:outline-none focus:border-[#981c2e] transition"
                />
              </div>

              <div>
                <label className="block text-[#c9bea9] font-medium mb-1.5">
                  Directives Opérationnelles de Miss M
                </label>
                <textarea
                  rows={3}
                  placeholder="Critères d'exigence, budget estimatif, contraintes d'exécution..."
                  value={directiveDesc}
                  onChange={(e) => setDirectiveDesc(e.target.value)}
                  required
                  className="w-full bg-[#0b0c10] border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-[#f4efe6] placeholder:text-stone-600 focus:outline-none focus:border-[#981c2e] transition leading-relaxed"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-1.5">
                  {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((p) => {
                    const labels = { LOW: 'Basse', MEDIUM: 'Normale', HIGH: 'Haute', CRITICAL: 'Urgente' };
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`px-2.5 py-1 rounded-lg text-xs transition cursor-pointer ${
                          priority === p
                            ? 'bg-[#290d13] text-[#d48b96] border border-[#6b1725] font-medium'
                            : 'bg-[#181a24] text-stone-400 hover:text-stone-200 border border-stone-800'
                        }`}
                      >
                        {labels[p]}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="submit"
                  disabled={transmitting || loading}
                  className="px-5 py-2 bg-gradient-to-r from-[#981c2e] to-[#7f1826] hover:from-[#851828] hover:to-[#6d1420] text-white rounded-xl text-xs font-sans font-medium tracking-wide shadow-lg shadow-[#400b13]/60 transition cursor-pointer disabled:opacity-50"
                >
                  Confier l'Étude
                </button>
              </div>
            </form>
          </div>

          {/* Dossiers in Progress */}
          <div className="bg-[#121319]/90 border border-stone-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
            <h4 className="font-editorial text-xl text-[#fdfbf7] tracking-wide pb-2 border-b border-stone-800/70">
              Dossiers Actifs Confiés à Miss Danford ({danfordMissions.length})
            </h4>

            <div className="space-y-2.5">
              {danfordMissions.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onSelectMission(m)}
                  className="p-3.5 rounded-xl bg-[#0e1015] border border-stone-800/70 hover:border-stone-700 transition cursor-pointer flex items-center justify-between group"
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
                          : 'En examen'}
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
      </div>
    </div>
  );
};
