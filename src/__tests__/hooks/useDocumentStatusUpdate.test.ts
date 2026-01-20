import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDocumentStatusUpdate } from '@/hooks/useDocumentStatusUpdate';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
      insert: vi.fn(() => Promise.resolve({ error: null })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ 
            data: { email: 'test@example.com', first_name: 'Test' },
            error: null 
          })),
        })),
      })),
    })),
  },
}));

vi.mock('@/services/emailService', () => ({
  emailService: {
    sendDocumentValidated: vi.fn(() => Promise.resolve({ success: true })),
    sendDocumentRejected: vi.fn(() => Promise.resolve({ success: true })),
    sendNotification: vi.fn(() => Promise.resolve({ success: true })),
  },
}));

vi.mock('@/components/finom/Toast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'agent-123', email: 'agent@example.com' },
  }),
}));

vi.mock('@/lib/logger', () => ({
  default: {
    warn: vi.fn(),
    logError: vi.fn(),
  },
}));

describe('useDocumentStatusUpdate', () => {
  const mockDocument = {
    id: 'doc-123',
    status: 'received',
    user_id: 'user-456',
    file_name: 'test-document.pdf',
    loan_id: 'loan-789',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useDocumentStatusUpdate());
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.updateStatus).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
  });

  describe('valid transitions', () => {
    it('should allow received -> validated transition', async () => {
      const { result } = renderHook(() => useDocumentStatusUpdate());
      
      let success = false;
      await act(async () => {
        success = await result.current.updateStatus({
          document: mockDocument,
          newStatus: 'validated',
        });
      });
      
      expect(result.current.error).toBeNull();
    });

    it('should allow received -> rejected transition', async () => {
      const { result } = renderHook(() => useDocumentStatusUpdate());
      
      let success = false;
      await act(async () => {
        success = await result.current.updateStatus({
          document: mockDocument,
          newStatus: 'rejected',
          rejectionReason: 'Document illisible',
        });
      });
      
      expect(result.current.error).toBeNull();
    });

    it('should allow received -> under_review transition', async () => {
      const { result } = renderHook(() => useDocumentStatusUpdate());
      
      await act(async () => {
        await result.current.updateStatus({
          document: mockDocument,
          newStatus: 'under_review',
        });
      });
      
      expect(result.current.error).toBeNull();
    });

    it('should allow pending -> received transition', async () => {
      const pendingDoc = { ...mockDocument, status: 'pending' };
      const { result } = renderHook(() => useDocumentStatusUpdate());
      
      await act(async () => {
        await result.current.updateStatus({
          document: pendingDoc,
          newStatus: 'received',
        });
      });
      
      expect(result.current.error).toBeNull();
    });
  });

  describe('invalid transitions', () => {
    it('should block pending -> validated (skip steps)', async () => {
      const pendingDoc = { ...mockDocument, status: 'pending' };
      const { result } = renderHook(() => useDocumentStatusUpdate());
      
      let success = false;
      await act(async () => {
        success = await result.current.updateStatus({
          document: pendingDoc,
          newStatus: 'validated',
        });
      });
      
      expect(success).toBe(false);
      expect(result.current.error).toContain('non autorisée');
    });

    it('should block validated -> any (terminal state)', async () => {
      const validatedDoc = { ...mockDocument, status: 'validated' };
      const { result } = renderHook(() => useDocumentStatusUpdate());
      
      let success = false;
      await act(async () => {
        success = await result.current.updateStatus({
          document: validatedDoc,
          newStatus: 'rejected',
        });
      });
      
      expect(success).toBe(false);
      expect(result.current.error).toContain('validé');
    });

    it('should block under_review -> pending (invalid path)', async () => {
      const reviewDoc = { ...mockDocument, status: 'under_review' };
      const { result } = renderHook(() => useDocumentStatusUpdate());
      
      let success = false;
      await act(async () => {
        success = await result.current.updateStatus({
          document: reviewDoc,
          newStatus: 'pending',
        });
      });
      
      expect(success).toBe(false);
      expect(result.current.error).toContain('non autorisée');
    });
  });

  describe('validation', () => {
    it('should require rejection reason when rejecting', async () => {
      const { result } = renderHook(() => useDocumentStatusUpdate());
      
      let success = false;
      await act(async () => {
        success = await result.current.updateStatus({
          document: mockDocument,
          newStatus: 'rejected',
          rejectionReason: '', // Empty reason
        });
      });
      
      expect(success).toBe(false);
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('error handling', () => {
    it('should clear error when clearError is called', async () => {
      const pendingDoc = { ...mockDocument, status: 'pending' };
      const { result } = renderHook(() => useDocumentStatusUpdate());
      
      // Trigger an error
      await act(async () => {
        await result.current.updateStatus({
          document: pendingDoc,
          newStatus: 'validated',
        });
      });
      
      expect(result.current.error).not.toBeNull();
      
      // Clear the error
      act(() => {
        result.current.clearError();
      });
      
      expect(result.current.error).toBeNull();
    });
  });

  describe('rejected document transitions', () => {
    it('should allow rejected -> received (replacement upload)', async () => {
      const rejectedDoc = { ...mockDocument, status: 'rejected' };
      const { result } = renderHook(() => useDocumentStatusUpdate());
      
      await act(async () => {
        await result.current.updateStatus({
          document: rejectedDoc,
          newStatus: 'received',
        });
      });
      
      expect(result.current.error).toBeNull();
    });

    it('should allow rejected -> pending (reset)', async () => {
      const rejectedDoc = { ...mockDocument, status: 'rejected' };
      const { result } = renderHook(() => useDocumentStatusUpdate());
      
      await act(async () => {
        await result.current.updateStatus({
          document: rejectedDoc,
          newStatus: 'pending',
        });
      });
      
      expect(result.current.error).toBeNull();
    });
  });
});
