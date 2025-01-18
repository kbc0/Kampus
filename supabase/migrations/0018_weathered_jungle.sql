/*
  # Update database functions to include avatar_url

  1. Changes
    - Add avatar_url to get_conversation_participants function return type
    - Add avatar_url to get_user_conversations function return type
    - Update function implementations to include avatar_url field

  2. Implementation Details
    - Drop existing functions first to avoid return type conflicts
    - Recreate functions with updated return types
*/

-- Drop existing functions
DROP FUNCTION IF EXISTS get_conversation_participants(uuid);
DROP FUNCTION IF EXISTS get_user_conversations(uuid);

-- Recreate get_conversation_participants with avatar_url
CREATE OR REPLACE FUNCTION get_conversation_participants(conversation_id_param uuid)
RETURNS TABLE (
  profile_id uuid,
  name text,
  university text,
  avatar_url text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as profile_id,
    p.name,
    p.university,
    p.avatar_url
  FROM conversation_participants cp
  JOIN profiles p ON p.id = cp.profile_id
  WHERE cp.conversation_id = conversation_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate get_user_conversations with avatar_url
CREATE OR REPLACE FUNCTION get_user_conversations(user_id_param uuid)
RETURNS TABLE (
  conversation_id uuid,
  last_message_at timestamptz,
  other_user_id uuid,
  other_user_name text,
  other_user_university text,
  other_user_avatar_url text,
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
    p.avatar_url,
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