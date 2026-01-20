-- Table pour stocker les tokens d'impersonation temporaires
CREATE TABLE public.impersonation_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour recherche rapide par token
CREATE INDEX idx_impersonation_tokens_token ON public.impersonation_tokens(token);
CREATE INDEX idx_impersonation_tokens_expires ON public.impersonation_tokens(expires_at);

-- Enable RLS
ALTER TABLE public.impersonation_tokens ENABLE ROW LEVEL SECURITY;

-- Admins peuvent tout voir
CREATE POLICY "Admins can manage all impersonation tokens"
ON public.impersonation_tokens
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Agents peuvent créer des tokens pour leurs clients assignés uniquement
CREATE POLICY "Agents can create tokens for assigned clients"
ON public.impersonation_tokens
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'agent') 
  AND admin_user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.client_assignments 
    WHERE agent_user_id = auth.uid() 
    AND client_user_id = target_user_id
  )
);

-- Agents peuvent voir leurs propres tokens
CREATE POLICY "Agents can view own tokens"
ON public.impersonation_tokens
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'agent') 
  AND admin_user_id = auth.uid()
);