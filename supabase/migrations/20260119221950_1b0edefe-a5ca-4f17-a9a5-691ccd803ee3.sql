-- Create client_notes table for internal agent notes
CREATE TABLE public.client_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  agent_id UUID NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_notes
CREATE POLICY "Agents can create notes for assigned clients"
ON public.client_notes
FOR INSERT
WITH CHECK (
  auth.uid() = agent_id 
  AND EXISTS (
    SELECT 1 FROM client_assignments ca 
    WHERE ca.client_user_id = client_notes.client_id 
    AND ca.agent_user_id = auth.uid()
  )
);

CREATE POLICY "Agents can view notes for assigned clients"
ON public.client_notes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM client_assignments ca 
    WHERE ca.client_user_id = client_notes.client_id 
    AND ca.agent_user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Agents can update their own notes"
ON public.client_notes
FOR UPDATE
USING (auth.uid() = agent_id);

CREATE POLICY "Agents can delete their own notes"
ON public.client_notes
FOR DELETE
USING (auth.uid() = agent_id);

CREATE POLICY "Admins can manage all notes"
ON public.client_notes
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_client_notes_updated_at
BEFORE UPDATE ON public.client_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Fix: Allow agents to update pipeline_stage for their assigned clients
CREATE POLICY "Agents can update assigned client pipeline_stage"
ON public.profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM client_assignments ca 
    WHERE ca.client_user_id = profiles.id 
    AND ca.agent_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM client_assignments ca 
    WHERE ca.client_user_id = profiles.id 
    AND ca.agent_user_id = auth.uid()
  )
);