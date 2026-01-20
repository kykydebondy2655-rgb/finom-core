-- ============================================
-- 1. FIX RLS POLICIES FOR client_notes TABLE
-- ============================================

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Admins can manage all notes" ON public.client_notes;
DROP POLICY IF EXISTS "Agents can view notes for assigned clients" ON public.client_notes;
DROP POLICY IF EXISTS "Agents can create notes for assigned clients" ON public.client_notes;
DROP POLICY IF EXISTS "Agents can update their own notes" ON public.client_notes;
DROP POLICY IF EXISTS "Agents can delete their own notes" ON public.client_notes;

-- Ensure RLS is enabled
ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;

-- Admin full access (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Admins full access to client_notes"
ON public.client_notes
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Agents can SELECT notes for their assigned clients
CREATE POLICY "Agents can view notes for assigned clients"
ON public.client_notes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.client_assignments ca
    WHERE ca.client_user_id = client_notes.client_id
      AND ca.agent_user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
);

-- Agents can INSERT notes for their assigned clients
CREATE POLICY "Agents can create notes for assigned clients"
ON public.client_notes
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = agent_id
  AND EXISTS (
    SELECT 1 FROM public.client_assignments ca
    WHERE ca.client_user_id = client_notes.client_id
      AND ca.agent_user_id = auth.uid()
  )
);

-- Agents can UPDATE their own notes
CREATE POLICY "Agents can update their own notes"
ON public.client_notes
FOR UPDATE
TO authenticated
USING (auth.uid() = agent_id)
WITH CHECK (auth.uid() = agent_id);

-- Agents can DELETE their own notes
CREATE POLICY "Agents can delete their own notes"
ON public.client_notes
FOR DELETE
TO authenticated
USING (auth.uid() = agent_id);

-- ============================================
-- 2. CREATE profile_audit_logs TABLE FOR AUDIT HISTORY
-- ============================================

CREATE TABLE IF NOT EXISTS public.profile_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  changed_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  action TEXT NOT NULL DEFAULT 'update',
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[] NOT NULL DEFAULT '{}'
);

-- Enable RLS on profile_audit_logs
ALTER TABLE public.profile_audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all audit logs
CREATE POLICY "Admins can view all profile audit logs"
ON public.profile_audit_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Agents can view audit logs for their assigned clients
CREATE POLICY "Agents can view audit logs for assigned clients"
ON public.profile_audit_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.client_assignments ca
    WHERE ca.client_user_id = profile_audit_logs.profile_id
      AND ca.agent_user_id = auth.uid()
  )
);

-- Admins and agents can insert audit logs
CREATE POLICY "Staff can create profile audit logs"
ON public.profile_audit_logs
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = changed_by
  AND (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'agent')
  )
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profile_audit_logs_profile_id ON public.profile_audit_logs(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_audit_logs_changed_at ON public.profile_audit_logs(changed_at DESC);