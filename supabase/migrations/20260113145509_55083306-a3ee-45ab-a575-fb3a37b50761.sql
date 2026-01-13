-- Make admin_delete_client robust for deleting profiles that may also be agents
CREATE OR REPLACE FUNCTION public.admin_delete_client(_client_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check caller is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can delete clients';
  END IF;

  -- Check profile exists
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = _client_id) THEN
    RAISE EXCEPTION 'Client not found';
  END IF;

  -- Delete in correct order to avoid FK constraints

  -- 1. Delete messages (from and to)
  DELETE FROM messages WHERE from_user_id = _client_id OR to_user_id = _client_id;

  -- 2. Delete notifications
  DELETE FROM notifications WHERE user_id = _client_id;

  -- 3. Delete callbacks (client or agent)
  DELETE FROM callbacks WHERE client_id = _client_id OR agent_id = _client_id;

  -- 4. Delete call_logs (client or agent)
  DELETE FROM call_logs WHERE client_id = _client_id OR agent_id = _client_id;

  -- 5. Delete appointments (client or agent)
  DELETE FROM appointments WHERE client_id = _client_id OR agent_id = _client_id;

  -- 6. Delete documents uploaded by the user
  DELETE FROM documents WHERE user_id = _client_id;

  -- 7. Clear document validation attribution (avoid FK)
  UPDATE documents SET validated_by = NULL WHERE validated_by = _client_id;

  -- 8. Delete loan_applications
  DELETE FROM loan_applications WHERE user_id = _client_id;

  -- 9. Delete client_assignments (as client OR as agent)
  DELETE FROM client_assignments WHERE client_user_id = _client_id OR agent_user_id = _client_id;

  -- 10. Delete beneficiaries
  DELETE FROM beneficiaries WHERE user_id = _client_id;

  -- 11. Delete transfers created by the user
  DELETE FROM transfers WHERE user_id = _client_id;

  -- 12. Clear transfers attribution to agent (avoid FK)
  UPDATE transfers SET agent_id = NULL WHERE agent_id = _client_id;

  -- 13. Delete holds (via bank_accounts)
  DELETE FROM holds WHERE account_id IN (SELECT id FROM bank_accounts WHERE user_id = _client_id);

  -- 14. Delete transactions (via bank_accounts)
  DELETE FROM transactions WHERE account_id IN (SELECT id FROM bank_accounts WHERE user_id = _client_id);

  -- 15. Delete bank_accounts
  DELETE FROM bank_accounts WHERE user_id = _client_id;

  -- 16. Delete audit_logs
  DELETE FROM audit_logs WHERE user_id = _client_id;

  -- 17. Delete user_roles
  DELETE FROM user_roles WHERE user_id = _client_id;

  -- 18. Finally delete the profile
  DELETE FROM profiles WHERE id = _client_id;

  RETURN jsonb_build_object('success', true, 'deleted_profile_id', _client_id);
END;
$$;