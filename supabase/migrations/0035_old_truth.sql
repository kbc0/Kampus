-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_new_message ON messages;
DROP FUNCTION IF EXISTS create_message_notification();

-- Create improved message notification function with active conversation check
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  receiver_id uuid;
  unread_count integer;
  last_read_at timestamptz;
BEGIN
  -- Get the receiver's ID
  SELECT profile_id INTO receiver_id
  FROM conversation_participants
  WHERE conversation_id = NEW.conversation_id
  AND profile_id != NEW.sender_id
  LIMIT 1;

  -- Get the last time the receiver read messages in this conversation
  SELECT updated_at INTO last_read_at
  FROM conversation_participants
  WHERE conversation_id = NEW.conversation_id
  AND profile_id = receiver_id;

  -- If the message was sent within 10 seconds of the last read, skip notification
  -- This indicates the user is likely actively viewing the conversation
  IF last_read_at IS NOT NULL AND 
     NEW.created_at <= last_read_at + interval '10 seconds' THEN
    RETURN NEW;
  END IF;

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