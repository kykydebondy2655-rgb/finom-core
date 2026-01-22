-- Add borrower_type column to loan_applications for distinguishing individual vs business loans
ALTER TABLE public.loan_applications 
ADD COLUMN IF NOT EXISTS borrower_type TEXT DEFAULT 'particulier';

-- Add company-specific fields for business loan applications
ALTER TABLE public.loan_applications 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS company_siret TEXT,
ADD COLUMN IF NOT EXISTS company_legal_form TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.loan_applications.borrower_type IS 'Type of borrower: particulier (individual) or entreprise (business)';
COMMENT ON COLUMN public.loan_applications.company_name IS 'Company name for business loans';
COMMENT ON COLUMN public.loan_applications.company_siret IS 'SIRET number for business loans';
COMMENT ON COLUMN public.loan_applications.company_legal_form IS 'Legal form (SARL, SAS, SCI, etc.) for business loans';