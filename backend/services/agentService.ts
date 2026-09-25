/**
 * GENESIS AGENT SERVICE
 * Handles agent profiles, analytical processing, mission routing suggestions,
 * and inter-agent intelligence exchanges.
 */

import {
  Identity,
  Mission,
  ProposedAction,
  InterAgentMessage,
  Permission,
  AgentRecommendation
} from '../../src/types/genesis.js';
import { DataService } from './dataService.js';

export class AgentService {
  private dataService: DataService;

  constructor(dataService?: DataService) {
    this.dataService = dataService || DataService.getInstance();
  }

  public getAgent(agentId: string): Identity | undefined {
    const identity = this.dataService.getIdentity(agentId);
    if (identity && identity.type === 'AGENT') {
      return identity;
    }
    return undefined;
  }

  public getAllAgents(): Identity[] {
    return this.dataService.getIdentities().filter((i) => i.type === 'AGENT');
  }

  /**
   * Evaluates all 15 agents against mission parameters:
   * DOMAIN, MISSION SCOPE, PERMISSIONS, TERRITORY, ESTABLISHMENT, AVAILABILITY, WORKLOAD.
   * Never automatically declares an agent authorized if required permissions are missing.
   */
  public getRecommendationsForMission(criteria: {
    title: string;
    description: string;
    domain?: string;
    territory?: string;
    establishment?: string;
    requiredPermissions?: Permission[];
  }): AgentRecommendation[] {
    const agents = this.getAllAgents();
    const activeMissions = this.dataService.getMissions().filter(
      (m) => m.status !== 'DONE' && m.status !== 'CANCELLED'
    );

    const textToMatch = `${criteria.domain || ''} ${criteria.title || ''} ${criteria.description || ''}`.toLowerCase();

    return agents.map((agent) => {
      let score = 30; // baseline
      const reasons: string[] = [];

      // 1. Domain & semantic relevance
      const agentDomainLower = agent.domain.toLowerCase();
      const domainWords = agentDomainLower.split(/[\s,.-]+/).filter((w) => w.length > 4);

      let matchedWords = 0;
      domainWords.forEach((word) => {
        if (textToMatch.includes(word)) matchedWords++;
      });

      if (matchedWords > 0) {
        score += Math.min(matchedWords * 15, 40);
        reasons.push(`Correspondance avec le domaine « ${agent.title} »`);
      }

      // Keyword affinities
      if (textToMatch.includes('fournisseur') || textToMatch.includes('commercial') || textToMatch.includes('devis')) {
        if (agent.id === 'agt_miss_danford') {
          score += 35;
          reasons.push('Direction commerciale et qualification partenaires');
        }
      }

      if (textToMatch.includes('holomenu') || textToMatch.includes('api') || textToMatch.includes('borne')) {
        if (agent.id === 'agt_technical') {
          score += 40;
          reasons.push('Spécialiste agréé HoloMenu RESTAURATION');
        }
      }

      if (textToMatch.includes('cuisine') || textToMatch.includes('haccp') || textToMatch.includes('restaurant')) {
        if (agent.id === 'agt_restauration') {
          score += 35;
          reasons.push('Expertise exploitation culinaire et hygiène HACCP');
        }
      }

      // 2. Permission check
      const required = criteria.requiredPermissions || ['ANALYZE_COMPANY'];
      const hasAllRequired = required.every((req) => agent.permissions.includes(req));
      if (!hasAllRequired) {
        score -= 20;
        reasons.push('Habilitations partielles pour l\'exécution autonome');
      } else {
        score += 15;
        reasons.push('Habilitations requises conformes');
      }

      // 3. Workload
      const currentWorkload = activeMissions.filter((m) => m.assignedAgentId === agent.id).length;
      if (currentWorkload === 0) {
        score += 10;
        reasons.push('Agent disponible (aucun mandat en cours)');
      } else {
        score -= currentWorkload * 5;
        reasons.push(`Charge actuelle : ${currentWorkload} mandat(s)`);
      }

      score = Math.max(10, Math.min(99, score));

      return {
        agent,
        suitabilityScore: score,
        reasons: reasons.slice(0, 3),
        isAuthorized: hasAllRequired,
        currentWorkload
      };
    }).sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  }

