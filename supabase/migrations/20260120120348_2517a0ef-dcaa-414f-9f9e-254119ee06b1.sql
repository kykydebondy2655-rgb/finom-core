-- Function to delete a loan application (admin only)
CREATE OR REPLACE FUNCTION public.admin_delete_loan(_loan_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check caller is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can delete loans';
  END IF;

  -- Check loan exists
  IF NOT EXISTS (SELECT 1 FROM loan_applications WHERE id = _loan_id) THEN
    RAISE EXCEPTION 'Loan not found';
  END IF;

  -- Delete related records first
  
  -- Delete messages related to this loan
  DELETE FROM messages WHERE loan_id = _loan_id;
  
  -- Delete documents related to this loan
  DELETE FROM documents WHERE loan_id = _loan_id;
  
  -- Delete loan status history
  DELETE FROM loan_status_history WHERE loan_id = _loan_id;
  
  -- Finally delete the loan application
  DELETE FROM loan_applications WHERE id = _loan_id;

  RETURN jsonb_build_object('success', true, 'deleted_loan_id', _loan_id);
END;
$$;