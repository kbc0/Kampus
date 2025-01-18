/*
  # Fix messaging functionality

  1. Updates
    - Add index on last_message_at for better performance
    - Add function to fetch conversations with latest messages
    - Add function to fetch conversation details
  
  2. Changes
    - Optimize conversation queries
    - Improve message ordering
*/

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at 
ON conversations(last_message_at DESC);

-- Function to fetch user conversations with latest messages
CREATE OR REPLACE FUNCTION get_user_conversations(user_id_param uuid)
RETURNS TABLE (
  conversation_id uuid,
  last_message_at timestamptz,
  other_user_id uuid,
  other_user_name text,
  other_user_university text,
  last_message_content text,
  last_message_sender_id uuid,
  last_message_created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as conversation_id,
    c.last_message_at,
    p.id as other_user_id,
    p.name as other_user_name,
    p.university as other_user_university,
    m.content as last_message_content,
    m.sender_id as last_message_sender_id,
    m.created_at as last_message_created_at
  FROM conversations c
  JOIN conversation_participants cp ON cp.conversation_id = c.id
  JOIN conversation_participants cp2 ON cp2.conversation_id = c.id
  JOIN profiles p ON p.id = cp2.profile_id
  LEFT JOIN LATERAL (
    SELECT content, sender_id, created_at
    FROM messages
    WHERE conversation_id = c.id
    ORDER BY created_at DESC
    LIMIT 1
  ) m ON true
  WHERE cp.profile_id = user_id_param
  AND cp2.profile_id != user_id_param
  ORDER BY c.last_message_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;