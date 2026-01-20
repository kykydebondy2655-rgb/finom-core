import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission | 'default';
  isSubscribed: boolean;
}

export const usePushNotifications = () => {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: 'default',
    isSubscribed: false,
  });

  useEffect(() => {
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    
    setState(prev => ({
      ...prev,
      isSupported,
      permission: isSupported ? Notification.permission : 'default',
    }));
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      logger.warn('Push notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));
      
      if (permission === 'granted') {
        logger.info('Push notification permission granted');
        return true;
      }
      
      logger.info('Push notification permission denied');
      return false;
    } catch (error) {
      logger.error('Error requesting notification permission:', error);
      return false;
    }
  }, [state.isSupported]);

  const showNotification = useCallback(async (
    title: string,
    options?: NotificationOptions
  ): Promise<boolean> => {
    if (!state.isSupported || state.permission !== 'granted') {
      return false;
    }

    try {
      // Try service worker notification first for better reliability
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        ...options,
      });
      return true;
    } catch {
      // Fallback to regular notification
      try {
        new Notification(title, {
          icon: '/icons/icon-192x192.png',
          ...options,
        });
        return true;
      } catch {
        logger.error('Error showing notification');
        return false;
      }
    }
  }, [state.isSupported, state.permission]);

  // Subscribe to real-time notifications from database
  const subscribeToRealtimeNotifications = useCallback((userId: string) => {
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notification = payload.new as {
            title: string;
            message: string;
            category: string;
          };
          
          if (state.permission === 'granted') {
            showNotification(notification.title, {
              body: notification.message,
              tag: notification.category,
              requireInteraction: notification.category === 'loan' || notification.category === 'document',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [state.permission, showNotification]);

  return {
    ...state,
    requestPermission,
    showNotification,
    subscribeToRealtimeNotifications,
  };
};
