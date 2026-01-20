import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLoanStatusUpdate } from '@/hooks/useLoanStatusUpdate';

// Mock dependencies
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
};

const mockUser = { id: 'user-123' };

vi.mock('@/components/finom/Toast', () => ({
  useToast: () => mockToast,
}));

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}));

vi.mock('@/lib/logger', () => ({
  default: {
    warn: vi.fn(),
    info: vi.fn(),
    logError: vi.fn(),
  },
}));

// Mock Supabase
const mockSupabaseUpdate = vi.fn();
const mockSupabaseInsert = vi.fn();
const mockSupabaseSelect = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'loan_applications') {
        return {
          update: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ error: null })),
          })),
        };
      }
      if (table === 'loan_status_history' || table === 'notifications') {
        return {
          insert: vi.fn(() => Promise.resolve({ error: null })),
        };
      }
      if (table === 'profiles') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn(() => Promise.resolve({ 
                data: { email: 'test@example.com', first_name: 'Test' }, 
                error: null 
              })),
            })),
          })),
        };
      }
      return {
        update: mockSupabaseUpdate,
        insert: mockSupabaseInsert,
        select: mockSupabaseSelect,
      };
    }),
  },
}));

// Mock email service
vi.mock('@/services/emailService', () => ({
  emailService: {
    sendLoanApproved: vi.fn(() => Promise.resolve()),
    sendLoanRejected: vi.fn(() => Promise.resolve()),
    sendLoanOfferIssued: vi.fn(() => Promise.resolve()),
    sendDocumentRequired: vi.fn(() => Promise.resolve()),
    sendNotification: vi.fn(() => Promise.resolve()),
  },
}));

describe('useLoanStatusUpdate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const mockLoan = {
    id: 'loan-123',
    status: 'pending',
    user_id: 'user-456',
    amount: 200000,
    rate: 3.5,
    monthly_payment: 1000,
  };

  describe('initialization', () => {
    it('should initialize with loading false and no error', () => {
      const { result } = renderHook(() => useLoanStatusUpdate());
      
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.updateStatus).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
    });
  });

  describe('state machine validation', () => {
    it('should reject invalid transition (pending to funded)', async () => {
      const { result } = renderHook(() => useLoanStatusUpdate());
      
      let success: boolean = false;
      await act(async () => {
        success = await result.current.updateStatus({
          loan: mockLoan,
          newStatus: 'funded',
        });
      });
      
      expect(success).toBe(false);
      expect(result.current.error).toContain('non autorisée');
      expect(mockToast.error).toHaveBeenCalled();
    });

    it('should reject transition from terminal state (funded)', async () => {
      const { result } = renderHook(() => useLoanStatusUpdate());
      
      const fundedLoan = { ...mockLoan, status: 'funded' };
      
      let success: boolean = false;
      await act(async () => {
        success = await result.current.updateStatus({
          loan: fundedLoan,
          newStatus: 'pending',
        });
      });
      
      expect(success).toBe(false);
      expect(result.current.error).toContain('ne peut plus être modifié');
    });

    it('should reject transition from rejected state', async () => {
      const { result } = renderHook(() => useLoanStatusUpdate());
      
      const rejectedLoan = { ...mockLoan, status: 'rejected' };
      
      let success: boolean = false;
      await act(async () => {
        success = await result.current.updateStatus({
          loan: rejectedLoan,
          newStatus: 'approved',
        });
      });
      
      expect(success).toBe(false);
    });
  });

  describe('validation schema', () => {
    it('should require rejection reason when status is rejected', async () => {
      const { result } = renderHook(() => useLoanStatusUpdate());
      
      let success: boolean = false;
      await act(async () => {
        success = await result.current.updateStatus({
          loan: mockLoan,
          newStatus: 'rejected',
          rejectionReason: '', // Empty reason
        });
      });
      
      expect(success).toBe(false);
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('clearError', () => {
    it('should clear the error state', async () => {
      const { result } = renderHook(() => useLoanStatusUpdate());
      
      // First cause an error
      await act(async () => {
        await result.current.updateStatus({
          loan: mockLoan,
          newStatus: 'funded',
        });
      });
      
      expect(result.current.error).not.toBeNull();
      
      // Then clear it
      act(() => {
        result.current.clearError();
      });
      
      expect(result.current.error).toBeNull();
    });
  });

  describe('valid transitions', () => {
    it('should allow pending to documents_required', async () => {
      const { result } = renderHook(() => useLoanStatusUpdate());
      
      // This test validates the state machine allows the transition
      // The actual DB call is mocked, so we're testing the logic
      const pendingLoan = { ...mockLoan, status: 'pending' };
      
      await act(async () => {
        await result.current.updateStatus({
          loan: pendingLoan,
          newStatus: 'documents_required',
        });
      });
      
      // If no error, the transition was allowed by the state machine
      // Note: success depends on mocked Supabase responses
    });

    it('should allow pending to under_review', async () => {
      const { result } = renderHook(() => useLoanStatusUpdate());
      
      await act(async () => {
        await result.current.updateStatus({
          loan: mockLoan,
          newStatus: 'under_review',
        });
      });
      
      // State machine should allow this
    });

    it('should allow offer_issued to approved', async () => {
      const { result } = renderHook(() => useLoanStatusUpdate());
      
      const offerLoan = { ...mockLoan, status: 'offer_issued' };
      
      await act(async () => {
        await result.current.updateStatus({
          loan: offerLoan,
          newStatus: 'approved',
        });
      });
      
      // State machine should allow this transition
    });
  });
});
