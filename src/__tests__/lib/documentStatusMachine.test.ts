import { describe, it, expect } from 'vitest';
import {
  DOCUMENT_STATUS_DEFINITIONS,
  VALID_DOCUMENT_TRANSITIONS,
  isValidDocumentTransition,
  getAllowedDocumentTransitions,
  getDocumentStatusDefinition,
  isDocumentTerminalStatus,
  canReplaceDocument,
  getDocumentTransitionBlockReason,
  getDocumentActionText,
} from '@/lib/documentStatusMachine';

describe('documentStatusMachine', () => {
  describe('DOCUMENT_STATUS_DEFINITIONS', () => {
    it('should have 5 status definitions', () => {
      expect(DOCUMENT_STATUS_DEFINITIONS).toHaveLength(5);
    });

    it('should have all required properties for each status', () => {
      DOCUMENT_STATUS_DEFINITIONS.forEach((status) => {
        expect(status).toHaveProperty('value');
        expect(status).toHaveProperty('label');
        expect(status).toHaveProperty('color');
        expect(status).toHaveProperty('icon');
        expect(status).toHaveProperty('description');
      });
    });

    it('should include all expected statuses', () => {
      const values = DOCUMENT_STATUS_DEFINITIONS.map(s => s.value);
      expect(values).toContain('pending');
      expect(values).toContain('received');
      expect(values).toContain('under_review');
      expect(values).toContain('validated');
      expect(values).toContain('rejected');
    });
  });

  describe('isValidDocumentTransition', () => {
    it('should allow transition from pending to received', () => {
      expect(isValidDocumentTransition('pending', 'received')).toBe(true);
    });

    it('should NOT allow transition from pending to validated directly', () => {
      expect(isValidDocumentTransition('pending', 'validated')).toBe(false);
    });

    it('should allow transition from received to validated', () => {
      expect(isValidDocumentTransition('received', 'validated')).toBe(true);
    });

    it('should allow transition from received to rejected', () => {
      expect(isValidDocumentTransition('received', 'rejected')).toBe(true);
    });

    it('should allow transition from received to under_review', () => {
      expect(isValidDocumentTransition('received', 'under_review')).toBe(true);
    });

    it('should NOT allow transition from validated to anything', () => {
      expect(isValidDocumentTransition('validated', 'pending')).toBe(false);
      expect(isValidDocumentTransition('validated', 'rejected')).toBe(false);
      expect(isValidDocumentTransition('validated', 'received')).toBe(false);
    });

    it('should allow transition from rejected back to received (replacement)', () => {
      expect(isValidDocumentTransition('rejected', 'received')).toBe(true);
    });

    it('should allow transition from rejected back to pending', () => {
      expect(isValidDocumentTransition('rejected', 'pending')).toBe(true);
    });

    it('should allow same status (no change)', () => {
      expect(isValidDocumentTransition('pending', 'pending')).toBe(true);
      expect(isValidDocumentTransition('validated', 'validated')).toBe(true);
    });

    it('should handle null current status', () => {
      expect(isValidDocumentTransition(null, 'pending')).toBe(true);
      expect(isValidDocumentTransition(null, 'received')).toBe(true);
      expect(isValidDocumentTransition(null, 'validated')).toBe(false);
    });

    it('should allow under_review to validated', () => {
      expect(isValidDocumentTransition('under_review', 'validated')).toBe(true);
    });

    it('should allow under_review to rejected', () => {
      expect(isValidDocumentTransition('under_review', 'rejected')).toBe(true);
    });
  });

  describe('getAllowedDocumentTransitions', () => {
    it('should return only received for pending', () => {
      const allowed = getAllowedDocumentTransitions('pending');
      expect(allowed).toContain('received');
      expect(allowed).toHaveLength(1);
    });

    it('should return multiple options for received', () => {
      const allowed = getAllowedDocumentTransitions('received');
      expect(allowed).toContain('under_review');
      expect(allowed).toContain('validated');
      expect(allowed).toContain('rejected');
      expect(allowed).toHaveLength(3);
    });

    it('should return empty array for validated (terminal)', () => {
      expect(getAllowedDocumentTransitions('validated')).toHaveLength(0);
    });

    it('should return received and pending for rejected', () => {
      const allowed = getAllowedDocumentTransitions('rejected');
      expect(allowed).toContain('received');
      expect(allowed).toContain('pending');
    });

    it('should return pending and received for null status', () => {
      const allowed = getAllowedDocumentTransitions(null);
      expect(allowed).toContain('pending');
      expect(allowed).toContain('received');
    });
  });

  describe('getDocumentStatusDefinition', () => {
    it('should return correct definition for valid status', () => {
      const def = getDocumentStatusDefinition('pending');
      expect(def).toBeDefined();
      expect(def?.label).toBe('En attente');
    });

    it('should return undefined for invalid status', () => {
      expect(getDocumentStatusDefinition('invalid')).toBeUndefined();
    });

    it('should return correct definition for validated', () => {
      const def = getDocumentStatusDefinition('validated');
      expect(def?.label).toBe('Validé');
      expect(def?.icon).toBe('✅');
    });
  });

  describe('isDocumentTerminalStatus', () => {
    it('should return true for validated', () => {
      expect(isDocumentTerminalStatus('validated')).toBe(true);
    });

    it('should return false for rejected (can be replaced)', () => {
      expect(isDocumentTerminalStatus('rejected')).toBe(false);
    });

    it('should return false for pending', () => {
      expect(isDocumentTerminalStatus('pending')).toBe(false);
    });

    it('should return false for received', () => {
      expect(isDocumentTerminalStatus('received')).toBe(false);
    });
  });

  describe('canReplaceDocument', () => {
    it('should return true for rejected documents', () => {
      expect(canReplaceDocument('rejected')).toBe(true);
    });

    it('should return false for validated documents', () => {
      expect(canReplaceDocument('validated')).toBe(false);
    });

    it('should return false for pending documents', () => {
      expect(canReplaceDocument('pending')).toBe(false);
    });

    it('should return false for received documents', () => {
      expect(canReplaceDocument('received')).toBe(false);
    });
  });

  describe('getDocumentTransitionBlockReason', () => {
    it('should explain why validated cannot transition', () => {
      const reason = getDocumentTransitionBlockReason('validated', 'rejected');
      expect(reason).toContain('validé');
      expect(reason).toContain('ne peut plus être modifié');
    });

    it('should list allowed transitions for invalid request', () => {
      const reason = getDocumentTransitionBlockReason('pending', 'validated');
      expect(reason).toContain('non autorisée');
      expect(reason).toContain('Transitions possibles');
    });
  });

  describe('getDocumentActionText', () => {
    it('should return correct action for each status', () => {
      expect(getDocumentActionText('pending')).toBe('Téléverser');
      expect(getDocumentActionText('received')).toBe('Vérifier');
      expect(getDocumentActionText('under_review')).toBe('Statuer');
      expect(getDocumentActionText('validated')).toBe('Validé');
      expect(getDocumentActionText('rejected')).toBe('Remplacer');
    });

    it('should return Action for unknown status', () => {
      expect(getDocumentActionText('unknown')).toBe('Action');
    });
  });

  describe('VALID_DOCUMENT_TRANSITIONS completeness', () => {
    it('should have transitions defined for all statuses', () => {
      const allStatuses = DOCUMENT_STATUS_DEFINITIONS.map(s => s.value);
      allStatuses.forEach((status) => {
        expect(VALID_DOCUMENT_TRANSITIONS).toHaveProperty(status);
      });
    });

    it('should only reference valid statuses in transitions', () => {
      const allStatuses = DOCUMENT_STATUS_DEFINITIONS.map(s => s.value);
      Object.values(VALID_DOCUMENT_TRANSITIONS).forEach((transitions) => {
        transitions.forEach((t) => {
          expect(allStatuses).toContain(t);
        });
      });
    });
  });
});
