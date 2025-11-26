'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from './api';

// User interface
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Session {
  user: User;
  access_token: string;
}

interface AuthError {
  message: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage token
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (token) {
        // Try to get user profile to verify token
        apiClient.getMe().then(response => {
          if (response.success && response.data) {
            const userData = response.data as any;
            const user: User = {
              id: userData.id || userData._id,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              createdAt: userData.createdAt
            };
            setUser(user);
            setSession({ user, access_token: token });
          } else {
            // Token invalid, clear it
            localStorage.removeItem('token');
            setUser(null);
            setSession(null);
          }
        }).catch(() => {
          localStorage.removeItem('token');
          setUser(null);
          setSession(null);
        }).finally(() => {
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.login({ email, password });
      if (response.success && response.data) {
        const data = response.data as { user: any; token: string };
        const { user: userData, token } = data;
        const user: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          createdAt: userData.createdAt
        };
        localStorage.setItem('token', token);
        setUser(user);
        setSession({ user, access_token: token });
        return { error: null };
      } else {
        return { error: { message: response.error || 'Login failed' } };
      }
    } catch (error: any) {
      return { error: { message: error.message || 'Login failed' } };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const response = await apiClient.register({ name, email, password });
      if (response.success && response.data) {
        const data = response.data as { user: any; token: string };
        const { user: userData, token } = data;
        const user: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          createdAt: userData.createdAt
        };
        localStorage.setItem('token', token);
        setUser(user);
        setSession({ user, access_token: token });
        return { error: null };
      } else {
        return { error: { message: response.error || 'Registration failed' } };
      }
    } catch (error: any) {
      return { error: { message: error.message || 'Registration failed' } };
    }
  };

  const signOut = async () => {
    try {
      // Call logout API if needed
      localStorage.removeItem('token');
      setUser(null);
      setSession(null);
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Logout failed' } };
    }
  };

  const resetPassword = async (email: string) => {
    // Mock password reset - always succeeds
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    console.log('Password reset requested for:', email);
    return { error: null };
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
