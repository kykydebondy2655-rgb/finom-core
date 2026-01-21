-- =====================================================
-- SECURITY FIX: Add deny_anonymous_access policies to all sensitive tables
-- This blocks unauthenticated access to all tables with RLS enabled
-- =====================================================

-- profiles
CREATE POLICY "Deny anonymous access on profiles"
ON public.profiles
FOR ALL
TO anon
USING (false);

-- bank_accounts
CREATE POLICY "Deny anonymous access on bank_accounts"
ON public.bank_accounts
FOR ALL
TO anon
USING (false);

-- beneficiaries
CREATE POLICY "Deny anonymous access on beneficiaries"
ON public.beneficiaries
FOR ALL
TO anon
USING (false);

-- loan_applications
CREATE POLICY "Deny anonymous access on loan_applications"
ON public.loan_applications
FOR ALL
TO anon
USING (false);

-- documents
CREATE POLICY "Deny anonymous access on documents"
ON public.documents
FOR ALL
TO anon
USING (false);

-- transfers
CREATE POLICY "Deny anonymous access on transfers"
ON public.transfers
FOR ALL
TO anon
USING (false);

-- transactions
CREATE POLICY "Deny anonymous access on transactions"
ON public.transactions
FOR ALL
TO anon
USING (false);

-- login_history
CREATE POLICY "Deny anonymous access on login_history"
ON public.login_history
FOR ALL
TO anon
USING (false);

-- messages
CREATE POLICY "Deny anonymous access on messages"
ON public.messages
FOR ALL
TO anon
USING (false);

-- support_messages
CREATE POLICY "Deny anonymous access on support_messages"
ON public.support_messages
FOR ALL
TO anon
USING (false);

-- impersonation_tokens
CREATE POLICY "Deny anonymous access on impersonation_tokens"
ON public.impersonation_tokens
FOR ALL
TO anon
USING (false);

-- notifications
CREATE POLICY "Deny anonymous access on notifications"
ON public.notifications
FOR ALL
TO anon
USING (false);

-- appointments
CREATE POLICY "Deny anonymous access on appointments"
ON public.appointments
FOR ALL
TO anon
USING (false);

-- callbacks
CREATE POLICY "Deny anonymous access on callbacks"
ON public.callbacks
FOR ALL
TO anon
USING (false);

-- call_logs
CREATE POLICY "Deny anonymous access on call_logs"
ON public.call_logs
FOR ALL
TO anon
USING (false);

-- client_notes
CREATE POLICY "Deny anonymous access on client_notes"
ON public.client_notes
FOR ALL
TO anon
USING (false);

-- client_assignments
CREATE POLICY "Deny anonymous access on client_assignments"
ON public.client_assignments
FOR ALL
TO anon
USING (false);

-- holds
CREATE POLICY "Deny anonymous access on holds"
ON public.holds
FOR ALL
TO anon
USING (false);

-- user_roles
CREATE POLICY "Deny anonymous access on user_roles"
ON public.user_roles
FOR ALL
TO anon
USING (false);

-- audit_logs
CREATE POLICY "Deny anonymous access on audit_logs"
ON public.audit_logs
FOR ALL
TO anon
USING (false);

-- email_logs
CREATE POLICY "Deny anonymous access on email_logs"
ON public.email_logs
FOR ALL
TO anon
USING (false);

-- system_settings
CREATE POLICY "Deny anonymous access on system_settings"
ON public.system_settings
FOR ALL
TO anon
USING (false);

-- email_templates
CREATE POLICY "Deny anonymous access on email_templates"
ON public.email_templates
FOR ALL
TO anon
USING (false);

-- client_status_history
CREATE POLICY "Deny anonymous access on client_status_history"
ON public.client_status_history
FOR ALL
TO anon
USING (false);

-- loan_status_history
CREATE POLICY "Deny anonymous access on loan_status_history"
ON public.loan_status_history
FOR ALL
TO anon
USING (false);

-- profile_audit_logs
CREATE POLICY "Deny anonymous access on profile_audit_logs"
ON public.profile_audit_logs
FOR ALL
TO anon
USING (false);

-- pending_imports
CREATE POLICY "Deny anonymous access on pending_imports"
ON public.pending_imports
FOR ALL
TO anon
USING (false);

-- lead_assignments_log
CREATE POLICY "Deny anonymous access on lead_assignments_log"
ON public.lead_assignments_log
FOR ALL
TO anon
USING (false);

-- appointment_slots
CREATE POLICY "Deny anonymous access on appointment_slots"
ON public.appointment_slots
FOR ALL
TO anon
USING (false);