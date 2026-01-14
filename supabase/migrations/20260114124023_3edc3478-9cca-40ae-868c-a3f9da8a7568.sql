-- =====================================================
-- SECURITY HARDENING MIGRATION v2
-- Fix audit_logs user insert vulnerability
-- Restrict call_logs to assigned clients only
-- =====================================================

-- 1. DROP problematic user audit_logs insert policy (security risk)
DROP POLICY IF EXISTS "Users can insert their own audit logs" ON public.audit_logs;

-- 2. FIX call_logs - restrict agents to assigned clients only
DROP POLICY IF EXISTS "Agents can view call logs" ON public.call_logs;

CREATE POLICY "Agents can view assigned client call logs"
ON public.call_logs
FOR SELECT
USING (
  (auth.uid() = agent_id) 
  OR has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM client_assignments ca 
    WHERE ca.client_user_id = call_logs.client_id 
    AND ca.agent_user_id = auth.uid()
  )
);

-- 3. RESTRICT agent profile visibility to admins + assigned clients only
DROP POLICY IF EXISTS "Agents can view assigned client profiles" ON public.profiles;

CREATE POLICY "Agents can view assigned client profiles only"
ON public.profiles
FOR SELECT
USING (
  -- User can view own profile
  (auth.uid() = id)
  -- Agents can only view their assigned clients
  OR EXISTS (
    SELECT 1 FROM client_assignments ca 
    WHERE ca.client_user_id = profiles.id 
    AND ca.agent_user_id = auth.uid()
  )
  -- Admins can view all
  OR has_role(auth.uid(), 'admin')
);