-- Fix infinite recursion in profiles RLS policy
-- The issue is that "Agents can view assigned client profiles" policy references profiles table again

-- Drop the problematic policy
DROP POLICY IF EXISTS "Agents can view assigned client profiles" ON public.profiles;

-- Recreate without the circular reference (don't check profiles.role, use user_roles instead)
CREATE POLICY "Agents can view assigned client profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.client_assignments ca
    WHERE ca.client_user_id = profiles.id 
    AND ca.agent_user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);