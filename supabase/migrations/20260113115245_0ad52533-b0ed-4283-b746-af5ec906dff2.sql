-- Ajouter les colonnes pour les leads dans profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS property_price numeric,
ADD COLUMN IF NOT EXISTS down_payment text,
ADD COLUMN IF NOT EXISTS purchase_type text,
ADD COLUMN IF NOT EXISTS lead_source text,
ADD COLUMN IF NOT EXISTS pipeline_stage text,
ADD COLUMN IF NOT EXISTS lead_status text DEFAULT 'new',
ADD COLUMN IF NOT EXISTS must_change_password boolean DEFAULT false;

-- Créer un index pour filtrer les leads par statut
CREATE INDEX IF NOT EXISTS idx_profiles_lead_status ON public.profiles(lead_status);

-- Politique RLS pour permettre aux admins de supprimer des profils
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Fonction pour assigner des leads à un agent
CREATE OR REPLACE FUNCTION public.assign_leads_to_agent(
  _agent_id uuid,
  _count integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _assigned_count integer := 0;
  _lead_id uuid;
BEGIN
  -- Vérifier que l'appelant est admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can assign leads';
  END IF;

  -- Sélectionner les leads NEW les plus anciens
  FOR _lead_id IN
    SELECT p.id 
    FROM profiles p
    LEFT JOIN client_assignments ca ON ca.client_user_id = p.id
    WHERE p.lead_status = 'new'
      AND ca.id IS NULL
    ORDER BY p.created_at ASC
    LIMIT _count
  LOOP
    -- Créer l'assignation
    INSERT INTO client_assignments (agent_user_id, client_user_id)
    VALUES (_agent_id, _lead_id)
    ON CONFLICT (client_user_id) DO NOTHING;
    
    -- Mettre à jour le statut du lead
    UPDATE profiles 
    SET lead_status = 'assigned'
    WHERE id = _lead_id;
    
    _assigned_count := _assigned_count + 1;
  END LOOP;

  RETURN _assigned_count;
END;
$$;