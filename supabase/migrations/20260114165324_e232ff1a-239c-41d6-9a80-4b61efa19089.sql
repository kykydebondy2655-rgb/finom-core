-- Add policy for clients to download documents sent to them (incoming documents)
-- This ensures clients can download files even if storage path structure differs
CREATE POLICY "Clients can download their incoming documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'documents' 
  AND EXISTS (
    SELECT 1 FROM public.documents d 
    WHERE d.file_path = storage.objects.name 
    AND d.user_id = auth.uid() 
    AND d.direction = 'incoming'
  )
);