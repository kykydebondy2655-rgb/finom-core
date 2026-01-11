/**
 * Hook pour vérifier les rôles utilisateur via la table user_roles sécurisée
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

type AppRole = 'client' | 'agent' | 'admin';

interface UseUserRolesReturn {
  roles: AppRole[];
  primaryRole: AppRole | null;
  hasRole: (role: AppRole) => boolean;
  isAdmin: boolean;
  isAgent: boolean;
  isClient: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUserRoles = (): UseUserRolesReturn => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    if (!user?.id) {
      setRoles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch roles from the secure user_roles table
      const { data, error: fetchError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (fetchError) {
        console.error('Error fetching user roles:', fetchError);
        setError(fetchError.message);
        // Fallback to profile role for backward compatibility
        setRoles([user.role as AppRole || 'client']);
        return;
      }

      if (data && data.length > 0) {
        // Type assertion since we know the shape
        const fetchedRoles = data.map(r => (r as { role: string }).role as AppRole);
        setRoles(fetchedRoles);
      } else {
        // Fallback to profile role
        setRoles([user.role as AppRole || 'client']);
      }
    } catch (err) {
      console.error('Error in useUserRoles:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setRoles([user.role as AppRole || 'client']);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.role]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const hasRole = useCallback((role: AppRole): boolean => {
    return roles.includes(role);
  }, [roles]);

  const getPrimaryRole = useCallback((): AppRole | null => {
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('agent')) return 'agent';
    if (roles.includes('client')) return 'client';
    return null;
  }, [roles]);

  return {
    roles,
    primaryRole: getPrimaryRole(),
    hasRole,
    isAdmin: hasRole('admin'),
    isAgent: hasRole('agent'),
    isClient: hasRole('client'),
    loading,
    error,
    refetch: fetchRoles,
  };
};

export default useUserRoles;
