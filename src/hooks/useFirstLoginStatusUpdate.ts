/**
 * Hook to update lead status on first login
 */

import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface UseFirstLoginStatusUpdateOptions {
  userId: string | undefined;
  currentLeadStatus: string | null | undefined;
}

export const useFirstLoginStatusUpdate = ({
  userId,
  currentLeadStatus,
}: UseFirstLoginStatusUpdateOptions) => {
  
  useEffect(() => {
    const updateStatusOnFirstLogin = async () => {
      if (!userId) return;
      
      // Only update if status is 'new' (never logged in before)
      if (currentLeadStatus !== 'new') return;

      try {
        // Check if this is the first login by counting login history
        const { count, error: countError } = await supabase
          .from('login_history')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        if (countError) throw countError;

        // If this is first or second login (current session counts), update status
        if (count !== null && count <= 2) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              lead_status: 'contacted',
              pipeline_stage: 'interesse',
            })
            .eq('id', userId);

          if (updateError) throw updateError;

          // Log status change
          await supabase.from('client_status_history').insert({
            client_id: userId,
            old_status: 'new',
            new_status: 'interesse',
            notes: 'Première connexion du client',
          });

          logger.info('Lead status updated on first login', { userId });
        }
      } catch (err) {
        logger.logError('Error updating lead status on first login', err);
      }
    };

    updateStatusOnFirstLogin();
  }, [userId, currentLeadStatus]);
};