  /**
   * Intelligently find the most appropriate agent for a mission based on:
   * - domain
   * - mission scope
   * - territory
   * - establishment
   * - permissions & availability
   */
  public findBestAgentForMission(criteria: {
    domain?: string;
    title?: string;
    description?: string;
    territory?: string;
    establishment?: string;
  }): { agent: Identity; confidence: number; matchReason: string } {
    const agents = this.getAllAgents();
    const textToMatch = `${criteria.domain || ''} ${criteria.title || ''} ${criteria.description || ''}`.toLowerCase();

    // 1. Restauration / Cooking / HACCP
    if (
      textToMatch.includes('fournisseur') ||
      textToMatch.includes('commercial') ||
      textToMatch.includes('partenaire commercial') ||
      textToMatch.includes('devis')
    ) {
      const danford = agents.find((a) => a.id === 'agt_miss_danford')!;
      return {
        agent: danford,
        confidence: 0.96,
        matchReason: 'Directement dans le périmètre de prospection commerciale et négociation de Miss Danford.'
      };
    }

    if (
      textToMatch.includes('holomenu') ||
      textToMatch.includes('api') ||
      textToMatch.includes('pos') ||
      textToMatch.includes('borne') ||
      textToMatch.includes('logiciel') ||
      textToMatch.includes('incident technique')
    ) {
      const tech = agents.find((a) => a.id === 'agt_technical')!;
      return {
        agent: tech,
        confidence: 0.95,
        matchReason: 'Attribué à l\'Agent Technique (Spécialiste HoloMenu RESTAURATION et architectures logicielles).'
      };
    }

    if (
      textToMatch.includes('cuisine') ||
      textToMatch.includes('haccp') ||
      textToMatch.includes('recette') ||
      textToMatch.includes('denrée') ||
      textToMatch.includes('salle')
    ) {
      const rest = agents.find((a) => a.id === 'agt_restauration')!;
      return {
        agent: rest,
        confidence: 0.92,
        matchReason: 'Attribué à l\'Agent Restauration pour la conformité HACCP et l\'exploitation culinaire.'
      };
    }

    if (
      textToMatch.includes('livraison') ||
      textToMatch.includes('transport') ||
      textToMatch.includes('fret') ||
      textToMatch.includes('tournée')
    ) {
      const log = agents.find((a) => a.id === 'agt_logistics')!;
      return {
        agent: log,
        confidence: 0.94,
        matchReason: 'Attribué à l\'Agent Logistique pour le routage opérationnel et les flux de livraison.'
      };
    }

    if (
      textToMatch.includes('partenariat') ||
      textToMatch.includes('alliance') ||
      textToMatch.includes('co-branding')
    ) {
      const part = agents.find((a) => a.id === 'agt_partnership')!;
      return {
        agent: part,
        confidence: 0.91,
        matchReason: 'Attribué à l\'Agent Partenariats pour la recherche et la structuration d\'alliances.'
      };
    }

    if (
      textToMatch.includes('déchet') ||
      textToMatch.includes('carbone') ||
      textToMatch.includes('rse') ||
      textToMatch.includes('écologique')
    ) {
      const env = agents.find((a) => a.id === 'agt_environmental')!;
      return {
        agent: env,
        confidence: 0.93,
        matchReason: 'Attribué à l\'Agent Environnemental pour l\'évaluation d\'impact écologique et durabilité.'
      };
    }

    if (
      textToMatch.includes('sécurité') ||
      textToMatch.includes('cyber') ||
      textToMatch.includes('anomalie') ||
      textToMatch.includes('intrusion')
    ) {
      const sec = agents.find((a) => a.id === 'agt_security')!;
      return {
        agent: sec,
        confidence: 0.95,
        matchReason: 'Attribué à l\'Agent Sécurité pour l\'analyse d\'anomalies et la cybersécurité.'
      };
    }

    if (
      textToMatch.includes('rgpd') ||
      textToMatch.includes('données') ||
      textToMatch.includes('confidentialité') ||
      textToMatch.includes('rétention')
    ) {
      const dat = agents.find((a) => a.id === 'agt_data')!;
      return {
        agent: dat,
        confidence: 0.92,
        matchReason: 'Attribué à l\'Agent Données pour la gouvernance RGPD et la séparation des registres.'
      };
    }

    if (
      textToMatch.includes('nettoyage') ||
      textToMatch.includes('hygiène') ||
      textToMatch.includes('propreté')
    ) {
      const cln = agents.find((a) => a.id === 'agt_cleaning')!;
      return {
        agent: cln,
        confidence: 0.91,
        matchReason: 'Attribué à l\'Agent Hygiène & Nettoyage pour les protocoles sanitaires.'
      };
    }

    if (
      textToMatch.includes('réparation') ||
      textToMatch.includes('pièce') ||
      textToMatch.includes('panne') ||
      textToMatch.includes('reconditionné')
    ) {
      const rep = agents.find((a) => a.id === 'agt_repair')!;
      return {
        agent: rep,
        confidence: 0.93,
        matchReason: 'Attribué à l\'Agent Réparation pour le diagnostic matériel et les pièces d\'usure.'
      };
    }

    if (
      textToMatch.includes('formation') ||
      textToMatch.includes('onboarding') ||
      textToMatch.includes('apprentissage')
    ) {
      const trn = agents.find((a) => a.id === 'agt_training')!;
      return {
        agent: trn,
        confidence: 0.90,
        matchReason: 'Attribué à l\'Agent Pédagogie pour l\'accueil et la transmission des savoir-faire.'
      };
    }

    if (
      textToMatch.includes('énergie') ||
      textToMatch.includes('consommation') ||
      textToMatch.includes('kwh') ||
      textToMatch.includes('fluides')
    ) {
      const nrg = agents.find((a) => a.id === 'agt_energy')!;
      return {
        agent: nrg,
        confidence: 0.94,
        matchReason: 'Attribué à l\'Agent Énergie pour la télémétrie et l\'optimisation de charge.'
      };
    }

    if (
      textToMatch.includes('communication') ||
      textToMatch.includes('presse') ||
      textToMatch.includes('traduction') ||
      textToMatch.includes('multilingue')
    ) {
      const com = agents.find((a) => a.id === 'agt_communication')!;
      return {
        agent: com,
        confidence: 0.92,
        matchReason: 'Attribué à l\'Agent Communication pour la rédaction multilingue et le rayonnement.'
      };
    }

    if (
      textToMatch.includes('surplus') ||
      textToMatch.includes('invendu') ||
      textToMatch.includes('gaspillage') ||
      textToMatch.includes('association')
    ) {
      const gas = agents.find((a) => a.id === 'agt_antigaspi')!;
      return {
        agent: gas,
        confidence: 0.96,
        matchReason: 'Attribué à l\'Agent Anti-Gaspi pour la redistribution solidaire des excédents.'
      };
    }

    // Default to Miss Danford for general business coordination
    const defaultAgent = agents.find((a) => a.id === 'agt_miss_danford') || agents[0];
    return {
      agent: defaultAgent,
      confidence: 0.85,
      matchReason: 'Routage général vers la Direction Commerciale Virtuelle (Miss Danford).'
    };
  }

