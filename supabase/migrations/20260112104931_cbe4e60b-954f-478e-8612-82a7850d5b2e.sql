
-- Fix remaining policies that still reference profiles.role causing potential recursion issues

-- Drop problematic policies on client_assignments (was recreated but still has old policy in useful-context)
DROP POLICY IF EXISTS "Agents can view their assignments" ON public.client_assignments;

-- Recreate the policy correctly using user_roles
CREATE POLICY "Agents can view their assignments" 
ON public.client_assignments 
FOR SELECT 
USING (
    auth.uid() = agent_user_id 
    OR EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = auth.uid() 
        AND user_roles.role = 'admin'::app_role
    )
);

-- Fix loan_applications policies that still reference profiles.role
DROP POLICY IF EXISTS "Agents can view all loans" ON public.loan_applications;

CREATE POLICY "Agents can view all loans" 
ON public.loan_applications 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = auth.uid() 
        AND user_roles.role IN ('agent'::app_role, 'admin'::app_role)
    )
);

-- Fix profiles policies that still reference profiles.role (the old ones)
DROP POLICY IF EXISTS "Agents can view assigned client profiles" ON public.profiles;

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
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = auth.uid() 
        AND user_roles.role IN ('agent'::app_role, 'admin'::app_role)
    )
);

-- Fix other tables that reference profiles.role

-- call_logs
DROP POLICY IF EXISTS "Agents can view call logs" ON public.call_logs;
CREATE POLICY "Agents can view call logs" 
ON public.call_logs 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = auth.uid() 
        AND user_roles.role IN ('agent'::app_role, 'admin'::app_role)
    )
);

-- callbacks
DROP POLICY IF EXISTS "Agents can view their callbacks" ON public.callbacks;
CREATE POLICY "Agents can view their callbacks" 
ON public.callbacks 
FOR SELECT 
USING (
    auth.uid() = agent_id 
    OR EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = auth.uid() 
        AND user_roles.role = 'admin'::app_role
    )
);

-- documents
DROP POLICY IF EXISTS "Agents can view all documents" ON public.documents;
CREATE POLICY "Agents can view all documents" 
ON public.documents 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = auth.uid() 
        AND user_roles.role IN ('agent'::app_role, 'admin'::app_role)
    )
);

-- appointments
DROP POLICY IF EXISTS "Users can view their appointments" ON public.appointments;
CREATE POLICY "Users can view their appointments" 
ON public.appointments 
FOR SELECT 
USING (
    auth.uid() = client_id 
    OR auth.uid() = agent_id 
    OR EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = auth.uid() 
        AND user_roles.role = 'admin'::app_role
    )
);

-- audit_logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = auth.uid() 
        AND user_roles.role = 'admin'::app_role
    )
);

-- system_settings
DROP POLICY IF EXISTS "Admins can update settings" ON public.system_settings;
CREATE POLICY "Admins can update settings" 
ON public.system_settings 
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = auth.uid() 
        AND user_roles.role = 'admin'::app_role
    )
);
