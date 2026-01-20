import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { emailService } from '@/services/emailService';
import { useToast } from '@/components/finom/Toast';
import { useAuth } from '@/context/AuthContext';
import logger from '@/lib/logger';
import { loanStatusUpdateSchema } from '@/lib/validations/statusSchemas';
import { 
  isValidTransition, 
  getStatusDefinition, 
  getTransitionBlockReason,
  isTerminalStatus,
  type LoanStatus 
} from '@/lib/loanStatusMachine';

export interface LoanData {
  id: string;
  status: string | null;
  user_id: string;
  amount: number;
  rate?: number;
  monthly_payment?: number;
}

export interface StatusUpdateParams {
  loan: LoanData;
  newStatus: string;
  rejectionReason?: string;
  nextAction?: string;
  isSystemTriggered?: boolean;
}

export interface UseLoanStatusUpdateReturn {
  updateStatus: (params: StatusUpdateParams) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Unified hook for loan status updates
 * Used by both admin and agent interfaces
 * Handles: validation, state machine, DB update, history logging, notifications, emails
 */
export function useLoanStatusUpdate(): UseLoanStatusUpdateReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const { user } = useAuth();

  const clearError = useCallback(() => setError(null), []);

  const updateStatus = useCallback(async ({
    loan,
    newStatus,
    rejectionReason = '',
    nextAction = '',
    isSystemTriggered = false,
  }: StatusUpdateParams): Promise<boolean> => {
    // 1. Validate state machine transition
    if (!isValidTransition(loan.status, newStatus)) {
      const reason = getTransitionBlockReason(loan.status || 'pending', newStatus);
      setError(reason);
      toast.error(reason);
      return false;
    }

    // 2. Validate input data with Zod schema
    const validationResult = loanStatusUpdateSchema.safeParse({
      status: newStatus,
      nextAction,
      rejectionReason,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      const errorMessage = firstError?.message || 'Données invalides';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const oldStatus = loan.status;
      const statusDef = getStatusDefinition(newStatus);
      const statusLabel = statusDef?.label || newStatus;
      const statusDescription = statusDef?.description || '';

      // 3. Update loan status in database
      const updateData: Record<string, unknown> = {
        status: newStatus,
        next_action: nextAction || null,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === 'rejected') {
        updateData.rejection_reason = rejectionReason;
      }

      const { error: updateError } = await supabase
        .from('loan_applications')
        .update(updateData)
        .eq('id', loan.id);

      if (updateError) throw updateError;

      // 4. Log status change to history
      const { error: historyError } = await supabase
        .from('loan_status_history')
        .insert({
          loan_id: loan.id,
          old_status: oldStatus,
          new_status: newStatus,
          changed_by: isSystemTriggered ? null : (user?.id || null),
          next_action: nextAction || null,
          rejection_reason: newStatus === 'rejected' ? rejectionReason : null,
          notes: isSystemTriggered ? 'Transition automatique du système' : null,
        });

      if (historyError) {
        logger.warn('Failed to log status history', { error: historyError.message });
      }

      // 5. Create in-app notification for client
      let notificationMessage = `Votre dossier de prêt est maintenant: ${statusLabel}. ${statusDescription}`;
      if (newStatus === 'rejected') {
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

      // 6. Send email notification (non-blocking)
      await sendStatusEmail(loan, newStatus, rejectionReason);

      toast.success('Statut du dossier mis à jour');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      logger.logError('Error updating loan status', err);
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  return { updateStatus, loading, error, clearError };
}

/**
 * Send appropriate email based on new status
 */
async function sendStatusEmail(
  loan: LoanData, 
  newStatus: string, 
  rejectionReason: string
): Promise<void> {
  try {
    const { data: clientProfile } = await supabase
      .from('profiles')
      .select('email, first_name')
      .eq('id', loan.user_id)
      .maybeSingle();

    if (!clientProfile?.email) return;

    const clientName = clientProfile.first_name || 'Client';
    const email = clientProfile.email;

    switch (newStatus) {
      case 'approved':
        await emailService.sendLoanApproved(
          email,
          clientName,
          loan.id,
          loan.amount,
          loan.rate || 0,
          loan.monthly_payment || 0
        );
        break;

      case 'rejected':
        await emailService.sendLoanRejected(
          email,
          clientName,
          loan.id,
          rejectionReason
        );
        break;

      case 'funded':
        await emailService.sendNotification(
          email,
          clientName,
          'Votre financement est débloqué ! 🎉',
          'Les fonds de votre prêt immobilier ont été versés. Félicitations pour votre nouveau projet !'
        );
        break;

      case 'offer_issued':
        await emailService.sendLoanOfferIssued(
          email,
          clientName,
          loan.id,
          loan.amount,
          loan.rate || 0,
          loan.monthly_payment || 0
        );
        break;

      case 'documents_required':
        await emailService.sendDocumentRequired(
          email,
          clientName,
          loan.id,
          ['Veuillez consulter votre espace client pour voir les documents requis']
        );
        break;

      case 'under_review':
        await emailService.sendNotification(
          email,
          clientName,
          'Votre dossier est en cours d\'analyse 🔍',
          'Notre équipe analyse actuellement votre dossier de prêt. Nous vous tiendrons informé de l\'avancement.',
          'Voir mon dossier',
          'https://pret-finom.co/loans'
        );
        break;

      case 'processing':
        await emailService.sendNotification(
          email,
          clientName,
          'Votre dossier est en traitement ⚙️',
          'Votre demande de prêt est en cours de traitement par notre service. Une réponse vous sera communiquée très prochainement.',
          'Suivre mon dossier',
          'https://pret-finom.co/loans'
        );
        break;
    }
  } catch (err) {
    logger.logError('Failed to send status email', err);
    // Don't throw - email failure shouldn't block status update
  }
}
