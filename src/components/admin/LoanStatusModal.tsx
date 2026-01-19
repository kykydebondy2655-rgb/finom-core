import React, { useState } from 'react';
import Button from '@/components/finom/Button';
import { adminApi } from '@/services/api';
import { supabase } from '@/integrations/supabase/client';
import { emailService } from '@/services/emailService';
import { useToast } from '@/components/finom/Toast';
import logger from '@/lib/logger';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  React.useEffect(() => {
    if (loan) {
      setSelectedStatus(loan.status || 'pending');
      setRejectionReason('');
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
      
      await adminApi.updateLoanStatus(
        loan.id, 
        selectedStatus, 
        selectedStatus === 'rejected' ? rejectionReason.trim() : undefined
      );

      // Get the user_id to create notification
      const userId = loan.user_id;
      
      if (userId) {
        // Create notification for client
        const statusLabel = STATUS_OPTIONS.find(s => s.value === selectedStatus)?.label || selectedStatus;
        let notificationMessage = `Votre dossier de prêt est maintenant: ${statusLabel}.`;
        if (selectedStatus === 'rejected') {
          notificationMessage = `Votre demande de prêt a été refusée. Raison: ${rejectionReason}`;
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
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
                  className={`status-option ${selectedStatus === option.value ? 'selected' : ''}`}
                  style={{ '--status-color': option.color } as React.CSSProperties}
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

          <div className="modal-actions">
            <Button variant="ghost" type="button" onClick={onClose}>
              Annuler
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Mise à jour...' : 'Enregistrer'}
            </Button>
          </div>
        </form>

        <style>{`
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 1rem;
          }
          .modal-content {
            background: white;
            border-radius: var(--radius-lg);
            width: 100%;
            max-width: 520px;
            max-height: 90vh;
            overflow-y: auto;
          }
          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid var(--color-border);
          }
          .modal-header h2 {
            margin: 0;
            font-size: 1.25rem;
          }
          .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--color-text-tertiary);
          }
          .loan-info {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            padding: 1.25rem 1.5rem;
            background: #f8fafc;
            border-bottom: 1px solid var(--color-border);
          }
          .loan-ref {
            font-family: monospace;
            color: var(--color-admin);
            font-weight: 600;
          }
          .loan-client {
            font-weight: 600;
            font-size: 1.1rem;
          }
          .loan-amount {
            color: var(--color-text-secondary);
          }
          form {
            padding: 1.5rem;
          }
          .error-message {
            background: #fee;
            color: var(--color-danger);
            padding: 0.75rem;
            border-radius: var(--radius-md);
            margin-bottom: 1rem;
          }
          .form-group {
            margin-bottom: 1.25rem;
          }
          .form-group label {
            display: block;
            font-weight: 500;
            margin-bottom: 0.75rem;
          }
          .status-options {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }
          .status-option {
            display: flex;
            align-items: center;
            gap: 0.375rem;
            padding: 0.625rem 1rem;
            border: 2px solid var(--color-border);
            border-radius: var(--radius-full);
            background: white;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s;
          }
          .status-option:hover {
            border-color: var(--status-color);
          }
          .status-option.selected {
            background: var(--status-color);
            border-color: var(--status-color);
            color: white;
          }
          .status-icon {
            font-size: 1rem;
          }
          .form-group textarea {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid var(--color-border);
            border-radius: var(--radius-md);
            font-size: 1rem;
            resize: vertical;
          }
          .modal-actions {
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
            padding-top: 1rem;
            border-top: 1px solid var(--color-border);
          }
        `}</style>
      </div>
    </div>
  );
};

export default LoanStatusModal;
