import React, { useState, useEffect } from 'react';
import Button from '@/components/finom/Button';
import { useLoanStatusUpdate, type LoanData } from '@/hooks/useLoanStatusUpdate';
import { 
  LOAN_STATUS_DEFINITIONS, 
  getAllowedTransitions, 
  isTerminalStatus,
  getStatusDefinition 
} from '@/lib/loanStatusMachine';
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

const LoanStatusModal: React.FC<LoanStatusModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  loan
}) => {
  const [selectedStatus, setSelectedStatus] = useState(loan?.status || 'pending');
  const [rejectionReason, setRejectionReason] = useState('');
  const [nextAction, setNextAction] = useState('');
  
  const { updateStatus, loading, error, clearError } = useLoanStatusUpdate();

  useEffect(() => {
    if (loan) {
      setSelectedStatus(loan.status || 'pending');
      setRejectionReason('');
      setNextAction('');
      clearError();
    }
  }, [loan, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loan || !loan.user_id) return;

    const loanData: LoanData = {
      id: loan.id,
      status: loan.status,
      user_id: loan.user_id,
      amount: loan.amount,
      rate: loan.rate,
      monthly_payment: loan.monthly_payment,
    };

    const success = await updateStatus({
      loan: loanData,
      newStatus: selectedStatus,
      rejectionReason: rejectionReason.trim(),
      nextAction: nextAction.trim(),
    });

    if (success) {
      onSuccess();
      onClose();
    }
  };

  if (!isOpen || !loan) return null;

  const clientName = `${loan.user?.first_name || ''} ${loan.user?.last_name || ''}`.trim() || 'Client';
  const currentStatus = loan.status || 'pending';
  const isTerminal = isTerminalStatus(currentStatus);
  const allowedTransitions = getAllowedTransitions(currentStatus);

  // Include current status in the list + allowed transitions
  const availableStatuses = LOAN_STATUS_DEFINITIONS.filter(
    s => s.value === currentStatus || allowedTransitions.includes(s.value as any)
  );

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

        {isTerminal && (
          <div className="warning-message" style={{ 
            padding: '12px', 
            backgroundColor: 'hsl(var(--warning) / 0.1)', 
            borderRadius: '8px',
            marginBottom: '16px',
            color: 'hsl(var(--warning))'
          }}>
            ⚠️ Ce dossier est en statut terminal ({getStatusDefinition(currentStatus)?.label}). 
            Aucune modification n'est possible.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Nouveau statut *</label>
            <div className="status-options">
              {availableStatuses.map((option) => {
                const isCurrent = option.value === currentStatus;
                const isDisabled = isTerminal && !isCurrent;
                
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`status-option ${selectedStatus === option.value ? 'selected' : ''} status-${option.value}`}
                    onClick={() => !isDisabled && setSelectedStatus(option.value)}
                    disabled={isDisabled}
                    style={{ opacity: isDisabled ? 0.5 : 1 }}
                  >
                    <span className="status-icon">{option.icon}</span>
                    <div className="status-content">
                      <span className="status-label">{option.label}</span>
                      <span className="status-desc">{option.description}</span>
                    </div>
                    {isCurrent && <span className="current-badge">Actuel</span>}
                  </button>
                );
              })}
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
            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading || isTerminal || selectedStatus === currentStatus}
            >
              {loading ? 'Mise à jour...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanStatusModal;
