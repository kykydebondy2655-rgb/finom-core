-- Insert initial system settings
INSERT INTO public.system_settings (key, value, category, type, description) VALUES
-- Loan settings
('min_loan_amount', '10000', 'loans', 'number', 'Montant minimum de prêt en euros'),
('max_loan_amount', '2000000', 'loans', 'number', 'Montant maximum de prêt en euros'),
('min_duration_years', '5', 'loans', 'number', 'Durée minimum de prêt en années'),
('max_duration_years', '30', 'loans', 'number', 'Durée maximum de prêt en années'),
('min_down_payment_percent', '10', 'loans', 'number', 'Apport minimum en pourcentage'),
('insurance_rate', '0.31', 'loans', 'number', 'Taux d''assurance emprunteur (%)'),
('bank_fees', '500', 'loans', 'number', 'Frais de dossier bancaire en euros'),

-- Rate profiles
('rate_excellent_10', '2.75', 'rates', 'number', 'Taux profil excellent 10 ans'),
('rate_excellent_15', '2.95', 'rates', 'number', 'Taux profil excellent 15 ans'),
('rate_excellent_20', '3.10', 'rates', 'number', 'Taux profil excellent 20 ans'),
('rate_excellent_25', '3.25', 'rates', 'number', 'Taux profil excellent 25 ans'),
('rate_standard_10', '2.95', 'rates', 'number', 'Taux profil standard 10 ans'),
('rate_standard_15', '3.15', 'rates', 'number', 'Taux profil standard 15 ans'),
('rate_standard_20', '3.32', 'rates', 'number', 'Taux profil standard 20 ans'),
('rate_standard_25', '3.50', 'rates', 'number', 'Taux profil standard 25 ans'),

-- Business hours
('business_hours_start', '09:00', 'business', 'string', 'Heure d''ouverture'),
('business_hours_end', '18:00', 'business', 'string', 'Heure de fermeture'),
('business_days', 'lun,mar,mer,jeu,ven', 'business', 'string', 'Jours ouvrés'),

-- Email settings
('email_sender_name', 'FINOM', 'email', 'string', 'Nom d''expéditeur des emails'),
('email_sender_address', 'noreply@pret-finom.co', 'email', 'string', 'Adresse email d''expédition'),

-- Security
('session_timeout_minutes', '60', 'security', 'number', 'Timeout de session en minutes'),
('max_login_attempts', '5', 'security', 'number', 'Tentatives de connexion max'),
('password_min_length', '8', 'security', 'number', 'Longueur minimum du mot de passe')

ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();