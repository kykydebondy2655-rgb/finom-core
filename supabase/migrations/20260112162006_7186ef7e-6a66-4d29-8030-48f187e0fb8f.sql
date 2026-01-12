-- =====================================================
-- GO-LIVE SECURITY FIX: Restrict agent access to assigned clients only
-- Fixes 6 P0 vulnerabilities: financial data exposure
-- =====================================================

-- 1. BANK_ACCOUNTS: Agents can only view accounts of assigned clients
-- Drop the existing policies first
DROP POLICY IF EXISTS "Agents can view assigned client bank accounts" ON public.bank_accounts;

-- Create restrictive policy for agents
CREATE POLICY "Agents can view assigned client bank accounts" 
ON public.bank_accounts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM client_assignments ca
    WHERE ca.client_user_id = bank_accounts.user_id 
    AND ca.agent_user_id = auth.uid()
  )
);

-- 2. TRANSACTIONS: Agents can only view transactions of assigned clients
DROP POLICY IF EXISTS "Agents can view assigned client transactions" ON public.transactions;

CREATE POLICY "Agents can view assigned client transactions" 
ON public.transactions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM bank_accounts ba
    JOIN client_assignments ca ON ca.client_user_id = ba.user_id
    WHERE ba.id = transactions.account_id 
    AND ca.agent_user_id = auth.uid()
  )
);

-- 3. TRANSFERS: Restrict to assigned clients + add UPDATE for admins
DROP POLICY IF EXISTS "Agents can view assigned client transfers" ON public.transfers;
DROP POLICY IF EXISTS "Admins can update transfers" ON public.transfers;
DROP POLICY IF EXISTS "Admins can view all transfers" ON public.transfers;

CREATE POLICY "Agents can view assigned client transfers" 
ON public.transfers 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM client_assignments ca
    WHERE ca.client_user_id = transfers.user_id 
    AND ca.agent_user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all transfers" 
ON public.transfers 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update transfers" 
ON public.transfers 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

-- 4. BENEFICIARIES: Agents can only view beneficiaries of assigned clients
DROP POLICY IF EXISTS "Agents can view assigned client beneficiaries" ON public.beneficiaries;

CREATE POLICY "Agents can view assigned client beneficiaries" 
ON public.beneficiaries 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM client_assignments ca
    WHERE ca.client_user_id = beneficiaries.user_id 
    AND ca.agent_user_id = auth.uid()
  )
);

-- 5. HOLDS: Agents can only view holds of assigned clients
DROP POLICY IF EXISTS "Agents can view assigned client holds" ON public.holds;
DROP POLICY IF EXISTS "Admins can manage holds" ON public.holds;

CREATE POLICY "Agents can view assigned client holds" 
ON public.holds 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM bank_accounts ba
    JOIN client_assignments ca ON ca.client_user_id = ba.user_id
    WHERE ba.id = holds.account_id 
    AND ca.agent_user_id = auth.uid()
  )
);

-- Admins can fully manage holds
CREATE POLICY "Admins can manage holds" 
ON public.holds 
FOR ALL 
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 6. PROFILES: Fix the overly permissive policy
-- The issue is that "Agents can view assigned client profiles" allows ALL agents/admins to see ALL profiles
-- We need to make this more restrictive
DROP POLICY IF EXISTS "Agents can view assigned client profiles" ON public.profiles;

-- Recreate with proper restriction: agents can ONLY see assigned clients, admins see all
CREATE POLICY "Agents can view assigned client profiles" 
ON public.profiles 
FOR SELECT 
USING (
  -- Agent can see assigned clients only
  EXISTS (
    SELECT 1 FROM client_assignments ca
    WHERE ca.client_user_id = profiles.id 
    AND ca.agent_user_id = auth.uid()
  )
  -- Agents can also see other agents (for messaging, etc)
  OR EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role IN ('agent', 'admin')
    AND EXISTS (
      SELECT 1 FROM user_roles ur2
      WHERE ur2.user_id = profiles.id AND ur2.role = 'agent'
    )
  )
);

-- 7. P1 FIXES: Add missing policies for workflow operations

-- Messages: Allow users to mark as read
DROP POLICY IF EXISTS "Users can update messages they received" ON public.messages;

CREATE POLICY "Users can update messages they received" 
ON public.messages 
FOR UPDATE 
USING (auth.uid() = to_user_id);

-- Appointments: Allow agents to create and manage
DROP POLICY IF EXISTS "Agents can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Agents can update appointments" ON public.appointments;

CREATE POLICY "Agents can create appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (
  auth.uid() = agent_id
  AND EXISTS (
    SELECT 1 FROM client_assignments ca
    WHERE ca.client_user_id = appointments.client_id 
    AND ca.agent_user_id = auth.uid()
  )
);

CREATE POLICY "Agents can update appointments" 
ON public.appointments 
FOR UPDATE 
USING (auth.uid() = agent_id);

-- Call logs: Allow agents to update their logs
DROP POLICY IF EXISTS "Agents can update their call logs" ON public.call_logs;

CREATE POLICY "Agents can update their call logs" 
ON public.call_logs 
FOR UPDATE 
USING (auth.uid() = agent_id);

-- 8. Add index for performance on common RLS queries
CREATE INDEX IF NOT EXISTS idx_client_assignments_agent_client 
ON public.client_assignments(agent_user_id, client_user_id);

CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id 
ON public.bank_accounts(user_id);

CREATE INDEX IF NOT EXISTS idx_transfers_user_id 
ON public.transfers(user_id);

CREATE INDEX IF NOT EXISTS idx_beneficiaries_user_id 
ON public.beneficiaries(user_id);