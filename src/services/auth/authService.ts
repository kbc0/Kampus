import { supabase } from '../../lib/supabase';
import { AuthError, AuthErrorCode } from './types';
import { createUserProfile } from './profileService';

export async function signUpUser(email: string, password: string, name: string, university: string) {
  try {
    // Create auth user first
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          name, 
          university,
          subjects: { canHelp: [], needsHelp: [] }
        }
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        throw new AuthError('User already exists', AuthErrorCode.USER_EXISTS);
      }
      if (authError.message.includes('weak password')) {
        throw new AuthError('Password is too weak', AuthErrorCode.WEAK_PASSWORD);
      }
      throw new AuthError(authError.message, authError.status?.toString());
    }

    if (!authData.user) {
      throw new AuthError('No user data returned', AuthErrorCode.NO_USER_DATA);
    }

    try {
      // Create profile with retries
      await createUserProfile(authData.user.id, name, university);
      
      // Sign out after successful registration
      await supabase.auth.signOut();
      
      return authData.user;
    } catch (error) {
      // Clean up auth user if profile creation fails
      await supabase.auth.signOut();
      throw error;
    }
  } catch (error: any) {
    // Handle connection errors
    if (error.message?.includes('fetch failed') || error.message?.includes('refused to connect')) {
      throw new AuthError('Connection failed. Please check your internet connection.', AuthErrorCode.CONNECTION_ERROR);
    }
    
    if (error instanceof AuthError) {
      throw error;
    }
    
    throw new AuthError(error.message, error.code);
  }
}

export async function signInUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new AuthError('Invalid email or password', AuthErrorCode.INVALID_CREDENTIALS);
      }
      throw new AuthError(error.message, error.status?.toString());
    }

    return data.user;
  } catch (error: any) {
    // Handle connection errors
    if (error.message?.includes('fetch failed') || error.message?.includes('refused to connect')) {
      throw new AuthError('Connection failed. Please check your internet connection.', AuthErrorCode.CONNECTION_ERROR);
    }
    throw error;
  }
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new AuthError(error.message, error.status?.toString());
  }
}