-- ==========================================
-- FINOM COMPLETE DATABASE MIGRATION
-- ==========================================

-- Drop trigger if exists to recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ==========================================
-- LOAN APPLICATIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.loan_applications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    duration INTEGER NOT NULL,
    rate DECIMAL(5,4) NOT NULL,
    status TEXT DEFAULT 'pending',
    monthly_payment DECIMAL(15,2),
    total_interest DECIMAL(15,2),
    total_amount DECIMAL(15,2),
    is_draft BOOLEAN DEFAULT false,
    rejection_reason TEXT,
    next_action TEXT,
    interest_rate_used DECIMAL(5,4),
    insurance_rate_used DECIMAL(5,4),
    fees_used DECIMAL(15,2),
    monthly_payment_est DECIMAL(15,2),
    total_cost_est DECIMAL(15,2),
    debt_ratio_est DECIMAL(5,2),
    sequestre_status TEXT DEFAULT 'none',
    sequestre_amount_expected DECIMAL(15,2),
    sequestre_amount_received DECIMAL(15,2),
    notary_iban TEXT,
    notary_ref TEXT,
    assurance_status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own loans" ON public.loan_applications
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own loans" ON public.loan_applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own loans" ON public.loan_applications
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Agents can view all loans" ON public.loan_applications
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('agent', 'admin'))
    );

-- ==========================================
-- DOCUMENTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    loan_id UUID REFERENCES public.loan_applications(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    category TEXT,
    status TEXT DEFAULT 'pending',
    validated_by UUID REFERENCES public.profiles(id),
    validated_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own documents" ON public.documents
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upload their own documents" ON public.documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own documents" ON public.documents
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Agents can view all documents" ON public.documents
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('agent', 'admin'))
    );

-- ==========================================
-- BANK ACCOUNTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    iban TEXT UNIQUE NOT NULL,
    bic TEXT NOT NULL,
    currency TEXT DEFAULT 'EUR',
    balance DECIMAL(15,2) DEFAULT 0,
    is_frozen BOOLEAN DEFAULT false,
    daily_limit DECIMAL(15,2) DEFAULT 5000,
    monthly_limit DECIMAL(15,2) DEFAULT 20000,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own account" ON public.bank_accounts
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own account" ON public.bank_accounts
    FOR UPDATE USING (auth.uid() = user_id);

-- ==========================================
-- BENEFICIARIES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.beneficiaries (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    iban TEXT NOT NULL,
    bic TEXT,
    bank_name TEXT,
    label TEXT,
    status TEXT DEFAULT 'pending',
    activated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own beneficiaries" ON public.beneficiaries
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own beneficiaries" ON public.beneficiaries
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own beneficiaries" ON public.beneficiaries
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own beneficiaries" ON public.beneficiaries
    FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- TRANSFERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.transfers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    beneficiary_id UUID NOT NULL REFERENCES public.beneficiaries(id),
    amount DECIMAL(15,2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    reference TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    processed_at TIMESTAMP WITH TIME ZONE,
    agent_id UUID REFERENCES public.profiles(id),
    document_id UUID REFERENCES public.documents(id),
    risk_score INTEGER DEFAULT 0,
    risk_flags TEXT,
    idempotency_key TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT
);

ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transfers" ON public.transfers
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own transfers" ON public.transfers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- TRANSACTIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    label TEXT,
    reference TEXT,
    related_transfer_id UUID REFERENCES public.transfers(id),
    document_id UUID REFERENCES public.documents(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" ON public.transactions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.bank_accounts WHERE id = account_id AND user_id = auth.uid())
    );

-- ==========================================
-- NOTIFICATIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_entity TEXT,
    related_id UUID,
    read BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- ==========================================
-- MESSAGES TABLE (Loan related)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    loan_id UUID NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,
    from_user_id UUID NOT NULL REFERENCES public.profiles(id),
    to_user_id UUID NOT NULL REFERENCES public.profiles(id),
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages they sent or received" ON public.messages
    FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- ==========================================
-- CRM: CLIENT ASSIGNMENTS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.client_assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    agent_user_id UUID NOT NULL REFERENCES public.profiles(id),
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.client_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view their assignments" ON public.client_assignments
    FOR SELECT USING (
        auth.uid() = agent_user_id OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ==========================================
-- CRM: CALL LOGS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.call_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES public.profiles(id),
    call_type TEXT NOT NULL CHECK(call_type IN ('inbound', 'outbound')),
    call_status TEXT NOT NULL CHECK(call_status IN ('answered', 'nrp', 'busy', 'voicemail', 'cancelled')),
    duration_seconds INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view call logs" ON public.call_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('agent', 'admin'))
    );
CREATE POLICY "Agents can create call logs" ON public.call_logs
    FOR INSERT WITH CHECK (auth.uid() = agent_id);

-- ==========================================
-- CRM: CALLBACKS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.callbacks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES public.profiles(id),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'planned' CHECK(status IN ('planned', 'done', 'missed', 'cancelled')),
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.callbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view their callbacks" ON public.callbacks
    FOR SELECT USING (auth.uid() = agent_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Agents can create callbacks" ON public.callbacks
    FOR INSERT WITH CHECK (auth.uid() = agent_id);
CREATE POLICY "Agents can update their callbacks" ON public.callbacks
    FOR UPDATE USING (auth.uid() = agent_id);

-- ==========================================
-- CRM: APPOINTMENTS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES public.profiles(id),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    appointment_type TEXT CHECK(appointment_type IN ('call', 'video', 'in_person')),
    subject TEXT NOT NULL,
    status TEXT DEFAULT 'planned' CHECK(status IN ('planned', 'completed', 'no_show', 'cancelled')),
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their appointments" ON public.appointments
    FOR SELECT USING (auth.uid() = client_id OR auth.uid() = agent_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ==========================================
-- AUDIT LOGS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    old_value JSONB,
    new_value JSONB,
    reason TEXT,
    metadata JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ==========================================
-- SYSTEM SETTINGS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings" ON public.system_settings
    FOR SELECT USING (true);
CREATE POLICY "Admins can update settings" ON public.system_settings
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ==========================================
-- HOLDS TABLE (for transfers)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.holds (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
    transfer_id UUID REFERENCES public.transfers(id),
    amount DECIMAL(15,2) NOT NULL,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'released', 'captured')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    released_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.holds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own holds" ON public.holds
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.bank_accounts WHERE id = account_id AND user_id = auth.uid())
    );

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_loan_applications_user ON public.loan_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_loan_applications_status ON public.loan_applications(status);
CREATE INDEX IF NOT EXISTS idx_documents_user ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_loan ON public.documents(loan_id);
CREATE INDEX IF NOT EXISTS idx_transfers_user ON public.transfers(user_id);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON public.transfers(status);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON public.transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_agent ON public.call_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_callbacks_agent ON public.callbacks(agent_id);

-- ==========================================
-- TRIGGERS FOR UPDATED_AT
-- ==========================================
CREATE TRIGGER update_loan_applications_updated_at
    BEFORE UPDATE ON public.loan_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bank_accounts_updated_at
    BEFORE UPDATE ON public.bank_accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_callbacks_updated_at
    BEFORE UPDATE ON public.callbacks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- RECREATE AUTH TRIGGER
-- ==========================================
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();