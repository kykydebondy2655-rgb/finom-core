import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  DOCUMENT_STATUS_DEFINITIONS,
  getAllowedDocumentTransitions,
  isDocumentTerminalStatus,
} from '@/lib/documentStatusMachine';
import { useDocumentStatusUpdate, type DocumentData } from '@/hooks/useDocumentStatusUpdate';
import { Clock, Inbox, Search, CheckCircle2, XCircle, FileText, AlertTriangle } from 'lucide-react';
import '@/styles/components.css';

interface DocumentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  document: {
    id: string;
    file_name: string;
    status: string;
    user_id: string;
    loan_id?: string | null;
  } | null;
}

// Map status values to Lucide icons
const STATUS_ICONS: Record<string, typeof Clock> = {
  pending: Clock,
  received: Inbox,
  under_review: Search,
  validated: CheckCircle2,
  rejected: XCircle,
};

const DocumentStatusModal: React.FC<DocumentStatusModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  document,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(document?.status || 'pending');
  const [rejectionReason, setRejectionReason] = useState('');
  
  const { updateStatus, loading, error, clearError } = useDocumentStatusUpdate();

  useEffect(() => {
    if (document) {
      setSelectedStatus(document.status);
      setRejectionReason('');
      clearError();
    }
  }, [document, clearError]);

  const handleSubmit = async () => {
    if (!document) return;

    const documentData: DocumentData = {
      id: document.id,
      status: document.status,
      user_id: document.user_id,
      file_name: document.file_name,
      loan_id: document.loan_id,
    };

    const success = await updateStatus({
      document: documentData,
      newStatus: selectedStatus,
      rejectionReason,
    });

    if (success) {
      onSuccess();
      onClose();
    }
  };

  if (!document) return null;

  const currentStatus = document.status || 'pending';
  const isTerminal = isDocumentTerminalStatus(currentStatus);
  const allowedTransitions = getAllowedDocumentTransitions(currentStatus);

  // Include current status + allowed transitions
  const availableStatuses = DOCUMENT_STATUS_DEFINITIONS.filter(
    s => s.value === currentStatus || allowedTransitions.includes(s.value as any)
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl document-status-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText size={20} /> Statuer sur le document
          </DialogTitle>
          <DialogDescription>
            {document.file_name}
          </DialogDescription>
        </DialogHeader>

        {isTerminal && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm">
            <AlertTriangle size={16} />
            <span>
              Document validé. Aucune modification possible.
            </span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nouveau statut</Label>
            <div className="grid grid-cols-1 gap-2">
              {availableStatuses.map((status) => {
                const IconComponent = STATUS_ICONS[status.value] || Clock;
                const isCurrent = status.value === currentStatus;
                const isDisabled = isTerminal && !isCurrent;

                return (
                  <button
                    key={status.value}
                    type="button"
                    onClick={() => !isDisabled && setSelectedStatus(status.value)}
                    disabled={isDisabled}
                    className={`status-option ${selectedStatus === status.value ? 'selected' : ''}`}
                    style={{
                      '--status-color': status.color,
                      opacity: isDisabled ? 0.5 : 1,
                    } as React.CSSProperties}
                  >
                    <span className="status-icon"><IconComponent size={16} /></span>
                    <div className="status-content">
                      <span className="status-label">
                        {status.label}
                        {isCurrent && <span className="ml-2 text-xs opacity-60">(actuel)</span>}
                      </span>
                      <span className="status-desc">{status.description}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedStatus === 'rejected' && (
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Raison du rejet *</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Indiquez la raison du rejet..."
                rows={3}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="cancel-btn"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="submit-btn"
            disabled={loading || isTerminal || selectedStatus === currentStatus}
          >
            {loading ? 'Mise à jour...' : 'Confirmer'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentStatusModal;
