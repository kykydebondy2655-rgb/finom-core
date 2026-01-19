-- Create loan_status_history table to track all loan status changes
CREATE TABLE public.loan_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_id UUID NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  next_action TEXT,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.loan_status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all loan status history"
ON public.loan_status_history
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Agents can view assigned client loan status history"
ON public.loan_status_history
FOR SELECT
USING (
  has_role(auth.uid(), 'agent') AND 
  EXISTS (
    SELECT 1 FROM loan_applications la
    JOIN client_assignments ca ON ca.client_user_id = la.user_id
    WHERE la.id = loan_status_history.loan_id 
    AND ca.agent_user_id = auth.uid()
  )
);

CREATE POLICY "Clients can view their own loan status history"
ON public.loan_status_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM loan_applications la
    WHERE la.id = loan_status_history.loan_id 
    AND la.user_id = auth.uid()
  )
);

CREATE POLICY "Admins and agents can insert loan status history"
ON public.loan_status_history
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'agent')
);

-- Add index for performance
CREATE INDEX idx_loan_status_history_loan_id ON public.loan_status_history(loan_id);
CREATE INDEX idx_loan_status_history_created_at ON public.loan_status_history(created_at DESC);