/**
 * Hook to create admin notifications for important events
 */

import { supabase } from '@/integrations/supabase/client';
import { emailService } from '@/services/emailService';
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

  /**
   * Notify admins when an agent modifies a client profile (in-app + email)
   */
  const notifyProfileModifiedByAgent = async (
    clientId: string,
    clientName: string,
    agentName: string,
    changedFields: string[]
  ) => {
    try {
      // Get all admin users with their profiles
      const { data: adminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (rolesError) throw rolesError;
      if (!adminRoles || adminRoles.length === 0) return;

      const adminIds = adminRoles.map(r => r.user_id);

      // Get admin emails
      const { data: adminProfiles } = await supabase
        .from('profiles')
        .select('id, email, first_name')
        .in('id', adminIds);

      const fieldsText = changedFields.length <= 3 
        ? changedFields.join(', ')
        : `${changedFields.slice(0, 3).join(', ')} (+${changedFields.length - 3})`;

      // Create in-app notifications
      const notifications = adminRoles.map(admin => ({
        user_id: admin.user_id,
        type: 'profile_modified',
        category: 'client',
        title: 'Modification de profil client',
        message: `L'agent ${agentName} a modifié le profil de ${clientName}: ${fieldsText}`,
        related_entity: 'profiles',
        related_id: clientId,
      }));

      await supabase.from('notifications').insert(notifications);

      // Send email notifications to admins
      if (adminProfiles && adminProfiles.length > 0) {
        for (const admin of adminProfiles) {
          if (admin.email) {
            await emailService.sendNotification(
              admin.email,
              admin.first_name || 'Administrateur',
              '🔔 Modification de profil client par un agent',
              `L'agent ${agentName} a modifié le profil du client ${clientName}.\n\nChamps modifiés: ${changedFields.join(', ')}\n\nConnectez-vous pour consulter les détails de la modification.`,
              'Voir le profil client',
              `https://pret-finom.co/admin/clients/${clientId}`
            );
          }
        }
      }
    } catch (err) {
      logger.logError('Failed to notify admins of profile modification', err);
    }
  };

  return {
    notifyNewLoanApplication,
    notifyNewClientRegistration,
    notifyNewDocumentUpload,
    notifyProfileModifiedByAgent,
  };
};

export default useAdminNotifications;
