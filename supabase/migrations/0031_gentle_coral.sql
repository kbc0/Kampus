-- Add unread_count to conversation_participants
ALTER TABLE conversation_participants
ADD COLUMN unread_count integer DEFAULT 0;

-- Function to update unread count when a new message is sent
CREATE OR REPLACE FUNCTION update_unread_message_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment unread count for the other participant
  UPDATE conversation_participants
  SET unread_count = unread_count + 1
  WHERE conversation_id = NEW.conversation_id
  AND profile_id != NEW.sender_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for updating unread count
CREATE TRIGGER on_new_message_update_unread
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_unread_message_count();

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_conversation_messages_read(conversation_id_param uuid, user_id_param uuid)
RETURNS void AS $$
BEGIN
  -- Mark messages as read
  UPDATE messages
  SET read = true
  WHERE conversation_id = conversation_id_param
  AND sender_id != user_id_param
  AND NOT read;

  -- Reset unread count
  UPDATE conversation_participants
  SET unread_count = 0
  WHERE conversation_id = conversation_id_param
  AND profile_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;