import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInUser, signUpUser, signOutUser } from '../services/auth/authService';
import { AuthError, AuthErrorCode } from '../services/auth/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, university: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Record<string, any>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user || null);
          if (!session?.user) {
            const publicRoutes = ['/', '/login', '/register', '/learn-more'];
            if (!publicRoutes.includes(location.pathname)) {
              navigate('/', { replace: true });
            }
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [navigate, location.pathname]);

  const signIn = async (email: string, password: string) => {
    try {
      await signInUser(email, password);
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      if (error instanceof AuthError) {
        toast.error('Invalid email or password');
      } else {
        toast.error('Failed to sign in. Please try again.');
      }
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string, university: string) => {
    try {
      await signUpUser(email, password, name, university);
      navigate('/login');
      toast.success('Registration successful! Please sign in.');
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.code) {
          case AuthErrorCode.USER_EXISTS:
            toast.error('An account with this email already exists. Please sign in instead.');
            break;
          case AuthErrorCode.WEAK_PASSWORD:
            toast.error('Please choose a stronger password.');
            break;
          case AuthErrorCode.PROFILE_CREATE_FAILED:
            toast.error('Failed to create profile. Please try again.');
            break;
          default:
            toast.error('Registration failed. Please try again.');
        }
      } else {
        toast.error('Registration failed. Please try again.');
      }
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await signOutUser();
      navigate('/', { replace: true });
    } catch (error) {
      toast.error('Failed to sign out');
      throw error;
    }
  };

  const updateProfile = async (updates: Record<string, any>) => {
    if (!user) return;

    try {
      // First update the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Then update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: updates
      });

      if (authError) throw authError;

      // Refresh user data
      const { data: { user: refreshedUser }, error: refreshError } = await supabase.auth.getUser();
      if (refreshError) throw refreshError;
      
      if (refreshedUser) {
        setUser(refreshedUser);
      }

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signUp, 
      signOut,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};