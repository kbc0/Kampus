/*
  # Add message relationships and indexes

  1. Changes
    - Add indexes for better query performance
    - Add foreign key relationships
    - Update RLS policies
  
  2. Security
    - Maintain existing RLS policies
    - Add new policies for message relationships
*/

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations USING GIN (participants);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages (conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at);

-- Add foreign key relationship between messages and profiles
ALTER TABLE messages
DROP CONSTRAINT IF EXISTS messages_sender_id_fkey,
ADD CONSTRAINT messages_sender_id_fkey
  FOREIGN KEY (sender_id)
  REFERENCES profiles(id)
  ON DELETE CASCADE;

-- Add foreign key relationship between messages and conversations
ALTER TABLE messages
DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey,
ADD CONSTRAINT messages_conversation_id_fkey
  FOREIGN KEY (conversation_id)
  REFERENCES conversations(id)
  ON DELETE CASCADE;

-- Update messages RLS policies
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;

CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND auth.uid() = ANY(c.participants)
    )
  );

CREATE POLICY "Users can insert messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND auth.uid() = ANY(c.participants)
    )
    AND auth.uid() = sender_id
  );

-- Add function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(conversation_id_param uuid)
RETURNS void AS $$
BEGIN
  UPDATE messages
  SET read = true
  WHERE conversation_id = conversation_id_param
  AND sender_id != auth.uid()
  AND NOT read;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;