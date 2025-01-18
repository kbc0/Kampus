import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  name: string;
  university: string;
  major?: string;
  minor?: string;
  bio?: string;
  avatar_url?: string;
  subjects?: {
    canHelp: string[];
    needsHelp: string[];
  };
  created_at: string;
}

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      navigate('/dashboard');
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            navigate('/dashboard');
            toast.error('User not found');
            return;
          }
          throw error;
        }

        if (!data) {
          navigate('/dashboard');
          toast.error('User not found');
          return;
        }

        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    // Subscribe to profile changes
    const channel = supabase
      .channel(`profile:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        () => {
          fetchProfile();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId, navigate]);

  return { profile, loading };
}