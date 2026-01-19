-- 1. Create client_status_history table for tracking status changes
CREATE TABLE IF NOT EXISTS public.client_status_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_status_history
CREATE POLICY "Admins can view all status history"
ON public.client_status_history
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Agents can view assigned clients status history"
ON public.client_status_history
FOR SELECT
USING (
    public.has_role(auth.uid(), 'agent')
    AND EXISTS (
        SELECT 1 FROM public.client_assignments ca 
        WHERE ca.client_user_id = client_status_history.client_id 
        AND ca.agent_user_id = auth.uid()
    )
);

CREATE POLICY "Admins and agents can insert status history"
ON public.client_status_history
FOR INSERT
WITH CHECK (
    public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'agent')
);

-- Index for fast lookups by client
CREATE INDEX idx_client_status_history_client_id ON public.client_status_history(client_id);
CREATE INDEX idx_client_status_history_created_at ON public.client_status_history(created_at DESC);