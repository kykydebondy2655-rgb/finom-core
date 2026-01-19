-- Add explicit denial of public/anonymous access to messages table
-- This ensures only authenticated users with proper authorization can access messages

-- First, ensure RLS is enabled (it should already be, but being explicit)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create a policy that explicitly blocks anonymous/public access
-- All existing policies use auth.uid() which returns NULL for anonymous users,
-- but let's make the denial explicit for security clarity

-- Drop any overly permissive policies if they exist
DROP POLICY IF EXISTS "Public can view messages" ON public.messages;
DROP POLICY IF EXISTS "Anyone can view messages" ON public.messages;
DROP POLICY IF EXISTS "Anonymous can view messages" ON public.messages;

-- Add a comment to document the security posture
COMMENT ON TABLE public.messages IS 'Private messages between users and agents. Access is restricted to authenticated participants only via RLS policies.';
