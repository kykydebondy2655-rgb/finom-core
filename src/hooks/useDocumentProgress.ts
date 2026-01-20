/**
 * Hook to monitor document progress and trigger automatic status transitions
 * Uses centralized useLoanStatusUpdate for consistency
 */

import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getDocumentChecklist, calculateDocumentProgress, type ProjectType } from '@/lib/documentChecklist';
import { emailService } from '@/services/emailService';
import { logger } from '@/lib/logger';
import { isValidTransition } from '@/lib/loanStatusMachine';

interface UseDocumentProgressOptions {
  loanId: string;
  userId: string;
  projectType: ProjectType;
  currentStatus: string | null;
  hasCoborrower: boolean;
  loanAmount?: number;
  loanRate?: number;
  monthlyPayment?: number;
  onStatusChange?: () => void;
}

// Documents that need to be provided by co-borrower as well
const COBORROWER_REQUIRED_DOCS = ['id_card', 'proof_of_address', 'tax_notice', 'payslips', 'employment_contract', 'bank_statements'];

export const useDocumentProgress = ({
  loanId,
  userId,
  projectType,
  currentStatus,
  hasCoborrower,
  loanAmount = 0,
  loanRate = 0,
  monthlyPayment = 0,
  onStatusChange,
}: UseDocumentProgressOptions) => {
  
  // Prevent duplicate transitions
  const isTransitioning = useRef(false);
  
  const checkAndTransition = useCallback(async () => {
    // Prevent concurrent transitions
    if (isTransitioning.current) return;
    
    // Only transition from pending or documents_required
    if (currentStatus !== 'pending' && currentStatus !== 'documents_required') {
      return;
    }

    // Validate transition is allowed by state machine
    if (!isValidTransition(currentStatus, 'under_review')) {
      logger.warn('Invalid auto-transition attempted', { from: currentStatus, to: 'under_review' });
      return;
    }

    try {
      isTransitioning.current = true;
      
      // Fetch all documents for this loan
      const { data: documents, error } = await supabase
        .from('documents')
        .select('*')
        .eq('loan_id', loanId)
        .eq('direction', 'outgoing');

      if (error) throw error;

      const checklist = getDocumentChecklist(projectType);
      const primaryDocs = documents?.filter(d => !d.document_owner || d.document_owner === 'primary') || [];
      const primaryProgress = calculateDocumentProgress(checklist, primaryDocs);

      let allComplete = primaryProgress.percentage === 100;

      // If has co-borrower, also check their documents
      if (hasCoborrower) {
        const coborrowerChecklist = checklist.filter(doc => COBORROWER_REQUIRED_DOCS.includes(doc.id));
        const coborrowerDocs = documents?.filter(d => d.document_owner === 'co_borrower') || [];
        const coborrowerProgress = calculateDocumentProgress(coborrowerChecklist, coborrowerDocs);
        allComplete = allComplete && coborrowerProgress.percentage === 100;
      }

      if (allComplete) {
        // Transition to under_review
        const { error: updateError } = await supabase
          .from('loan_applications')
          .update({
            status: 'under_review',
            next_action: 'Analyse du dossier en cours',
            updated_at: new Date().toISOString(),
          })
          .eq('id', loanId);

        if (updateError) throw updateError;

        // Log the automatic status change to history for audit trail
        const { error: historyError } = await supabase
          .from('loan_status_history')
          .insert({
            loan_id: loanId,
            old_status: currentStatus,
            new_status: 'under_review',
            next_action: 'Analyse du dossier en cours',
            notes: 'Transition automatique - Tous les documents requis ont été reçus',
            changed_by: null, // System-triggered
          });

        if (historyError) {
          logger.warn('Failed to log auto-transition history', { error: historyError.message });
        }

        // Create notification for client
        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'loan_status',
          category: 'loan',
          title: 'Dossier complet - En analyse 🔍',
          message: 'Tous vos documents ont été reçus. Votre dossier passe en analyse par notre équipe.',
          related_entity: 'loan_applications',
          related_id: loanId,
        });

        // Notify assigned agent
        const { data: assignment } = await supabase
          .from('client_assignments')
          .select('agent_user_id')
          .eq('client_user_id', userId)
          .maybeSingle();

        if (assignment?.agent_user_id) {
          await supabase.from('notifications').insert({
            user_id: assignment.agent_user_id,
            type: 'loan_status',
            category: 'loan',
            title: 'Dossier complet',
            message: `Le dossier #${loanId.slice(0, 8)} a tous ses documents. Prêt pour analyse.`,
            related_entity: 'loan_applications',
            related_id: loanId,
          });
        }

        // Send email to client (critical - was missing before)
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, first_name')
          .eq('id', userId)
          .maybeSingle();

        if (profile?.email) {
          try {
            await emailService.sendNotification(
              profile.email,
              profile.first_name || 'Client',
              'Votre dossier est en cours d\'analyse 🔍',
              'Tous vos documents ont été reçus ! Notre équipe analyse maintenant votre dossier de prêt. Nous vous tiendrons informé de l\'avancement.',
              'Voir mon dossier',
              'https://pret-finom.co/loans'
            );
            logger.info('Auto-transition email sent', { loanId, email: profile.email });
          } catch (emailErr) {
            logger.logError('Failed to send auto-transition email', emailErr);
            // Don't throw - email failure shouldn't block the transition
          }
        }

        onStatusChange?.();
        logger.info('Loan auto-transitioned to under_review', { loanId });
      }
    } catch (err) {
      logger.logError('Error in document progress check', err);
    } finally {
      isTransitioning.current = false;
    }
  }, [loanId, userId, projectType, currentStatus, hasCoborrower, onStatusChange]);

  useEffect(() => {
    // Check on mount
    checkAndTransition();

    // Subscribe to document changes for this loan
    const channel = supabase
      .channel(`documents-${loanId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `loan_id=eq.${loanId}`,
        },
        () => {
          checkAndTransition();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loanId, checkAndTransition]);

  return { checkAndTransition };
};
