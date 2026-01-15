-- Table pour stocker les imports en attente de validation
CREATE TABLE public.pending_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    import_type TEXT NOT NULL DEFAULT 'leads',
    file_name TEXT NOT NULL,
    total_rows INTEGER NOT NULL DEFAULT 0,
    valid_rows INTEGER NOT NULL DEFAULT 0,
    invalid_rows INTEGER NOT NULL DEFAULT 0,
    data JSONB NOT NULL DEFAULT '[]',
    validation_errors JSONB DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.pending_imports ENABLE ROW LEVEL SECURITY;

-- Only admins can access pending imports
CREATE POLICY "Admins can view all pending imports"
ON public.pending_imports FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create pending imports"
ON public.pending_imports FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update pending imports"
ON public.pending_imports FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete pending imports"
ON public.pending_imports FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Index for faster queries
CREATE INDEX idx_pending_imports_status ON public.pending_imports(status);
CREATE INDEX idx_pending_imports_admin_id ON public.pending_imports(admin_id);

-- Function to process approved import
CREATE OR REPLACE FUNCTION public.process_pending_import(_import_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    _import_record RECORD;
    _lead JSONB;
    _success_count INTEGER := 0;
    _error_count INTEGER := 0;
    _errors JSONB := '[]';
    _new_profile_id UUID;
BEGIN
    -- Verify caller is admin
    IF NOT has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Only admins can process imports';
    END IF;

    -- Get the import record
    SELECT * INTO _import_record FROM pending_imports WHERE id = _import_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Import not found';
    END IF;
    
    IF _import_record.status != 'approved' THEN
        RAISE EXCEPTION 'Import must be approved before processing';
    END IF;

    -- Process each lead in the data array
    FOR _lead IN SELECT * FROM jsonb_array_elements(_import_record.data)
    LOOP
        BEGIN
            -- Check if email already exists
            IF EXISTS (SELECT 1 FROM profiles WHERE email = _lead->>'email') THEN
                _errors := _errors || jsonb_build_object('email', _lead->>'email', 'error', 'Email déjà existant');
                _error_count := _error_count + 1;
                CONTINUE;
            END IF;
            
            -- Generate a new UUID for the profile
            _new_profile_id := gen_random_uuid();
            
            -- Insert into profiles
            INSERT INTO profiles (
                id, 
                email, 
                first_name, 
                last_name, 
                phone, 
                property_price, 
                down_payment, 
                purchase_type, 
                lead_source, 
                pipeline_stage,
                lead_status,
                role,
                must_change_password
            ) VALUES (
                _new_profile_id,
                _lead->>'email',
                _lead->>'firstName',
                _lead->>'lastName',
                _lead->>'phone',
                NULLIF(_lead->>'propertyPrice', '')::NUMERIC,
                _lead->>'downPayment',
                _lead->>'purchaseType',
                _lead->>'source',
                COALESCE(_lead->>'pipelineStage', 'nouveau'),
                'new',
                'client',
                true
            );
            
            -- Insert role
            INSERT INTO user_roles (user_id, role)
            VALUES (_new_profile_id, 'client');
            
            _success_count := _success_count + 1;
        EXCEPTION WHEN OTHERS THEN
            _errors := _errors || jsonb_build_object('email', _lead->>'email', 'error', SQLERRM);
            _error_count := _error_count + 1;
        END;
    END LOOP;

    -- Update import status
    UPDATE pending_imports 
    SET status = 'processed', processed_at = now()
    WHERE id = _import_id;

    RETURN jsonb_build_object(
        'success', true,
        'success_count', _success_count,
        'error_count', _error_count,
        'errors', _errors
    );
END;
$$;