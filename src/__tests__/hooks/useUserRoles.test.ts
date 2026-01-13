import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';

// Mock the auth context
vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useUserRoles } from '@/hooks/useUserRoles';

describe('useUserRoles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty roles when no user is logged in', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      clearMustChangePassword: vi.fn(),
      isAuthenticated: false,
    });

    const { result } = renderHook(() => useUserRoles());

    // Wait for the hook to complete loading
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.roles).toEqual([]);
    expect(result.current.primaryRole).toBe(null);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isAgent).toBe(false);
    expect(result.current.isClient).toBe(false);
  });

  it('fetches roles from user_roles table when user is logged in', async () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'client' as const,
    };

    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      clearMustChangePassword: vi.fn(),
      isAuthenticated: true,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [{ role: 'client' }],
        error: null,
      }),
    } as any);

    const { result } = renderHook(() => useUserRoles());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(result.current.roles).toContain('client');
    expect(result.current.isClient).toBe(true);
  });

  it('correctly identifies admin role as primary', async () => {
    const mockUser = {
      id: 'admin-user-id',
      email: 'admin@example.com',
      role: 'admin' as const,
    };

    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      clearMustChangePassword: vi.fn(),
      isAuthenticated: true,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [{ role: 'admin' }, { role: 'agent' }],
        error: null,
      }),
    } as any);

    const { result } = renderHook(() => useUserRoles());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(result.current.primaryRole).toBe('admin');
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isAgent).toBe(true);
  });

  it('falls back to profile role when fetch fails', async () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'agent' as const,
    };

    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      clearMustChangePassword: vi.fn(),
      isAuthenticated: true,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      }),
    } as any);

    const { result } = renderHook(() => useUserRoles());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(result.current.roles).toContain('agent');
    expect(result.current.error).toBe('Database error');
  });

  it('hasRole function works correctly', async () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'client' as const,
    };

    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      clearMustChangePassword: vi.fn(),
      isAuthenticated: true,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [{ role: 'client' }, { role: 'agent' }],
        error: null,
      }),
    } as any);

    const { result } = renderHook(() => useUserRoles());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(result.current.hasRole('client')).toBe(true);
    expect(result.current.hasRole('agent')).toBe(true);
    expect(result.current.hasRole('admin')).toBe(false);
  });
});
