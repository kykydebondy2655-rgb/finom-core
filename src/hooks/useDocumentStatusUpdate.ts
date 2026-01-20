import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { emailService } from '@/services/emailService';
import { useToast } from '@/components/finom/Toast';
import { useAuth } from '@/context/AuthContext';
import logger from '@/lib/logger';
import { documentStatusUpdateSchema } from '@/lib/validations/statusSchemas';
import { 
  isValidDocumentTransition, 
  getDocumentStatusDefinition, 
  getDocumentTransitionBlockReason,
  isDocumentTerminalStatus,
  type DocumentStatus 
} from '@/lib/documentStatusMachine';

export interface DocumentData {
  id: string;
  status: string | null;
  user_id: string;
  file_name: string;
  loan_id?: string | null;
}

export interface DocumentStatusUpdateParams {
  document: DocumentData;
  newStatus: string;
  rejectionReason?: string;
  isSystemTriggered?: boolean;
}

export interface UseDocumentStatusUpdateReturn {
  updateStatus: (params: DocumentStatusUpdateParams) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Unified hook for document status updates
 * Used by agent interface and system auto-transitions
 * Handles: validation, state machine, DB update, notifications, emails
 */
export function useDocumentStatusUpdate(): UseDocumentStatusUpdateReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const { user } = useAuth();

  const clearError = useCallback(() => setError(null), []);

  const updateStatus = useCallback(async ({
    document,
    newStatus,
    rejectionReason = '',
    isSystemTriggered = false,
  }: DocumentStatusUpdateParams): Promise<boolean> => {
    const currentStatus = document.status || 'pending';

    // 1. Check if current status is terminal
    if (isDocumentTerminalStatus(currentStatus)) {
      const errorMsg = 'Un document validé ne peut plus être modifié.';
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    }

    // 2. Validate state machine transition
    if (!isValidDocumentTransition(currentStatus, newStatus)) {
      const reason = getDocumentTransitionBlockReason(currentStatus, newStatus);
      setError(reason);
      toast.error(reason);
      return false;
    }

    // 3. Validate input data with Zod schema
    const validationResult = documentStatusUpdateSchema.safeParse({
      status: newStatus,
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
      const statusDef = getDocumentStatusDefinition(newStatus);
      const statusLabel = statusDef?.label || newStatus;
      const statusDescription = statusDef?.description || '';

      // 4. Update document status in database
      const updateData: Record<string, unknown> = {
        status: newStatus,
      };

      // Set validation metadata for validated status
      if (newStatus === 'validated') {
        updateData.validated_at = new Date().toISOString();
        updateData.validated_by = isSystemTriggered ? null : (user?.id || null);
      } else {
        updateData.validated_at = null;
        updateData.validated_by = null;
      }

      // Set rejection reason for rejected status
      if (newStatus === 'rejected') {
        updateData.rejection_reason = rejectionReason;
      } else {
        updateData.rejection_reason = null;
      }

      const { error: updateError } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', document.id);

      if (updateError) throw updateError;

      // 5. Create in-app notification for client
      let notificationMessage = `Votre document "${document.file_name}" est maintenant: ${statusLabel}. ${statusDescription}`;
      if (newStatus === 'rejected') {
        notificationMessage = `Votre document "${document.file_name}" a été rejeté. Raison: ${rejectionReason}. Veuillez téléverser un nouveau document.`;
      }
      if (newStatus === 'validated') {
        notificationMessage = `Votre document "${document.file_name}" a été validé. ✓`;
      }

      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: document.user_id,
          type: 'document_status',
          category: 'document',
          title: `Document ${statusLabel.toLowerCase()}`,
          message: notificationMessage,
          related_entity: 'documents',
          related_id: document.id,
        });

      if (notifError) {
        logger.warn('Notification creation failed', { error: notifError.message });
      }

      // 6. Send email notification (non-blocking)
      await sendDocumentStatusEmail(document, newStatus, rejectionReason);

      toast.success('Statut du document mis à jour');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      logger.logError('Error updating document status', err);
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
 * Send appropriate email based on document status change
 */
async function sendDocumentStatusEmail(
  document: DocumentData,
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
    const email = clientProfile.email;

    switch (newStatus) {
      case 'validated':
        await emailService.sendDocumentValidated(
          email,
          clientName,
          document.file_name
        );
        break;

      case 'rejected':
        await emailService.sendDocumentRejected(
          email,
          clientName,
          document.file_name,
          rejectionReason
        );
        break;

      case 'under_review':
        await emailService.sendNotification(
          email,
          clientName,
          'Document en cours de vérification 🔍',
          `Votre document "${document.file_name}" est en cours d'examen par notre équipe.`
        );
        break;

      case 'received':
        await emailService.sendNotification(
          email,
          clientName,
          'Document bien reçu 📥',
          `Nous avons bien reçu votre document "${document.file_name}". Il sera examiné prochainement.`
        );
        break;
    }
  } catch (err) {
    logger.logError('Failed to send document status email', err);
    // Don't throw - email failure shouldn't block status update
  }
}
