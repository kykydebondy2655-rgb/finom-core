-- Add direction and motif fields to documents table for admin-sent documents
-- direction: 'outgoing' = client uploads to FINOM, 'incoming' = FINOM sends to client
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS direction TEXT DEFAULT 'outgoing',
ADD COLUMN IF NOT EXISTS motif TEXT,
ADD COLUMN IF NOT EXISTS uploaded_by UUID;

-- Add comment for clarity
COMMENT ON COLUMN public.documents.direction IS 'outgoing = client uploads, incoming = admin sends to client';
COMMENT ON COLUMN public.documents.motif IS 'Reason/purpose for admin-sent documents';
COMMENT ON COLUMN public.documents.uploaded_by IS 'UUID of user who uploaded the document (for admin uploads)';

-- RLS: Admins can insert documents for any user (incoming documents)
CREATE POLICY "Admins can upload documents for clients"
ON public.documents
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'::app_role
  )
);

-- RLS: Clients can view incoming documents sent to them
CREATE POLICY "Users can view incoming documents"
ON public.documents
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id AND direction = 'incoming'
);