-- Allow admins to view all bank accounts
CREATE POLICY "Admins can view all bank accounts"
ON public.bank_accounts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update all bank accounts
CREATE POLICY "Admins can update all bank accounts"
ON public.bank_accounts
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to insert bank accounts
CREATE POLICY "Admins can insert bank accounts"
ON public.bank_accounts
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));