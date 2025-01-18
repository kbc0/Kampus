import { supabase } from '../lib/supabase';

interface Conversation {
  id: string;
}

export async function findExistingConversation(userId: string, otherUserId: string): Promise<Conversation | null> {
  try {
    const { data, error } = await supabase.rpc('get_conversation_between_users', { 
      user1_id: userId, 
      user2_id: otherUserId 
    });

    if (error) throw error;
    return data ? { id: data } : null;
  } catch (error) {
    console.error('Error finding conversation:', error);
    throw error;
  }
}

export async function createConversation(userId: string, otherUserId: string): Promise<Conversation> {
  try {
    // First check if users are friends
    const { data: areFriends, error: friendCheckError } = await supabase
      .rpc('are_friends', {
        user1_id: userId,
        user2_id: otherUserId
      });

    if (friendCheckError) throw friendCheckError;
    if (!areFriends) {
      throw new Error('Users must be friends to start a conversation');
    }

    const { data, error } = await supabase.rpc('create_conversation_with_participants', {
      user1_id: userId,
      user2_id: otherUserId
    });

    if (error) throw error;
    if (!data) throw new Error('Failed to create conversation');
    
    return { id: data };
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
}