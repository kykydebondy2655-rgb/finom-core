-- Add INSERT policy for admins to upload documents for any client
CREATE POLICY "Admins can upload documents for clients"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);