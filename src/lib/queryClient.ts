/**
 * React Query Configuration
 * Centralized QueryClient with optimized cache settings
 */

import { QueryClient } from '@tanstack/react-query';

// Cache durations in milliseconds
export const CACHE_TIME = {
  /** Short-lived data (1 minute) - user notifications, real-time data */
  SHORT: 1 * 60 * 1000,
  /** Medium-lived data (5 minutes) - lists that change occasionally */
  MEDIUM: 5 * 60 * 1000,
  /** Long-lived data (15 minutes) - reference data, settings */
  LONG: 15 * 60 * 1000,
  /** Very long-lived data (1 hour) - static reference data */
  STATIC: 60 * 60 * 1000,
} as const;

// Stale times - when data is considered fresh
export const STALE_TIME = {
  /** Immediately stale - always refetch on mount */
  NONE: 0,
  /** Fresh for 30 seconds */
  SHORT: 30 * 1000,
  /** Fresh for 2 minutes */
  MEDIUM: 2 * 60 * 1000,
  /** Fresh for 10 minutes */
  LONG: 10 * 60 * 1000,
} as const;

// Query keys for consistent cache management
export const QUERY_KEYS = {
  // Admin queries
  admin: {
    clients: ['admin', 'clients'] as const,
    agents: ['admin', 'agents'] as const,
    loans: ['admin', 'loans'] as const,
    assignments: ['admin', 'assignments'] as const,
    imports: ['admin', 'imports'] as const,
    stats: ['admin', 'stats'] as const,
  },
  // Agent queries
  agent: {
    clients: (agentId: string) => ['agent', 'clients', agentId] as const,
    callbacks: (agentId: string) => ['agent', 'callbacks', agentId] as const,
    callLogs: (agentId: string) => ['agent', 'callLogs', agentId] as const,
  },
  // Client queries
  client: {
    loans: (userId: string) => ['client', 'loans', userId] as const,
    documents: (userId: string) => ['client', 'documents', userId] as const,
    profile: (userId: string) => ['client', 'profile', userId] as const,
    notifications: (userId: string) => ['client', 'notifications', userId] as const,
  },
  // Shared queries
  loan: (loanId: string) => ['loan', loanId] as const,
  document: (documentId: string) => ['document', documentId] as const,
} as const;

/**
 * Create and configure the QueryClient
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default stale time - data considered fresh for 2 minutes
      staleTime: STALE_TIME.MEDIUM,
      // Keep unused data in cache for 5 minutes
      gcTime: CACHE_TIME.MEDIUM,
      // Retry failed queries up to 2 times
      retry: 2,
      // Don't refetch on window focus in development
      refetchOnWindowFocus: process.env.NODE_ENV === 'production',
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
});

export default queryClient;
