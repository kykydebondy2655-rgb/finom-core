/**
 * Unit Tests for useRealtimeNotifications hook
 */

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
    channel: vi.fn(),
    removeChannel: vi.fn(),
  },
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  default: {
    logError: vi.fn(),
  },
}));

import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

describe('useRealtimeNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default channel mock
    vi.mocked(supabase.channel).mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    } as any);
  });

  it('returns empty notifications when no user is logged in', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      clearMustChangePassword: vi.fn(),
      isAuthenticated: false,
    });

    const { result } = renderHook(() => useRealtimeNotifications());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.loading).toBe(false);
  });

  it('fetches notifications when user is logged in', async () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'client' as const,
    };

    const mockNotifications = [
      { id: '1', title: 'Test', message: 'Hello', read: false, category: 'loan', created_at: new Date().toISOString(), user_id: 'test-user-id', type: 'info' },
      { id: '2', title: 'Test 2', message: 'World', read: true, category: 'document', created_at: new Date().toISOString(), user_id: 'test-user-id', type: 'info' },
    ];

    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      clearMustChangePassword: vi.fn(),
      isAuthenticated: true,
    });

    const mockLimit = vi.fn().mockResolvedValue({
      data: mockNotifications,
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnValue({ limit: mockLimit }),
    } as any);

    const { result } = renderHook(() => useRealtimeNotifications());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(result.current.notifications).toHaveLength(2);
    expect(result.current.unreadCount).toBe(1);
  });

  it('counts unread notifications correctly', async () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'client' as const,
    };

    const mockNotifications = [
      { id: '1', read: false },
      { id: '2', read: false },
      { id: '3', read: true },
      { id: '4', read: false },
    ];

    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      clearMustChangePassword: vi.fn(),
      isAuthenticated: true,
    });

    const mockLimit = vi.fn().mockResolvedValue({
      data: mockNotifications,
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnValue({ limit: mockLimit }),
    } as any);

    const { result } = renderHook(() => useRealtimeNotifications());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(result.current.unreadCount).toBe(3);
  });

  it('handles fetch error gracefully', async () => {
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

    const mockLimit = vi.fn().mockRejectedValue(new Error('Database error'));

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnValue({ limit: mockLimit }),
    } as any);

    const { result } = renderHook(() => useRealtimeNotifications());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(result.current.notifications).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('sets up realtime channel subscription', async () => {
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

    const mockLimit = vi.fn().mockResolvedValue({ data: [], error: null });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnValue({ limit: mockLimit }),
    } as any);

    renderHook(() => useRealtimeNotifications());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(supabase.channel).toHaveBeenCalledWith(`notifications-${mockUser.id}`);
  });

  it('cleans up channel on unmount', async () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'client' as const,
    };

    const mockChannel = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
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

    vi.mocked(supabase.channel).mockReturnValue(mockChannel as any);

    const mockLimit = vi.fn().mockResolvedValue({ data: [], error: null });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnValue({ limit: mockLimit }),
    } as any);

    const { unmount } = renderHook(() => useRealtimeNotifications());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    unmount();

    expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel);
  });

  it('markAsRead performs optimistic update', async () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'client' as const,
    };

    const mockNotifications = [
      { id: 'notif-1', read: false },
    ];

    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      clearMustChangePassword: vi.fn(),
      isAuthenticated: true,
    });

    // Setup initial fetch
    const mockLimit = vi.fn().mockResolvedValue({
      data: mockNotifications,
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnValue({ limit: mockLimit }),
      update: vi.fn().mockReturnThis(),
    } as any);

    const { result } = renderHook(() => useRealtimeNotifications());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(result.current.unreadCount).toBe(1);

    // Setup mark as read
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(supabase.from).mockReturnValue({
      update: vi.fn().mockReturnValue({ eq: mockEq }),
      eq: mockEq,
    } as any);

    await act(async () => {
      await result.current.markAsRead('notif-1');
    });

    expect(result.current.notifications[0].read).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });
});
