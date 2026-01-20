-- Create email_templates table for visual template editor
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  description TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Only admins can manage email templates
CREATE POLICY "Admins can view all email templates"
  ON public.email_templates
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create email templates"
  ON public.email_templates
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update email templates"
  ON public.email_templates
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete email templates"
  ON public.email_templates
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default templates with variable placeholders
INSERT INTO public.email_templates (name, subject, description, variables, html_content) VALUES
('welcome', 'Bienvenue chez FINOM – Votre espace client est prêt 🏦', 'Email envoyé aux nouveaux clients', '["firstName", "email"]'::jsonb, '<p>Bienvenue {{firstName}} !</p>'),
('loanSubmitted', 'Demande de prêt reçue ✓', 'Confirmation de soumission de demande', '["firstName", "loanId", "amount", "duration"]'::jsonb, '<p>Demande enregistrée</p>'),
('loanApproved', 'Félicitations – Offre de prêt disponible 🎉', 'Notification d''approbation de prêt', '["firstName", "amount", "rate", "monthlyPayment"]'::jsonb, '<p>Offre approuvée</p>'),
('loanRejected', 'Mise à jour de votre demande de prêt', 'Notification de refus avec motif', '["firstName", "reason"]'::jsonb, '<p>Demande refusée</p>'),
('documentRequest', 'Documents requis pour votre dossier 📄', 'Demande de documents complémentaires', '["firstName", "documents"]'::jsonb, '<p>Documents demandés</p>'),
('documentValidated', 'Document validé ✓', 'Confirmation de validation de document', '["firstName", "documentName"]'::jsonb, '<p>Document validé</p>'),
('documentRejected', 'Document à corriger', 'Demande de correction de document', '["firstName", "documentName", "rejectionReason"]'::jsonb, '<p>Document rejeté</p>'),
('appointmentReminder', 'Rappel – Rendez-vous téléphonique demain', 'Rappel de rendez-vous', '["firstName", "scheduledAt", "agentName"]'::jsonb, '<p>Rappel RDV</p>'),
('passwordReset', 'Réinitialisation de votre mot de passe', 'Lien de reset mot de passe', '["firstName", "resetLink"]'::jsonb, '<p>Reset password</p>'),
('accountOpening', 'Vos accès à votre espace client FINOM', 'Identifiants de connexion', '["firstName", "email", "tempPassword", "loginUrl"]'::jsonb, '<p>Accès compte</p>');