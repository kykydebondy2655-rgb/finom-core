import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/finom/Toast';
import { emailService } from '@/services/emailService';
import logger from '@/lib/logger';

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
  { value: 'pending', label: 'En attente', color: '#f59e0b', icon: '⏳' },
  { value: 'received', label: 'Reçu', color: '#3b82f6', icon: '📥' },
  { value: 'under_review', label: 'En analyse', color: '#8b5cf6', icon: '🔍' },
  { value: 'validated', label: 'Validé', color: '#10b981', icon: '✅' },
  { value: 'rejected', label: 'Rejeté', color: '#ef4444', icon: '❌' },
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
      <DialogContent className="sm:max-w-[450px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl" style={{ backgroundColor: 'white' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            📄 Statuer sur le document
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
                  <span className="status-icon">{status.icon}</span>
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

        <style>{`
          .status-option {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 1rem;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            background: white;
            cursor: pointer;
            transition: all 0.2s;
            text-align: left;
          }
          .status-option:hover {
            border-color: var(--status-color);
            background: color-mix(in srgb, var(--status-color) 5%, white);
          }
          .status-option.selected {
            border-color: var(--status-color);
            background: color-mix(in srgb, var(--status-color) 10%, white);
          }
          .status-icon { font-size: 1.25rem; }
          .status-label { font-weight: 500; color: #374151; }
          .cancel-btn {
            padding: 0.5rem 1rem;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            background: white;
            color: #374151;
            font-weight: 500;
            cursor: pointer;
          }
          .cancel-btn:hover { background: #f3f4f6; }
          .submit-btn {
            padding: 0.5rem 1.5rem;
            border: none;
            border-radius: 6px;
            background: #10b981;
            color: white;
            font-weight: 600;
            cursor: pointer;
          }
          .submit-btn:hover { background: #059669; }
          .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentStatusModal;
