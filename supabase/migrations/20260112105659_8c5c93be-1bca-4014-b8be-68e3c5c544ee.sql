-- Add down_payment and property_price columns to loan_applications
ALTER TABLE public.loan_applications 
ADD COLUMN IF NOT EXISTS down_payment numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS property_price numeric DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN public.loan_applications.down_payment IS 'Apport personnel du client';
COMMENT ON COLUMN public.loan_applications.property_price IS 'Prix total du bien immobilier';