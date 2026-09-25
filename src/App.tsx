/**
 * GENESIS CORE v0.1
 * Main Application Interface
 * 
 * Constitutional Principle:
 * "We are not here to replace humans. We are here to evolve in symbiosis with them."
 * Human authority must remain above AI authority.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header.js';
import { Navigation, NavTab } from './components/Navigation.js';
import { DemoStepper } from './components/DemoStepper.js';
import { DashboardView } from './components/DashboardView.js';
import { MissDanfordView } from './components/MissDanfordView.js';
import { MissionsView } from './components/MissionsView.js';
import { ValidationsView } from './components/ValidationsView.js';
import { AgentsView } from './components/AgentsView.js';
import { FilesView } from './components/FilesView.js';
import { HistoryView } from './components/HistoryView.js';
import { CoreStatusView } from './components/CoreStatusView.js';
import { CreateMissionModal } from './components/CreateMissionModal.js';
import { NotificationCenter } from './components/NotificationCenter.js';
import { api } from './services/api.js';
import {
  CoreStatus,
  Mission,
  ValidationRequest,
  AuditEvent,
  Identity,
  MissionPriority,
  GenesisNotification
} from './types/genesis.js';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('ACCUEIL');
  const [status, setStatus] = useState<CoreStatus | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [validations, setValidations] = useState<ValidationRequest[]>([]);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [agents, setAgents] = useState<Identity[]>([]);
  const [notifications, setNotifications] = useState<GenesisNotification[]>([]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load all Genesis system data
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [statusRes, missionsRes, validationsRes, eventsRes, identitiesRes, agentsRes, notifsRes] =
        await Promise.all([
          api.getStatus(),
          api.getMissions(),
          api.getValidations(),
          api.getEvents(150),
          api.getIdentities(),
          api.getAgents(),
          api.getNotifications()
        ]);

      setStatus(statusRes);
      setMissions(missionsRes);
      setValidations(validationsRes);
      setEvents(eventsRes);
      setIdentities(identitiesRes);
      setAgents(agentsRes);
      setNotifications(notifsRes);

      // Keep selected mission updated if present
      if (selectedMission) {
        const found = missionsRes.find((m) => m.id === selectedMission.id);
        if (found) setSelectedMission(found);
      }
    } catch (err: unknown) {
      console.error('Genesis load error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Genesis connection error: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [selectedMission]);

  useEffect(() => {
    loadAllData();
  }, []);

  // Demo Mission lookup (canonical demo)
  const demoMission = missions.find((m) => m.id === 'msn_demo_restauration_01') || missions[0];
  const pendingValidation = validations.find((v) => v.status === 'PENDING');

  // Core Actions
  const handleResetCore = async () => {
    try {
      setResetting(true);
      await api.resetCore();
      setSelectedMission(null);
      await loadAllData();
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  const handleExecuteAnalysis = async (missionId: string) => {
    try {
      setLoading(true);
      const result = await api.triggerAnalysis(missionId);
      await loadAllData();
      if (result.mission) {
        setSelectedMission(result.mission);
      }
      if (result.requiresHuman) {
        // Automatically switch to validations tab to prompt Miss M
        setCurrentTab('VALIDATIONS');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Analysis failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorizeValidation = async (validationId: string) => {
    try {
      setLoading(true);
      await api.decideValidation(
        validationId,
        'AUTHORIZE',
        'Autorisation formelle délivrée par Miss M (Autorité Humaine Finale).'
      );
      await loadAllData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Authorization failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDecideValidation = async (
    validationId: string,
    decision: 'AUTHORIZE' | 'REFUSE' | 'REQUEST_MORE_INFO' | 'SUSPEND',
    note?: string
  ) => {
    try {
      setLoading(true);
      await api.decideValidation(validationId, decision, note);
      await loadAllData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Decision error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleAcknowledgeNotification = async (id: string) => {
    await api.acknowledgeNotification(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, acknowledged: true, read: true } : n))
    );
  };

  const handleCreateMission = async (data: {
    title: string;
    description: string;
    priority: MissionPriority;
    assignedAgentId: string;
    deadline?: string;
    context: Record<string, unknown>;
  }) => {
    const created = await api.createMission(data);
    await loadAllData();
    setSelectedMission(created);
    setCurrentTab('MISSIONS');
  };

  const handleCreateMissionFromDanford = async (
    title: string,
    description: string,
    priority: string
  ) => {
    const created = await api.createMission({
      title,
      description,
      priority,
      assignedAgentId: 'agt_miss_danford',
      context: { source: 'DIRECTIVE_FROM_DANFORD_TERMINAL' }
    });
    await loadAllData();
    setSelectedMission(created);
  };

  const handleSuspendMission = async (missionId: string) => {
    await api.suspendMission(missionId, 'Suspended by Miss M');
    await loadAllData();
  };

  const handleCancelMission = async (missionId: string) => {
    await api.cancelMission(missionId, 'Cancelled by Miss M');
    await loadAllData();
  };

  const handleSelectMission = (mission: Mission | null) => {
    setSelectedMission(mission);
    setCurrentTab('MISSIONS');
  };

  const handleSelectValidation = (_val: ValidationRequest) => {
    setCurrentTab('VALIDATIONS');
  };

  const danfordIdentity = identities.find((i) => i.id === 'agt_miss_danford');
  const pendingCount = validations.filter((v) => v.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-[#090a0d] text-stone-100 flex flex-col selection:bg-rose-950 selection:text-rose-200">
      {/* Header */}
      <Header
        status={status}
        notifications={notifications}
        onReset={handleResetCore}
        resetting={resetting}
        onOpenNotifications={() => setIsNotificationCenterOpen(true)}
      />

      {/* Navigation */}
      <Navigation
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'MISSIONS') setSelectedMission(null);
        }}
        pendingValidationsCount={pendingCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {errorMessage && (
          <div className="p-4 bg-rose-950/80 border border-rose-800 text-rose-200 rounded-xl text-xs font-sans flex items-center justify-between shadow-lg">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-100 font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Global Demo Stepper Widget */}
        <DemoStepper
          demoMission={demoMission}
          pendingValidation={pendingValidation}
          onExecuteAnalysis={handleExecuteAnalysis}
          onAuthorizeValidation={handleAuthorizeValidation}
          onReset={handleResetCore}
          loading={loading || resetting}
        />

        {/* View Switcher */}
        {currentTab === 'ACCUEIL' && (
          <DashboardView
            status={status}
            missions={missions}
            validations={validations}
            events={events}
            agents={agents}
            onNavigate={setCurrentTab}
            onSelectMission={handleSelectMission}
            onSelectValidation={handleSelectValidation}
          />
        )}

        {currentTab === 'MISS_DANFORD' && (
          <MissDanfordView
            danfordIdentity={danfordIdentity}
            missions={missions}
            events={events}
            onCreateMission={handleCreateMissionFromDanford}
            onSelectMission={handleSelectMission}
            loading={loading}
          />
        )}

        {currentTab === 'MISSIONS' && (
          <MissionsView
            missions={missions}
            selectedMission={selectedMission}
            onSelectMission={setSelectedMission}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onExecuteAnalysis={handleExecuteAnalysis}
            onSuspendMission={handleSuspendMission}
            onCancelMission={handleCancelMission}
            onNavigateToValidation={() => setCurrentTab('VALIDATIONS')}
            agents={agents}
            onRefreshData={loadAllData}
            loading={loading}
          />
        )}

        {currentTab === 'VALIDATIONS' && (
          <ValidationsView
            validations={validations}
            onDecide={handleDecideValidation}
            loading={loading}
          />
        )}

        {currentTab === 'AGENTS' && (
          <AgentsView
            identities={identities}
            missions={missions}
            onSelectMission={handleSelectMission}
            onRefreshData={loadAllData}
          />
        )}

        {currentTab === 'FICHIERS' && <FilesView />}

        {currentTab === 'HISTORIQUE' && <HistoryView events={events} />}

        {currentTab === 'CORE_STATUS' && (
          <CoreStatusView
            status={status}
            agents={agents}
            missions={missions}
            validations={validations}
            events={events}
            onRefreshData={loadAllData}
          />
        )}
      </main>

      {/* High-End Architectural Footer */}
      <footer className="border-t border-stone-900/90 bg-[#07080a] py-6 text-xs font-sans text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-brand uppercase tracking-widest text-[11px] text-stone-300">
              Genesis Company
            </span>
            <span className="text-stone-700">·</span>
            <span className="font-editorial italic text-stone-400 text-sm">
              Architecture de Gouvernance Symbiotique
            </span>
          </div>

          <div className="flex items-center gap-3 text-stone-400 text-xs">
            <span>Autorité Souveraine : <strong className="text-stone-200">Miss M</strong></span>
            <span className="text-stone-700">·</span>
            <span>Directoire Commercial Virtuel : <strong className="text-stone-200">Miss Danford</strong></span>
          </div>
        </div>
      </footer>

      {/* Create Mission Modal */}
      <CreateMissionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateMission}
        agents={agents}
        loading={loading}
      />

      {/* Notification Center Drawer / Modal */}
      <NotificationCenter
        notifications={notifications}
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        onMarkRead={handleMarkNotificationRead}
        onAcknowledge={handleAcknowledgeNotification}
        onNavigateTab={setCurrentTab}
      />
    </div>
  );
}

      {/* High-End Architectural Footer */}
      <footer className="border-t border-stone-900/90 bg-[#07080a] py-6 text-xs font-sans text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-brand uppercase tracking-widest text-[11px] text-stone-300">
              Genesis Company
            </span>
            <span className="text-stone-700">·</span>
            <span className="font-editorial italic text-stone-400 text-sm">
              Architecture de Gouvernance Symbiotique
            </span>
          </div>

          <div className="flex items-center gap-3 text-stone-400 text-xs">
            <span>Autorité Souveraine : <strong className="text-stone-200">Miss M</strong></span>
            <span className="text-stone-700">·</span>
            <span>Directoire Commercial Virtuel : <strong className="text-stone-200">Miss Danford</strong></span>
          </div>
        </div>
      </footer>

      {/* Create Mission Modal */}
      <CreateMissionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateMission}
        agents={agents}
        loading={loading}
      />
    </div>
  );
}