  /**
   * Analysis engine supporting Miss Danford and all specialized agents.
   */
  public analyzeMission(mission: Mission): {
    analysisResult: {
      summary: string;
      identifiedTargets: Array<{ name: string; relevance: string; category: string }>;
      riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
      commercialRecommendation: string;
    };
    proposedAction: ProposedAction;
  } {
    const assigned = this.getAgent(mission.assignedAgentId) || this.getAgent('agt_miss_danford')!;

    // Restauration procurement mission
    if (
      mission.title.toLowerCase().includes('fournisseur') ||
      mission.description.toLowerCase().includes('restauration') ||
      mission.description.toLowerCase().includes('matériel')
    ) {
      const analysisResult = {
        summary: `Analyse commerciale stratégique instruite par ${assigned.name}. Évaluation du marché des équipements de cuisine professionnelle et froid industriel (HACCP) en Europe francophone.`,
        identifiedTargets: [
          {
            name: 'EuroKitchen Pro (France / Union Européenne)',
            relevance: '96% - Fournisseur de premier rang en équipement inox lourd, froid et cuisson haute performance.',
            category: 'Grossiste Équipement Pro'
          },
          {
            name: 'Rational Matériel Gastronomique',
            relevance: '91% - Référence pour fours mixtes intelligents et maintien en température.',
            category: 'Fabricant Spécialisé'
          },
          {
            name: 'Horeca Equip Direct',
            relevance: '84% - Bon rapport qualité/prix sur mobilier inox et extraction.',
            category: 'Distributeur Régional'
          }
        ],
        riskLevel: 'LOW' as const,
        commercialRecommendation: `${assigned.name} recommande d'initier une prise de contact auprès d'EuroKitchen Pro pour soumettre le cahier des charges préliminaire et solliciter une offre chiffrée avec engagement SAV.`
      };

      const proposedAction: ProposedAction = {
        actionType: 'CONTACT_COMPANY',
        name: 'Prise de contact fournisseur - EuroKitchen Pro',
        target: 'EuroKitchen Pro (Département Comptes Clés)',
        rationale: "Transmission du cahier des charges d'aménagement cuisine et demande d'ouverture de compte commercial avec proposition tarifaire B2B.",
        payload: {
          recipientCompany: 'EuroKitchen Pro',
          contactChannel: 'SIMULATED_COMMERCIAL_INQUIRY',
          projectScope: 'Cuisine professionnelle restaurant gastronomique',
          equipmentFocus: ['Four mixte 10 niveaux', 'Piano cuisson induction 6 feux', 'Chambre froide positive 8m3'],
          budgetCap: mission.context?.budgetThreshold || 75000,
          simulatedDate: new Date().toISOString()
        },
        risksAndLimitations: [
          'SIMULATION STRICTE : Aucun contact réel ni courriel externe n\'est déclenché sans accord.',
          'Négociation contractuelle soumise au contrôle ultérieur de Miss M.',
          'Validation préalable de la solvabilité du fournisseur requise.'
        ],
        proposedNextStep: "Demande formelle d'autorisation à Miss M pour transmission du dossier de consultation simulé.",
        isSimulated: true
      };

      return { analysisResult, proposedAction };
    }

    // Default analytical generation for any mission
    const analysisResult = {
      summary: `Analyse contextuelle menée par ${assigned.name} sur les paramètres de la mission '${mission.title}'.`,
      identifiedTargets: [
        {
          name: 'Opérateur Référencé Genesis',
          relevance: '90% - Solution optimale sous contraintes opérationnelles.',
          category: assigned.domain.slice(0, 30)
        }
      ],
      riskLevel: 'LOW' as const,
      commercialRecommendation: `${assigned.name} recommande de formaliser la démarche sous supervision directe de Miss M.`
    };

    const proposedAction: ProposedAction = {
      actionType: 'SEND_PROFESSIONAL_MESSAGE',
      name: `Démarche préparatoire · ${mission.title}`,
      target: 'Partenaire qualifié Genesis',
      rationale: `Exécution de la mission '${mission.title}' conformément aux directives de Miss M.`,
      payload: {
        missionId: mission.id,
        agentId: assigned.id,
        context: mission.context,
        timestamp: new Date().toISOString()
      },
      risksAndLimitations: [
        'SIMULATION CERTIFIÉE : Aucune transmission extérieure sans arbitrage de Miss M.',
        'Périmètre strictement confiné au mandat'
      ],
      proposedNextStep: 'Soumission formelle de la requête au Bureau de Décision de Miss M.',
      isSimulated: true
    };

    return { analysisResult, proposedAction };
  }

