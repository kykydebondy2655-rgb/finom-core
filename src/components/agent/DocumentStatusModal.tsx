import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/finom/Toast';
import { emailService } from '@/services/emailService';
import logger from '@/lib/logger';
import { Clock, Inbox, Search, CheckCircle2, XCircle, FileText } from 'lucide-react';
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

const DOCUMENT_STATUSES = [
  { value: 'pending', label: 'En attente', color: '#f59e0b', Icon: Clock },
  { value: 'received', label: 'Reçu', color: '#3b82f6', Icon: Inbox },
  { value: 'under_review', label: 'En analyse', color: '#8b5cf6', Icon: Search },
  { value: 'validated', label: 'Validé', color: '#10b981', Icon: CheckCircle2 },
  { value: 'rejected', label: 'Rejeté', color: '#ef4444', Icon: XCircle },
];

const DocumentStatusModal: React.FC<DocumentStatusModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  document,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(document?.status || 'pending');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  React.useEffect(() => {
    if (document) {
      setSelectedStatus(document.status);
      setRejectionReason('');
    }
  }, [document]);

  const handleSubmit = async () => {
    if (!document) return;

    if (selectedStatus === 'rejected' && !rejectionReason.trim()) {
      toast.error('Veuillez indiquer la raison du rejet');
      return;
    }

    setLoading(true);
    try {
      // Update document status
      const updateData: Record<string, unknown> = {
        status: selectedStatus,
        validated_at: selectedStatus === 'validated' ? new Date().toISOString() : null,
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
      const statusLabel = DOCUMENT_STATUSES.find(s => s.value === selectedStatus)?.label || selectedStatus;
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: document.user_id,
          type: 'document_status',
          category: 'document',
          title: `Document ${statusLabel.toLowerCase()}`,
          message: selectedStatus === 'rejected' 
            ? `Votre document "${document.file_name}" a été rejeté. Raison: ${rejectionReason}`
            : `Votre document "${document.file_name}" est maintenant: ${statusLabel}`,
          related_entity: 'documents',
          related_id: document.id,
        });

      if (notifError) {
        logger.warn('Notification creation failed', { error: notifError.message });
      }

      // Send email notification to client for validated/rejected documents
      try {
        const { data: clientProfile } = await supabase
          .from('profiles')
          .select('email, first_name')
          .eq('id', document.user_id)
          .maybeSingle();

        if (clientProfile?.email) {
          if (selectedStatus === 'validated') {
            emailService.sendDocumentValidated(
              clientProfile.email,
              clientProfile.first_name || 'Client',
              document.file_name
            ).catch(err => logger.logError('Email send error', err));
          } else if (selectedStatus === 'rejected') {
            emailService.sendDocumentRejected(
              clientProfile.email,
              clientProfile.first_name || 'Client',
              document.file_name,
              rejectionReason
            ).catch(err => logger.logError('Email send error', err));
          }
        }
      } catch (emailErr) {
        logger.logError('Failed to send document status email', emailErr);
      }

      toast.success('Statut du document mis à jour');
      onSuccess();
      onClose();
    } catch (err) {
      logger.logError('Document status update error', err);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  if (!document) return null;

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

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nouveau statut</Label>
            <div className="grid grid-cols-1 gap-2">
              {DOCUMENT_STATUSES.map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => setSelectedStatus(status.value)}
                  className={`status-option ${selectedStatus === status.value ? 'selected' : ''}`}
                  style={{
                    '--status-color': status.color,
                  } as React.CSSProperties}
                >
                  <span className="status-icon"><status.Icon size={16} /></span>
                  <span className="status-label">{status.label}</span>
                </button>
              ))}
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
            disabled={loading}
          >
            {loading ? 'Mise à jour...' : 'Confirmer'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentStatusModal;
