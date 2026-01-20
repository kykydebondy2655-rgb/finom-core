-- Create email_logs table to track all sent emails
CREATE TABLE public.email_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    recipient_email TEXT NOT NULL,
    template TEXT NOT NULL,
    subject TEXT,
    status TEXT NOT NULL DEFAULT 'sent',
    error_message TEXT,
    metadata JSONB,
    sent_by UUID,
    client_id UUID,
    loan_id UUID,
    document_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all email logs"
ON public.email_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Agents can view email logs for assigned clients"
ON public.email_logs
FOR SELECT
USING (
    has_role(auth.uid(), 'agent') AND (
        sent_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM client_assignments ca
            WHERE ca.client_user_id = email_logs.client_id
            AND ca.agent_user_id = auth.uid()
        )
    )
);

CREATE POLICY "Admins and agents can insert email logs"
ON public.email_logs
FOR INSERT
WITH CHECK (
    has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'agent')
);

-- Add indexes for performance
CREATE INDEX idx_email_logs_client_id ON public.email_logs(client_id);
CREATE INDEX idx_email_logs_sent_by ON public.email_logs(sent_by);
CREATE INDEX idx_email_logs_created_at ON public.email_logs(created_at DESC);