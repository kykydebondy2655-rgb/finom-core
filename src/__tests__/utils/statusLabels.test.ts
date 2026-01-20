import { describe, it, expect } from 'vitest';
import { 
  getClientStatusLabel, 
  getCallStatusLabel,
  getLoanStatusLabel,
  getDocumentStatusLabel,
  CLIENT_STATUS_LABELS,
  CALL_STATUS_LABELS,
  LOAN_STATUS_LABELS,
  DOCUMENT_STATUS_LABELS
} from '@/lib/validators';

describe('Client Status Labels (Pipeline)', () => {
  describe('getClientStatusLabel', () => {
    it('returns correct label for nouveau status', () => {
      expect(getClientStatusLabel('nouveau')).toBe('Nouveau');
    });

    it('returns correct label for nrp status', () => {
      expect(getClientStatusLabel('nrp')).toBe('NRP');
      expect(getClientStatusLabel('NRP')).toBe('NRP');
    });

    it('returns correct label for faux_numero status', () => {
      expect(getClientStatusLabel('faux_numero')).toBe('Faux numéro');
    });

    it('returns correct label for pas_interesse status', () => {
      expect(getClientStatusLabel('pas_interesse')).toBe('Pas intéressé');
    });

    it('returns correct label for a_rappeler status', () => {
      expect(getClientStatusLabel('a_rappeler')).toBe('À rappeler');
    });

    it('returns correct label for interesse status', () => {
      expect(getClientStatusLabel('interesse')).toBe('Intéressé');
    });

    it('returns correct label for qualifie status', () => {
      expect(getClientStatusLabel('qualifie')).toBe('Qualifié');
    });

    it('returns correct label for converti status', () => {
      expect(getClientStatusLabel('converti')).toBe('Converti');
    });

    it('handles null status gracefully', () => {
      expect(getClientStatusLabel(null)).toBe('Inconnu');
    });

    it('handles undefined status gracefully', () => {
      expect(getClientStatusLabel(undefined as unknown as string)).toBe('Inconnu');
    });

    it('handles unknown status by formatting it', () => {
      expect(getClientStatusLabel('unknown_status')).toBe('Unknown status');
    });
  });

  describe('CLIENT_STATUS_LABELS constant', () => {
    it('contains all required pipeline statuses', () => {
      const requiredStatuses = [
        'nouveau', 'nrp', 'NRP', 'faux_numero', 
        'pas_interesse', 'a_rappeler', 
        'interesse', 'qualifie', 'converti'
      ];
      
      requiredStatuses.forEach(status => {
        expect(CLIENT_STATUS_LABELS).toHaveProperty(status);
      });
    });

    it('has unique labels for each status', () => {
      const labels = Object.values(CLIENT_STATUS_LABELS);
      // NRP appears twice (nrp and NRP) so we filter duplicates
      const uniqueLabels = [...new Set(labels)];
      expect(uniqueLabels.length).toBeGreaterThan(5);
    });
  });
});

describe('Call Status Labels', () => {
  describe('getCallStatusLabel', () => {
    it('returns correct label for answered status', () => {
      expect(getCallStatusLabel('answered')).toBe('Répondu');
    });

    it('returns correct label for no_answer status', () => {
      expect(getCallStatusLabel('no_answer')).toBe('Pas de réponse');
    });

    it('returns correct label for voicemail status', () => {
      expect(getCallStatusLabel('voicemail')).toBe('Messagerie');
    });

    it('returns correct label for busy status', () => {
      expect(getCallStatusLabel('busy')).toBe('Occupé');
    });

    it('returns correct label for callback_scheduled status', () => {
      expect(getCallStatusLabel('callback_scheduled')).toBe('Rappel planifié');
    });

    it('handles unknown status by returning it', () => {
      expect(getCallStatusLabel('unknown')).toBe('unknown');
    });
  });

  describe('CALL_STATUS_LABELS constant', () => {
    it('contains all required call statuses', () => {
      const requiredStatuses = [
        'answered', 'no_answer', 'voicemail', 
        'busy', 'callback_scheduled'
      ];
      
      requiredStatuses.forEach(status => {
        expect(CALL_STATUS_LABELS).toHaveProperty(status);
      });
    });
  });
});

describe('Loan Status Labels', () => {
  describe('getLoanStatusLabel', () => {
    it('returns correct label for pending status', () => {
      expect(getLoanStatusLabel('pending')).toBe('En attente');
    });

    it('returns correct label for in_review status', () => {
      expect(getLoanStatusLabel('in_review')).toBe('En analyse');
    });

    it('returns correct label for documents_required status', () => {
      expect(getLoanStatusLabel('documents_required')).toBe('Documents requis');
    });

    it('returns correct label for approved status', () => {
      expect(getLoanStatusLabel('approved')).toBe('Approuvé');
    });

    it('returns correct label for rejected status', () => {
      expect(getLoanStatusLabel('rejected')).toBe('Refusé');
    });

    it('returns correct label for funded status', () => {
      expect(getLoanStatusLabel('funded')).toBe('Financé');
    });

    it('handles null status gracefully', () => {
      expect(getLoanStatusLabel(null)).toBe('Inconnu');
    });
  });

  describe('LOAN_STATUS_LABELS constant', () => {
    it('contains all required loan statuses', () => {
      const requiredStatuses = [
        'pending', 'in_review', 'documents_required',
        'approved', 'rejected', 'funded'
      ];
      
      requiredStatuses.forEach(status => {
        expect(LOAN_STATUS_LABELS).toHaveProperty(status);
      });
    });
  });
});

describe('Document Status Labels', () => {
  describe('getDocumentStatusLabel', () => {
    it('returns correct label for pending status', () => {
      expect(getDocumentStatusLabel('pending')).toBe('En attente');
    });

    it('returns correct label for validated status', () => {
      expect(getDocumentStatusLabel('validated')).toBe('Validé');
    });

    it('returns correct label for rejected status', () => {
      expect(getDocumentStatusLabel('rejected')).toBe('Refusé');
    });

    it('returns correct label for expired status', () => {
      expect(getDocumentStatusLabel('expired')).toBe('Expiré');
    });

    it('handles null status gracefully', () => {
      expect(getDocumentStatusLabel(null)).toBe('Inconnu');
    });
  });

  describe('DOCUMENT_STATUS_LABELS constant', () => {
    it('contains all required document statuses', () => {
      const requiredStatuses = [
        'pending', 'validated', 'rejected', 'expired'
      ];
      
      requiredStatuses.forEach(status => {
        expect(DOCUMENT_STATUS_LABELS).toHaveProperty(status);
      });
    });
  });
});
