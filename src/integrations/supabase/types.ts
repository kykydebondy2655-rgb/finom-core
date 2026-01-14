export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          agent_id: string
          appointment_type: string | null
          client_id: string
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          scheduled_at: string
          status: string | null
          subject: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          appointment_type?: string | null
          client_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          scheduled_at: string
          status?: string | null
          subject: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          appointment_type?: string | null
          client_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          scheduled_at?: string
          status?: string | null
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          new_value: Json | null
          old_value: Json | null
          reason: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          reason?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          reason?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_accounts: {
        Row: {
          balance: number | null
          bic: string
          created_at: string
          currency: string | null
          daily_limit: number | null
          iban: string
          id: string
          is_frozen: boolean | null
          monthly_limit: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number | null
          bic: string
          created_at?: string
          currency?: string | null
          daily_limit?: number | null
          iban: string
          id?: string
          is_frozen?: boolean | null
          monthly_limit?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number | null
          bic?: string
          created_at?: string
          currency?: string | null
          daily_limit?: number | null
          iban?: string
          id?: string
          is_frozen?: boolean | null
          monthly_limit?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficiaries: {
        Row: {
          activated_at: string | null
          bank_name: string | null
          bic: string | null
          created_at: string
          iban: string
          id: string
          label: string | null
          name: string
          status: string | null
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          bank_name?: string | null
          bic?: string | null
          created_at?: string
          iban: string
          id?: string
          label?: string | null
          name: string
          status?: string | null
          user_id: string
        }
        Update: {
          activated_at?: string | null
          bank_name?: string | null
          bic?: string | null
          created_at?: string
          iban?: string
          id?: string
          label?: string | null
          name?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beneficiaries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      call_logs: {
        Row: {
          agent_id: string
          call_status: string
          call_type: string
          client_id: string
          created_at: string
          duration_seconds: number | null
          id: string
          notes: string | null
        }
        Insert: {
          agent_id: string
          call_status: string
          call_type: string
          client_id: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          notes?: string | null
        }
        Update: {
          agent_id?: string
          call_status?: string
          call_type?: string
          client_id?: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      callbacks: {
        Row: {
          agent_id: string
          client_id: string
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          reason: string | null
          scheduled_at: string
          status: string | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          client_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          reason?: string | null
          scheduled_at: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          client_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          reason?: string | null
          scheduled_at?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "callbacks_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "callbacks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_assignments: {
        Row: {
          agent_user_id: string
          assigned_at: string
          client_user_id: string
          id: string
        }
        Insert: {
          agent_user_id: string
          assigned_at?: string
          client_user_id: string
          id?: string
        }
        Update: {
          agent_user_id?: string
          assigned_at?: string
          client_user_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_assignments_agent_user_id_fkey"
            columns: ["agent_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_assignments_client_user_id_fkey"
            columns: ["client_user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string | null
          direction: string | null
          expires_at: string | null
          file_name: string
          file_path: string
          file_type: string | null
          id: string
          loan_id: string | null
          motif: string | null
          rejection_reason: string | null
          status: string | null
          uploaded_at: string
          uploaded_by: string | null
          user_id: string
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          category?: string | null
          direction?: string | null
          expires_at?: string | null
          file_name: string
          file_path: string
          file_type?: string | null
          id?: string
          loan_id?: string | null
          motif?: string | null
          rejection_reason?: string | null
          status?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
          user_id: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          category?: string | null
          direction?: string | null
          expires_at?: string | null
          file_name?: string
          file_path?: string
          file_type?: string | null
          id?: string
          loan_id?: string | null
          motif?: string | null
          rejection_reason?: string | null
          status?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
          user_id?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loan_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      holds: {
        Row: {
          account_id: string
          amount: number
          created_at: string
          id: string
          released_at: string | null
          status: string | null
          transfer_id: string | null
        }
        Insert: {
          account_id: string
          amount: number
          created_at?: string
          id?: string
          released_at?: string | null
          status?: string | null
          transfer_id?: string | null
        }
        Update: {
          account_id?: string
          amount?: number
          created_at?: string
          id?: string
          released_at?: string | null
          status?: string | null
          transfer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "holds_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holds_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_assignments_log: {
        Row: {
          action: string
          created_at: string
          from_agent_id: string | null
          id: string
          lead_id: string
          performed_by_admin_id: string
          to_agent_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          from_agent_id?: string | null
          id?: string
          lead_id: string
          performed_by_admin_id: string
          to_agent_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          from_agent_id?: string | null
          id?: string
          lead_id?: string
          performed_by_admin_id?: string
          to_agent_id?: string | null
        }
        Relationships: []
      }
      loan_applications: {
        Row: {
          agency_fees: number | null
          amount: number
          assurance_status: string | null
          created_at: string
          debt_ratio_est: number | null
          down_payment: number | null
          duration: number
          fees_used: number | null
          id: string
          insurance_cost: number | null
          insurance_rate_used: number | null
          interest_rate_used: number | null
          is_draft: boolean | null
          monthly_credit: number | null
          monthly_insurance: number | null
          monthly_payment: number | null
          monthly_payment_est: number | null
          next_action: string | null
          notary_fees: number | null
          notary_iban: string | null
          notary_ref: string | null
          project_type: string | null
          property_price: number | null
          rate: number
          rejection_reason: string | null
          sequestre_amount_expected: number | null
          sequestre_amount_received: number | null
          sequestre_status: string | null
          status: string | null
          total_amount: number | null
          total_cost_est: number | null
          total_fees: number | null
          total_interest: number | null
          updated_at: string
          user_id: string
          works_amount: number | null
        }
        Insert: {
          agency_fees?: number | null
          amount: number
          assurance_status?: string | null
          created_at?: string
          debt_ratio_est?: number | null
          down_payment?: number | null
          duration: number
          fees_used?: number | null
          id?: string
          insurance_cost?: number | null
          insurance_rate_used?: number | null
          interest_rate_used?: number | null
          is_draft?: boolean | null
          monthly_credit?: number | null
          monthly_insurance?: number | null
          monthly_payment?: number | null
          monthly_payment_est?: number | null
          next_action?: string | null
          notary_fees?: number | null
          notary_iban?: string | null
          notary_ref?: string | null
          project_type?: string | null
          property_price?: number | null
          rate: number
          rejection_reason?: string | null
          sequestre_amount_expected?: number | null
          sequestre_amount_received?: number | null
          sequestre_status?: string | null
          status?: string | null
          total_amount?: number | null
          total_cost_est?: number | null
          total_fees?: number | null
          total_interest?: number | null
          updated_at?: string
          user_id: string
          works_amount?: number | null
        }
        Update: {
          agency_fees?: number | null
          amount?: number
          assurance_status?: string | null
          created_at?: string
          debt_ratio_est?: number | null
          down_payment?: number | null
          duration?: number
          fees_used?: number | null
          id?: string
          insurance_cost?: number | null
          insurance_rate_used?: number | null
          interest_rate_used?: number | null
          is_draft?: boolean | null
          monthly_credit?: number | null
          monthly_insurance?: number | null
          monthly_payment?: number | null
          monthly_payment_est?: number | null
          next_action?: string | null
          notary_fees?: number | null
          notary_iban?: string | null
          notary_ref?: string | null
          project_type?: string | null
          property_price?: number | null
          rate?: number
          rejection_reason?: string | null
          sequestre_amount_expected?: number | null
          sequestre_amount_received?: number | null
          sequestre_status?: string | null
          status?: string | null
          total_amount?: number | null
          total_cost_est?: number | null
          total_fees?: number | null
          total_interest?: number | null
          updated_at?: string
          user_id?: string
          works_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "loan_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      login_history: {
        Row: {
          browser: string | null
          device_type: string | null
          email: string
          first_name: string | null
          id: string
          ip_address: string | null
          last_name: string | null
          logged_in_at: string
          os: string | null
          user_agent: string | null
          user_id: string
          user_role: string
        }
        Insert: {
          browser?: string | null
          device_type?: string | null
          email: string
          first_name?: string | null
          id?: string
          ip_address?: string | null
          last_name?: string | null
          logged_in_at?: string
          os?: string | null
          user_agent?: string | null
          user_id: string
          user_role?: string
        }
        Update: {
          browser?: string | null
          device_type?: string | null
          email?: string
          first_name?: string | null
          id?: string
          ip_address?: string | null
          last_name?: string | null
          logged_in_at?: string
          os?: string | null
          user_agent?: string | null
          user_id?: string
          user_role?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          created_at: string
          from_user_id: string
          id: string
          loan_id: string
          message: string
          read: boolean | null
          to_user_id: string
        }
        Insert: {
          created_at?: string
          from_user_id: string
          id?: string
          loan_id: string
          message: string
          read?: boolean | null
          to_user_id: string
        }
        Update: {
          created_at?: string
          from_user_id?: string
          id?: string
          loan_id?: string
          message?: string
          read?: boolean | null
          to_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loan_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          category: string
          created_at: string
          id: string
          message: string
          read: boolean | null
          related_entity: string | null
          related_id: string | null
          sent_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          related_entity?: string | null
          related_id?: string | null
          sent_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          related_entity?: string | null
          related_id?: string | null
          sent_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string
          down_payment: string | null
          email: string | null
          first_name: string | null
          id: string
          kyc_level: number | null
          kyc_status: string | null
          last_name: string | null
          lead_source: string | null
          lead_status: string | null
          must_change_password: boolean | null
          phone: string | null
          pipeline_stage: string | null
          property_price: number | null
          purchase_type: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          down_payment?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          kyc_level?: number | null
          kyc_status?: string | null
          last_name?: string | null
          lead_source?: string | null
          lead_status?: string | null
          must_change_password?: boolean | null
          phone?: string | null
          pipeline_stage?: string | null
          property_price?: number | null
          purchase_type?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          down_payment?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          kyc_level?: number | null
          kyc_status?: string | null
          last_name?: string | null
          lead_source?: string | null
          lead_status?: string | null
          must_change_password?: boolean | null
          phone?: string | null
          pipeline_stage?: string | null
          property_price?: number | null
          purchase_type?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          category: string
          description: string | null
          key: string
          type: string
          updated_at: string
          updated_by: string | null
          value: string
        }
        Insert: {
          category: string
          description?: string | null
          key: string
          type: string
          updated_at?: string
          updated_by?: string | null
          value: string
        }
        Update: {
          category?: string
          description?: string | null
          key?: string
          type?: string
          updated_at?: string
          updated_by?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          created_at: string
          currency: string | null
          document_id: string | null
          id: string
          label: string | null
          reference: string | null
          related_transfer_id: string | null
          type: string
        }
        Insert: {
          account_id: string
          amount: number
          created_at?: string
          currency?: string | null
          document_id?: string | null
          id?: string
          label?: string | null
          reference?: string | null
          related_transfer_id?: string | null
          type: string
        }
        Update: {
          account_id?: string
          amount?: number
          created_at?: string
          currency?: string | null
          document_id?: string | null
          id?: string
          label?: string | null
          reference?: string | null
          related_transfer_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_related_transfer_id_fkey"
            columns: ["related_transfer_id"]
            isOneToOne: false
            referencedRelation: "transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      transfers: {
        Row: {
          agent_id: string | null
          amount: number
          beneficiary_id: string
          cancelled_at: string | null
          created_at: string
          currency: string | null
          document_id: string | null
          id: string
          idempotency_key: string | null
          processed_at: string | null
          reference: string | null
          rejection_reason: string | null
          risk_flags: string | null
          risk_score: number | null
          status: string | null
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          amount: number
          beneficiary_id: string
          cancelled_at?: string | null
          created_at?: string
          currency?: string | null
          document_id?: string | null
          id?: string
          idempotency_key?: string | null
          processed_at?: string | null
          reference?: string | null
          rejection_reason?: string | null
          risk_flags?: string | null
          risk_score?: number | null
          status?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string | null
          amount?: number
          beneficiary_id?: string
          cancelled_at?: string | null
          created_at?: string
          currency?: string | null
          document_id?: string | null
          id?: string
          idempotency_key?: string | null
          processed_at?: string | null
          reference?: string | null
          rejection_reason?: string | null
          risk_flags?: string | null
          risk_score?: number | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfers_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_delete_agent: { Args: { _agent_id: string }; Returns: Json }
      admin_delete_client: { Args: { _client_id: string }; Returns: Json }
      assign_leads_to_agent: {
        Args: { _agent_id: string; _count: number }
        Returns: number
      }
      get_agent_assigned_leads: {
        Args: { _agent_id: string }
        Returns: {
          assigned_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          lead_status: string
          phone: string
          pipeline_stage: string
        }[]
      }
      get_user_role: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      reassign_leads: {
        Args: {
          _admin_id: string
          _from_agent_id: string
          _lead_ids: string[]
          _to_agent_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "client" | "agent" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["client", "agent", "admin"],
    },
  },
} as const
