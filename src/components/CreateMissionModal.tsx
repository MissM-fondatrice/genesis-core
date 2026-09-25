import React, { useState } from 'react';
import { Briefcase, X, Send, Sparkles, ShieldCheck } from 'lucide-react';
import { Identity, MissionPriority } from '../types/genesis.js';

interface CreateMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    priority: MissionPriority;
    assignedAgentId: string;
    deadline?: string;
    context: Record<string, unknown>;
  }) => Promise<void>;
  agents: Identity[];
  loading: boolean;
}

export const CreateMissionModal: React.FC<CreateMissionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  agents,
  loading
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<MissionPriority>('HIGH');
  const [assignedAgentId, setAssignedAgentId] = useState('agt_miss_danford');
  const [domain, setDomain] = useState('Hospitality & Equipment Procurement');
  const [budgetThreshold, setBudgetThreshold] = useState('75000');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    try {
      setSubmitting(true);
      await onSubmit({
        title,
        description,
        priority,
        assignedAgentId,
        context: {
          domain,
          budgetThreshold: Number(budgetThreshold) || undefined,
          specialInstructions
        }
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemoTemplate = () => {
    setTitle('Recherche fournisseur matériel restauration');
    setDescription("Miss M demande à Miss Danford d'analyser une possibilité de fournisseur de matériel pour un établissement de restauration.");
    setPriority('HIGH');
    setAssignedAgentId('agt_miss_danford');
    setDomain('Équipements Gastronomie & CHR');
    setBudgetThreshold('75000');
    setSpecialInstructions('Exiger des équipements conformes aux normes européennes CE et un engagement sur le service après-vente sous 48h.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#12141a] border border-stone-800 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-500 hover:text-stone-300 cursor-pointer p-1 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800/80">
          <div>
            <div className="flex items-center gap-2 text-xs">
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              <span className="font-brand uppercase tracking-widest text-[11px] text-stone-400">
                Instruction Souveraine
              </span>
            </div>
            <h3 className="font-editorial text-2xl sm:text-3xl text-stone-100 font-normal tracking-wide mt-0.5">
              Nouveau Mandat Stratégique (Miss M)
            </h3>
          </div>

          <button
            type="button"
            onClick={handleFillDemoTemplate}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 cursor-pointer font-sans self-start sm:self-auto bg-rose-950/40 px-3 py-1.5 rounded-md border border-rose-900/50 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cas Démonstrateur Canonique</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block text-stone-300 font-medium mb-1.5">
              Intitulé du Mandat
            </label>
            <input
              type="text"
              placeholder="Ex. Recherche fournisseur matériel restauration"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-stone-950/80 border border-stone-800 rounded-lg px-3.5 py-2.5 text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-rose-600 transition"
            />
          </div>

          <div>
            <label className="block text-stone-300 font-medium mb-1.5">
              Cahier des Charges & Directives de Miss M
            </label>
            <textarea
              rows={3}
              placeholder="Détaillez le mandat confié à la Directrice Virtuelle..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full bg-stone-950/80 border border-stone-800 rounded-lg px-3.5 py-2.5 text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-rose-600 transition leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-300 font-medium mb-1.5">
                Directoire Assigné
              </label>
              <select
                value={assignedAgentId}
                onChange={(e) => setAssignedAgentId(e.target.value)}
                className="w-full bg-stone-950/80 border border-stone-800 rounded-lg px-3.5 py-2.5 text-xs text-stone-200 focus:outline-none focus:border-rose-600 transition"
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

            <div>
              <label className="block text-stone-300 font-medium mb-1.5">
                Niveau d'Urgence / Priorité
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as MissionPriority)}
                className="w-full bg-stone-950/80 border border-stone-800 rounded-lg px-3.5 py-2.5 text-xs text-stone-200 focus:outline-none focus:border-rose-600 transition"
              >
                <option value="LOW">Basse priorité</option>
                <option value="MEDIUM">Priorité normale</option>
                <option value="HIGH">Haute priorité (Stratégique)</option>
                <option value="CRITICAL">Urgente / Critique</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-stone-400 hover:text-stone-200 cursor-pointer transition font-sans"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting || loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white rounded-lg text-xs font-sans font-medium tracking-wide shadow-lg shadow-rose-950/60 transition cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Transmettre l'Ordre</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
