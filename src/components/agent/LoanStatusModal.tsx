import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/finom/Toast';
import { emailService } from '@/services/emailService';
import logger from '@/lib/logger';
import '@/styles/components.css';

interface LoanStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  loan: {
    id: string;
    status: string;
    user_id: string;
    amount: number;
    rate?: number;
    monthly_payment?: number;
  } | null;
}

const LOAN_STATUSES = [
  { value: 'pending', label: 'En attente', color: '#f59e0b', icon: '⏳', description: 'Dossier reçu, en attente de traitement' },
  { value: 'documents_required', label: 'Documents requis', color: '#3b82f6', icon: '📋', description: 'Documents manquants à fournir' },
  { value: 'under_review', label: 'En analyse', color: '#8b5cf6', icon: '🔍', description: 'Analyse du dossier en cours' },
  { value: 'processing', label: 'En traitement', color: '#06b6d4', icon: '⚙️', description: 'Dossier en cours de traitement' },
  { value: 'offer_issued', label: 'Offre émise', color: '#f97316', icon: '📨', description: 'Offre envoyée, délai légal 10 jours' },
  { value: 'approved', label: 'Approuvé', color: '#10b981', icon: '✅', description: 'Dossier validé et approuvé' },
  { value: 'rejected', label: 'Rejeté', color: '#ef4444', icon: '❌', description: 'Dossier refusé' },
  { value: 'funded', label: 'Financé', color: '#059669', icon: '💰', description: 'Fonds débloqués' },
];

const LoanStatusModal: React.FC<LoanStatusModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  loan,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(loan?.status || 'pending');
  const [nextAction, setNextAction] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  React.useEffect(() => {
    if (loan) {
      setSelectedStatus(loan.status);
      setNextAction('');
      setRejectionReason('');
    }
  }, [loan]);

  const handleSubmit = async () => {
    if (!loan) return;

    if (selectedStatus === 'rejected' && !rejectionReason.trim()) {
      toast.error('Veuillez indiquer la raison du rejet');
      return;
    }

    setLoading(true);
    try {
      // Update loan status
      const updateData: Record<string, unknown> = {
        status: selectedStatus,
        next_action: nextAction || null,
        updated_at: new Date().toISOString(),
      };

      if (selectedStatus === 'rejected') {
        updateData.rejection_reason = rejectionReason;
      }

      const { error: updateError } = await supabase
        .from('loan_applications')
        .update(updateData)
        .eq('id', loan.id);

      if (updateError) throw updateError;

      // Create notification for client
      const statusLabel = LOAN_STATUSES.find(s => s.value === selectedStatus)?.label || selectedStatus;
      const statusDesc = LOAN_STATUSES.find(s => s.value === selectedStatus)?.description || '';
      
      let notificationMessage = `Votre dossier de prêt est maintenant: ${statusLabel}. ${statusDesc}`;
      if (selectedStatus === 'rejected') {
        notificationMessage = `Votre demande de prêt a été rejetée. Raison: ${rejectionReason}`;
      }
      if (nextAction) {
        notificationMessage += ` Prochaine étape: ${nextAction}`;
      }

      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: loan.user_id,
          type: 'loan_status',
          category: 'loan',
          title: `Dossier ${statusLabel.toLowerCase()}`,
          message: notificationMessage,
          related_entity: 'loan_applications',
          related_id: loan.id,
        });

      if (notifError) {
        logger.warn('Notification error', { error: notifError.message });
      }

      // Send email notification to client (non-blocking)
      try {
        const { data: clientProfile } = await supabase
          .from('profiles')
          .select('email, first_name')
          .eq('id', loan.user_id)
          .maybeSingle();

        if (clientProfile?.email) {
          if (selectedStatus === 'approved') {
            emailService.sendLoanApproved(
              clientProfile.email,
              clientProfile.first_name || 'Client',
              loan.id,
              loan.amount,
              loan.rate || 0,
              loan.monthly_payment || 0
            ).catch(err => logger.logError('Email send error', err));
          } else if (selectedStatus === 'rejected') {
            emailService.sendLoanRejected(
              clientProfile.email,
              clientProfile.first_name || 'Client',
              loan.id,
              rejectionReason
            ).catch(err => logger.logError('Email send error', err));
          } else if (selectedStatus === 'funded') {
            emailService.sendNotification(
              clientProfile.email,
              clientProfile.first_name || 'Client',
              'Votre financement est débloqué ! 🎉',
              'Les fonds de votre prêt immobilier ont été versés. Félicitations pour votre nouveau projet !'
            ).catch(err => logger.logError('Email send error', err));
          } else if (selectedStatus === 'offer_issued') {
            emailService.sendLoanOfferIssued(
              clientProfile.email,
              clientProfile.first_name || 'Client',
              loan.id,
              loan.amount,
              loan.rate || 0,
              loan.monthly_payment || 0
            ).catch(err => logger.logError('Email send error', err));
          } else if (selectedStatus === 'documents_required') {
            emailService.sendDocumentRequired(
              clientProfile.email,
              clientProfile.first_name || 'Client',
              loan.id,
              ['Veuillez consulter votre espace client pour voir les documents requis']
            ).catch(err => logger.logError('Email send error', err));
          }
        }
      } catch (emailErr) {
        logger.logError('Failed to send status email', emailErr);
      }

      toast.success('Statut du dossier mis à jour');
      onSuccess();
      onClose();
    } catch (err) {
      logger.logError('Update error', err);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  if (!loan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl agent-loan-status-modal" style={{ backgroundColor: 'white' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            📁 Statuer sur le dossier
          </DialogTitle>
          <DialogDescription>
            Dossier #{loan.id.slice(0, 8)} - {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(loan.amount)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nouveau statut</Label>
            <div className="grid grid-cols-1 gap-2">
              {LOAN_STATUSES.map((status) => (
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
                  <div className="status-content">
                    <span className="status-label">{status.label}</span>
                    <span className="status-desc">{status.description}</span>
                  </div>
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

          <div className="space-y-2">
            <Label htmlFor="next-action">Prochaine action (optionnel)</Label>
            <Textarea
              id="next-action"
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              placeholder="Ex: Attente de la signature du compromis..."
              rows={2}
            />
          </div>
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

export default LoanStatusModal;
