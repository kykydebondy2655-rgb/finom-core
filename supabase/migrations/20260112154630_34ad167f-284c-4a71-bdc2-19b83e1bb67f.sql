-- Ajouter les colonnes manquantes pour le simulateur complet
ALTER TABLE public.loan_applications
ADD COLUMN IF NOT EXISTS notary_fees numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS agency_fees numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS works_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_credit numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS monthly_insurance numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS insurance_cost numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS total_fees numeric DEFAULT NULL;

-- Ajouter des commentaires pour clarifier les colonnes
COMMENT ON COLUMN public.loan_applications.notary_fees IS 'Frais de notaire en euros';
COMMENT ON COLUMN public.loan_applications.agency_fees IS 'Frais d''agence en euros';
COMMENT ON COLUMN public.loan_applications.works_amount IS 'Montant des travaux en euros';
COMMENT ON COLUMN public.loan_applications.monthly_credit IS 'Mensualité crédit hors assurance';
COMMENT ON COLUMN public.loan_applications.monthly_insurance IS 'Mensualité assurance emprunteur';
COMMENT ON COLUMN public.loan_applications.insurance_cost IS 'Coût total de l''assurance sur la durée du prêt';
COMMENT ON COLUMN public.loan_applications.total_fees IS 'Total des frais (notaire + agence)';