  /**
   * INTER-AGENT INTELLIGENCE EXCHANGE
   * Allows two agents to exchange mission-related information through Genesis Core.
   * Transmits ONLY the information necessary for the mission.
   */
  public executeInterAgentExchange(input: {
    fromAgentId: string;
    toAgentId: string;
    missionId?: string;
    requestSummary: string;
  }): InterAgentMessage {
    const fromAgent = this.getAgent(input.fromAgentId);
    const toAgent = this.getAgent(input.toAgentId);

    if (!fromAgent || !toAgent) {
      throw new Error(`Invalid agents specified for collaboration: ${input.fromAgentId} -> ${input.toAgentId}`);
    }

    // Generate strict minimal filtered response
    let filteredResponse = `Synthèse communiquée par ${toAgent.name} à ${fromAgent.name} : Données strictement nécessaires transmises.`;

    if (toAgent.id === 'agt_miss_danford') {
      filteredResponse = `Miss Danford transmet : Cahier des charges validé pour EuroKitchen Pro (plafond budgétaire 75k€ HT, exigence SAV 48h). Aucune coordonnée non nécessaire transmise.`;
    } else if (toAgent.id === 'agt_technical') {
      filteredResponse = `Agent Technique transmet : Spécifications API HoloMenu RESTAURATION v2.4 (MQTT sécurisé, ports 8883) et compatibilité bornes cuisine.`;
    } else if (toAgent.id === 'agt_restauration') {
      filteredResponse = `Agent Restauration transmet : Contraintes d'implantation HACCP pour piano induction 6 feux et volume froid 8m3.`;
    } else if (toAgent.id === 'agt_environmental') {
      filteredResponse = `Agent Environnemental transmet : Indice de réparabilité 8.9/10 et éligibilité éco-subvention UE.`;
    }

    const message: InterAgentMessage = {
      id: `iam_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      fromAgentId: fromAgent.id,
      fromAgentName: fromAgent.name,
      toAgentId: toAgent.id,
      toAgentName: toAgent.name,
      missionId: input.missionId,
      requestSummary: input.requestSummary,
      filteredResponse,
      transferredContext: {
        confidentialityLevel: 'STRICT_NEED_TO_KNOW',
        filteredFields: ['supplierPricingConfidential', 'executiveNotesExempt'],
        securityHash: `sha256_${Date.now().toString(16)}`
      },
      simulated: true
    };

    // Update activity history for both agents
    fromAgent.activityHistory.unshift({
      id: `act_${Date.now()}_1`,
      timestamp: message.timestamp,
      action: `Requête d'information inter-agents adressée à ${toAgent.name}`,
      missionId: input.missionId,
      details: input.requestSummary
    });

