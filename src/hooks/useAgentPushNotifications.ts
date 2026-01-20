/**
 * Hook for agent-specific push notifications
 * Subscribes to real-time events for assigned clients
 */

import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePushNotifications } from './usePushNotifications';
import { logger } from '@/lib/logger';

interface AgentPushNotificationsOptions {
  agentId: string;
  assignedClientIds: string[];
  enabled?: boolean;
}

interface ClientActivity {
  type: 'document' | 'loan_status' | 'client_status' | 'message' | 'login';
  clientId: string;
  clientName?: string;
  details: string;
}

export const useAgentPushNotifications = ({
  agentId,
  assignedClientIds,
  enabled = true,
}: AgentPushNotificationsOptions) => {
  const { isSupported, permission, requestPermission, showNotification } = usePushNotifications();
  const channelsRef = useRef<ReturnType<typeof supabase.channel>[]>([]);
  const clientNamesRef = useRef<Record<string, string>>({});

  // Fetch client names for better notifications
  const fetchClientNames = useCallback(async () => {
    if (assignedClientIds.length === 0) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', assignedClientIds);

      if (error) throw error;

      const names: Record<string, string> = {};
      data?.forEach((client) => {
        names[client.id] = `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Client';
      });
      clientNamesRef.current = names;
    } catch (err) {
      logger.logError('Error fetching client names for notifications', err);
    }
  }, [assignedClientIds]);

  // Get client name from cache
  const getClientName = useCallback((clientId: string) => {
    return clientNamesRef.current[clientId] || 'Un client';
  }, []);

  // Show activity notification
  const notifyActivity = useCallback(
    async (activity: ClientActivity) => {
      if (permission !== 'granted') return;

      const clientName = activity.clientName || getClientName(activity.clientId);
      
      let title = '';
      let body = activity.details;
      let tag = activity.type;

      switch (activity.type) {
        case 'document':
          title = '📄 Nouveau document';
          break;
        case 'loan_status':
          title = '💰 Mise à jour dossier';
          break;
        case 'client_status':
          title = '👤 Changement statut client';
          break;
        case 'message':
          title = '💬 Nouveau message';
          break;
        case 'login':
          title = '🔐 Connexion client';
          break;
        default:
          title = '🔔 Nouvelle activité';
      }

      body = `${clientName}: ${activity.details}`;

      await showNotification(title, {
        body,
        tag,
        data: { clientId: activity.clientId, type: activity.type },
        requireInteraction: activity.type === 'document' || activity.type === 'loan_status',
      });
    },
    [permission, getClientName, showNotification]
  );

  // Subscribe to client activities
  useEffect(() => {
    if (!enabled || !agentId || assignedClientIds.length === 0) return;

    fetchClientNames();

    // Clean up previous channels
    channelsRef.current.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    channelsRef.current = [];

    // Create filter for assigned clients
    const clientFilter = `user_id=in.(${assignedClientIds.join(',')})`;

    // Subscribe to new documents
    const documentsChannel = supabase
      .channel(`agent-${agentId}-documents`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'documents',
          filter: clientFilter,
        },
        (payload) => {
          const doc = payload.new as { user_id: string; file_name: string; category?: string };
          notifyActivity({
            type: 'document',
            clientId: doc.user_id,
            details: `A uploadé: ${doc.category || doc.file_name}`,
          });
        }
      )
      .subscribe();

    channelsRef.current.push(documentsChannel);

    // Subscribe to loan status changes
    const loanStatusChannel = supabase
      .channel(`agent-${agentId}-loan-status`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'loan_status_history',
        },
        async (payload) => {
          const history = payload.new as { loan_id: string; new_status: string; changed_by?: string };
          
          // Check if this loan belongs to one of our clients
          const { data: loan } = await supabase
            .from('loan_applications')
            .select('user_id')
            .eq('id', history.loan_id)
            .single();

          if (loan && assignedClientIds.includes(loan.user_id)) {
            // Don't notify if agent made the change themselves
            if (history.changed_by !== agentId) {
              notifyActivity({
                type: 'loan_status',
                clientId: loan.user_id,
                details: `Dossier passé en: ${history.new_status}`,
              });
            }
          }
        }
      )
      .subscribe();

    channelsRef.current.push(loanStatusChannel);

    // Subscribe to client status changes (not made by this agent)
    const clientStatusChannel = supabase
      .channel(`agent-${agentId}-client-status`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'client_status_history',
          filter: `client_id=in.(${assignedClientIds.join(',')})`,
        },
        (payload) => {
          const history = payload.new as { 
            client_id: string; 
            new_status: string; 
            changed_by?: string;
          };
          
          // Don't notify if agent made the change themselves
          if (history.changed_by !== agentId) {
            notifyActivity({
              type: 'client_status',
              clientId: history.client_id,
              details: `Statut changé: ${history.new_status}`,
            });
          }
        }
      )
      .subscribe();

    channelsRef.current.push(clientStatusChannel);

    // Subscribe to messages to agent
    const messagesChannel = supabase
      .channel(`agent-${agentId}-messages`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `to_user_id=eq.${agentId}`,
        },
        (payload) => {
          const message = payload.new as { from_user_id: string; message: string };
          
          if (assignedClientIds.includes(message.from_user_id)) {
            notifyActivity({
              type: 'message',
              clientId: message.from_user_id,
              details: message.message.substring(0, 50) + (message.message.length > 50 ? '...' : ''),
            });
          }
        }
      )
      .subscribe();

    channelsRef.current.push(messagesChannel);

    // Subscribe to login history for clients
    const loginChannel = supabase
      .channel(`agent-${agentId}-logins`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'login_history',
          filter: `user_id=in.(${assignedClientIds.join(',')})`,
        },
        (payload) => {
          const login = payload.new as { user_id: string; device_type?: string };
          notifyActivity({
            type: 'login',
            clientId: login.user_id,
            details: `Connexion depuis ${login.device_type || 'appareil inconnu'}`,
          });
        }
      )
      .subscribe();

    channelsRef.current.push(loginChannel);

    logger.info('Agent push notifications subscribed', { agentId, clientCount: assignedClientIds.length });

    // Cleanup
    return () => {
      channelsRef.current.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
    };
  }, [enabled, agentId, assignedClientIds, fetchClientNames, notifyActivity]);

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
  };
};

export default useAgentPushNotifications;
