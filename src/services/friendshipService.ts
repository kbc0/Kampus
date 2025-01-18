import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export async function sendFriendRequest(senderId: string, receiverId: string, message?: string) {
  try {
    const { error } = await supabase
      .from('friendships')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        status: 'pending',
        message
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
}

export async function respondToFriendRequest(requestId: string, accept: boolean) {
  try {
    const { error } = await supabase
      .from('friendships')
      .update({
        status: accept ? 'accepted' : 'rejected'
      })
      .eq('id', requestId);

    if (error) throw error;
  } catch (error) {
    console.error('Error responding to friend request:', error);
    throw error;
  }
}

export async function removeFriendship(friendshipId: string) {
  try {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);

    if (error) throw error;
  } catch (error) {
    console.error('Error removing friend:', error);
    throw error;
  }
}