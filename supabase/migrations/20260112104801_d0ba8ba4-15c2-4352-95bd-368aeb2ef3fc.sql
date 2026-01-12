
-- Drop problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Agents can view their assignments" ON public.client_assignments;
DROP POLICY IF EXISTS "Agents can view all loans" ON public.loan_applications;
DROP POLICY IF EXISTS "Agents can view assigned client loans" ON public.loan_applications;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Agents can view assigned client profiles" ON public.profiles;

-- Recreate policies using user_roles table instead of profiles.role to avoid recursion

-- client_assignments: Agents and admins can view assignments
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

-- loan_applications: Agents can view loans of assigned clients
CREATE POLICY "Agents can view assigned client loans" 
ON public.loan_applications 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.client_assignments ca
        WHERE ca.client_user_id = loan_applications.user_id 
        AND ca.agent_user_id = auth.uid()
    )
);

-- loan_applications: Admins can view all loans
CREATE POLICY "Admins can view all loans" 
ON public.loan_applications 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = auth.uid() 
        AND user_roles.role = 'admin'::app_role
    )
);

-- profiles: Admins can view all profiles (using user_roles, not profiles)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = auth.uid() 
        AND user_roles.role = 'admin'::app_role
    )
);

-- profiles: Agents can view assigned client profiles (using user_roles)
CREATE POLICY "Agents can view assigned client profiles" 
ON public.profiles 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.client_assignments ca
        JOIN public.user_roles ur ON ur.user_id = auth.uid() AND ur.role IN ('agent'::app_role, 'admin'::app_role)
        WHERE ca.client_user_id = profiles.id 
        AND ca.agent_user_id = auth.uid()
    )
);
