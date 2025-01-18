-- First drop the trigger that depends on create_message_notification
DROP TRIGGER IF EXISTS on_new_message ON messages;

-- Now we can safely drop the functions
DROP FUNCTION IF EXISTS create_message_notification();
DROP FUNCTION IF EXISTS get_user_conversations(uuid);

-- Recreate the get_user_conversations function
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
  last_message_created_at timestamptz,
  unread_count bigint
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
  ),
  unread_counts AS (
    SELECT 
      m.conversation_id,
      COUNT(*) as unread_count
    FROM messages m
    WHERE NOT m.read 
    AND m.sender_id != user_id_param
    GROUP BY m.conversation_id
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
    lm.created_at,
    COALESCE(uc.unread_count, 0)
  FROM conversations c
  JOIN conversation_participants cp1 ON cp1.conversation_id = c.id AND cp1.profile_id = user_id_param
  JOIN conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.profile_id != user_id_param
  JOIN profiles p ON p.id = cp2.profile_id
  LEFT JOIN last_messages lm ON lm.conversation_id = c.id
  LEFT JOIN unread_counts uc ON uc.conversation_id = c.id
  ORDER BY c.last_message_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the create_message_notification function
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  existing_notification_id uuid;
  unread_count integer;
BEGIN
  -- Get existing unread notification for this conversation
  SELECT id INTO existing_notification_id
  FROM notifications
  WHERE user_id = (
    SELECT profile_id 
    FROM conversation_participants 
    WHERE conversation_id = NEW.conversation_id 
    AND profile_id != NEW.sender_id
  )
  AND type = 'message'
  AND (data->>'conversation_id')::uuid = NEW.conversation_id
  AND NOT read;

  -- Count unread messages
  SELECT COUNT(*) INTO unread_count
  FROM messages
  WHERE conversation_id = NEW.conversation_id
  AND sender_id = NEW.sender_id
  AND NOT read;

  -- If there's an existing notification, update it
  IF existing_notification_id IS NOT NULL THEN
    UPDATE notifications
    SET data = jsonb_build_object(
      'message_id', NEW.id,
      'conversation_id', NEW.conversation_id,
      'sender_id', NEW.sender_id,
      'content', substring(NEW.content, 1, 100),
      'sender_name', (SELECT name FROM profiles WHERE id = NEW.sender_id),
      'unread_count', unread_count
    ),
    updated_at = now()
    WHERE id = existing_notification_id;
  ELSE
    -- Create new notification
    WITH other_participant AS (
      SELECT profile_id
      FROM conversation_participants
      WHERE conversation_id = NEW.conversation_id
      AND profile_id != NEW.sender_id
      LIMIT 1
    )
    INSERT INTO notifications (user_id, type, data)
    SELECT 
      profile_id,
      'message',
      jsonb_build_object(
        'message_id', NEW.id,
        'conversation_id', NEW.conversation_id,
        'sender_id', NEW.sender_id,
        'content', substring(NEW.content, 1, 100),
        'sender_name', (SELECT name FROM profiles WHERE id = NEW.sender_id),
        'unread_count', unread_count
      )
    FROM other_participant;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION create_message_notification();