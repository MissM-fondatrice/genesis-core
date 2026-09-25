import React, { useState } from 'react';
import {
  Bell,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  ShieldAlert,
  ArrowRight,
  Clock,
  Sparkles,
  Check
} from 'lucide-react';
import { GenesisNotification, NotificationCategory } from '../types/genesis.js';
import { NavTab } from './Navigation.js';

interface NotificationCenterProps {
  notifications: GenesisNotification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkRead: (id: string) => Promise<void>;
  onAcknowledge: (id: string) => Promise<void>;
  onNavigateTab?: (tab: NavTab) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkRead,
  onAcknowledge,
  onNavigateTab
}) => {
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory | 'ALL'>('ALL');
  const [actingId, setActingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((notif) => {
    if (selectedCategory !== 'ALL' && notif.category !== selectedCategory) return false;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const criticalCount = notifications.filter((n) => n.category === 'CRITICAL' && !n.acknowledged).length;

  const handleAcknowledge = async (id: string) => {
    try {
      setActingId(id);
      await onAcknowledge(id);
    } finally {
      setActingId(null);
    }
  };

  const handleRead = async (id: string) => {
    try {
      setActingId(id);
      await onMarkRead(id);
    } finally {
      setActingId(null);
    }
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'CRITICAL':
        return <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'ACTION_REQUIRED':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'IMPORTANT':
        return <Clock className="w-4 h-4 text-stone-300 shrink-0" />;
      case 'INFO':
      default:
        return <Info className="w-4 h-4 text-stone-400 shrink-0" />;
    }
  };

  const getCategoryLabel = (category: NotificationCategory) => {
    switch (category) {
      case 'CRITICAL':
        return 'Critique';
      case 'ACTION_REQUIRED':
        return 'Arbitrage requis';
      case 'IMPORTANT':
        return 'Important';
      case 'INFO':
        return 'Information';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#121319] border border-stone-800/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-stone-800/80 bg-[#161821] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#201015] border border-[#521924]/60 flex items-center justify-center text-[#d48b96]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-editorial text-xl text-[#fdfbf7] font-normal tracking-wide">
                  Centre des Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-[#3d121b] text-[#f4b6c1] border border-[#6b1e2c]">
                    {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#a89d8f] font-sans">
                Acheminement ciblé vers Miss M & directoires virtuels
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Critical Banner if any unacknowledged critical alert exists */}
        {criticalCount > 0 && (
          <div className="p-3.5 bg-rose-950/40 border-b border-rose-900/60 flex items-center justify-between text-xs text-rose-200">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>{criticalCount} alerte constitutionnelle</strong> requiert votre accusé de réception explicite.
              </span>
            </div>
          </div>
        )}

        {/* Category Filter Tabs */}
        <div className="p-3 bg-[#0d0e13] border-b border-stone-800/70 flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap text-xs font-sans ${
              selectedCategory === 'ALL'
                ? 'bg-[#1f222e] text-[#fdfbf7] font-medium border border-stone-700'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
            }`}
          >
            Toutes ({notifications.length})
          </button>
          <button
            onClick={() => setSelectedCategory('ACTION_REQUIRED')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap text-xs font-sans ${
              selectedCategory === 'ACTION_REQUIRED'
                ? 'bg-[#2a1d13] text-amber-200 font-medium border border-amber-800/50'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
            }`}
          >
            Arbitrage requis ({notifications.filter((n) => n.category === 'ACTION_REQUIRED').length})
          </button>
          <button
            onClick={() => setSelectedCategory('CRITICAL')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap text-xs font-sans ${
              selectedCategory === 'CRITICAL'
                ? 'bg-[#2d1217] text-rose-200 font-medium border border-rose-900/60'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
            }`}
          >
            Critiques ({notifications.filter((n) => n.category === 'CRITICAL').length})
          </button>
          <button
            onClick={() => setSelectedCategory('INFO')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap text-xs font-sans ${
              selectedCategory === 'INFO'
                ? 'bg-[#1f222e] text-stone-200 font-medium border border-stone-700'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
            }`}
          >
            Informations ({notifications.filter((n) => n.category === 'INFO').length})
          </button>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto p-4 space-y-3 flex-1 scrollbar-thin">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 text-stone-500 text-xs">
              Aucune notification dans cette catégorie.
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isCritical = notif.category === 'CRITICAL';
              const needsAck = isCritical && !notif.acknowledged;

              return (
                <div
                  key={notif.id}
                  className={`p-4 rounded-xl border transition-all ${
                    needsAck
                      ? 'bg-rose-950/20 border-rose-900/80 shadow-md'
                      : notif.read
                      ? 'bg-[#161821]/50 border-stone-800/60'
                      : 'bg-[#181a24] border-stone-700/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getCategoryIcon(notif.category)}</div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-sans text-[#a89d8f] uppercase tracking-wider">
                            {getCategoryLabel(notif.category)}
                          </span>
                          <span className="text-stone-600">·</span>
                          <span className="text-[11px] font-sans text-stone-500">
                            Destinataire : <strong className="text-stone-300">{notif.recipientName}</strong>
                          </span>
                        </div>

                        <h4 className="text-sm font-medium text-[#fcfaf6]">
                          {notif.title}
                        </h4>

                        <p className="text-xs text-[#c9bea9] font-sans leading-relaxed">
                          {notif.message}
                        </p>

                        <div className="text-[11px] text-stone-500 font-sans pt-1">
                          {new Date(notif.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>

                    {!notif.read && !needsAck && (
                      <button
                        onClick={() => handleRead(notif.id)}
                        disabled={actingId === notif.id}
                        title="Marquer comme lu"
                        className="text-stone-500 hover:text-stone-300 p-1 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Actions Bar inside Card */}
                  <div className="mt-3 pt-2.5 border-t border-stone-800/60 flex items-center justify-between text-xs font-sans">
                    {needsAck ? (
                      <button
                        onClick={() => handleAcknowledge(notif.id)}
                        disabled={actingId === notif.id}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-100 text-xs font-medium transition cursor-pointer border border-rose-700/80"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Accuser réception formellement (Requis)
                      </button>
                    ) : (
                      <>
                        {notif.missionId && onNavigateTab && (
                          <button
                            onClick={() => {
                              onNavigateTab('MISSIONS');
                              onClose();
                            }}
                            className="flex items-center gap-1.5 text-[#d48b96] hover:text-[#f4b6c1] transition cursor-pointer"
                          >
                            <span>Consulter le mandat</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        {notif.category === 'ACTION_REQUIRED' && onNavigateTab && (
                          <button
                            onClick={() => {
                              onNavigateTab('VALIDATIONS');
                              onClose();
                            }}
                            className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition cursor-pointer ml-auto"
                          >
                            <span>Accéder à l'arbitrage</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
