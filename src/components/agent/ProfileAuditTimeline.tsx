import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatDate } from '@/services/api';
import { History, User, ChevronDown, ChevronUp } from 'lucide-react';
import logger from '@/lib/logger';

interface AuditLog {
  id: string;
  profile_id: string;
  changed_by: string;
  action: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  changed_fields: string[];
  changed_at: string;
}

interface ProfileAuditTimelineProps {
  clientId: string;
  maxItems?: number;
}

// French labels for fields
const FIELD_LABELS: Record<string, string> = {
  first_name: 'Prénom',
  last_name: 'Nom',
  email: 'Email',
  phone: 'Téléphone',
  address: 'Adresse',
  city: 'Ville',
  postal_code: 'Code postal',
  country: 'Pays',
  property_price: 'Prix du bien',
  down_payment: 'Apport',
  purchase_type: 'Type d\'achat',
  lead_source: 'Source',
  pipeline_stage: 'Pipeline',
  lead_status: 'Statut lead',
  kyc_status: 'Statut KYC',
  kyc_level: 'Niveau KYC',
};

const ProfileAuditTimeline: React.FC<ProfileAuditTimelineProps> = ({ clientId, maxItems = 10 }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [changerNames, setChangerNames] = useState<Record<string, string>>({});

  useEffect(() => {
    loadAuditLogs();
  }, [clientId]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const { data: sessionData } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/profile_audit_logs?profile_id=eq.${clientId}&order=changed_at.desc&limit=${maxItems}`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${sessionData?.session?.access_token || supabaseKey}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch audit logs');

      const data = await response.json() as AuditLog[];
      setLogs(data || []);

      // Fetch changer names
      const changerIds = [...new Set(data.map(l => l.changed_by))];
      if (changerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, role')
          .in('id', changerIds);

        if (profiles) {
          const names: Record<string, string> = {};
          profiles.forEach(p => {
            const role = p.role === 'admin' ? '(Admin)' : p.role === 'agent' ? '(Agent)' : '';
            names[p.id] = `${p.first_name || ''} ${p.last_name || ''} ${role}`.trim();
          });
          setChangerNames(names);
        }
      }
    } catch (err) {
      logger.logError('Error loading profile audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'number') return value.toLocaleString('fr-FR');
    return String(value);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-12 bg-muted rounded" />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        <History className="mx-auto mb-2 opacity-50" size={20} />
        Aucune modification enregistrée
      </div>
    );
  }

  return (
    <div className="space-y-0">
      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
        <History size={14} />
        Historique des modifications du profil
      </h4>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
        
        {logs.map((log, index) => {
          const isExpanded = expandedId === log.id;
          const changerName = changerNames[log.changed_by] || 'Utilisateur inconnu';
          
          return (
            <div key={log.id} className="relative pl-10 pb-4">
              {/* Timeline dot */}
              <div className={`absolute left-2.5 w-3 h-3 rounded-full ${
                index === 0 ? 'bg-primary' : 'bg-muted-foreground'
              }`} />
              
              <div 
                className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                  isExpanded ? 'bg-muted/50 border-primary/30' : 'bg-card hover:bg-muted/30'
                }`}
                onClick={() => setExpandedId(isExpanded ? null : log.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <User size={14} className="text-muted-foreground" />
                    <span className="font-medium">{changerName}</span>
                    <span className="text-muted-foreground">a modifié</span>
                    <span className="font-medium text-primary">
                      {log.changed_fields.length} champ{log.changed_fields.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatDate(log.changed_at)}</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </div>

                {/* Changed fields summary */}
                <div className="mt-1 text-xs text-muted-foreground">
                  {log.changed_fields.map(f => FIELD_LABELS[f] || f).join(', ')}
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                    {log.changed_fields.map(field => {
                      const oldVal = log.old_values?.[field];
                      const newVal = log.new_values?.[field];
                      return (
                        <div key={field} className="flex items-start gap-2 text-sm">
                          <span className="font-medium min-w-[100px]">
                            {FIELD_LABELS[field] || field}:
                          </span>
                          <span className="text-destructive line-through opacity-70">
                            {formatValue(oldVal)}
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <span className="text-primary font-medium">
                            {formatValue(newVal)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileAuditTimeline;
