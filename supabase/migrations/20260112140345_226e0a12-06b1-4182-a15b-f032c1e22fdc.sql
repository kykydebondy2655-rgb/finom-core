-- Add project_type column to loan_applications
ALTER TABLE public.loan_applications 
ADD COLUMN IF NOT EXISTS project_type TEXT DEFAULT 'achat_residence_principale';