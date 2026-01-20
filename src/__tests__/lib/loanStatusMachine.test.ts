import { describe, it, expect } from 'vitest';
import {
  LOAN_STATUS_DEFINITIONS,
  VALID_TRANSITIONS,
  isValidTransition,
  getAllowedTransitions,
  getStatusDefinition,
  isTerminalStatus,
  getTransitionBlockReason,
} from '@/lib/loanStatusMachine';

describe('loanStatusMachine', () => {
  describe('LOAN_STATUS_DEFINITIONS', () => {
    it('should have 8 status definitions', () => {
      expect(LOAN_STATUS_DEFINITIONS).toHaveLength(8);
    });

    it('should have all required properties for each status', () => {
      LOAN_STATUS_DEFINITIONS.forEach((status) => {
        expect(status).toHaveProperty('value');
        expect(status).toHaveProperty('label');
        expect(status).toHaveProperty('color');
        expect(status).toHaveProperty('icon');
        expect(status).toHaveProperty('description');
      });
    });

    it('should include all expected statuses', () => {
      const values = LOAN_STATUS_DEFINITIONS.map(s => s.value);
      expect(values).toContain('pending');
      expect(values).toContain('documents_required');
      expect(values).toContain('under_review');
      expect(values).toContain('processing');
      expect(values).toContain('offer_issued');
      expect(values).toContain('approved');
      expect(values).toContain('rejected');
      expect(values).toContain('funded');
    });
  });

  describe('isValidTransition', () => {
    it('should allow transition from pending to documents_required', () => {
      expect(isValidTransition('pending', 'documents_required')).toBe(true);
    });

    it('should allow transition from pending to under_review', () => {
      expect(isValidTransition('pending', 'under_review')).toBe(true);
    });

    it('should allow transition from pending to rejected', () => {
      expect(isValidTransition('pending', 'rejected')).toBe(true);
    });

    it('should NOT allow transition from pending to approved', () => {
      expect(isValidTransition('pending', 'approved')).toBe(false);
    });

    it('should NOT allow transition from pending to funded', () => {
      expect(isValidTransition('pending', 'funded')).toBe(false);
    });

    it('should allow transition from approved to funded', () => {
      expect(isValidTransition('approved', 'funded')).toBe(true);
    });

    it('should NOT allow transition from funded to anything', () => {
      expect(isValidTransition('funded', 'pending')).toBe(false);
      expect(isValidTransition('funded', 'approved')).toBe(false);
      expect(isValidTransition('funded', 'rejected')).toBe(false);
    });

    it('should NOT allow transition from rejected to anything', () => {
      expect(isValidTransition('rejected', 'pending')).toBe(false);
      expect(isValidTransition('rejected', 'approved')).toBe(false);
    });

    it('should allow same status (no change)', () => {
      expect(isValidTransition('pending', 'pending')).toBe(true);
      expect(isValidTransition('approved', 'approved')).toBe(true);
      expect(isValidTransition('funded', 'funded')).toBe(true);
    });

    it('should handle null current status', () => {
      expect(isValidTransition(null, 'pending')).toBe(true);
      expect(isValidTransition(null, 'documents_required')).toBe(true);
      expect(isValidTransition(null, 'funded')).toBe(false);
    });

    it('should NOT allow backwards transitions (funded to approved)', () => {
      expect(isValidTransition('funded', 'approved')).toBe(false);
    });

    it('should NOT allow skipping steps (pending to funded)', () => {
      expect(isValidTransition('pending', 'funded')).toBe(false);
    });

    it('should allow offer_issued to approved after 10-day period', () => {
      expect(isValidTransition('offer_issued', 'approved')).toBe(true);
    });

    it('should allow offer_issued to rejected if client declines', () => {
      expect(isValidTransition('offer_issued', 'rejected')).toBe(true);
    });
  });

  describe('getAllowedTransitions', () => {
    it('should return correct transitions for pending', () => {
      const allowed = getAllowedTransitions('pending');
      expect(allowed).toContain('documents_required');
      expect(allowed).toContain('under_review');
      expect(allowed).toContain('rejected');
      expect(allowed).not.toContain('approved');
      expect(allowed).not.toContain('funded');
    });

    it('should return empty array for terminal states', () => {
      expect(getAllowedTransitions('rejected')).toHaveLength(0);
      expect(getAllowedTransitions('funded')).toHaveLength(0);
    });

    it('should return pending and documents_required for null status', () => {
      const allowed = getAllowedTransitions(null);
      expect(allowed).toContain('pending');
      expect(allowed).toContain('documents_required');
    });

    it('should return only funded for approved status', () => {
      const allowed = getAllowedTransitions('approved');
      expect(allowed).toContain('funded');
      expect(allowed).toContain('rejected');
      expect(allowed).toHaveLength(2);
    });
  });

  describe('getStatusDefinition', () => {
    it('should return correct definition for valid status', () => {
      const def = getStatusDefinition('pending');
      expect(def).toBeDefined();
      expect(def?.label).toBe('En attente');
      expect(def?.icon).toBe('⏳');
    });

    it('should return undefined for invalid status', () => {
      expect(getStatusDefinition('invalid_status')).toBeUndefined();
    });

    it('should return correct definition for funded', () => {
      const def = getStatusDefinition('funded');
      expect(def?.label).toBe('Financé');
      expect(def?.color).toBe('#059669');
    });
  });

  describe('isTerminalStatus', () => {
    it('should return true for rejected', () => {
      expect(isTerminalStatus('rejected')).toBe(true);
    });

    it('should return true for funded', () => {
      expect(isTerminalStatus('funded')).toBe(true);
    });

    it('should return false for pending', () => {
      expect(isTerminalStatus('pending')).toBe(false);
    });

    it('should return false for approved', () => {
      expect(isTerminalStatus('approved')).toBe(false);
    });

    it('should return false for processing', () => {
      expect(isTerminalStatus('processing')).toBe(false);
    });
  });

  describe('getTransitionBlockReason', () => {
    it('should explain why funded cannot transition', () => {
      const reason = getTransitionBlockReason('funded', 'pending');
      expect(reason).toContain('Financé');
      expect(reason).toContain('ne peut plus être modifié');
    });

    it('should explain why rejected cannot transition', () => {
      const reason = getTransitionBlockReason('rejected', 'approved');
      expect(reason).toContain('Rejeté');
      expect(reason).toContain('ne peut plus être modifié');
    });

    it('should list allowed transitions for invalid request', () => {
      const reason = getTransitionBlockReason('pending', 'funded');
      expect(reason).toContain('non autorisée');
      expect(reason).toContain('Transitions possibles');
    });
  });

  describe('VALID_TRANSITIONS completeness', () => {
    it('should have transitions defined for all statuses', () => {
      const allStatuses = LOAN_STATUS_DEFINITIONS.map(s => s.value);
      allStatuses.forEach((status) => {
        expect(VALID_TRANSITIONS).toHaveProperty(status);
      });
    });

    it('should only reference valid statuses in transitions', () => {
      const allStatuses = LOAN_STATUS_DEFINITIONS.map(s => s.value);
      Object.values(VALID_TRANSITIONS).forEach((transitions) => {
        transitions.forEach((t) => {
          expect(allStatuses).toContain(t);
        });
      });
    });
  });
});
