/**
 * Hook to monitor sequestre status and alert when 100% reached
 */

import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { emailService } from '@/services/emailService';
import { logger } from '@/lib/logger';

interface UseSequestreAlertOptions {
  loanId: string;
  userId: string;
  amountExpected: number;
  amountReceived: number;
  sequestreStatus: string;
}

export const useSequestreAlert = ({
  loanId,
  userId,
  amountExpected,
  amountReceived,
  sequestreStatus,
}: UseSequestreAlertOptions) => {
  
  const checkAndAlert = useCallback(async () => {
    // Only alert if we have expected amount and received >= expected
    if (!amountExpected || amountExpected <= 0) return;
    if (amountReceived < amountExpected) return;
    if (sequestreStatus === 'complete') return; // Already marked complete

    try {
      // Update sequestre status to complete
      const { error: updateError } = await supabase
        .from('loan_applications')
        .update({
          sequestre_status: 'complete',
          updated_at: new Date().toISOString(),
        })
        .eq('id', loanId);

      if (updateError) throw updateError;

      // Notify client
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'sequestre_complete',
        category: 'loan',
        title: 'Séquestre complet ✅',
        message: `Le montant du séquestre (${amountReceived.toLocaleString('fr-FR')} €) a été reçu en totalité.`,
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
          type: 'sequestre_complete',
          category: 'loan',
          title: 'Séquestre 100%',
          message: `Dossier #${loanId.slice(0, 8)}: Séquestre complet (${amountReceived.toLocaleString('fr-FR')} €)`,
          related_entity: 'loan_applications',
          related_id: loanId,
        });
      }

      // Notify all admins
      const { data: admins } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (admins?.length) {
        const adminNotifications = admins.map(admin => ({
          user_id: admin.user_id,
          type: 'sequestre_complete',
          category: 'loan',
          title: 'Séquestre 100%',
          message: `Dossier #${loanId.slice(0, 8)}: Séquestre complet (${amountReceived.toLocaleString('fr-FR')} €)`,
          related_entity: 'loan_applications',
          related_id: loanId,
        }));
        await supabase.from('notifications').insert(adminNotifications);
      }

      // Send email to client
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, first_name')
        .eq('id', userId)
        .maybeSingle();

      if (profile?.email) {
        emailService.sendNotification(
          profile.email,
          profile.first_name || 'Client',
          'Séquestre reçu en totalité ✅',
          `Le montant du séquestre (${amountReceived.toLocaleString('fr-FR')} €) pour votre dossier a été reçu. Votre dossier peut avancer vers les prochaines étapes.`
        ).catch(err => logger.logError('Email error', err));
      }

      logger.info('Sequestre complete alert sent', { loanId, amount: amountReceived });
    } catch (err) {
      logger.logError('Error in sequestre alert', err);
    }
  }, [loanId, userId, amountExpected, amountReceived, sequestreStatus]);

  useEffect(() => {
    checkAndAlert();
  }, [checkAndAlert]);
};
