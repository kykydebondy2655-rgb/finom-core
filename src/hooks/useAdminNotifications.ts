/**
 * Hook to create admin notifications for important events
 */

import { supabase } from '@/integrations/supabase/client';
import logger from '@/lib/logger';

export const useAdminNotifications = () => {
  /**
   * Notify all admins about a new loan application
   */
  const notifyNewLoanApplication = async (
    loanId: string,
    clientName: string,
    amount: number
  ) => {
    try {
      // Get all admin users
      const { data: adminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (rolesError) throw rolesError;

      if (!adminRoles || adminRoles.length === 0) return;

      // Create notification for each admin
      const notifications = adminRoles.map(admin => ({
        user_id: admin.user_id,
        type: 'new_loan',
        category: 'loan',
        title: 'Nouvelle demande de prêt',
        message: `${clientName} a soumis une demande de prêt de ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)}`,
        related_entity: 'loan_applications',
        related_id: loanId,
      }));

      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (insertError) throw insertError;
    } catch (err) {
      logger.logError('Failed to notify admins of new loan', err);
    }
  };

  /**
   * Notify all admins about a new client registration
   */
  const notifyNewClientRegistration = async (
    clientId: string,
    clientName: string,
    email: string
  ) => {
    try {
      const { data: adminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (rolesError) throw rolesError;

      if (!adminRoles || adminRoles.length === 0) return;

      const notifications = adminRoles.map(admin => ({
        user_id: admin.user_id,
        type: 'new_client',
        category: 'client',
        title: 'Nouveau client inscrit',
        message: `${clientName} (${email}) vient de créer un compte`,
        related_entity: 'profiles',
        related_id: clientId,
      }));

      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (insertError) throw insertError;
    } catch (err) {
      logger.logError('Failed to notify admins of new client', err);
    }
  };

  /**
   * Notify admins about new document upload
   */
  const notifyNewDocumentUpload = async (
    documentId: string,
    clientName: string,
    documentName: string,
    loanId?: string
  ) => {
    try {
      const { data: adminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (rolesError) throw rolesError;

      if (!adminRoles || adminRoles.length === 0) return;

      const notifications = adminRoles.map(admin => ({
        user_id: admin.user_id,
        type: 'new_document',
        category: 'document',
        title: 'Nouveau document reçu',
        message: `${clientName} a envoyé le document "${documentName}"`,
        related_entity: 'documents',
        related_id: documentId,
      }));

      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (insertError) throw insertError;
    } catch (err) {
      logger.logError('Failed to notify admins of new document', err);
    }
  };

  return {
    notifyNewLoanApplication,
    notifyNewClientRegistration,
    notifyNewDocumentUpload,
  };
};

export default useAdminNotifications;
