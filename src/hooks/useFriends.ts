import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Friend, FriendRequest } from '../types/friends';
import { toast } from 'react-hot-toast';
import { sendFriendRequest, respondToFriendRequest, removeFriendship } from '../services/friendshipService';

export function useFriends(profileId?: string) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchFriends = useCallback(async () => {
    if (!profileId) return;

    try {
      const { data: publicFriends, error } = await supabase
        .from('friendships')
        .select(`
          id,
          sender:profiles!friendships_sender_id_fkey (
            id,
            name,
            university,
            avatar_url
          ),
          receiver:profiles!friendships_receiver_id_fkey (
            id,
            name,
            university,
            avatar_url
          )
        `)
        .eq('status', 'accepted')
        .or(`sender_id.eq.${profileId},receiver_id.eq.${profileId}`);

      if (error) throw error;

      const formattedFriends = (publicFriends || []).map(f => {
        const isSender = f.sender.id === profileId;
        const friend = isSender ? f.receiver : f.sender;
        return {
          id: friend.id,
          name: friend.name,
          university: friend.university,
          avatar_url: friend.avatar_url,
          friendship_id: f.id
        };
      });

      setFriends(formattedFriends);
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast.error('Failed to load friends');
    }
  }, [profileId]);

  const fetchRequests = useCallback(async () => {
    if (!user) return;

    try {
      const [receivedData, sentData] = await Promise.all([
        supabase
          .from('friendships')
          .select(`
            *,
            sender:profiles!friendships_sender_id_fkey(name, university, avatar_url),
            receiver:profiles!friendships_receiver_id_fkey(name, university, avatar_url)
          `)
          .eq('receiver_id', user.id)
          .eq('status', 'pending'),
        supabase
          .from('friendships')
          .select(`
            *,
            sender:profiles!friendships_sender_id_fkey(name, university, avatar_url),
            receiver:profiles!friendships_receiver_id_fkey(name, university, avatar_url)
          `)
          .eq('sender_id', user.id)
          .eq('status', 'pending')
      ]);

      if (receivedData.error) throw receivedData.error;
      if (sentData.error) throw sentData.error;

      setPendingRequests(receivedData.data || []);
      setSentRequests(sentData.data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load friend requests');
    }
  }, [user]);

  const handleSendFriendRequest = async (receiverId: string, message?: string) => {
    if (!user) return;

    try {
      await sendFriendRequest(user.id, receiverId, message);
      await fetchRequests();
    } catch (error: any) {
      if (error?.code === '23505') {
        toast.error('A friend request already exists');
      } else {
        toast.error('Failed to send friend request');
      }
      throw error;
    }
  };

  const handleRespondToRequest = async (requestId: string, accept: boolean) => {
    try {
      await respondToFriendRequest(requestId, accept);
      await Promise.all([fetchFriends(), fetchRequests()]);
    } catch (error) {
      console.error('Error responding to friend request:', error);
      toast.error('Failed to respond to friend request');
      throw error;
    }
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    try {
      await removeFriendship(friendshipId);
      setFriends(prev => prev.filter(friend => friend.friendship_id !== friendshipId));
      toast.success('Friend removed successfully');
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Failed to remove friend');
      throw error;
    }
  };

  useEffect(() => {
    if (!profileId) {
      setFriends([]);
      setPendingRequests([]);
      setSentRequests([]);
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchFriends(), user && fetchRequests()]);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Subscribe to friendship changes
    const channel = supabase
      .channel(`friendships:${profileId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `sender_id=eq.${profileId} OR receiver_id=eq.${profileId}`
        },
        async (payload) => {
          // Handle different types of changes
          if (payload.eventType === 'DELETE') {
            setFriends(prev => prev.filter(friend => friend.friendship_id !== payload.old.id));
          } else {
            // For INSERT and UPDATE, refresh the lists
            await Promise.all([fetchFriends(), user && fetchRequests()]);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [profileId, user, fetchFriends, fetchRequests]);

  return {
    friends,
    pendingRequests,
    sentRequests,
    loading,
    sendFriendRequest: handleSendFriendRequest,
    respondToRequest: handleRespondToRequest,
    removeFriend: handleRemoveFriend
  };
}