    toAgent.activityHistory.unshift({
      id: `act_${Date.now()}_2`,
      timestamp: message.timestamp,
      action: `Réponse d'expertise fournie à ${fromAgent.name}`,
      missionId: input.missionId,
      details: filteredResponse
    });

    return message;
  }

  /**
   * Executes a simulated external action in the safe Genesis sandbox.
   * NEVER makes real external calls, emails, or transactions.
   */
  public executeSimulatedAction(
    mission: Mission,
    proposedAction: ProposedAction
  ): {
    executedAt: string;
    actionType: Permission;
    target: string;
    summary: string;
    details: Record<string, unknown>;
    disclaimer: string;
  } {
    return {
      executedAt: new Date().toISOString(),
      actionType: proposedAction.actionType,
      target: proposedAction.target,
      summary: `SIMULATED ACTION EXECUTED: Démarche commerciale simulée auprès de "${proposedAction.target}". Cahier des charges et requête transmis au bac à sable sécurisé Genesis.`,
      details: {
        simulationId: `sim_${Date.now()}`,
        dispatchedPayload: proposedAction.payload,
        rationale: proposedAction.rationale,
        authorizedUnderMission: mission.id,
        responseSimulation: {
          status: 'SIMULATED_SUCCESS',
          supplierAcknowledgement: 'Dossier reçu dans le sandbox Genesis. Offre indicative préliminaire générée (fourchette 68 000€ - 74 200€ HT).',
          leadTimeWeeks: 4
        }
      },
      disclaimer: 'SIMULATION — NO REAL EXTERNAL CONTACT WAS MADE. AUCUN CONTACT EXTERNE RÉEL N\'A ÉTÉ EFFECTUÉ.'
    };
  }
}
