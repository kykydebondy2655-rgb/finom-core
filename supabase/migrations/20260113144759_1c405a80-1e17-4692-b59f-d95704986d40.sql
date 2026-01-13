-- Admin RPC to delete an agent and all dependent data (atomic)
CREATE OR REPLACE FUNCTION public.admin_delete_agent(_agent_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can delete agents';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = _agent_id) THEN
    RAISE EXCEPTION 'Agent not found';
  END IF;

  -- Remove agent references to avoid FK violations

  -- Messages (if agent ever participated)
  DELETE FROM public.messages WHERE from_user_id = _agent_id OR to_user_id = _agent_id;

  -- Notifications
  DELETE FROM public.notifications WHERE user_id = _agent_id;

  -- Audit logs
  DELETE FROM public.audit_logs WHERE user_id = _agent_id;

  -- Calls / callbacks / appointments
  DELETE FROM public.call_logs WHERE agent_id = _agent_id;
  DELETE FROM public.callbacks WHERE agent_id = _agent_id;
  DELETE FROM public.appointments WHERE agent_id = _agent_id;

  -- Unassign all clients from this agent
  DELETE FROM public.client_assignments WHERE agent_user_id = _agent_id;

  -- Documents validation attribution (avoid FK)
  UPDATE public.documents SET validated_by = NULL WHERE validated_by = _agent_id;

  -- Transfers processed by this agent (avoid FK)
  UPDATE public.transfers SET agent_id = NULL WHERE agent_id = _agent_id;

  -- Role mapping
  DELETE FROM public.user_roles WHERE user_id = _agent_id;

  -- Finally delete profile
  DELETE FROM public.profiles WHERE id = _agent_id;

  RETURN jsonb_build_object('success', true, 'deleted_agent_id', _agent_id);
END;
$$;