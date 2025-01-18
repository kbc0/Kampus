-- Add updated_at column to conversation_participants if it doesn't exist
ALTER TABLE conversation_participants 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_conversation_participant_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to conversation_participants
DROP TRIGGER IF EXISTS set_conversation_participant_timestamp ON conversation_participants;
CREATE TRIGGER set_conversation_participant_timestamp
  BEFORE UPDATE ON conversation_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_participant_timestamp();

-- Update mark_conversation_messages_read function to update the timestamp
CREATE OR REPLACE FUNCTION mark_conversation_messages_read(conversation_id_param uuid, user_id_param uuid)
RETURNS void AS $$
BEGIN
  -- Mark messages as read
  UPDATE messages
  SET read = true
  WHERE conversation_id = conversation_id_param
  AND sender_id != user_id_param
  AND NOT read;

  -- Update participant's last read timestamp
  UPDATE conversation_participants
  SET 
    unread_count = 0,
    updated_at = now()
  WHERE conversation_id = conversation_id_param
  AND profile_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;