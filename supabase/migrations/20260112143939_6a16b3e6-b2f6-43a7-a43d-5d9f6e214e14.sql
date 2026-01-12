-- Fix storage policy: Agents should only view documents of assigned clients
-- Drop the overly permissive agent policy
DROP POLICY IF EXISTS "Agents can view all documents" ON storage.objects;

-- Create a more restrictive policy for agents
CREATE POLICY "Agents can view assigned client documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND (
    -- Owner can always access their own documents
    auth.uid()::text = (storage.foldername(name))[1]
    -- Agents can only access documents of clients assigned to them
    OR EXISTS (
      SELECT 1 FROM public.client_assignments ca
      WHERE ca.agent_user_id = auth.uid()
      AND ca.client_user_id::text = (storage.foldername(name))[1]
    )
    -- Admins can access all documents
    OR public.has_role(auth.uid(), 'admin')
  )
);

-- Add an index on client_assignments for better performance
CREATE INDEX IF NOT EXISTS idx_client_assignments_agent_client 
ON public.client_assignments(agent_user_id, client_user_id);