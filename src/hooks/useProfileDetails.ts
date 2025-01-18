import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ProfileDetails } from '../types/profile';
import { toast } from 'react-hot-toast';

export function useProfileDetails(userId: string) {
  const [profile, setProfile] = useState<ProfileDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get basic profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;

        // Get stats
        const { data: statsData, error: statsError } = await supabase
          .from('profile_stats')
          .select('*')
          .eq('profile_id', userId)
          .single();

        if (statsError && statsError.code !== 'PGRST116') throw statsError;

        if (isMounted && profileData) {
          setProfile({
            ...profileData,
            stats: statsData ? {
              topicsCount: statsData.topics_count || 0,
              repliesCount: statsData.replies_count || 0,
              likesGivenCount: statsData.likes_given_count || 0,
              likesReceivedCount: statsData.likes_received_count || 0,
              friendsCount: statsData.friends_count || 0
            } : {
              topicsCount: 0,
              repliesCount: 0,
              likesGivenCount: 0,
              likesReceivedCount: 0,
              friendsCount: 0
            }
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        if (isMounted) {
          setError(error as Error);
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(fetchProfile, 1000 * retryCount);
          } else {
            toast.error('Failed to load profile details');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
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
          if (isMounted) {
            fetchProfile();
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      channel.unsubscribe();
    };
  }, [userId]);

  const updateProfile = async (updates: Partial<ProfileDetails>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;
      
      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      return false;
    }
  };

  return { profile, loading, error, updateProfile };
}