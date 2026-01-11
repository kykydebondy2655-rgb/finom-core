/**
 * Unified API Services for FINOM
 * All Supabase queries centralized here
 */

import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

// ============= TYPES =============
export type LoanApplication = Tables<'loan_applications'>;
export type Profile = Tables<'profiles'>;
export type Document = Tables<'documents'>;
export type BankAccount = Tables<'bank_accounts'>;
export type Beneficiary = Tables<'beneficiaries'>;
export type Transfer = Tables<'transfers'>;
export type Transaction = Tables<'transactions'>;
export type Notification = Tables<'notifications'>;
export type Message = Tables<'messages'>;
export type Appointment = Tables<'appointments'>;
export type Callback = Tables<'callbacks'>;
export type CallLog = Tables<'call_logs'>;
export type ClientAssignment = Tables<'client_assignments'>;

// ============= LOAN APPLICATIONS =============
export const loansApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('loan_applications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('loan_applications')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(loan: TablesInsert<'loan_applications'>) {
    const { data, error } = await supabase
      .from('loan_applications')
      .insert(loan)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: TablesUpdate<'loan_applications'>) {
    const { data, error } = await supabase
      .from('loan_applications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from('loan_applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
};

// ============= DOCUMENTS =============
export const documentsApi = {
  async getByLoan(loanId: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('loan_id', loanId)
      .order('uploaded_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async upload(doc: TablesInsert<'documents'>) {
    const { data, error } = await supabase
      .from('documents')
      .insert(doc)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: string, rejectionReason?: string) {
    const { data, error } = await supabase
      .from('documents')
      .update({ 
        status, 
        rejection_reason: rejectionReason,
        validated_at: status === 'approved' ? new Date().toISOString() : null
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

// ============= BANK ACCOUNTS =============
export const bankingApi = {
  async getAccount(userId: string) {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async updateAccount(id: string, updates: TablesUpdate<'bank_accounts'>) {
    const { data, error } = await supabase
      .from('bank_accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getTransactions(accountId: string, limit = 50) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  }
};

// ============= BENEFICIARIES =============
export const beneficiariesApi = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('beneficiaries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(beneficiary: TablesInsert<'beneficiaries'>) {
    const { data, error } = await supabase
      .from('beneficiaries')
      .insert(beneficiary)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: TablesUpdate<'beneficiaries'>) {
    const { data, error } = await supabase
      .from('beneficiaries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('beneficiaries')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// ============= TRANSFERS =============
export const transfersApi = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('transfers')
      .select('*, beneficiaries(name, iban)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(transfer: TablesInsert<'transfers'>) {
    const { data, error } = await supabase
      .from('transfers')
      .insert(transfer)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('transfers')
      .select('*, beneficiaries(name, iban)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }
};

// ============= PROFILES =============
export const profilesApi = {
  async get(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async update(userId: string, updates: TablesUpdate<'profiles'>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

// ============= NOTIFICATIONS =============
export const notificationsApi = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async markAsRead(id: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    if (error) throw error;
  },

  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId);
    if (error) throw error;
  }
};

// ============= MESSAGES =============
export const messagesApi = {
  async getByLoan(loanId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('loan_id', loanId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  async send(message: TablesInsert<'messages'>) {
    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

// ============= AGENT SERVICES =============
export const agentApi = {
  async getAssignedClients(agentId: string) {
    // First get assignments
    const { data: assignments, error: assignError } = await supabase
      .from('client_assignments')
      .select('*')
      .eq('agent_user_id', agentId);
    if (assignError) throw assignError;
    
    if (!assignments || assignments.length === 0) return [];
    
    // Then get profiles for each client
    const clientIds = assignments.map(a => a.client_user_id);
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', clientIds);
    if (profileError) throw profileError;
    
    // Combine data
    return assignments.map(a => ({
      ...a,
      client: profiles?.find(p => p.id === a.client_user_id) || null
    }));
  },

  async getCallbacks(agentId: string) {
    const { data, error } = await supabase
      .from('callbacks')
      .select(`
        *,
        client:profiles!callbacks_client_id_fkey(*)
      `)
      .eq('agent_id', agentId)
      .order('scheduled_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  async createCallback(callback: TablesInsert<'callbacks'>) {
    const { data, error } = await supabase
      .from('callbacks')
      .insert(callback)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateCallback(id: string, updates: TablesUpdate<'callbacks'>) {
    const { data, error } = await supabase
      .from('callbacks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async logCall(callLog: TablesInsert<'call_logs'>) {
    const { data, error } = await supabase
      .from('call_logs')
      .insert(callLog)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getCallLogs(agentId: string) {
    const { data, error } = await supabase
      .from('call_logs')
      .select(`
        *,
        client:profiles!call_logs_client_id_fkey(*)
      `)
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
};

// ============= ADMIN SERVICES =============
export const adminApi = {
  async getAllClients() {
    // Get all users with 'client' role from user_roles table
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        role,
        profiles:user_id(*)
      `)
      .eq('role', 'client');
    if (error) throw error;
    // Flatten to return profile data
    return data?.map(r => {
      const profile = r.profiles as any;
      return profile ? { ...profile, id: r.user_id } : null;
    }).filter(Boolean) || [];
  },

  async getAllAgents() {
    // Get all users with 'agent' role from user_roles table
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        role,
        profiles:user_id(*)
      `)
      .eq('role', 'agent');
    if (error) throw error;
    return data?.map(r => {
      const profile = r.profiles as any;
      return profile ? { ...profile, id: r.user_id } : null;
    }).filter(Boolean) || [];
  },

  async getAllLoans() {
    const { data, error } = await supabase
      .from('loan_applications')
      .select(`
        *,
        user:profiles!loan_applications_user_id_fkey(*)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getClientAssignments() {
    const { data, error } = await supabase
      .from('client_assignments')
      .select(`
        *,
        agent:profiles!client_assignments_agent_user_id_fkey(*),
        client:profiles!client_assignments_client_user_id_fkey(*)
      `);
    if (error) throw error;
    return data;
  }
};

// ============= UTILITY FUNCTIONS =============
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return '0 €';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (date: string | null | undefined): string => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

export const formatDateTime = (date: string | null | undefined): string => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getStatusLabel = (status: string | null): string => {
  const labels: Record<string, string> = {
    pending: 'En attente',
    in_review: 'En cours d\'analyse',
    approved: 'Approuvé',
    rejected: 'Refusé',
    funded: 'Financé',
    completed: 'Terminé',
    draft: 'Brouillon'
  };
  return labels[status || ''] || status || 'Inconnu';
};

export const getStatusColor = (status: string | null): string => {
  const colors: Record<string, string> = {
    pending: 'var(--color-warning)',
    in_review: 'var(--color-info)',
    approved: 'var(--color-success)',
    rejected: 'var(--color-danger)',
    funded: 'var(--color-success)',
    completed: 'var(--color-success)',
    draft: 'var(--color-text-tertiary)'
  };
  return colors[status || ''] || 'var(--color-text-secondary)';
};
