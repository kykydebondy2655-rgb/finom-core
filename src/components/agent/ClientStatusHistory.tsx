/**
 * Component to display client status change history
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatDateTime } from '@/services/api';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, History } from 'lucide-react';

interface StatusHistoryEntry {
  id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string | null;
  notes: string | null;
  created_at: string;
  changed_by_profile?: {
    first_name: string | null;
    last_name: string | null;
  };
}

interface ClientStatusHistoryProps {
  clientId: string;
}

const STATUS_LABELS: Record<string, string> = {
  'nouveau': 'Nouveau',
  'nrp': 'NRP',
  'pas_interesse': 'Pas intéressé',
  'en_attente': 'En attente',
  'a_rappeler': 'À rappeler',
  'interesse': 'Intéressé',
  'qualifie': 'Qualifié',
  'converti': 'Converti',
};

const ClientStatusHistory: React.FC<ClientStatusHistoryProps> = ({ clientId }) => {
  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [clientId]);

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('client_status_history')
        .select(`
          id,
          old_status,
          new_status,
          changed_by,
          notes,
          created_at
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Fetch profile names for changed_by
      if (data && data.length > 0) {
        const changedByIds = [...new Set(data.map(h => h.changed_by).filter(Boolean))];
        if (changedByIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .in('id', changedByIds);

          const profileMap = new Map(profiles?.map(p => [p.id, p]));
          
          const enrichedData = data.map(entry => ({
            ...entry,
            changed_by_profile: entry.changed_by ? profileMap.get(entry.changed_by) : undefined
          }));
          
          setHistory(enrichedData);
        } else {
          setHistory(data);
        }
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error('Error loading status history:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string | null) => {
    if (!status) return '-';
    return STATUS_LABELS[status] || status;
  };

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground py-2">
        Chargement de l'historique...
      </div>
    );
  }

  if (history.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
        <History size={16} />
        <span>Historique des statuts ({history.length})</span>
        <ChevronDown 
          size={16} 
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
          {history.map((entry) => (
            <div 
              key={entry.id} 
              className="flex items-start gap-3 p-2 rounded-lg bg-muted/50 text-sm"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground line-through">
                    {getStatusLabel(entry.old_status)}
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-medium">
                    {getStatusLabel(entry.new_status)}
                  </span>
                </div>
                {entry.notes && (
                  <p className="text-muted-foreground text-xs mt-1">
                    {entry.notes}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{formatDateTime(entry.created_at)}</span>
                  {entry.changed_by_profile && (
                    <span>
                      par {entry.changed_by_profile.first_name} {entry.changed_by_profile.last_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ClientStatusHistory;
