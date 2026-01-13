-- Create admin_delete_client RPC function
-- Deletes a client and ALL associated data in correct order (transaction)
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

  -- Check client exists
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = _client_id) THEN
    RAISE EXCEPTION 'Client not found';
  END IF;

  -- Delete in correct order to avoid FK constraints

  -- 1. Delete messages (from and to)
  DELETE FROM messages WHERE from_user_id = _client_id OR to_user_id = _client_id;

  -- 2. Delete notifications
  DELETE FROM notifications WHERE user_id = _client_id;

  -- 3. Delete callbacks
  DELETE FROM callbacks WHERE client_id = _client_id;

  -- 4. Delete call_logs
  DELETE FROM call_logs WHERE client_id = _client_id;

  -- 5. Delete appointments
  DELETE FROM appointments WHERE client_id = _client_id;

  -- 6. Delete documents
  DELETE FROM documents WHERE user_id = _client_id;

  -- 7. Delete loan_applications
  DELETE FROM loan_applications WHERE user_id = _client_id;

  -- 8. Delete client_assignments
  DELETE FROM client_assignments WHERE client_user_id = _client_id;

  -- 9. Delete beneficiaries
  DELETE FROM beneficiaries WHERE user_id = _client_id;

  -- 10. Delete transfers
  DELETE FROM transfers WHERE user_id = _client_id;

  -- 11. Delete holds (via bank_accounts)
  DELETE FROM holds WHERE account_id IN (SELECT id FROM bank_accounts WHERE user_id = _client_id);

  -- 12. Delete transactions (via bank_accounts)
  DELETE FROM transactions WHERE account_id IN (SELECT id FROM bank_accounts WHERE user_id = _client_id);

  -- 13. Delete bank_accounts
  DELETE FROM bank_accounts WHERE user_id = _client_id;

  -- 14. Delete user_roles
  DELETE FROM user_roles WHERE user_id = _client_id;

  -- 15. Finally delete the profile
  DELETE FROM profiles WHERE id = _client_id;

  RETURN jsonb_build_object('success', true, 'deleted_client_id', _client_id);
END;
$$;