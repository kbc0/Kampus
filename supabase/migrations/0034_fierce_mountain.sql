-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_new_message ON messages;
DROP FUNCTION IF EXISTS create_message_notification();

-- Create improved message notification function
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  receiver_id uuid;
  unread_count integer;
BEGIN
  -- Get the receiver's ID
  SELECT profile_id INTO receiver_id
  FROM conversation_participants
  WHERE conversation_id = NEW.conversation_id
  AND profile_id != NEW.sender_id
  LIMIT 1;

  -- Count total unread messages in this conversation
  SELECT COUNT(*) INTO unread_count
  FROM messages
  WHERE conversation_id = NEW.conversation_id
  AND sender_id != receiver_id
  AND NOT read;

  -- Delete any existing unread notifications for this conversation
  DELETE FROM notifications
  WHERE user_id = receiver_id
  AND type = 'message'
  AND (data->>'conversation_id')::uuid = NEW.conversation_id
  AND NOT read;

  -- Create new notification with unread count
  INSERT INTO notifications (user_id, type, data)
  VALUES (
    receiver_id,
    'message',
    jsonb_build_object(
      'message_id', NEW.id,
      'conversation_id', NEW.conversation_id,
      'sender_id', NEW.sender_id,
      'content', substring(NEW.content, 1, 100),
      'sender_name', (SELECT name FROM profiles WHERE id = NEW.sender_id),
      'unread_count', unread_count
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION create_message_notification();