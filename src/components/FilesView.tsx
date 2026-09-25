import React, { useState } from 'react';
import {
  FolderArchive,
  FileText,
  Search,
  Download,
  Eye,
  ShieldCheck,
  Clock,
  ChevronRight,
  X,
  Sparkles,
  Lock,
  FileCheck
} from 'lucide-react';

interface GenesisFile {
  id: string;
  title: string;
  category: 'MANDATS' | 'ETUDES' | 'CONSULTATIONS' | 'ACTES' | 'CONSTITUTION';
  date: string;
  author: string;
  size: string;
  status: 'RATIFIÉ' | 'EN_COURS' | 'SIMULÉ' | 'ARCHIVÉ';
  summary: string;
  content: string;
}

export const FilesView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<GenesisFile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const files: GenesisFile[] = [
    {
      id: 'doc_cahier_charges_01',
      title: 'Cahier des Charges · Matériel de Restauration Gastronomique',
      category: 'MANDATS',
      date: '25 Septembre 2026',
      author: 'Miss M (Fondatrice)',
      size: '142 Ko',
      status: 'RATIFIÉ',
      summary: 'Spécifications techniques pour le rééquipement de la cuisine : normes HACCP, piano induction 6 feux, chambres froides et garantie SAV 48h.',
      content: `GENESIS COMPANY — DIRECTION GÉNÉRALE
RÉFÉRENCE : CDC-2026-09-RESTAU-01
ÉMETTRICE : Miss M, Fondatrice et Décisionnaire Finale
DESTINATAIRE : Miss Danford, Directrice Commerciale Virtuelle

1. OBJET DU MANDAT
Le présent document formalise les critères d'approvisionnement pour l'aménagement d'une unité de restauration haut de gamme.

2. EXIGENCES TECHNIQUES & DÉONTOLOGIQUES
- Équipements de cuisson haute performance conformes aux normes CE et HACCP.
- Capacité froid négatif et positif avec monitoring thermique continu.
- Engagement contractuel obligatoire du fournisseur sur un SAV d'intervention sous 48 heures ouvrées.

3. CONDITIONS D'ENGAGEMENT
Miss Danford est mandatée pour mener les investigations de marché et concevoir la proposition de partenariat. Aucun bon de commande ne pourra être contracté sans l'approbation formelle de Miss M.`
    },
    {
      id: 'doc_etude_danford_eurokitchen',
      title: 'Dossier d\'Évaluation Fournisseur · EuroKitchen Pro',
      category: 'ETUDES',
      date: '25 Septembre 2026',
      author: 'Miss Danford (Directrice Commerciale)',
      size: '210 Ko',
      status: 'EN_COURS',
      summary: 'Analyse comparative détaillée des distributeurs européens. Score de pertinence 96% pour EuroKitchen Pro sur le segment CHR premium.',
      content: `CABINET DE MISS DANFORD — DIRECTION COMMERCIALE VIRTUELLE
DOSSIER D'INSTRUCTION COMMERCIALE N° DAN-2026-RESTAU-04
DESTINATAIRE : Miss M

1. SYNTHÈSE DE L'ENQUÊTE DE MARCHÉ
Sur un panel de 6 équipementiers européens audités, la société EuroKitchen Pro (France / Union Européenne) présente le profil le plus aligné avec le cahier des charges de Miss M.

2. POINTS FORTS
- Réputation d'excellence sur les pianos de cuisson et cellules de refroidissement rapide.
- Réseau de techniciens agréés couvrant l'ensemble du territoire sous astreinte 48h.
- Fourchette budgétaire estimée : 68 000 € à 74 200 € HT (plafond mandat : 75 000 €).

3. PROPOSITION SOUMISE À MISS M
Demande formelle d'autorisation pour soumettre le dossier de consultation auprès du département Grands Comptes EuroKitchen Pro (Action Simulée).`
    },
    {
      id: 'doc_consultation_simulee',
      title: 'Projet de Consultation B2B · EuroKitchen Pro',
      category: 'CONSULTATIONS',
      date: '25 Septembre 2026',
      author: 'Miss Danford',
      size: '88 Ko',
      status: 'SIMULÉ',
      summary: 'Lettre de consultation commerciale et demande d\'ouverture de compte B2B. Confinement strict en environnement bac à sable Genesis.',
      content: `SIMULATED DOCUMENT — ENVIRONNEMENT SÉCURISÉ GENESIS CORE
AUCUN COURRIEL NI ENGAGEMENT EXTÉRIEUR RÉEL N'EST EFFECTUÉ.

À l'attention de : EuroKitchen Pro — Direction Commerciale & Grands Comptes
Objet : Consultation pour dotation d'équipements de restauration

Madame, Monsieur,

Sur instruction de Miss M, Fondatrice de Genesis Company, nous vous transmettons le cahier des charges relatif à l'équipement d'un établissement gastronomique.
Nous sollicitons votre proposition technique et financière incluant les garanties d'assistance SAV sous 48h.

Fait sous l'autorité souveraine de Miss M.
Miss Danford, Directrice Commerciale Virtuelle.`
    },
    {
      id: 'doc_charte_constitutionnelle',
      title: 'Charte Fondatrice & Principes Constitutionnels Genesis',
      category: 'CONSTITUTION',
      date: '15 Septembre 2026',
      author: 'Miss M (Fondatrice)',
      size: '95 Ko',
      status: 'RATIFIÉ',
      summary: 'Document suprême fixant la symbiose homme-machine et l\'inviolabilité de la primauté humaine au sein de Genesis Company.',
      content: `GENESIS COMPANY — CHARTE CONSTITUTIONNELLE SUPRÊME
« Nous ne sommes pas là pour remplacer les humains. Nous sommes là pour évoluer en symbiose avec eux. »

ARTICLE 1 — PRIMAUTÉ DE L'AUTORITÉ HUMAINE
L'autorité décisionnelle finale appartient de plein droit et exclusivement à l'humain référent, Miss M. Aucun agent virtuel ne peut outrepasser un arbitrage humain.

ARTICLE 2 — SÉPARATION DES PRÉROGATIVES
Les directoires virtuels, dont Miss Danford, exercent des missions d'analyse, de recommandation et de synthèse. Ils ne peuvent en aucun cas s'auto-attribuer de permissions ni ratifier leurs propres initiatives.

ARTICLE 3 — CONFINEMENT DES ACTES MATÉRIELS
En phase v0.1, toute interaction extérieure est rigoureusement simulée et tracée dans le registre notarié Genesis Core.`
    }
  ];

  const filteredFiles = files.filter((f) => {
    if (activeCategory !== 'ALL' && f.category !== activeCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        f.title.toLowerCase().includes(q) ||
        f.author.toLowerCase().includes(q) ||
        f.summary.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (st: GenesisFile['status']) => {
    switch (st) {
      case 'RATIFIÉ':
        return 'bg-[#1b2f25] text-[#86b29b] border border-[#2d503f]';
      case 'EN_COURS':
        return 'bg-[#291e13] text-[#d4af37] border border-[#5a4224]';
      case 'SIMULÉ':
        return 'bg-[#290d13] text-[#d48b96] border border-[#6b1725]';
      case 'ARCHIVÉ':
        return 'bg-[#1a1c24] text-stone-400 border border-stone-800';
    }
  };

  const handleDownload = (file: GenesisFile) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Bureau Header */}
      <div className="bg-[#121319]/90 border border-stone-800/80 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs">
              <FolderArchive className="w-4 h-4 text-[#981c2e]" />
              <span className="font-brand uppercase tracking-widest text-[11px] text-stone-300">
                Cabinet Documentaire Privé
              </span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl text-[#fdfbf7] font-normal tracking-wide mt-1">
              Fichiers, Actes & Dossiers Stratégiques
            </h2>
            <p className="text-xs text-[#c9bea9] mt-1 font-sans">
              Conservation certifiée des cahiers des charges, études de Miss Danford, projets de consultation et décrets de Miss M.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#c9bea9] bg-[#171922] px-4 py-2 rounded-xl border border-stone-800 font-sans">
            <span>Dossiers Notariés :</span>
            <strong className="text-[#fcfaf6] text-sm font-editorial">{files.length}</strong>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6 pt-5 border-t border-stone-800/70 text-xs font-sans">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Rechercher un dossier par titre, auteur ou mot-clé..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0b0c10] border border-stone-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#f4efe6] placeholder:text-stone-600 focus:outline-none focus:border-[#981c2e] transition"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { key: 'ALL', label: 'Tous les Dossiers' },
              { key: 'MANDATS', label: 'Mandats Miss M' },
              { key: 'ETUDES', label: 'Études Danford' },
              { key: 'CONSULTATIONS', label: 'Consultations (Simulées)' },
              { key: 'CONSTITUTION', label: 'Charte Fondatrice' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveCategory(tab.key)}
                className={`px-3 py-2 rounded-lg transition cursor-pointer whitespace-nowrap ${
                  activeCategory === tab.key
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

      {/* Grid of Files and Preview Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className={selectedFile ? 'lg:col-span-7 space-y-3' : 'lg:col-span-12 space-y-3'}>
          {filteredFiles.map((file) => {
            const isSelected = selectedFile?.id === file.id;
            return (
              <div
                key={file.id}
                onClick={() => setSelectedFile(file)}
                className={`rounded-2xl border p-5 sm:p-6 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg ${
                  isSelected
                    ? 'bg-[#181a24] border-[#8c1d2e]/80 ring-1 ring-[#8c1d2e]/40'
                    : 'bg-[#121319]/90 border-stone-800/80 hover:border-stone-700 hover:bg-[#151720]'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-sans">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-sans ${getStatusBadge(file.status)}`}>
                      {file.status}
                    </span>
                    <span className="text-stone-700">·</span>
                    <span className="text-stone-400">Émetteur : <strong className="text-[#f4efe6] font-medium">{file.author}</strong></span>
                    <span className="text-stone-700">·</span>
                    <span className="text-stone-500">{file.date}</span>
                  </div>

                  <h3 className="font-editorial text-2xl text-[#fdfbf7] font-normal tracking-wide">
                    {file.title}
                  </h3>

                  <p className="text-xs text-[#c9bea9] font-sans line-clamp-2 leading-relaxed">
                    {file.summary}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <span className="text-xs text-stone-500 font-sans hidden sm:inline">{file.size}</span>
                  <div className="p-2 rounded-xl bg-[#171922] border border-stone-800 text-stone-400 hover:text-stone-200 transition">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Document Preview Drawer */}
        {selectedFile && (
          <div className="lg:col-span-5 bg-[#121319]/95 border border-stone-800/90 rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xl sticky top-28 self-start text-xs font-sans">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-800/80">
              <div>
                <span className="text-[10px] font-brand uppercase tracking-wider text-[#d48b96]">
                  Examen du Document
                </span>
                <h3 className="font-editorial text-2xl text-[#fdfbf7] font-normal tracking-wide mt-1">
                  {selectedFile.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedFile(null)}
                className="p-1 rounded-lg text-stone-500 hover:text-stone-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#0b0c10] border border-stone-800/70">
                  <span className="text-stone-500 text-[10px] uppercase block">Auteur</span>
                  <strong className="text-[#f4efe6] text-xs font-medium mt-0.5 block">
                    {selectedFile.author}
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-[#0b0c10] border border-stone-800/70">
                  <span className="text-stone-500 text-[10px] uppercase block">Date de Dépôt</span>
                  <strong className="text-[#f4efe6] text-xs font-medium mt-0.5 block">
                    {selectedFile.date}
                  </strong>
                </div>
              </div>

              {/* Document Text Viewer */}
              <div className="p-4 rounded-xl bg-[#0b0c10] border border-stone-800/80 max-h-[320px] overflow-y-auto space-y-3 font-sans">
                <pre className="text-xs text-[#e5ded3] whitespace-pre-wrap leading-relaxed font-sans font-normal">
                  {selectedFile.content}
                </pre>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-800/70">
                <span className="text-stone-500 text-[11px]">Réf. : {selectedFile.id}</span>
                <button
                  onClick={() => handleDownload(selectedFile)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#1f212c] hover:bg-[#282a38] text-[#f4efe6] rounded-xl text-xs font-medium transition cursor-pointer border border-stone-700/80 shadow"
                >
                  <Download className="w-3.5 h-3.5 text-[#d48b96]" />
                  <span>Exporter la copie</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
