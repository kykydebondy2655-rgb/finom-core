-- Create support_messages table for general client support (no loan required)
CREATE TABLE public.support_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'agent', 'admin')),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Clients can view their own support messages
CREATE POLICY "Clients can view their support messages"
ON public.support_messages
FOR SELECT
USING (auth.uid() = user_id);

-- Clients can send support messages
CREATE POLICY "Clients can send support messages"
ON public.support_messages
FOR INSERT
WITH CHECK (auth.uid() = user_id AND sender_type = 'client');

-- Agents/Admins can view all support messages
CREATE POLICY "Agents and admins can view all support messages"
ON public.support_messages
FOR SELECT
USING (public.has_role(auth.uid(), 'agent') OR public.has_role(auth.uid(), 'admin'));

-- Agents/Admins can respond to support messages
CREATE POLICY "Agents and admins can respond to support"
ON public.support_messages
FOR INSERT
WITH CHECK (
  (public.has_role(auth.uid(), 'agent') OR public.has_role(auth.uid(), 'admin'))
  AND sender_type IN ('agent', 'admin')
);

-- Agents/Admins can update messages (mark as read)
CREATE POLICY "Agents and admins can update support messages"
ON public.support_messages
FOR UPDATE
USING (public.has_role(auth.uid(), 'agent') OR public.has_role(auth.uid(), 'admin'));

-- Clients can update their own messages (mark as read)
CREATE POLICY "Clients can update their support messages"
ON public.support_messages
FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_support_messages_user_id ON public.support_messages(user_id);
CREATE INDEX idx_support_messages_created_at ON public.support_messages(created_at DESC);

-- Enable realtime for support_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;