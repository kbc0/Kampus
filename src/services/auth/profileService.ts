import { supabase } from '../../lib/supabase';
import { AuthError, AuthErrorCode } from './types';

export async function createUserProfile(
  userId: string,
  name: string,
  university: string,
  retries = 3
) {
  let attempt = 0;
  let lastError;

  while (attempt < retries) {
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (existingProfile) {
        return; // Profile already exists, no need to create
      }

      // Create new profile
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          name,
          university,
          subjects: { canHelp: [], needsHelp: [] }
        });

      if (!error) {
        return;
      }

      // If error is not duplicate key, don't retry
      if (error.code !== '23505') {
        throw new AuthError('Failed to create user profile', error.code);
      }

      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      lastError = error;
    } catch (error: any) {
      lastError = error;
    }
    attempt++;
  }

  throw new AuthError(
    'Failed to create user profile after retries', 
    lastError?.code || AuthErrorCode.PROFILE_CREATE_FAILED
  );
}