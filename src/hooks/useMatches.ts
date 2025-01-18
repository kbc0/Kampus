import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface Match {
  id: string;
  name: string;
  university: string;
  major?: string;
  minor?: string;
  avatar_url?: string;
  matchingSubjects: string[];
}

export function useMatches(type: 'canHelp' | 'needsHelp', subjects: string[]) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const fetchMatches = async () => {
      if (!user?.id || !subjects.length) {
        if (isMounted) {
          setMatches([]);
          setLoading(false);
        }
        return;
      }
      
      try {
        setLoading(true);
        setError(null);

        // First get banned user IDs
        const { data: bannedUsers } = await supabase
          .from('user_bans')
          .select('user_id')
          .is('lifted_at', null);

        const bannedUserIds = bannedUsers?.map(ban => ban.user_id) || [];

        // Then get profiles excluding banned users
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, university, major, minor, avatar_url, subjects')
          .neq('id', user.id)
          .not('id', 'in', `(${bannedUserIds.join(',')})`);

        if (profilesError) throw profilesError;

        if (isMounted) {
          const matchedProfiles = profiles
            .filter(profile => {
              const profileSubjects = profile.subjects?.[type === 'canHelp' ? 'needsHelp' : 'canHelp'] || [];
              return subjects.some(subject => profileSubjects.includes(subject));
            })
            .map(profile => ({
              id: profile.id,
              name: profile.name,
              university: profile.university,
              major: profile.major,
              minor: profile.minor,
              avatar_url: profile.avatar_url,
              matchingSubjects: subjects.filter(subject => 
                profile.subjects?.[type === 'canHelp' ? 'needsHelp' : 'canHelp']?.includes(subject)
              )
            }));

          setMatches(matchedProfiles);
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
        if (isMounted) {
          setError(error as Error);
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(fetchMatches, 1000 * retryCount);
          } else {
            toast.error('Failed to load matches');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMatches();

    // Subscribe to profile changes
    const channel = supabase
      .channel('profiles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          if (isMounted) {
            fetchMatches();
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      channel.unsubscribe();
    };
  }, [type, subjects, user?.id]);

  return { matches, loading, error };
}