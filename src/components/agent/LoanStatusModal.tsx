import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLoanStatusUpdate, type LoanData } from '@/hooks/useLoanStatusUpdate';
import { 
  LOAN_STATUS_DEFINITIONS, 
  getAllowedTransitions, 
  isTerminalStatus,
  getStatusDefinition 
} from '@/lib/loanStatusMachine';
import { Clock, ClipboardList, Search, Settings, Send, CheckCircle2, XCircle, Wallet, FolderOpen, AlertTriangle } from 'lucide-react';
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

// Map status values to Lucide icons
const STATUS_ICONS: Record<string, typeof Clock> = {
  pending: Clock,
  documents_required: ClipboardList,
  under_review: Search,
  processing: Settings,
  offer_issued: Send,
  approved: CheckCircle2,
  rejected: XCircle,
  funded: Wallet,
};

const LoanStatusModal: React.FC<LoanStatusModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  loan,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(loan?.status || 'pending');
  const [nextAction, setNextAction] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  
  const { updateStatus, loading, error, clearError } = useLoanStatusUpdate();

  useEffect(() => {
    if (loan) {
      setSelectedStatus(loan.status);
      setNextAction('');
      setRejectionReason('');
      clearError();
    }
  }, [loan, clearError]);

  const handleSubmit = async () => {
    if (!loan) return;

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

  if (!loan) return null;

  const currentStatus = loan.status || 'pending';
  const isTerminal = isTerminalStatus(currentStatus);
  const allowedTransitions = getAllowedTransitions(currentStatus);

  // Include current status + allowed transitions
  const availableStatuses = LOAN_STATUS_DEFINITIONS.filter(
    s => s.value === currentStatus || allowedTransitions.includes(s.value as any)
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl agent-loan-status-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FolderOpen size={20} /> Statuer sur le dossier
          </DialogTitle>
          <DialogDescription>
            Dossier #{loan.id.slice(0, 8)} - {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(loan.amount)}
          </DialogDescription>
        </DialogHeader>

        {isTerminal && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm">
            <AlertTriangle size={16} />
            <span>
              Dossier en statut terminal ({getStatusDefinition(currentStatus)?.label}). 
              Aucune modification possible.
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
            disabled={loading || isTerminal || selectedStatus === currentStatus}
          >
            {loading ? 'Mise à jour...' : 'Confirmer'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoanStatusModal;
