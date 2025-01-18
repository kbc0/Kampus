-- Function to create notification for new messages
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete any existing unread message notifications from the same conversation
  DELETE FROM notifications
  WHERE user_id = (
    SELECT profile_id 
    FROM conversation_participants 
    WHERE conversation_id = NEW.conversation_id 
    AND profile_id != NEW.sender_id
  )
  AND type = 'message'
  AND (data->>'conversation_id')::uuid = NEW.conversation_id
  AND NOT read;

  -- Insert new notification
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
      'sender_name', (SELECT name FROM profiles WHERE id = NEW.sender_id)
    )
  FROM other_participant;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;