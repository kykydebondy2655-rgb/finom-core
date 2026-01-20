/**
 * Component to display document validation history
 * Shows validation timeline based on document fields
 */

import React from 'react';
import { formatDateTime } from '@/services/api';
import { getDocumentStatusDefinition } from '@/lib/documentStatusMachine';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, FileCheck, AlertCircle } from 'lucide-react';
import type { Document } from '@/services/api';

interface DocumentStatusHistoryProps {
  documents: Document[];
  className?: string;
}

interface DocumentEvent {
  id: string;
  documentName: string;
  status: string;
  date: string;
  validatedBy?: string | null;
  rejectionReason?: string | null;
}

const DocumentStatusHistory: React.FC<DocumentStatusHistoryProps> = ({ documents, className = '' }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  // Build timeline events from documents
  const events: DocumentEvent[] = documents
    .filter(doc => doc.status && doc.status !== 'pending')
    .map(doc => ({
      id: doc.id,
      documentName: doc.file_name,
      status: doc.status || 'pending',
      date: (doc as any).validated_at || doc.uploaded_at,
      validatedBy: (doc as any).validated_by,
      rejectionReason: (doc as any).rejection_reason,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStatusLabel = (status: string): string => {
    const def = getDocumentStatusDefinition(status);
    return def?.label || status;
  };

  const getStatusIcon = (status: string): string => {
    const def = getDocumentStatusDefinition(status);
    return def?.icon || '📄';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'validated': return 'text-green-600 dark:text-green-400';
      case 'rejected': return 'text-red-600 dark:text-red-400';
      case 'under_review': return 'text-purple-600 dark:text-purple-400';
      case 'received': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-muted-foreground';
    }
  };

  if (events.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2 w-full">
        <FileCheck size={16} />
        <span>Historique des documents ({events.length})</span>
        <ChevronDown 
          size={16} 
          className={`ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 space-y-2 max-h-80 overflow-y-auto pr-2">
          {events.map((event) => (
            <div 
              key={event.id} 
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 text-sm border border-border/50"
            >
              <div className="text-lg flex-shrink-0">
                {getStatusIcon(event.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-foreground truncate max-w-[200px]">
                    {event.documentName}
                  </span>
                  <span className={`font-medium ${getStatusColor(event.status)}`}>
                    {getStatusLabel(event.status)}
                  </span>
                </div>
                
                {event.rejectionReason && (
                  <p className="text-destructive text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {event.rejectionReason}
                  </p>
                )}
                
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span>{formatDateTime(event.date)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default DocumentStatusHistory;
