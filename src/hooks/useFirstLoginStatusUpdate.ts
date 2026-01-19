/**
 * Hook and utility to update lead status on first login
 */

import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface UseFirstLoginStatusUpdateOptions {
  userId: string | undefined;
  currentLeadStatus: string | null | undefined;
}

/**
 * Standalone function to update lead status on first login
 * Called from AuthContext
 */
export const updateLeadStatusOnFirstLogin = async (userId: string): Promise<void> => {
  try {
    // Get current profile status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('lead_status')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) throw profileError;

    // Only update if status is 'new'
    if (profile?.lead_status !== 'new') return;

    // Check login count
    const { count, error: countError } = await supabase
      .from('login_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) throw countError;

    // If first login, update status
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
    throw err;
  }
};

/**
 * React hook version for use in components
 */
export const useFirstLoginStatusUpdate = ({
  userId,
  currentLeadStatus,
}: UseFirstLoginStatusUpdateOptions) => {
  
  useEffect(() => {
    if (!userId || currentLeadStatus !== 'new') return;
    
    updateLeadStatusOnFirstLogin(userId).catch(() => {
      // Error already logged in function
    });
  }, [userId, currentLeadStatus]);
};
