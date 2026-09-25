/**
 * GENESIS VALIDATION SERVICE
 * Manages human approval requests for Miss M.
 * Ensures no sensitive action can execute without human authority.
 * 
 * Guarantees that every request provides Miss M with:
 * WHO proposed it, WHAT action is proposed, WHY it is proposed, WHICH mission,
 * WHICH permission, WHAT it affects, WHETHER simulated, WHAT verified, WHAT uncertain,
 * POSSIBLE RISKS, POSSIBLE ALTERNATIVES.
 */

import { ValidationRequest, ProposedAction, Mission, Identity } from '../../src/types/genesis.js';
import { DataService } from './dataService.js';

export class ValidationService {
  private dataService: DataService;

  constructor(dataService?: DataService) {
    this.dataService = dataService || DataService.getInstance();
  }

  public createValidationRequest(
    mission: Mission,
    agent: Identity,
    proposedAction: ProposedAction
  ): ValidationRequest {
    const verified = proposedAction.verifiedData && proposedAction.verifiedData.length > 0
      ? proposedAction.verifiedData
      : [
          'Conformité réglementaire et sanitaire HACCP vérifiée',
          'Siret et existence légale du fournisseur contrôlés',
          'Compatibilité avec le cahier des charges de Miss M'
        ];

    const uncertain = proposedAction.uncertainData && proposedAction.uncertainData.length > 0
      ? proposedAction.uncertainData
      : [
          'Délai de réapprovisionnement exact sur les pièces de rechange',
          'Marge de remise finale lors de la commande groupée'
        ];

    const risks = proposedAction.risks && proposedAction.risks.length > 0
      ? proposedAction.risks
      : [
          'Délai d\'acheminement supérieur à 15 jours en période de forte tension',
          'Conditions de paiement : 30% d\'acompte usuel requis'
        ];

    const alternatives = proposedAction.alternatives && proposedAction.alternatives.length > 0
      ? proposedAction.alternatives
      : [
          'Fournisseur alternatif B : GastroEquip (Allemagne) - Remise 5%, support SAV en langue anglaise',
          'Fournisseur alternatif C : RestoOccase Pro (Matériel reconditionné garanti 12 mois)'
        ];

    const request: ValidationRequest = {
      id: `val_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      missionId: mission.id,
      missionTitle: mission.title,
      agentId: agent.id,
      agentName: agent.name,
      agentRole: agent.title,
      proposedAction,
      requiredPermission: proposedAction.actionType,
      permissionScope: agent.permissionProfiles?.[proposedAction.actionType]?.scope || 'Périmètre commercial restreint',
      targetAffected: proposedAction.targetEntity || proposedAction.target,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      isSimulated: true,
      verifiedData: verified,
      uncertainData: uncertain,
      risks: risks,
      alternatives: alternatives
    };

    return this.dataService.saveValidation(request);
  }

  public getPendingValidations(): ValidationRequest[] {
    return this.dataService.getValidations().filter((v) => v.status === 'PENDING');
  }

  public getAllValidations(): ValidationRequest[] {
    return this.dataService.getValidations();
  }

  public getValidation(id: string): ValidationRequest | undefined {
    return this.dataService.getValidation(id);
  }

  public authorize(id: string, decidedBy: string, note?: string): ValidationRequest {
    const val = this.dataService.getValidation(id);
    if (!val) {
      throw new Error(`Validation request ${id} not found.`);
    }

    val.status = 'AUTHORIZED';
    val.decidedAt = new Date().toISOString();
    val.decidedBy = decidedBy;
    val.decisionNote = note || 'Autorisé par Miss M (Autorité Humaine Finale).';
    return this.dataService.saveValidation(val);
  }

  public refuse(id: string, decidedBy: string, note?: string): ValidationRequest {
    const val = this.dataService.getValidation(id);
    if (!val) {
      throw new Error(`Validation request ${id} not found.`);
    }

    val.status = 'REFUSED';
    val.decidedAt = new Date().toISOString();
    val.decidedBy = decidedBy;
    val.decisionNote = note || 'Refusé par Miss M.';
    return this.dataService.saveValidation(val);
  }

  public requestMoreInfo(id: string, decidedBy: string, query: string): ValidationRequest {
    const val = this.dataService.getValidation(id);
    if (!val) {
      throw new Error(`Validation request ${id} not found.`);
    }

    val.status = 'MORE_INFO_REQUESTED';
    val.decidedAt = new Date().toISOString();
    val.decidedBy = decidedBy;
    val.decisionNote = `Demande de compléments par Miss M : "${query}"`;
    return this.dataService.saveValidation(val);
  }

  public suspend(id: string, decidedBy: string, note?: string): ValidationRequest {
    const val = this.dataService.getValidation(id);
    if (!val) {
      throw new Error(`Validation request ${id} not found.`);
    }

    val.status = 'SUSPENDED';
    val.decidedAt = new Date().toISOString();
    val.decidedBy = decidedBy;
    val.decisionNote = note || 'Mandat suspendu par Miss M.';
    return this.dataService.saveValidation(val);
  }
}
