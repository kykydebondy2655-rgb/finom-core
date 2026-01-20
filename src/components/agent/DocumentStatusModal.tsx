import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/finom/Toast';
import { useAuth } from '@/context/AuthContext';
import { emailService } from '@/services/emailService';
import logger from '@/lib/logger';
import { documentStatusUpdateSchema } from '@/lib/validations/statusSchemas';
import { 
  DOCUMENT_STATUS_DEFINITIONS,
  isValidDocumentTransition,
  getAllowedDocumentTransitions,
  isDocumentTerminalStatus,
  getDocumentTransitionBlockReason,
  getDocumentStatusDefinition,
} from '@/lib/documentStatusMachine';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const { user } = useAuth();

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    if (document) {
      setSelectedStatus(document.status);
      setRejectionReason('');
      clearError();
    }
  }, [document, clearError]);

  const handleSubmit = async () => {
    if (!document) return;

    // Validate state machine transition
    if (!isValidDocumentTransition(document.status, selectedStatus)) {
      const reason = getDocumentTransitionBlockReason(document.status, selectedStatus);
      setError(reason);
      toast.error(reason);
      return;
    }

    // Validate status update using Zod schema
    const validationResult = documentStatusUpdateSchema.safeParse({
      status: selectedStatus,
      rejectionReason: rejectionReason
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      const errorMessage = firstError?.message || 'Données invalides';
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Update document status
      const updateData: Record<string, unknown> = {
        status: selectedStatus,
        validated_at: selectedStatus === 'validated' ? new Date().toISOString() : null,
        validated_by: selectedStatus === 'validated' ? user?.id : null,
      };

      if (selectedStatus === 'rejected') {
        updateData.rejection_reason = rejectionReason;
      }

      const { error: updateError } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', document.id);

      if (updateError) throw updateError;

      // Create notification for client
      const statusDef = getDocumentStatusDefinition(selectedStatus);
      const statusLabel = statusDef?.label || selectedStatus;
      const statusDescription = statusDef?.description || '';

      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: document.user_id,
          type: 'document_status',
          category: 'document',
          title: `Document ${statusLabel.toLowerCase()}`,
          message: selectedStatus === 'rejected' 
            ? `Votre document "${document.file_name}" a été rejeté. Raison: ${rejectionReason}. Veuillez téléverser un nouveau document.`
            : `Votre document "${document.file_name}" est maintenant: ${statusLabel}. ${statusDescription}`,
          related_entity: 'documents',
          related_id: document.id,
        });

      if (notifError) {
        logger.warn('Notification creation failed', { error: notifError.message });
      }

      // Send email notification to client for validated/rejected documents
      await sendDocumentStatusEmail(document, selectedStatus, rejectionReason);

      toast.success('Statut du document mis à jour');
      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      logger.logError('Document status update error', err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
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

/**
 * Send appropriate email based on document status change
 */
async function sendDocumentStatusEmail(
  document: { user_id: string; file_name: string },
  newStatus: string,
  rejectionReason: string
): Promise<void> {
  try {
    const { data: clientProfile } = await supabase
      .from('profiles')
      .select('email, first_name')
      .eq('id', document.user_id)
      .maybeSingle();

    if (!clientProfile?.email) return;

    const clientName = clientProfile.first_name || 'Client';

    if (newStatus === 'validated') {
      await emailService.sendDocumentValidated(
        clientProfile.email,
        clientName,
        document.file_name
      );
    } else if (newStatus === 'rejected') {
      await emailService.sendDocumentRejected(
        clientProfile.email,
        clientName,
        document.file_name,
        rejectionReason
      );
    }
  } catch (err) {
    logger.logError('Failed to send document status email', err);
    // Don't throw - email failure shouldn't block status update
  }
}

export default DocumentStatusModal;
