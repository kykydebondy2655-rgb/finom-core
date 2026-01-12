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
  async getByLoan(loanId: string, direction: 'outgoing' | 'incoming' | 'all' = 'all') {
    let query = supabase
      .from('documents')
      .select('*')
      .eq('loan_id', loanId)
      .order('uploaded_at', { ascending: false });
    
    if (direction !== 'all') {
      query = query.eq('direction', direction);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getByUser(userId: string, direction: 'outgoing' | 'incoming' | 'all' = 'all') {
    let query = supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false });
    
    if (direction !== 'all') {
      query = query.eq('direction', direction);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getReceivedByUser(userId: string, loanId?: string) {
    let query = supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .eq('direction', 'incoming')
      .order('uploaded_at', { ascending: false });
    
    if (loanId) {
      query = query.eq('loan_id', loanId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async upload(doc: TablesInsert<'documents'>) {
    const { data, error } = await supabase
      .from('documents')
      .insert({
        ...doc,
        direction: doc.direction || 'outgoing'
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async uploadForClient(doc: {
    userId: string;
    loanId?: string;
    fileName: string;
    filePath: string;
    fileType?: string;
    category: string;
    motif: string;
    uploadedBy: string;
  }) {
    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: doc.userId,
        loan_id: doc.loanId || null,
        file_name: doc.fileName,
        file_path: doc.filePath,
        file_type: doc.fileType || null,
        category: doc.category,
        direction: 'incoming',
        motif: doc.motif,
        uploaded_by: doc.uploadedBy,
        status: 'approved'
      })
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
    // First get callbacks
    const { data: callbacks, error: cbError } = await supabase
      .from('callbacks')
      .select('*')
      .eq('agent_id', agentId)
      .order('scheduled_at', { ascending: true });
    if (cbError) throw cbError;
    
    if (!callbacks || callbacks.length === 0) return [];
    
    // Then get client profiles
    const clientIds = [...new Set(callbacks.map(c => c.client_id))];
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', clientIds);
    if (profileError) throw profileError;
    
    return callbacks.map(cb => ({
      ...cb,
      client: profiles?.find(p => p.id === cb.client_id) || null
    }));
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
    // First get call logs
    const { data: logs, error: logError } = await supabase
      .from('call_logs')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false });
    if (logError) throw logError;
    
    if (!logs || logs.length === 0) return [];
    
    // Then get client profiles
    const clientIds = [...new Set(logs.map(l => l.client_id))];
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', clientIds);
    if (profileError) throw profileError;
    
    return logs.map(log => ({
      ...log,
      client: profiles?.find(p => p.id === log.client_id) || null
    }));
  },

  // Get a specific assigned client's profile (via client_assignments RLS)
  async getClientProfile(agentId: string, clientId: string) {
    // First verify assignment exists
    const { data: assignment, error: assignError } = await supabase
      .from('client_assignments')
      .select('*')
      .eq('agent_user_id', agentId)
      .eq('client_user_id', clientId)
      .maybeSingle();
    if (assignError) throw assignError;
    if (!assignment) return null;
    
    // Then get the client profile (RLS allows via assignment)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', clientId)
      .single();
    if (profileError) throw profileError;
    return profile;
  },

  // Get loans for an assigned client
  async getClientLoans(clientId: string) {
    const { data, error } = await supabase
      .from('loan_applications')
      .select('*')
      .eq('user_id', clientId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Get documents for an assigned client
  async getClientDocuments(clientId: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', clientId)
      .order('uploaded_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }
};

// ============= ADMIN SERVICES =============
export const adminApi = {
async getAllClients() {
    // Get user IDs with 'client' role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'client');
    if (roleError) throw roleError;
    if (!roleData || roleData.length === 0) return [];
    
    // Get profiles for those user IDs
    const userIds = roleData.map(r => r.user_id);
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);
    if (profileError) throw profileError;
    return profiles || [];
  },

  async getAllAgents() {
    // Get user IDs with 'agent' role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'agent');
    if (roleError) throw roleError;
    if (!roleData || roleData.length === 0) return [];
    
    // Get profiles for those user IDs
    const userIds = roleData.map(r => r.user_id);
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);
    if (profileError) throw profileError;
    return profiles || [];
  },

  // Create a new agent account
  async createAgent(email: string, password: string, firstName: string, lastName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: 'agent'
        }
      }
    });
    if (error) throw error;
    return data;
  },

  // Create a new client account
  async createClient(email: string, password: string, firstName: string, lastName: string, phone?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: 'client'
        }
      }
    });
    if (error) throw error;
    
    // Update phone if provided
    if (phone && data.user) {
      await supabase.from('profiles').update({ phone }).eq('id', data.user.id);
    }
    
    return data;
  },

  // Batch create assignments
  async createBatchAssignments(assignments: { agentUserId: string; clientUserId: string }[]) {
    const insertData = assignments.map(a => ({
      agent_user_id: a.agentUserId,
      client_user_id: a.clientUserId
    }));
    const { data, error } = await supabase
      .from('client_assignments')
      .insert(insertData)
      .select();
    if (error) throw error;
    return data;
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
  },

  // Get a specific client profile by ID (admin only - RLS allows via admin policy)
  async getClientById(clientId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', clientId)
      .single();
    if (error) throw error;
    return data;
  },

  // Get loans for a specific client (admin)
  async getClientLoans(clientId: string) {
    const { data, error } = await supabase
      .from('loan_applications')
      .select('*')
      .eq('user_id', clientId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Get documents for a specific client (admin)
  async getClientDocuments(clientId: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', clientId)
      .order('uploaded_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Update loan status (admin only)
  async updateLoanStatus(loanId: string, status: string, rejectionReason?: string) {
    const updates: TablesUpdate<'loan_applications'> = { status };
    if (rejectionReason) updates.rejection_reason = rejectionReason;
    
    const { data, error } = await supabase
      .from('loan_applications')
      .update(updates)
      .eq('id', loanId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Create client assignment
  async createAssignment(agentUserId: string, clientUserId: string) {
    const { data, error } = await supabase
      .from('client_assignments')
      .insert({ agent_user_id: agentUserId, client_user_id: clientUserId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Delete client assignment
  async deleteAssignment(assignmentId: string) {
    const { error } = await supabase
      .from('client_assignments')
      .delete()
      .eq('id', assignmentId);
    if (error) throw error;
  },

  // Get assigned agent for a client
  async getClientAgent(clientUserId: string) {
    const { data, error } = await supabase
      .from('client_assignments')
      .select(`
        *,
        agent:profiles!client_assignments_agent_user_id_fkey(*)
      `)
      .eq('client_user_id', clientUserId)
      .maybeSingle();
    if (error) throw error;
    return data?.agent || null;
  },

  // Get client bank account (admin only)
  async getClientBankAccount(clientId: string) {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('user_id', clientId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // Update or create client bank account (admin only)
  async updateClientBankAccount(clientId: string, updates: { balance?: number; iban?: string; bic?: string }) {
    // First check if account exists
    const { data: existing } = await supabase
      .from('bank_accounts')
      .select('id')
      .eq('user_id', clientId)
      .maybeSingle();

    if (existing) {
      // Update existing account
      const { data, error } = await supabase
        .from('bank_accounts')
        .update({
          balance: updates.balance,
          iban: updates.iban,
          bic: updates.bic,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', clientId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      // Create new account
      const { data, error } = await supabase
        .from('bank_accounts')
        .insert({
          user_id: clientId,
          iban: updates.iban || '',
          bic: updates.bic || 'XXXXXXXX',
          balance: updates.balance || 0,
          currency: 'EUR'
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
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
