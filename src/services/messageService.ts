import { supabase } from '../lib/supabase';
import { Conversation } from '../types/messages';

export async function fetchUserConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .rpc('get_user_conversations', { user_id_param: userId });

  if (error) throw error;

  return data.map((conv: any) => ({
    id: conv.conversation_id,
    lastMessage: conv.last_message_content ? {
      content: conv.last_message_content,
      created_at: conv.last_message_created_at,
      sender_id: conv.last_message_sender_id
    } : undefined,
    otherUser: {
      id: conv.other_user_id,
      name: conv.other_user_name,
      university: conv.other_user_university,
      avatar_url: conv.other_user_avatar_url
    },
    unreadCount: conv.unread_count || 0
  }));
}

export async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
  await supabase.rpc('mark_conversation_messages_read', {
    conversation_id_param: conversationId,
    user_id_param: userId
  });
}