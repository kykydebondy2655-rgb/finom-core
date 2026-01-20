-- Create appointment_slots table for available slots
CREATE TABLE public.appointment_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appointment_slots ENABLE ROW LEVEL SECURITY;

-- Everyone can view available slots
CREATE POLICY "Anyone can view available slots" 
ON public.appointment_slots 
FOR SELECT 
USING (is_available = true);

-- Agents can manage their own slots
CREATE POLICY "Agents can manage their slots" 
ON public.appointment_slots 
FOR ALL 
USING (agent_id = auth.uid());

-- Admins can manage all slots
CREATE POLICY "Admins can manage all slots" 
ON public.appointment_slots 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Add status and type to appointments table if not exists
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS appointment_type VARCHAR(50) DEFAULT 'phone',
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';

-- Clients can book appointments
CREATE POLICY "Clients can view own appointments" 
ON public.appointments 
FOR SELECT 
USING (client_id = auth.uid());

CREATE POLICY "Clients can book appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (client_id = auth.uid());

-- Agents can view and manage their appointments
CREATE POLICY "Agents can view assigned appointments" 
ON public.appointments 
FOR SELECT 
USING (agent_id = auth.uid());

CREATE POLICY "Agents can update their appointments" 
ON public.appointments 
FOR UPDATE 
USING (agent_id = auth.uid());

-- Enable realtime for appointments
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointment_slots;