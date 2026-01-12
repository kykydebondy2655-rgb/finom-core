-- Fix PUBLIC_SYSTEM_SETTINGS: Restrict system_settings to authenticated users only
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can read settings" ON public.system_settings;

-- Create a restricted policy: only authenticated users can read settings
CREATE POLICY "Authenticated users can read settings"
ON public.system_settings
FOR SELECT
TO authenticated
USING (true);

-- Admins can still update (existing policy is fine)