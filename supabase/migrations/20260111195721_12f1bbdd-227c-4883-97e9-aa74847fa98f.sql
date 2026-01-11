-- Allow admins to INSERT and DELETE assignments
CREATE POLICY "Admins can create assignments"
ON public.client_assignments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete assignments"
ON public.client_assignments
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to UPDATE loan_applications (for status changes)
CREATE POLICY "Admins can update any loan"
ON public.loan_applications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);