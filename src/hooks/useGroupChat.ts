import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { GroupChat, Message } from '../types/messages';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export function useGroupChat(groupId: string) {
  const [group, setGroup] = useState<GroupChat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchGroup = async () => {
    try {
      const { data, error } = await supabase
        .from('group_chats')
        .select(`
          *,
          members:group_members!left(
            profile:profiles(id, name, avatar_url)
          ),
          last_message:group_messages!left(
            id,
            content,
            created_at,
            sender:profiles!group_messages_sender_id_fkey(
              id,
              name
            )
          )
        `)
        .eq('id', groupId)
        .single();

      if (error) throw error;
      if (!data) return;

      setGroup({
        id: data.id,
        name: data.name,
        description: data.description,
        memberCount: data.members.length,
        members: data.members.map((m: any) => ({
          id: m.profile.id,
          name: m.profile.name,
          avatar_url: m.profile.avatar_url
        }))
      });
    } catch (error) {
      console.error('Error fetching group:', error);
      toast.error('Failed to load group details');
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('group_messages')
          .select(`
            *,
            sender:profiles!group_messages_sender_id_fkey(
              id,
              name,
              avatar_url
            )
          `)
          .eq('group_id', groupId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        setMessages(data.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          created_at: msg.created_at,
          sender: {
            id: msg.sender.id,
            name: msg.sender.name,
            avatar_url: msg.sender.avatar_url
          }
        })));
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    // Initial data fetch
    Promise.all([fetchGroup(), fetchMessages()]);

    // Subscribe to new messages and group changes
    const channel = supabase
      .channel(`group_${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`
        },
        async (payload) => {
          const { data: newMessage, error } = await supabase
            .from('group_messages')
            .select(`
              *,
              sender:profiles!group_messages_sender_id_fkey(
                id,
                name,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (error) {
            console.error('Error fetching new message:', error);
            return;
          }

          if (newMessage) {
            setMessages(prev => [...prev, {
              id: newMessage.id,
              content: newMessage.content,
              created_at: newMessage.created_at,
              sender: {
                id: newMessage.sender.id,
                name: newMessage.sender.name,
                avatar_url: newMessage.sender.avatar_url
              }
            }]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_members',
          filter: `group_id=eq.${groupId}`
        },
        () => {
          // Refresh group data when members change
          fetchGroup();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [groupId]);

  const sendMessage = async (content: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase.rpc('send_group_message', {
        group_id_param: groupId,
        content_param: content.trim()
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      throw error;
    }
  };

  const addMembers = async (memberIds: string[]) => {
    try {
      for (const memberId of memberIds) {
        const { error } = await supabase.rpc('add_group_member', {
          group_id_param: groupId,
          profile_id_param: memberId
        });
        if (error) throw error;
      }

      toast.success('Members added successfully');
    } catch (error) {
      console.error('Error adding members:', error);
      toast.error('Failed to add members');
      throw error;
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase.rpc('remove_group_member', {
        group_id_param: groupId,
        profile_id_param: memberId
      });

      if (error) throw error;

      // Update local state to remove the member
      if (group) {
        setGroup({
          ...group,
          members: group.members.filter(m => m.id !== memberId),
          memberCount: group.memberCount - 1
        });
      }

      toast.success('Member removed successfully');
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
      throw error;
    }
  };

  return {
    group,
    messages,
    loading,
    sendMessage,
    addMembers,
    removeMember
  };
}