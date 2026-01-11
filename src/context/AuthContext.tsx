import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthUser {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: 'client' | 'agent' | 'admin';
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<AuthUser>;
    register: (email: string, password: string, firstName: string, lastName: string) => Promise<AuthUser>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                fetchUserProfile(session.user);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes (keep callback synchronous to avoid deadlocks)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                // Defer any Supabase calls to avoid re-entrancy issues
                setTimeout(() => {
                    fetchUserProfile(session.user);
                }, 0);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserProfile = async (authUser: User) => {
        try {
            // Fetch profile and role in parallel for better performance
            const [profileResult, roleResult] = await Promise.all([
                supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authUser.id)
                    .maybeSingle(),
                supabase
                    .rpc('get_user_role', { _user_id: authUser.id })
            ]);

            const profile = profileResult.data;
            // Use role from user_roles table via RPC function (secure)
            const role = (roleResult.data as 'client' | 'agent' | 'admin') || 'client';

            setUser({
                id: authUser.id,
                email: authUser.email || '',
                firstName: profile?.first_name || undefined,
                lastName: profile?.last_name || undefined,
                role
            });
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
            setUser({
                id: authUser.id,
                email: authUser.email || '',
                role: 'client'
            });
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string): Promise<AuthUser> => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        const authUser = data.user;
        if (!authUser) throw new Error('Login failed');

        // Fetch profile and role to get the complete user
        const [profileResult, roleResult] = await Promise.all([
            supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .maybeSingle(),
            supabase.rpc('get_user_role', { _user_id: authUser.id })
        ]);

        const profile = profileResult.data;
        const role = (roleResult.data as 'client' | 'agent' | 'admin') || 'client';

        const loggedUser: AuthUser = {
            id: authUser.id,
            email: authUser.email || '',
            firstName: profile?.first_name || undefined,
            lastName: profile?.last_name || undefined,
            role
        };

        setUser(loggedUser);
        return loggedUser;
    };

    const register = async (email: string, password: string, firstName: string, lastName: string): Promise<AuthUser> => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName
                },
                emailRedirectTo: `${window.location.origin}/`
            }
        });

        if (error) throw error;

        const authUser = data.user;
        
        // Check if user already exists (Supabase returns user but no session)
        if (!authUser) throw new Error('Échec de l\'inscription');
        
        // If user exists but identities is empty, it means email is already taken
        if (authUser.identities && authUser.identities.length === 0) {
            throw new Error('Cet email est déjà utilisé. Veuillez vous connecter.');
        }

        // New users are always clients
        const registeredUser: AuthUser = {
            id: authUser.id,
            email: authUser.email || '',
            firstName: firstName,
            lastName: lastName,
            role: 'client'
        };

        setUser(registeredUser);
        return registeredUser;
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    const value: AuthContextType = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
