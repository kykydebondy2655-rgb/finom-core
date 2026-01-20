/**
 * Component to display notes history with timestamps
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatDateTime } from '@/services/api';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, MessageSquare, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import logger from '@/lib/logger';

interface NoteHistoryEntry {
  id: string;
  note: string;
  created_at: string;
  updated_at: string;
  agent_id: string;
  agent?: {
    first_name: string | null;
    last_name: string | null;
  };
}

interface NotesHistoryProps {
  clientId: string;
  className?: string;
}

const NotesHistory: React.FC<NotesHistoryProps> = ({ clientId, className = '' }) => {
  const [notes, setNotes] = useState<NoteHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [clientId]);

  const loadNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('client_notes')
        .select(`
          id,
          note,
          created_at,
          updated_at,
          agent_id,
          agent:profiles!client_notes_agent_id_fkey(first_name, last_name)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotes((data as unknown as NoteHistoryEntry[]) || []);
    } catch (err) {
      logger.logError('Error loading notes history', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground py-2">
        Chargement de l'historique des notes...
      </div>
    );
  }

  if (notes.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2 w-full">
        <MessageSquare size={16} />
        <span>Historique des notes ({notes.length})</span>
        <ChevronDown 
          size={16} 
          className={`ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 space-y-2 max-h-80 overflow-y-auto pr-2">
          {notes.map((entry) => {
            const wasEdited = entry.updated_at && entry.updated_at !== entry.created_at;
            
            return (
              <div 
                key={entry.id} 
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 text-sm border border-border/50"
              >
                <div className="text-lg flex-shrink-0">📝</div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground whitespace-pre-wrap break-words">
                    {entry.note}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground flex-wrap">
                    <span className="font-medium">
                      {entry.agent?.first_name} {entry.agent?.last_name}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatDistanceToNow(new Date(entry.created_at), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </span>
                    {wasEdited && (
                      <>
                        <span>•</span>
                        <span className="italic">
                          modifié {formatDistanceToNow(new Date(entry.updated_at), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </span>
                      </>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDateTime(entry.created_at)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default NotesHistory;
