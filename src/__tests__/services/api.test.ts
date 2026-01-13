/**
 * Unit Tests for API Services
 * Tests loansApi, documentsApi, bankingApi, beneficiariesApi, transfersApi, profilesApi
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import {
  loansApi,
  documentsApi,
  bankingApi,
  beneficiariesApi,
  transfersApi,
  profilesApi,
  notificationsApi,
  messagesApi,
} from '@/services/api';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      signUp: vi.fn(),
    },
    rpc: vi.fn(),
  },
}));

describe('loansApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('fetches all loans ordered by created_at', async () => {
      const mockLoans = [
        { id: '1', amount: 100000, status: 'pending' },
        { id: '2', amount: 200000, status: 'approved' },
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockLoans, error: null }),
      } as any);

      const result = await loansApi.getAll();

      expect(supabase.from).toHaveBeenCalledWith('loan_applications');
      expect(result).toEqual(mockLoans);
    });

    it('throws error on failure', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Database error' } 
        }),
      } as any);

      await expect(loansApi.getAll()).rejects.toEqual({ message: 'Database error' });
    });
  });

  describe('getById', () => {
    it('fetches a specific loan by ID', async () => {
      const mockLoan = { id: '123', amount: 150000 };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: mockLoan, error: null }),
      } as any);

      const result = await loansApi.getById('123');

      expect(result).toEqual(mockLoan);
    });

    it('returns null for non-existent loan', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      } as any);

      const result = await loansApi.getById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('creates a new loan application', async () => {
      const newLoan = { 
        user_id: 'user-123', 
        amount: 200000, 
        duration: 240, 
        rate: 3.5 
      };
      const createdLoan = { id: 'loan-456', ...newLoan };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: createdLoan, error: null }),
      } as any);

      const result = await loansApi.create(newLoan);

      expect(result).toEqual(createdLoan);
    });
  });

  describe('update', () => {
    it('updates loan application fields', async () => {
      const updatedLoan = { id: '123', status: 'approved' };

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedLoan, error: null }),
      } as any);

      const result = await loansApi.update('123', { status: 'approved' });

      expect(result).toEqual(updatedLoan);
    });
  });

  describe('getByUser', () => {
    it('fetches loans for a specific user', async () => {
      const mockLoans = [{ id: '1', user_id: 'user-123', amount: 100000 }];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockLoans, error: null }),
      } as any);

      const result = await loansApi.getByUser('user-123');

      expect(result).toEqual(mockLoans);
    });
  });
});

describe('documentsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getByLoan', () => {
    it('fetches all documents for a loan', async () => {
      const mockDocs = [{ id: '1', file_name: 'doc.pdf', loan_id: 'loan-123' }];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockDocs, error: null }),
      } as any);

      const result = await documentsApi.getByLoan('loan-123');

      expect(result).toEqual(mockDocs);
    });

    it('filters by direction when specified', async () => {
      const mockDocs = [{ id: '1', direction: 'incoming' }];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockDocs, error: null }),
      };
      vi.mocked(supabase.from).mockReturnValue(mockQuery as any);

      await documentsApi.getByLoan('loan-123', 'incoming');

      // eq called twice: once for loan_id, once for direction
      expect(mockQuery.eq).toHaveBeenCalledTimes(2);
    });
  });

  describe('upload', () => {
    it('inserts a new document record', async () => {
      const newDoc = {
        user_id: 'user-123',
        file_name: 'test.pdf',
        file_path: '/path/to/file',
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: { id: 'doc-456', ...newDoc, direction: 'outgoing' }, 
          error: null 
        }),
      } as any);

      const result = await documentsApi.upload(newDoc);

      expect(result.id).toBe('doc-456');
    });
  });

  describe('updateStatus', () => {
    it('updates document status and sets validated_at for approved', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: { id: '123', status: 'approved' }, 
          error: null 
        }),
      } as any);

      const result = await documentsApi.updateStatus('123', 'approved');

      expect(result.status).toBe('approved');
    });

    it('includes rejection reason when rejecting', async () => {
      const mockUpdate = vi.fn().mockReturnThis();
      
      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: { id: '123', status: 'rejected', rejection_reason: 'Invalid' }, 
          error: null 
        }),
      } as any);

      await documentsApi.updateStatus('123', 'rejected', 'Invalid');

      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        status: 'rejected',
        rejection_reason: 'Invalid',
      }));
    });
  });
});

describe('bankingApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAccount', () => {
    it('fetches bank account for user', async () => {
      const mockAccount = { id: '1', user_id: 'user-123', balance: 5000, iban: 'FR1234' };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: mockAccount, error: null }),
      } as any);

      const result = await bankingApi.getAccount('user-123');

      expect(result).toEqual(mockAccount);
    });

    it('returns null when no account exists', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      } as any);

      const result = await bankingApi.getAccount('user-without-account');

      expect(result).toBeNull();
    });
  });

  describe('updateAccount', () => {
    it('updates account details', async () => {
      const updated = { id: 'acc-123', balance: 10000 };

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updated, error: null }),
      } as any);

      const result = await bankingApi.updateAccount('acc-123', { balance: 10000 });

      expect(result.balance).toBe(10000);
    });
  });

  describe('getTransactions', () => {
    it('fetches transactions with default limit', async () => {
      const mockTxs = [
        { id: '1', amount: 100, type: 'credit' },
        { id: '2', amount: -50, type: 'debit' },
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockTxs, error: null }),
      } as any);

      const result = await bankingApi.getTransactions('acc-123');

      expect(result).toHaveLength(2);
    });
  });
});

describe('beneficiariesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('fetches all beneficiaries for user', async () => {
      const mockBeneficiaries = [
        { id: '1', name: 'John Doe', iban: 'FR123' },
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockBeneficiaries, error: null }),
      } as any);

      const result = await beneficiariesApi.getAll('user-123');

      expect(result).toEqual(mockBeneficiaries);
    });
  });

  describe('create', () => {
    it('creates a new beneficiary', async () => {
      const newBenef = { user_id: 'user-123', name: 'Jane Doe', iban: 'FR456' };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: { id: 'benef-789', ...newBenef }, 
          error: null 
        }),
      } as any);

      const result = await beneficiariesApi.create(newBenef);

      expect(result.id).toBe('benef-789');
    });
  });

  describe('delete', () => {
    it('deletes a beneficiary', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      } as any);

      await expect(beneficiariesApi.delete('benef-123')).resolves.toBeUndefined();
    });

    it('throws on error', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: { message: 'Cannot delete' } }),
      } as any);

      await expect(beneficiariesApi.delete('benef-123')).rejects.toEqual({ 
        message: 'Cannot delete' 
      });
    });
  });
});

describe('transfersApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('fetches all transfers with beneficiary data', async () => {
      const mockTransfers = [
        { id: '1', amount: 500, beneficiaries: { name: 'John', iban: 'FR123' } },
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockTransfers, error: null }),
      } as any);

      const result = await transfersApi.getAll('user-123');

      expect(result[0].beneficiaries).toBeDefined();
    });
  });

  describe('create', () => {
    it('creates a new transfer', async () => {
      const newTransfer = {
        user_id: 'user-123',
        beneficiary_id: 'benef-456',
        amount: 1000,
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: { id: 'transfer-789', ...newTransfer, status: 'pending' }, 
          error: null 
        }),
      } as any);

      const result = await transfersApi.create(newTransfer);

      expect(result.id).toBe('transfer-789');
    });
  });
});

describe('profilesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('get', () => {
    it('fetches user profile', async () => {
      const mockProfile = { id: 'user-123', first_name: 'John', last_name: 'Doe' };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
      } as any);

      const result = await profilesApi.get('user-123');

      expect(result.first_name).toBe('John');
    });
  });

  describe('update', () => {
    it('updates user profile', async () => {
      const updated = { id: 'user-123', phone: '+33612345678' };

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updated, error: null }),
      } as any);

      const result = await profilesApi.update('user-123', { phone: '+33612345678' });

      expect(result.phone).toBe('+33612345678');
    });
  });
});

describe('notificationsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('fetches all notifications for user', async () => {
      const mockNotifications = [
        { id: '1', title: 'Test', read: false },
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockNotifications, error: null }),
      } as any);

      const result = await notificationsApi.getAll('user-123');

      expect(result).toHaveLength(1);
    });
  });

  describe('markAsRead', () => {
    it('marks a notification as read', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      } as any);

      await expect(notificationsApi.markAsRead('notif-123')).resolves.toBeUndefined();
    });
  });

  describe('markAllAsRead', () => {
    it('marks all notifications as read for user', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      } as any);

      await expect(notificationsApi.markAllAsRead('user-123')).resolves.toBeUndefined();
    });
  });
});

describe('messagesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getByLoan', () => {
    it('fetches messages for a loan in chronological order', async () => {
      const mockMessages = [
        { id: '1', message: 'First', created_at: '2024-01-01' },
        { id: '2', message: 'Second', created_at: '2024-01-02' },
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockMessages, error: null }),
      } as any);

      const result = await messagesApi.getByLoan('loan-123');

      expect(result).toHaveLength(2);
    });
  });

  describe('send', () => {
    it('sends a new message', async () => {
      const newMessage = {
        loan_id: 'loan-123',
        from_user_id: 'user-1',
        to_user_id: 'user-2',
        message: 'Hello',
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: { id: 'msg-456', ...newMessage }, 
          error: null 
        }),
      } as any);

      const result = await messagesApi.send(newMessage);

      expect(result.id).toBe('msg-456');
    });
  });
});
