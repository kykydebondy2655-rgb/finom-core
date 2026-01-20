/**
 * Tests for useNotificationService hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock Supabase
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();
const mockEq = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: mockInsert,
      select: mockSelect,
      eq: mockEq,
    })),
  },
}));

// Mock emailService
vi.mock('@/services/emailService', () => ({
  emailService: {
    send: vi.fn(() => Promise.resolve({ success: true })),
    sendLoanApproved: vi.fn(() => Promise.resolve({ success: true })),
    sendLoanRejected: vi.fn(() => Promise.resolve({ success: true })),
    sendLoanOfferIssued: vi.fn(() => Promise.resolve({ success: true })),
    sendLoanSubmitted: vi.fn(() => Promise.resolve({ success: true })),
    sendDocumentValidated: vi.fn(() => Promise.resolve({ success: true })),
    sendDocumentRejected: vi.fn(() => Promise.resolve({ success: true })),
    sendNotification: vi.fn(() => Promise.resolve({ success: true })),
  },
}));

// Mock useAuth
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
  }),
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  default: {
    log: vi.fn(),
    warn: vi.fn(),
    logError: vi.fn(),
  },
}));

import { useNotificationService } from '@/hooks/useNotificationService';
import { emailService } from '@/services/emailService';

describe('useNotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockReturnValue({ error: null });
    mockSelect.mockReturnValue({ data: [{ id: '123' }], error: null });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSingle.mockReturnValue({ data: { id: 'user-123' }, error: null });
  });

  describe('sendNotification', () => {
    it('creates in-app notification successfully', async () => {
      mockInsert.mockReturnValue({ error: null });

      const { result } = renderHook(() => useNotificationService());

      let success: boolean = false;
      await act(async () => {
        success = await result.current.sendNotification({
          userId: 'user-123',
          title: 'Test Title',
          message: 'Test message',
          type: 'info',
          category: 'loan',
        });
      });

      expect(success).toBe(true);
    });

    it('returns false when notification creation fails', async () => {
      mockInsert.mockReturnValue({ error: { message: 'Insert failed' } });

      const { result } = renderHook(() => useNotificationService());

      let success: boolean = false;
      await act(async () => {
        success = await result.current.sendNotification({
          userId: 'user-123',
          title: 'Test Title',
          message: 'Test message',
          type: 'error',
          category: 'system',
        });
      });

      expect(success).toBe(false);
    });
  });

  describe('sendBulkNotifications', () => {
    it('creates multiple notifications at once', async () => {
      mockInsert.mockReturnValue({ 
        select: vi.fn().mockReturnValue({ 
          data: [{ id: '1' }, { id: '2' }], 
          error: null 
        }) 
      });

      const { result } = renderHook(() => useNotificationService());

      const payloads = [
        { userId: 'user-1', title: 'Title 1', message: 'Msg 1', type: 'info' as const, category: 'loan' as const },
        { userId: 'user-2', title: 'Title 2', message: 'Msg 2', type: 'info' as const, category: 'loan' as const },
      ];

      let count = 0;
      await act(async () => {
        count = await result.current.sendBulkNotifications(payloads);
      });

      expect(count).toBe(2);
    });

    it('returns 0 for empty payload array', async () => {
      const { result } = renderHook(() => useNotificationService());

      let count = 0;
      await act(async () => {
        count = await result.current.sendBulkNotifications([]);
      });

      expect(count).toBe(0);
    });
  });

  describe('notifyLoanStatusChange', () => {
    it('sends loan approved email', async () => {
      const { result } = renderHook(() => useNotificationService());

      await act(async () => {
        await result.current.notifyLoanStatusChange('approved', {
          email: 'client@example.com',
          firstName: 'Jean',
          loanId: 'loan-123',
          amount: 200000,
          rate: 3.5,
          monthlyPayment: 950,
        });
      });

      expect(emailService.sendLoanApproved).toHaveBeenCalledWith(
        'client@example.com',
        'Jean',
        'loan-123',
        200000,
        3.5,
        950
      );
    });

    it('sends loan rejected email with reason', async () => {
      const { result } = renderHook(() => useNotificationService());

      await act(async () => {
        await result.current.notifyLoanStatusChange('rejected', {
          email: 'client@example.com',
          firstName: 'Jean',
          loanId: 'loan-123',
          reason: 'Endettement trop élevé',
        });
      });

      expect(emailService.sendLoanRejected).toHaveBeenCalledWith(
        'client@example.com',
        'Jean',
        'loan-123',
        'Endettement trop élevé'
      );
    });

    it('sends offer issued email', async () => {
      const { result } = renderHook(() => useNotificationService());

      await act(async () => {
        await result.current.notifyLoanStatusChange('offer_issued', {
          email: 'client@example.com',
          firstName: 'Jean',
          loanId: 'loan-123',
          amount: 200000,
          rate: 3.5,
          monthlyPayment: 950,
        });
      });

      expect(emailService.sendLoanOfferIssued).toHaveBeenCalled();
    });

    it('skips email when sendEmail is false', async () => {
      const { result } = renderHook(() => useNotificationService());

      await act(async () => {
        await result.current.notifyLoanStatusChange('approved', {
          email: 'client@example.com',
          firstName: 'Jean',
          loanId: 'loan-123',
        }, false);
      });

      expect(emailService.sendLoanApproved).not.toHaveBeenCalled();
    });
  });

  describe('notifyDocumentStatusChange', () => {
    it('sends document validated email', async () => {
      const { result } = renderHook(() => useNotificationService());

      await act(async () => {
        await result.current.notifyDocumentStatusChange('validated', {
          email: 'client@example.com',
          firstName: 'Jean',
          documentName: 'ID.pdf',
          loanId: 'loan-123',
        }, 'user-123');
      });

      expect(emailService.sendDocumentValidated).toHaveBeenCalledWith(
        'client@example.com',
        'Jean',
        'ID.pdf',
        'loan-123'
      );
    });

    it('sends document rejected email with reason', async () => {
      const { result } = renderHook(() => useNotificationService());

      await act(async () => {
        await result.current.notifyDocumentStatusChange('rejected', {
          email: 'client@example.com',
          firstName: 'Jean',
          documentName: 'RIB.pdf',
          rejectionReason: 'Document illisible',
          loanId: 'loan-123',
        }, 'user-123');
      });

      expect(emailService.sendDocumentRejected).toHaveBeenCalledWith(
        'client@example.com',
        'Jean',
        'RIB.pdf',
        'Document illisible',
        'loan-123'
      );
    });
  });

  describe('notifyLeadAssignment', () => {
    it('sends lead assignment notification and email', async () => {
      const { result } = renderHook(() => useNotificationService());

      await act(async () => {
        await result.current.notifyLeadAssignment(
          'agent-123',
          'agent@example.com',
          'Marie',
          5
        );
      });

      expect(emailService.sendNotification).toHaveBeenCalledWith(
        'agent@example.com',
        'Marie',
        'Nouveaux leads assignés',
        expect.stringContaining('5 nouveau(x) lead(s)'),
        'Voir mes leads',
        expect.any(String)
      );
    });
  });
});
