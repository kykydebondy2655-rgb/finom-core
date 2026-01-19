import React, { useState } from 'react';
import Button from '@/components/finom/Button';
import { adminApi } from '@/services/api';
import { supabase } from '@/integrations/supabase/client';
import { emailService } from '@/services/emailService';
import { useToast } from '@/components/finom/Toast';
import { useAuth } from '@/context/AuthContext';
import logger from '@/lib/logger';
import '@/styles/components.css';

interface LoanStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  loan: {
    id: string;
    status: string | null;
    amount: number;
    rate?: number;
    monthly_payment?: number;
    user_id?: string;
    user?: { first_name?: string; last_name?: string };
  } | null;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'En attente', color: 'var(--color-warning)', icon: '⏳' },
  { value: 'documents_required', label: 'Documents requis', color: '#7C3AED', icon: '📋' },
  { value: 'under_review', label: 'En analyse', color: 'var(--color-info)', icon: '🔍' },
  { value: 'processing', label: 'En traitement', color: '#0891B2', icon: '⚙️' },
  { value: 'offer_issued', label: 'Offre émise', color: '#f97316', icon: '📨', description: 'Délai légal de 10 jours de réflexion' },
  { value: 'approved', label: 'Approuvé', color: 'var(--color-success)', icon: '✅' },
  { value: 'rejected', label: 'Refusé', color: 'var(--color-danger)', icon: '❌' },
  { value: 'funded', label: 'Financé', color: 'var(--color-success)', icon: '💰' },
];

const LoanStatusModal: React.FC<LoanStatusModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  loan
}) => {
  const [selectedStatus, setSelectedStatus] = useState(loan?.status || 'pending');
  const [rejectionReason, setRejectionReason] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const { user } = useAuth();

  React.useEffect(() => {
    if (loan) {
      setSelectedStatus(loan.status || 'pending');
      setRejectionReason('');
      setNextAction('');
    }
  }, [loan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loan) return;

    if (selectedStatus === 'rejected' && !rejectionReason.trim()) {
      setError('Veuillez indiquer un motif de refus');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get old status for history
      const oldStatus = loan.status;
      
      await adminApi.updateLoanStatus(
        loan.id, 
        selectedStatus, 
        selectedStatus === 'rejected' ? rejectionReason.trim() : undefined,
        nextAction.trim() || undefined
      );

      // Log status change to history
      const { error: historyError } = await supabase
        .from('loan_status_history')
        .insert({
          loan_id: loan.id,
          old_status: oldStatus,
          new_status: selectedStatus,
          changed_by: user?.id || null,
          next_action: nextAction.trim() || null,
          rejection_reason: selectedStatus === 'rejected' ? rejectionReason.trim() : null,
        });

      if (historyError) {
        logger.warn('Failed to log status history', { error: historyError.message });
      }

      // Get the user_id to create notification
      const userId = loan.user_id;
      
      if (userId) {
        // Create notification for client
        const statusLabel = STATUS_OPTIONS.find(s => s.value === selectedStatus)?.label || selectedStatus;
        let notificationMessage = `Votre dossier de prêt est maintenant: ${statusLabel}.`;
        if (selectedStatus === 'rejected') {
          notificationMessage = `Votre demande de prêt a été refusée. Raison: ${rejectionReason}`;
        }
        if (nextAction.trim()) {
          notificationMessage += ` Prochaine étape: ${nextAction.trim()}`;
        }

        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: userId,
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
            .eq('id', userId)
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
            } else if (selectedStatus === 'under_review') {
              emailService.sendNotification(
                clientProfile.email,
                clientProfile.first_name || 'Client',
                'Votre dossier est en cours d\'analyse 🔍',
                'Notre équipe analyse actuellement votre dossier de prêt. Nous vous tiendrons informé de l\'avancement.',
                'Voir mon dossier',
                'https://pret-finom.co/loans'
              ).catch(err => logger.logError('Email send error', err));
            } else if (selectedStatus === 'processing') {
              emailService.sendNotification(
                clientProfile.email,
                clientProfile.first_name || 'Client',
                'Votre dossier est en traitement ⚙️',
                'Votre demande de prêt est en cours de traitement par notre service. Une réponse vous sera communiquée très prochainement.',
                'Suivre mon dossier',
                'https://pret-finom.co/loans'
              ).catch(err => logger.logError('Email send error', err));
            }
          }
        } catch (emailErr) {
          logger.logError('Failed to send status email', emailErr);
        }
      }

      toast.success('Statut du dossier mis à jour');
      onSuccess();
      onClose();
    } catch (err: any) {
      logger.logError('Error updating loan status', err);
      setError(err?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !loan) return null;

  const clientName = `${loan.user?.first_name || ''} ${loan.user?.last_name || ''}`.trim() || 'Client';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content loan-status-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📋 Modifier le statut</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="loan-info">
          <span className="loan-ref">Dossier #{loan.id.slice(0, 8)}</span>
          <span className="loan-client">{clientName}</span>
          <span className="loan-amount">{loan.amount?.toLocaleString()} €</span>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Nouveau statut *</label>
            <div className="status-options">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`status-option ${selectedStatus === option.value ? 'selected' : ''} status-${option.value}`}
                  onClick={() => setSelectedStatus(option.value)}
                >
                  <span className="status-icon">{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {selectedStatus === 'rejected' && (
            <div className="form-group">
              <label>Motif du refus *</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Indiquez la raison du refus..."
                rows={3}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Prochaine action (optionnel)</label>
            <textarea
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              placeholder="Ex: Attente de la signature du compromis..."
              rows={2}
            />
          </div>

          <div className="modal-actions">
            <Button variant="ghost" type="button" onClick={onClose}>
              Annuler
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Mise à jour...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanStatusModal;
