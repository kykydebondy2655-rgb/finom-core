-- ========================
-- 1. Extend profiles table with city/postal_code fields
-- ========================
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS postal_code text,
ADD COLUMN IF NOT EXISTS country text DEFAULT 'France';

-- ========================
-- 2. Add co-borrower support to loan_applications
-- ========================
ALTER TABLE public.loan_applications
ADD COLUMN IF NOT EXISTS has_coborrower boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS coborrower_data jsonb DEFAULT NULL;

-- ========================
-- 3. Add document_owner to documents table for co-borrower docs
-- ========================
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS document_owner text DEFAULT 'primary' CHECK (document_owner IN ('primary', 'co_borrower'));

-- ========================
-- 4. Create batch_assign_leads RPC function
-- ========================
CREATE OR REPLACE FUNCTION public.batch_assign_leads(
  _lead_ids uuid[],
  _agent_id uuid,
  _admin_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _updated_count INTEGER := 0;
  _lead_id UUID;
  _action TEXT;
  _old_agent_id UUID;
BEGIN
  -- Verify caller is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can batch assign leads';
  END IF;

  -- Determine action (assign or unassign)
  IF _agent_id IS NULL THEN
    _action := 'unassign';
  ELSE
    _action := 'assign';
  END IF;

  -- Process each lead
  FOREACH _lead_id IN ARRAY _lead_ids
  LOOP
    -- Get current assignment if any
    SELECT agent_user_id INTO _old_agent_id 
    FROM client_assignments 
    WHERE client_user_id = _lead_id;

    -- Remove existing assignment if any
    DELETE FROM client_assignments WHERE client_user_id = _lead_id;

    -- If assigning to an agent, create new assignment
    IF _agent_id IS NOT NULL THEN
      INSERT INTO client_assignments (agent_user_id, client_user_id)
      VALUES (_agent_id, _lead_id);
      
      -- Update lead status
      UPDATE profiles SET lead_status = 'assigned' WHERE id = _lead_id;
    ELSE
      -- Unassigning - set back to new
      UPDATE profiles SET lead_status = 'new' WHERE id = _lead_id;
    END IF;

    -- Log the action
    INSERT INTO lead_assignments_log (lead_id, from_agent_id, to_agent_id, action, performed_by_admin_id)
    VALUES (_lead_id, _old_agent_id, _agent_id, _action, _admin_id);

    _updated_count := _updated_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'updated_count', _updated_count,
    'requested_count', array_length(_lead_ids, 1)
  );
END;
$function$;

-- ========================
-- 5. Create index for performance
-- ========================
CREATE INDEX IF NOT EXISTS idx_profiles_lead_status ON public.profiles(lead_status);
CREATE INDEX IF NOT EXISTS idx_loan_applications_has_coborrower ON public.loan_applications(has_coborrower) WHERE has_coborrower = true;