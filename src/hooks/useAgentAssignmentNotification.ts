/**
 * Hook to send notification to agent when assigned to a new loan/client
 */

import { supabase } from '@/integrations/supabase/client';
import { emailService } from '@/services/emailService';
import { logger } from '@/lib/logger';

interface NotifyAgentAssignmentParams {
  agentId: string;
  clientId: string;
  clientName: string;
  loanId?: string;
  loanAmount?: number;
}

export const notifyAgentAssignment = async ({
  agentId,
  clientId,
  clientName,
  loanId,
  loanAmount,
}: NotifyAgentAssignmentParams) => {
  try {
    // Create notification
    const message = loanId
      ? `Nouveau dossier assigné: ${clientName} - ${loanAmount?.toLocaleString('fr-FR')} €`
      : `Nouveau client assigné: ${clientName}`;

    await supabase.from('notifications').insert({
      user_id: agentId,
      type: 'assignment',
      category: 'client',
      title: 'Nouvelle assignation',
      message,
      related_entity: loanId ? 'loan_applications' : 'profiles',
      related_id: loanId || clientId,
    });

    // Get agent profile for email
    const { data: agentProfile } = await supabase
      .from('profiles')
      .select('email, first_name')
      .eq('id', agentId)
      .maybeSingle();

    if (agentProfile?.email) {
      emailService.sendNotification(
        agentProfile.email,
        agentProfile.first_name || 'Agent',
        '📋 Nouvelle assignation',
        message
      ).catch(err => logger.logError('Agent notification email error', err));
    }

    logger.info('Agent notified of assignment', { agentId, clientId, loanId });
  } catch (err) {
    logger.logError('Error notifying agent of assignment', err);
  }
};

/**
 * Hook to use in components that handle assignments
 */
export const useAgentAssignmentNotification = () => {
  return { notifyAgentAssignment };
};
