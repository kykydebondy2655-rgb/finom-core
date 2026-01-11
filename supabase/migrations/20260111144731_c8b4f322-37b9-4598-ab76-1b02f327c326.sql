
-- Allow agents to view loans of their assigned clients
CREATE POLICY "Agents can view assigned client loans"
ON public.loan_applications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM client_assignments ca
    WHERE ca.client_user_id = loan_applications.user_id
    AND ca.agent_user_id = auth.uid()
  )
);

-- Allow agents to view documents of their assigned clients
CREATE POLICY "Agents can view assigned client documents"
ON public.documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM client_assignments ca
    WHERE ca.client_user_id = documents.user_id
    AND ca.agent_user_id = auth.uid()
  )
);
