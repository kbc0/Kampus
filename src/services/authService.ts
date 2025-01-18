import { supabase } from '../lib/supabase';

export async function signUpUser(email: string, password: string, name: string, university: string) {
  try {
    // First check if user exists in auth
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers({
      filters: {
        email: email
      }
    });

    if (usersError) throw usersError;
    if (users && users.length > 0) {
      throw new Error('USER_EXISTS');
    }

    // Create auth user
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
        throw new Error('USER_EXISTS');
      }
      throw authError;
    }

    if (!authData.user) {
      throw new Error('NO_USER_DATA');
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        name,
        university,
        subjects: { canHelp: [], needsHelp: [] }
      });

    if (profileError) {
      // If profile creation fails, clean up auth user
      await supabase.auth.signOut();
      throw profileError;
    }

    return authData.user;
  } catch (error: any) {
    // Clean up on any error
    await supabase.auth.signOut();
    throw error;
  }
}

export async function signInUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw error;
  }

  return data.user;
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}