/**
 * GENESIS IDENTITY SERVICE
 * Manages human and agent identities, roles, authorities, and constitutional boundaries.
 */

import { Identity } from '../../src/types/genesis.js';
import { DataService } from './dataService.js';

export class IdentityService {
  private dataService: DataService;

  constructor(dataService?: DataService) {
    this.dataService = dataService || DataService.getInstance();
  }

  public getAllIdentities(): Identity[] {
    return this.dataService.getIdentities();
  }

  public getAgents(): Identity[] {
    return this.dataService.getIdentities().filter((i) => i.type === 'AGENT');
  }

  public getIdentityById(id: string): Identity | undefined {
    return this.dataService.getIdentity(id);
  }

  public getPrimaryHuman(): Identity {
    const missM = this.dataService.getIdentity('usr_miss_m');
    if (!missM) {
      throw new Error('FATAL: Primary Human Authority (Miss M) not found in Genesis registry.');
    }
    return missM;
  }

  public getPrimaryAgent(): Identity {
    const missDanford = this.dataService.getIdentity('agt_miss_danford');
    if (!missDanford) {
      throw new Error('FATAL: Virtual Commercial Director (Miss Danford) not found in Genesis registry.');
    }
    return missDanford;
  }

  /**
   * Constitutional Identity Integrity Checks:
   * Rule 1: An agent can never assume Miss M's identity or authority.
   * Rule 2: An agent can never alter constitutional laws or self-elevate permissions.
   */
  public verifyIdentityIntegrity(actorId: string, attemptedRole: string): { valid: boolean; violation?: string } {
    const actor = this.dataService.getIdentity(actorId);
    if (!actor) {
      return { valid: false, violation: `Unknown identity identifier: ${actorId}` };
    }

    if (actor.type === 'AGENT' && (attemptedRole === 'FOUNDER' || attemptedRole === 'FINAL_HUMAN_AUTHORITY')) {
      return {
        valid: false,
        violation: `CONSTITUTIONAL BREACH: Agent ${actor.name} attempted to assume Human Authority (${attemptedRole}).`
      };
    }

    return { valid: true };
  }
}
