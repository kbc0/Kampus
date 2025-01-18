import { toast } from 'react-hot-toast';

interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  backoff?: boolean;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delayMs = 1000,
    backoff = true
  } = options;

  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry if it's an auth error or validation error
      if (error?.status === 401 || error?.status === 422) {
        throw error;
      }

      // Only show error toast on final attempt
      if (attempt === maxRetries - 1) {
        console.error('Supabase operation failed:', error);
        toast.error('Connection error. Please check your internet connection and try again.');
        throw error;
      }

      // Wait before retrying, with exponential backoff if enabled
      const delay = backoff ? delayMs * Math.pow(2, attempt) : delayMs;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

export function handleSupabaseError(error: any) {
  console.error('Supabase error:', error);
  
  if (error?.status === 401) {
    toast.error('Please sign in to continue');
    return;
  }

  if (error?.status === 403) {
    toast.error('You don\'t have permission to perform this action');
    return;
  }

  if (error?.status === 404) {
    toast.error('The requested resource was not found');
    return;
  }

  if (error?.status === 409) {
    toast.error('This action conflicts with existing data');
    return;
  }

  toast.error('An error occurred. Please try again later.');
}