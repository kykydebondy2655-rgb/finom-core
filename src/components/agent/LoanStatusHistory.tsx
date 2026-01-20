/**
 * Component to display loan status change history
 * Reads from loan_status_history table
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatDateTime } from '@/services/api';
import { getStatusDefinition } from '@/lib/loanStatusMachine';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, History, Bot, AlertCircle } from 'lucide-react';
import logger from '@/lib/logger';

interface LoanHistoryEntry {
  id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string | null;
  next_action: string | null;
  rejection_reason: string | null;
  notes: string | null;
  created_at: string;
  changed_by_profile?: {
    first_name: string | null;
    last_name: string | null;
  };
}

interface LoanStatusHistoryProps {
  loanId: string;
  className?: string;
}

const LoanStatusHistory: React.FC<LoanStatusHistoryProps> = ({ loanId, className = '' }) => {
  const [history, setHistory] = useState<LoanHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [loanId]);

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('loan_status_history')
        .select(`
          id,
          old_status,
          new_status,
          changed_by,
          next_action,
          rejection_reason,
          notes,
          created_at
        `)
        .eq('loan_id', loanId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch profile names for changed_by
      if (data && data.length > 0) {
        const changedByIds = [...new Set(data.map(h => h.changed_by).filter(Boolean))] as string[];
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
      logger.logError('Error loading loan status history', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string | null): string => {
    if (!status) return 'Nouveau';
    const def = getStatusDefinition(status);
    return def?.label || status;
  };

  const getStatusIcon = (status: string | null): string => {
    if (!status) return '📄';
    const def = getStatusDefinition(status);
    return def?.icon || '📄';
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
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2 w-full">
        <History size={16} />
        <span>Historique des statuts du prêt ({history.length})</span>
        <ChevronDown 
          size={16} 
          className={`ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 space-y-2 max-h-80 overflow-y-auto pr-2">
          {history.map((entry) => (
            <div 
              key={entry.id} 
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 text-sm border border-border/50"
            >
              <div className="text-lg flex-shrink-0">
                {getStatusIcon(entry.new_status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {entry.old_status && (
                    <>
                      <span className="text-muted-foreground line-through">
                        {getStatusLabel(entry.old_status)}
                      </span>
                      <span className="text-muted-foreground">→</span>
                    </>
                  )}
                  <span className="font-medium text-foreground">
                    {getStatusLabel(entry.new_status)}
                  </span>
                </div>
                
                {entry.next_action && (
                  <p className="text-muted-foreground text-xs mt-1">
                    📌 {entry.next_action}
                  </p>
                )}
                
                {entry.rejection_reason && (
                  <p className="text-destructive text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {entry.rejection_reason}
                  </p>
                )}
                
                {entry.notes && (
                  <p className="text-muted-foreground text-xs mt-1 italic">
                    {entry.notes}
                  </p>
                )}
                
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span>{formatDateTime(entry.created_at)}</span>
                  {entry.changed_by_profile ? (
                    <span className="flex items-center gap-1">
                      par {entry.changed_by_profile.first_name} {entry.changed_by_profile.last_name}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Bot size={12} />
                      Système
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

export default LoanStatusHistory;
