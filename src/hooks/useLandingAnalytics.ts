import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsEvent {
  event_type: 'page_view' | 'cta_click' | 'form_submit' | 'scenario_add' | 'chat_open' | 'slider_change';
  event_name: string;
  metadata?: Record<string, unknown>;
}

/**
 * Hook for tracking landing page analytics
 * Stores events in audit_logs table with entity_type 'landing_analytics'
 */
export const useLandingAnalytics = () => {
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const pageViewTrackedRef = useRef(false);

  const trackEvent = useCallback(async ({ event_type, event_name, metadata = {} }: AnalyticsEvent) => {
    try {
      // Store analytics in audit_logs with a special entity_type
      await supabase.from('audit_logs').insert({
        action: event_type,
        entity_type: 'landing_analytics',
        entity_id: sessionIdRef.current,
        user_id: '00000000-0000-0000-0000-000000000000', // Anonymous user placeholder
        metadata: {
          event_name,
          session_id: sessionIdRef.current,
          timestamp: new Date().toISOString(),
          page_url: window.location.href,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
          screen_size: `${window.innerWidth}x${window.innerHeight}`,
          ...metadata,
        },
      });
    } catch (error) {
      // Silently fail for analytics - don't disrupt user experience
      console.debug('Analytics tracking failed:', error);
    }
  }, []);

  // Track page view on mount
  useEffect(() => {
    if (!pageViewTrackedRef.current) {
      pageViewTrackedRef.current = true;
      trackEvent({
        event_type: 'page_view',
        event_name: 'landing_page_view',
        metadata: {
          entry_time: new Date().toISOString(),
        },
      });
    }
  }, [trackEvent]);

  // Track CTA clicks
  const trackCtaClick = useCallback((ctaName: string, additionalData?: Record<string, unknown>) => {
    trackEvent({
      event_type: 'cta_click',
      event_name: ctaName,
      metadata: additionalData,
    });
  }, [trackEvent]);

  // Track form submissions
  const trackFormSubmit = useCallback((formName: string, success: boolean, additionalData?: Record<string, unknown>) => {
    trackEvent({
      event_type: 'form_submit',
      event_name: formName,
      metadata: {
        success,
        ...additionalData,
      },
    });
  }, [trackEvent]);

  // Track scenario additions
  const trackScenarioAdd = useCallback((scenarioCount: number) => {
    trackEvent({
      event_type: 'scenario_add',
      event_name: 'scenario_comparison',
      metadata: {
        total_scenarios: scenarioCount,
      },
    });
  }, [trackEvent]);

  // Track chat interactions
  const trackChatOpen = useCallback(() => {
    trackEvent({
      event_type: 'chat_open',
      event_name: 'chat_widget_opened',
    });
  }, [trackEvent]);

  // Track significant slider changes (debounced tracking)
  const trackSliderChange = useCallback((sliderName: string, value: number) => {
    trackEvent({
      event_type: 'slider_change',
      event_name: `slider_${sliderName}`,
      metadata: {
        value,
      },
    });
  }, [trackEvent]);

  return {
    trackCtaClick,
    trackFormSubmit,
    trackScenarioAdd,
    trackChatOpen,
    trackSliderChange,
    sessionId: sessionIdRef.current,
  };
};

export default useLandingAnalytics;
