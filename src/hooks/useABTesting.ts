import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * A/B Testing Configuration
 * Define your experiments and variants here
 */
export interface ABExperiment {
  id: string;
  name: string;
  description: string;
  variants: ABVariant[];
  isActive: boolean;
}

export interface ABVariant {
  id: string;
  name: string;
  weight: number; // Percentage weight (all variants should sum to 100)
}

// Available experiments configuration
export const AB_EXPERIMENTS: Record<string, ABExperiment> = {
  landing_hero: {
    id: 'landing_hero',
    name: 'Hero Section Style',
    description: 'Test different hero section designs',
    isActive: true,
    variants: [
      { id: 'control', name: 'Original', weight: 50 },
      { id: 'variant_a', name: 'Minimal', weight: 25 },
      { id: 'variant_b', name: 'Bold CTA', weight: 25 },
    ],
  },
  landing_cta: {
    id: 'landing_cta',
    name: 'CTA Button Style',
    description: 'Test different CTA button text and colors',
    isActive: true,
    variants: [
      { id: 'control', name: 'Être recontacté', weight: 33 },
      { id: 'variant_a', name: 'Demander mon étude gratuite', weight: 33 },
      { id: 'variant_b', name: 'Parler à un conseiller', weight: 34 },
    ],
  },
  landing_social_proof: {
    id: 'landing_social_proof',
    name: 'Social Proof Section',
    description: 'Test showing vs hiding social proof elements',
    isActive: true,
    variants: [
      { id: 'control', name: 'With testimonials', weight: 50 },
      { id: 'variant_a', name: 'With stats only', weight: 50 },
    ],
  },
};

interface ABAssignment {
  experimentId: string;
  variantId: string;
  assignedAt: string;
}

interface UseABTestingReturn {
  getVariant: (experimentId: string) => string;
  trackConversion: (experimentId: string, conversionType: string, metadata?: Record<string, unknown>) => Promise<void>;
  isLoading: boolean;
  assignments: Record<string, string>;
  sessionId: string;
}

/**
 * Hook for A/B testing functionality
 * Assigns users to variants and tracks conversions
 */
export const useABTesting = (): UseABTestingReturn => {
  const sessionIdRef = useRef<string>('');
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const initRef = useRef(false);

  // Generate or retrieve session ID
  useEffect(() => {
    let sessionId = sessionStorage.getItem('ab_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('ab_session_id', sessionId);
    }
    sessionIdRef.current = sessionId;
  }, []);

  // Load existing assignments or create new ones
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const loadAssignments = () => {
      const stored = localStorage.getItem('ab_assignments');
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as ABAssignment[];
          const assignmentMap: Record<string, string> = {};
          parsed.forEach((a) => {
            // Only use if experiment is still active
            if (AB_EXPERIMENTS[a.experimentId]?.isActive) {
              assignmentMap[a.experimentId] = a.variantId;
            }
          });
          setAssignments(assignmentMap);
        } catch {
          // Invalid stored data, will create new assignments
        }
      }
      setIsLoading(false);
    };

    loadAssignments();
  }, []);

  // Select a variant based on weights
  const selectVariant = useCallback((experiment: ABExperiment): string => {
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const variant of experiment.variants) {
      cumulative += variant.weight;
      if (random <= cumulative) {
        return variant.id;
      }
    }

    // Fallback to control
    return experiment.variants[0]?.id || 'control';
  }, []);

  // Get variant for an experiment (assigns if not already assigned)
  const getVariant = useCallback(
    (experimentId: string): string => {
      const experiment = AB_EXPERIMENTS[experimentId];
      if (!experiment || !experiment.isActive) {
        return 'control';
      }

      // Return existing assignment
      if (assignments[experimentId]) {
        return assignments[experimentId];
      }

      // Create new assignment
      const variantId = selectVariant(experiment);
      const newAssignments = { ...assignments, [experimentId]: variantId };
      setAssignments(newAssignments);

      // Store in localStorage
      const stored: ABAssignment[] = Object.entries(newAssignments).map(([expId, varId]) => ({
        experimentId: expId,
        variantId: varId,
        assignedAt: new Date().toISOString(),
      }));
      localStorage.setItem('ab_assignments', JSON.stringify(stored));

      // Track assignment event
      trackAssignment(experimentId, variantId);

      return variantId;
    },
    [assignments, selectVariant]
  );

  // Track variant assignment
  const trackAssignment = async (experimentId: string, variantId: string) => {
    try {
      await supabase.from('audit_logs').insert({
        action: 'ab_assignment',
        entity_type: 'ab_testing',
        entity_id: sessionIdRef.current || crypto.randomUUID(),
        user_id: '00000000-0000-0000-0000-000000000000',
        metadata: {
          experiment_id: experimentId,
          experiment_name: AB_EXPERIMENTS[experimentId]?.name,
          variant_id: variantId,
          variant_name: AB_EXPERIMENTS[experimentId]?.variants.find((v) => v.id === variantId)?.name,
          session_id: sessionIdRef.current,
          timestamp: new Date().toISOString(),
          page_url: window.location.href,
          user_agent: navigator.userAgent,
        },
      });
    } catch (error) {
      console.debug('A/B assignment tracking failed:', error);
    }
  };

  // Track conversion for an experiment
  const trackConversion = useCallback(
    async (experimentId: string, conversionType: string, metadata: Record<string, unknown> = {}) => {
      const variantId = assignments[experimentId];
      if (!variantId) return;

      try {
        await supabase.from('audit_logs').insert({
          action: 'ab_conversion',
          entity_type: 'ab_testing',
          entity_id: sessionIdRef.current || crypto.randomUUID(),
          user_id: '00000000-0000-0000-0000-000000000000',
          metadata: {
            experiment_id: experimentId,
            experiment_name: AB_EXPERIMENTS[experimentId]?.name,
            variant_id: variantId,
            variant_name: AB_EXPERIMENTS[experimentId]?.variants.find((v) => v.id === variantId)?.name,
            conversion_type: conversionType,
            session_id: sessionIdRef.current,
            timestamp: new Date().toISOString(),
            ...metadata,
          },
        });
      } catch (error) {
        console.debug('A/B conversion tracking failed:', error);
      }
    },
    [assignments]
  );

  return {
    getVariant,
    trackConversion,
    isLoading,
    assignments,
    sessionId: sessionIdRef.current,
  };
};

export default useABTesting;
