-- Add expires_at tracking for documents that need it (ID cards, pay slips, etc.)
-- Already exists in schema, just ensure it's used

-- Add notification for agent assignment tracking
-- This will be handled through notifications table which already exists

-- Enable realtime for loan_applications to support auto-status transitions
ALTER PUBLICATION supabase_realtime ADD TABLE public.loan_applications;