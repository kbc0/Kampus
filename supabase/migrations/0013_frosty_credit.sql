/*
  # Fix conversations query and improve performance

  1. Changes
    - Fix ambiguous column references in get_user_conversations function
    - Add table aliases to clarify column sources
    - Optimize query performance
*/

-- Drop and recreate the function with fixed column references
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
  WITH last_messages AS (
    SELECT DISTINCT ON (m.conversation_id)
      m.conversation_id,
      m.content,
      m.sender_id,
      m.created_at
    FROM messages m
    ORDER BY m.conversation_id, m.created_at DESC
  )
  SELECT 
    c.id,
    c.last_message_at,
    p.id,
    p.name,
    p.university,
    lm.content,
    lm.sender_id,
    lm.created_at
  FROM conversations c
  JOIN conversation_participants cp1 ON cp1.conversation_id = c.id AND cp1.profile_id = user_id_param
  JOIN conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.profile_id != user_id_param
  JOIN profiles p ON p.id = cp2.profile_id
  LEFT JOIN last_messages lm ON lm.conversation_id = c.id
  ORDER BY c.last_message_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;