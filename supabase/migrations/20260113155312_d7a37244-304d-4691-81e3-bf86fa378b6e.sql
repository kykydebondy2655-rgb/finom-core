-- Create login_history table to track all user logins
CREATE TABLE public.login_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  user_role TEXT NOT NULL DEFAULT 'client',
  first_name TEXT,
  last_name TEXT,
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  logged_in_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;

-- Only admins can view login history
CREATE POLICY "Admins can view all login history"
ON public.login_history
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow authenticated users to insert their own login record
CREATE POLICY "Users can insert their own login"
ON public.login_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_login_history_logged_in_at ON public.login_history(logged_in_at DESC);
CREATE INDEX idx_login_history_user_id ON public.login_history(user_id);