import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { emailService } from '@/services/emailService';
import logger from '@/lib/logger';
import { detectDevice, getClientIP } from '@/lib/deviceDetector';

export interface AuthUser {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    role: 'client' | 'agent' | 'admin';
    mustChangePassword?: boolean;
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<AuthUser>;
    register: (email: string, password: string, firstName: string, lastName: string) => Promise<AuthUser>;
    logout: () => Promise<void>;
    clearMustChangePassword: () => void;
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
                phone: profile?.phone || undefined,
                address: profile?.address || undefined,
                role,
                mustChangePassword: profile?.must_change_password || false
            });
        } catch (error) {
            logger.logError('Failed to fetch user profile', error);
            setUser({
                id: authUser.id,
                email: authUser.email || '',
                role: 'client',
                mustChangePassword: false
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
            phone: profile?.phone || undefined,
            address: profile?.address || undefined,
            role,
            mustChangePassword: profile?.must_change_password || false
        };

        setUser(loggedUser);

        // Log the login (non-blocking)
        logLoginHistory(loggedUser).catch(err => 
            logger.logError('Failed to log login history', err)
        );

        return loggedUser;
    };

    const logLoginHistory = async (loggedUser: AuthUser) => {
        try {
            const deviceInfo = detectDevice();
            const ipAddress = await getClientIP();

            await supabase.from('login_history').insert({
                user_id: loggedUser.id,
                email: loggedUser.email,
                user_role: loggedUser.role,
                first_name: loggedUser.firstName || null,
                last_name: loggedUser.lastName || null,
                ip_address: ipAddress,
                user_agent: deviceInfo.userAgent,
                device_type: deviceInfo.deviceType,
                browser: deviceInfo.browser,
                os: deviceInfo.os
            });
        } catch (err) {
            logger.logError('Login history insert failed', err);
        }
    };

    const clearMustChangePassword = () => {
        if (user) {
            setUser({ ...user, mustChangePassword: false });
        }
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

        // Send welcome email (non-blocking)
        emailService.sendWelcome(email, firstName).catch(err => 
            logger.logError('Failed to send welcome email', err)
        );

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
        clearMustChangePassword,
        isAuthenticated: !!user
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
