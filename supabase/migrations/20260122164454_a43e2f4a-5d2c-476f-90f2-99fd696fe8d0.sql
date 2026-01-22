-- Add DELETE policy for admins on documents table
CREATE POLICY "Admins can delete documents"
ON public.documents
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Also add DELETE policy for storage objects for admins
CREATE POLICY "Admins can delete any storage object"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);