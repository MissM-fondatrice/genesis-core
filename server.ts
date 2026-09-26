/**
 * GENESIS CORE v0.1 - Backend Entry Point
 * Full-stack Express server with Vite middleware integration.
 */

import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GenesisCore } from './backend/core/genesisCore.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function bootstrap() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  const core = GenesisCore.getInstance();

  // =========================================================================
  // API ROUTES
  // =========================================================================

  // Core Status & Governance
  app.get('/api/core/status', (_req: Request, res: Response) => {
    res.json(core.getStatus());
  });

  // Reset to initial baseline demonstration state
  app.post('/api/core/reset', (_req: Request, res: Response) => {
    core.resetSystem();
    res.json({ message: 'Genesis Core reset to baseline state.', status: core.getStatus() });
  });

  // Identities & Agents
  app.get('/api/identities', (_req: Request, res: Response) => {
    res.json(core.identityService.getAllIdentities());
  });

  app.get('/api/agents', (_req: Request, res: Response) => {
    res.json(core.agentService.getAllAgents());
  });

  app.get('/api/agents/:id', (req: Request, res: Response) => {
    const agent = core.agentService.getAgent(req.params.id);
    if (!agent) {
      res.status(404).json({ error: 'Agent not found.' });
      return;
    }
    res.json(agent);
  });

  // Modify agent permissions by Miss M
  app.post('/api/agents/:id/permissions', (req: Request, res: Response) => {
    try {
      const { permission, status, scope, callerId } = req.body;
      if (!permission || !status) {
        res.status(400).json({ error: 'permission and status are required.' });
        return;
      }
      const updatedAgent = core.modifyAgentPermission(
        req.params.id,
        permission,
        status,
        scope || 'Périmètre défini par Miss M',
        callerId || 'usr_miss_m'
      );
      res.json(updatedAgent);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(403).json({ error: msg });
    }
  });

  // Inter-agent intelligence exchange
  app.post('/api/agents/collaborate', (req: Request, res: Response) => {
    try {
      const { fromAgentId, toAgentId, missionId, requestSummary } = req.body;
      if (!fromAgentId || !toAgentId || !requestSummary) {
        res.status(400).json({ error: 'fromAgentId, toAgentId and requestSummary are required.' });
        return;
      }

      const result = core.collaborateInterAgent({
        fromAgentId,
        toAgentId,
        missionId,
        requestSummary
      });

      res.json(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(400).json({ error: msg });
    }
  });

  // Constitutional Test Suite (10 general rules)
  app.get('/api/tests/status', (_req: Request, res: Response) => {
    import('./backend/tests/genesisAgentTests.js').then(({ runGenesisAgentTests }) => {
      const report = runGenesisAgentTests(core);
      res.json(report);
    });
  });

  app.post('/api/tests/run', (_req: Request, res: Response) => {
    import('./backend/tests/genesisAgentTests.js').then(({ runGenesisAgentTests }) => {
      const report = runGenesisAgentTests(core);
      res.json(report);
    });
  });

  // GENESIS AI PROVIDER GATEWAY v0.1 — dedicated test suite
  app.get('/api/tests/ai-gateway', async (_req: Request, res: Response) => {
    try {
      const { runAIGatewayTests, runAIGatewayAsyncTests } = await import('./backend/tests/aiGatewayTests.js');
      const syncReport = runAIGatewayTests(core);
      const asyncReport = await runAIGatewayAsyncTests(core);
      res.json({
        syncReport,
        asyncReport,
        allPassed: syncReport.allPassed && asyncReport.allPassed
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: msg });
    }
  });

  // Scenario Test Runner (Scenarios 1 through 6)
  app.get('/api/scenarios', (_req: Request, res: Response) => {
    try {
      const scenarios = core.runAllScenarios();
      res.json(scenarios);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: msg });
    }
  });

  app.post('/api/scenarios/run/:id', (req: Request, res: Response) => {
    try {
      const scenarioId = Number(req.params.id);
      const result = core.runScenario(scenarioId);
      res.json(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(400).json({ error: msg });
    }
  });

  // Notification Center
  app.get('/api/notifications', (_req: Request, res: Response) => {
    res.json(core.getNotifications());
  });

  app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
    const success = core.markNotificationRead(req.params.id);
    res.json({ success });
  });

  app.post('/api/notifications/:id/acknowledge', (req: Request, res: Response) => {
    const success = core.acknowledgeNotification(req.params.id);
    res.json({ success });
  });

  // Multi-criteria agent recommendations for a mission
  app.post('/api/missions/recommend-agent', (req: Request, res: Response) => {
    try {
      const { title, description, domain, territory, establishment, requiredPermissions } = req.body;
      const recommendations = core.getRecommendationsForMission({
        title: title || '',
        description: description || '',
        domain,
        territory,
        establishment,
        requiredPermissions
      });
      res.json(recommendations);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(400).json({ error: msg });
    }
  });

  // Missions
  app.get('/api/missions', (_req: Request, res: Response) => {
    res.json(core.missionService.getAllMissions());
  });

  app.post('/api/missions', (req: Request, res: Response) => {
    try {
      const { title, description, priority, deadline, context, assignedAgentId } = req.body;
      if (!title || !description) {
        res.status(400).json({ error: 'Title and description are required.' });
        return;
      }

      const mission = core.createMission({
        title,
        description,
        creatorId: 'usr_miss_m',
        assignedAgentId,
        priority,
        deadline,
        context
      });

      res.status(201).json(mission);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(400).json({ error: msg });
    }
  });

  app.get('/api/missions/:id', (req: Request, res: Response) => {
    const mission = core.missionService.getMissionById(req.params.id);
    if (!mission) {
      res.status(404).json({ error: 'Mission not found.' });
      return;
    }
    res.json(mission);
  });

  app.post('/api/missions/:id/assign', (req: Request, res: Response) => {
    try {
      const { agentId } = req.body;
      if (!agentId) {
        res.status(400).json({ error: 'agentId is required.' });
        return;
      }
      const mission = core.assignMission(req.params.id, agentId);
      res.json(mission);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(400).json({ error: msg });
    }
  });

  app.post('/api/missions/:id/route', (req: Request, res: Response) => {
    try {
      const result = core.routeMission(req.params.id);
      res.json(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(400).json({ error: msg });
    }
  });

  // Step 3 & 4: Trigger Agent Analysis & Proposal & Permission Check
  app.post('/api/missions/:id/analyze', async (req: Request, res: Response) => {
    try {
      const result = await core.processMissionAnalysis(req.params.id);
      res.json(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(400).json({ error: msg });
    }
  });

  app.post('/api/missions/:id/suspend', (req: Request, res: Response) => {
    try {
      const { reason } = req.body;
      const mission = core.suspendMission(req.params.id, reason || 'Mission suspended by Miss M');
      res.json(mission);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(400).json({ error: msg });
    }
  });

  app.post('/api/missions/:id/cancel', (req: Request, res: Response) => {
    try {
      const { reason } = req.body;
      const mission = core.cancelMission(req.params.id, reason || 'Mission cancelled by Miss M');
      res.json(mission);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(400).json({ error: msg });
    }
  });

  // Validations Queue
  app.get('/api/validations', (req: Request, res: Response) => {
    const status = req.query.status as string;
    if (status === 'PENDING') {
      res.json(core.validationService.getPendingValidations());
    } else {
      res.json(core.validationService.getAllValidations());
    }
  });

  app.post('/api/validations/:id/decide', (req: Request, res: Response) => {
    try {
      const { decision, note } = req.body;
      if (!decision || !['AUTHORIZE', 'REFUSE', 'REQUEST_MORE_INFO', 'SUSPEND'].includes(decision)) {
        res.status(400).json({ error: 'Valid decision (AUTHORIZE, REFUSE, REQUEST_MORE_INFO, SUSPEND) is required.' });
        return;
      }

      const result = core.processHumanDecision(req.params.id, decision, note);
      res.json(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(400).json({ error: msg });
    }
  });

  // AI Provider Gateway — key-free status listing for Miss M (section 21)
  app.get('/api/ai/providers', (_req: Request, res: Response) => {
    res.json(core.getAIProvidersStatus());
  });

  // Audit Events
  app.get('/api/events', (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 100;
    const missionId = req.query.missionId as string;
    if (missionId) {
      res.json(core.auditService.getHistoryForMission(missionId));
    } else {
      res.json(core.auditService.getHistory(limit));
    }
  });

  // Demo step runner endpoint for the 11-step sequence
  app.post('/api/demo/run-step', async (req: Request, res: Response) => {
    try {
      const { step, missionId } = req.body;
      const targetMissionId = missionId || 'msn_demo_restauration_01';
      let mission = core.missionService.getMissionById(targetMissionId);

      if (!mission) {
        res.status(404).json({ error: 'Demo mission not found. Reset the core first.' });
        return;
      }

      switch (step) {
        case 2: // Assign
          mission = core.assignMission(targetMissionId, 'agt_miss_danford');
          res.json({ step: 2, mission, message: 'Assigned to Miss Danford' });
          break;
        case 3: // Analyze + Propose + Permission check
          const analysisRes = await core.processMissionAnalysis(targetMissionId);
          res.json({
            step: 3,
            mission: analysisRes.mission,
            validationRequest: analysisRes.validationRequest,
            message: 'Analysis completed, proposal formulated, human validation requested'
          });
          break;
        case 7: // Miss M approves
          if (!mission.validationRequestId) {
            res.status(400).json({ error: 'No validation request currently attached to mission.' });
            return;
          }
          const decisionRes = core.processHumanDecision(
            mission.validationRequestId,
            'AUTHORIZE',
            'Autorisation accordée par Miss M pour consultation fournisseur simulée.'
          );
          res.json({
            step: 7,
            validation: decisionRes.validation,
            mission: decisionRes.mission,
            executionResult: decisionRes.executionResult,
            message: 'Miss M authorized action. Simulated action executed and recorded.'
          });
          break;
        default:
          res.status(400).json({ error: `Unsupported demo step: ${step}` });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(400).json({ error: msg });
    }
  });

  // =========================================================================
  // FRONTEND INTEGRATION
  // =========================================================================
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[GENESIS CORE v0.1] Orchestration Server active on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('[GENESIS CORE] Bootstrap failed:', err);
  process.exit(1);
});
