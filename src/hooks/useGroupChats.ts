import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { GroupChat } from '../types/messages';
import { toast } from 'react-hot-toast';

export function useGroupChats() {
  const [groups, setGroups] = useState<GroupChat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
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
          .order('updated_at', { ascending: false });

        if (error) throw error;

        const formattedGroups = data.map(group => ({
          id: group.id,
          name: group.name,
          description: group.description,
          memberCount: group.members.length,
          lastMessage: group.last_message?.[0] ? {
            id: group.last_message[0].id,
            content: group.last_message[0].content,
            created_at: group.last_message[0].created_at,
            sender_id: group.last_message[0].sender.id,
            sender_name: group.last_message[0].sender.name
          } : undefined
        }));

        setGroups(formattedGroups);
      } catch (error) {
        console.error('Error fetching groups:', error);
        toast.error('Failed to load group chats');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();

    // Subscribe to changes
    const channel = supabase
      .channel('group_chats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_chats'
        },
        () => {
          fetchGroups();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_messages'
        },
        () => {
          fetchGroups();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const createGroup = async (name: string, description: string, memberIds: string[]) => {
    try {
      const { data, error } = await supabase.rpc('create_group_chat', {
        name_param: name,
        description_param: description,
        initial_members: memberIds
      });

      if (error) throw error;

      toast.success('Group created successfully');
      return data;
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
      throw error;
    }
  };

  return { groups, loading, createGroup };
}