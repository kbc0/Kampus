-- Drop existing policies
DROP POLICY IF EXISTS "Members can send messages" ON group_messages;

-- Create improved policies for group messages
CREATE POLICY "Members can send messages"
  ON group_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = group_messages.group_id
      AND profile_id = auth.uid()
      AND left_at IS NULL
    )
  );

-- Add sender_id to group_messages if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'group_messages' AND column_name = 'sender_id'
  ) THEN
    ALTER TABLE group_messages ADD COLUMN sender_id uuid REFERENCES profiles(id);
  END IF;
END $$;

-- Update the function to include sender_id
CREATE OR REPLACE FUNCTION send_group_message(
  group_id_param uuid,
  content_param text
)
RETURNS uuid AS $$
DECLARE
  new_message_id uuid;
BEGIN
  -- Verify sender is a group member
  IF NOT EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = group_id_param
    AND profile_id = auth.uid()
    AND left_at IS NULL
  ) THEN
    RAISE EXCEPTION 'User is not a member of this group';
  END IF;

  -- Insert message
  INSERT INTO group_messages (
    group_id,
    sender_id,
    content
  ) VALUES (
    group_id_param,
    auth.uid(),
    content_param
  ) RETURNING id INTO new_message_id;

  RETURN new_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION send_group_message(uuid, text) TO authenticated;