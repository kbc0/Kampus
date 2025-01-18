import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface OtherUser {
  id: string;
  name: string;
  university: string;
  avatar_url?: string;
}

export function useConversation(conversationId?: string) {
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!conversationId || !user) {
      setOtherUser(null);
      setLoading(false);
      return;
    }

    const fetchConversation = async () => {
      try {
        // First check if users are friends
        const { data: participants, error: participantsError } = await supabase
          .rpc('get_conversation_participants', { 
            conversation_id_param: conversationId 
          });

        if (participantsError) throw participantsError;

        const otherParticipant = participants?.find(p => p.profile_id !== user.id);
        if (otherParticipant) {
          setOtherUser({
            id: otherParticipant.profile_id,
            name: otherParticipant.name,
            university: otherParticipant.university,
            avatar_url: otherParticipant.avatar_url
          });
        }
      } catch (error) {
        console.error('Error fetching conversation:', error);
        toast.error('Failed to load conversation details');
        setOtherUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [conversationId, user]);

  return { otherUser, loading };
}