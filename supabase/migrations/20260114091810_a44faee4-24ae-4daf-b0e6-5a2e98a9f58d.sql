-- Table de log pour l'audit des réattributions de leads
CREATE TABLE public.lead_assignments_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL,
  from_agent_id UUID,
  to_agent_id UUID,
  action TEXT NOT NULL CHECK (action IN ('assign', 'unassign', 'transfer')),
  performed_by_admin_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour performances
CREATE INDEX idx_lead_assignments_log_lead_id ON public.lead_assignments_log(lead_id);
CREATE INDEX idx_lead_assignments_log_from_agent ON public.lead_assignments_log(from_agent_id);
CREATE INDEX idx_lead_assignments_log_to_agent ON public.lead_assignments_log(to_agent_id);
CREATE INDEX idx_lead_assignments_log_created_at ON public.lead_assignments_log(created_at DESC);

-- Enable RLS
ALTER TABLE public.lead_assignments_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Admins can view assignment logs"
ON public.lead_assignments_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Only admins can insert logs (via RPC)
CREATE POLICY "Admins can insert assignment logs"
ON public.lead_assignments_log
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- RPC Function: reassign_leads (atomique)
CREATE OR REPLACE FUNCTION public.reassign_leads(
  _lead_ids UUID[],
  _from_agent_id UUID,
  _to_agent_id UUID,
  _admin_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _updated_count INTEGER := 0;
  _lead_id UUID;
  _action TEXT;
BEGIN
  -- Vérifier que l'appelant est admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can reassign leads';
  END IF;

  -- Déterminer l'action
  IF _to_agent_id IS NULL THEN
    _action := 'unassign';
  ELSE
    _action := 'transfer';
  END IF;

  -- Traiter chaque lead
  FOREACH _lead_id IN ARRAY _lead_ids
  LOOP
    -- Vérifier que le lead est bien assigné à from_agent_id
    IF EXISTS (
      SELECT 1 FROM client_assignments 
      WHERE client_user_id = _lead_id 
        AND agent_user_id = _from_agent_id
    ) THEN
      -- Supprimer l'ancienne assignation
      DELETE FROM client_assignments 
      WHERE client_user_id = _lead_id 
        AND agent_user_id = _from_agent_id;

      -- Si transfert, créer nouvelle assignation
      IF _to_agent_id IS NOT NULL THEN
        INSERT INTO client_assignments (agent_user_id, client_user_id)
        VALUES (_to_agent_id, _lead_id)
        ON CONFLICT (client_user_id) DO UPDATE 
        SET agent_user_id = _to_agent_id, assigned_at = now();
      END IF;

      -- Mettre à jour le statut du lead
      IF _to_agent_id IS NULL THEN
        UPDATE profiles SET lead_status = 'new' WHERE id = _lead_id;
      ELSE
        UPDATE profiles SET lead_status = 'assigned' WHERE id = _lead_id;
      END IF;

      -- Logger l'action
      INSERT INTO lead_assignments_log (lead_id, from_agent_id, to_agent_id, action, performed_by_admin_id)
      VALUES (_lead_id, _from_agent_id, _to_agent_id, _action, _admin_id);

      _updated_count := _updated_count + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'updated_count', _updated_count,
    'requested_count', array_length(_lead_ids, 1)
  );
END;
$$;

-- RPC Function: get_agent_assigned_leads (pour le modal)
CREATE OR REPLACE FUNCTION public.get_agent_assigned_leads(_agent_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  lead_status TEXT,
  pipeline_stage TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Vérifier que l'appelant est admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can view agent assigned leads';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    p.phone,
    p.lead_status,
    p.pipeline_stage,
    ca.assigned_at
  FROM profiles p
  INNER JOIN client_assignments ca ON ca.client_user_id = p.id
  WHERE ca.agent_user_id = _agent_id
  ORDER BY ca.assigned_at DESC;
END;
$$;