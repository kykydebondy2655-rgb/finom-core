-- =====================================================
-- SECURITY HARDENING MIGRATION
-- Fixes 5 critical RLS vulnerabilities
-- =====================================================

-- 1. DROP overly permissive "Agents can view ALL loans" policy
DROP POLICY IF EXISTS "Agents can view all loans" ON public.loan_applications;

-- 2. DROP overly permissive "Agents can view all documents" policy  
DROP POLICY IF EXISTS "Agents can view all documents" ON public.documents;

-- 3. FIX system_settings - restrict to admins only (remove public read)
DROP POLICY IF EXISTS "Authenticated users can read settings" ON public.system_settings;

CREATE POLICY "Only admins can read settings"
ON public.system_settings
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- 4. ADD restrictive INSERT policy for transactions (admin/system only)
CREATE POLICY "Only admins can insert transactions"
ON public.transactions
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 5. ADD admin SELECT policy for transactions (currently missing for admins)
CREATE POLICY "Admins can view all transactions"
ON public.transactions
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- 6. ADD explicit user SELECT restriction for login_history (already correct but ensure)
-- Users can only see their OWN login history
CREATE POLICY "Users can view their own login history"
ON public.login_history
FOR SELECT
USING (auth.uid() = user_id);

-- 7. ADD admin INSERT for audit_logs (system/admin only)
CREATE POLICY "Admins can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- 8. ADD authenticated users INSERT for audit_logs (for their own actions)
CREATE POLICY "Users can insert their own audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);