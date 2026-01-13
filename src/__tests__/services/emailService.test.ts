/**
 * Unit Tests for Email Service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { emailService } from '@/services/emailService';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  default: {
    warn: vi.fn(),
    logError: vi.fn(),
  },
}));

describe('emailService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('send', () => {
    it('sends email successfully via edge function', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await emailService.send({
        template: 'welcome',
        to: 'test@example.com',
        data: { firstName: 'John' },
      });

      expect(result.success).toBe(true);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('send-email', {
        body: {
          template: 'welcome',
          to: 'test@example.com',
          data: { firstName: 'John' },
        },
      });
    });

    it('returns error on edge function failure', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: { message: 'Function error' },
      });

      const result = await emailService.send({
        template: 'welcome',
        to: 'test@example.com',
        data: {},
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Function error');
    });

    it('handles exception gracefully', async () => {
      vi.mocked(supabase.functions.invoke).mockRejectedValue(new Error('Network error'));

      const result = await emailService.send({
        template: 'welcome',
        to: 'test@example.com',
        data: {},
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('sendWelcome', () => {
    it('sends welcome email with correct template and data', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await emailService.sendWelcome('test@example.com', 'John');

      expect(result.success).toBe(true);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('send-email', {
        body: {
          template: 'welcome',
          to: 'test@example.com',
          data: { firstName: 'John', email: 'test@example.com' },
        },
      });
    });
  });

  describe('sendLoanSubmitted', () => {
    it('sends loan submitted email with all loan details', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await emailService.sendLoanSubmitted(
        'test@example.com',
        'John',
        'loan-123',
        250000,
        240,
        1500
      );

      expect(result.success).toBe(true);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('send-email', {
        body: {
          template: 'loanSubmitted',
          to: 'test@example.com',
          data: {
            firstName: 'John',
            loanId: 'loan-123',
            amount: 250000,
            duration: 240,
            monthlyPayment: 1500,
          },
        },
      });
    });
  });

  describe('sendLoanApproved', () => {
    it('sends loan approved email', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await emailService.sendLoanApproved(
        'test@example.com',
        'John',
        'loan-123',
        250000,
        3.5,
        1500
      );

      expect(result.success).toBe(true);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('send-email', {
        body: {
          template: 'loanApproved',
          to: 'test@example.com',
          data: {
            firstName: 'John',
            loanId: 'loan-123',
            amount: 250000,
            rate: 3.5,
            monthlyPayment: 1500,
          },
        },
      });
    });
  });

  describe('sendLoanRejected', () => {
    it('sends loan rejected email with reason', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await emailService.sendLoanRejected(
        'test@example.com',
        'John',
        'loan-123',
        'Insufficient income'
      );

      expect(result.success).toBe(true);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('send-email', {
        body: {
          template: 'loanRejected',
          to: 'test@example.com',
          data: {
            firstName: 'John',
            loanId: 'loan-123',
            reason: 'Insufficient income',
          },
        },
      });
    });

    it('sends rejection email without reason', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await emailService.sendLoanRejected(
        'test@example.com',
        'John',
        'loan-123'
      );

      expect(result.success).toBe(true);
    });
  });

  describe('sendDocumentRequired', () => {
    it('sends document required email with list of documents', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const documents = ['Pièce d\'identité', 'Justificatif de domicile'];
      const result = await emailService.sendDocumentRequired(
        'test@example.com',
        'John',
        'loan-123',
        documents
      );

      expect(result.success).toBe(true);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('send-email', {
        body: {
          template: 'documentRequired',
          to: 'test@example.com',
          data: {
            firstName: 'John',
            loanId: 'loan-123',
            documents,
          },
        },
      });
    });
  });

  describe('sendCallbackReminder', () => {
    it('sends callback reminder email', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await emailService.sendCallbackReminder(
        'test@example.com',
        'John',
        '2024-01-15T10:00:00Z',
        'Jane Agent'
      );

      expect(result.success).toBe(true);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('send-email', {
        body: {
          template: 'callbackReminder',
          to: 'test@example.com',
          data: {
            firstName: 'John',
            scheduledAt: '2024-01-15T10:00:00Z',
            agentName: 'Jane Agent',
          },
        },
      });
    });
  });

  describe('sendNotification', () => {
    it('sends generic notification email', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await emailService.sendNotification(
        'test@example.com',
        'John',
        'Update Available',
        'Your loan status has been updated.'
      );

      expect(result.success).toBe(true);
    });

    it('includes CTA when provided', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await emailService.sendNotification(
        'test@example.com',
        'John',
        'Action Required',
        'Please review your documents.',
        'View Documents',
        'https://example.com/documents'
      );

      expect(result.success).toBe(true);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('send-email', {
        body: {
          template: 'notification',
          to: 'test@example.com',
          data: {
            firstName: 'John',
            title: 'Action Required',
            message: 'Please review your documents.',
            ctaText: 'View Documents',
            ctaUrl: 'https://example.com/documents',
          },
        },
      });
    });
  });

  describe('sendTransferCompleted', () => {
    it('sends transfer completed email', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await emailService.sendTransferCompleted(
        'test@example.com',
        'John',
        1500,
        'Jane Doe',
        'TRF-2024-001'
      );

      expect(result.success).toBe(true);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('send-email', {
        body: {
          template: 'transferCompleted',
          to: 'test@example.com',
          data: {
            firstName: 'John',
            amount: 1500,
            beneficiary: 'Jane Doe',
            reference: 'TRF-2024-001',
          },
        },
      });
    });
  });

  describe('sendPasswordReset', () => {
    it('sends password reset email with reset link', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await emailService.sendPasswordReset(
        'test@example.com',
        'John',
        'https://example.com/reset?token=abc123'
      );

      expect(result.success).toBe(true);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('send-email', {
        body: {
          template: 'passwordReset',
          to: 'test@example.com',
          data: {
            firstName: 'John',
            email: 'test@example.com',
            resetLink: 'https://example.com/reset?token=abc123',
          },
        },
      });
    });
  });
});
