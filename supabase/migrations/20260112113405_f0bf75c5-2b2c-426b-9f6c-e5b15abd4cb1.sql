-- Allow agents to update documents for their assigned clients
CREATE POLICY "Agents can update assigned client documents"
ON public.documents
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM client_assignments ca
    WHERE ca.client_user_id = documents.user_id
    AND ca.agent_user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'::app_role
  )
);

-- Allow agents to update loan applications for their assigned clients
CREATE POLICY "Agents can update assigned client loans"
ON public.loan_applications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM client_assignments ca
    WHERE ca.client_user_id = loan_applications.user_id
    AND ca.agent_user_id = auth.uid()
  )
);

-- Allow agents/admins to insert notifications for clients
CREATE POLICY "Agents can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('agent'::app_role, 'admin'::app_role)
  )
);