/*
  # Fix message relationships and add missing columns

  1. Changes
    - Drop existing policies first
    - Create participants junction table
    - Update conversations table structure
    - Update foreign key relationships
    - Add new policies
  
  2. Security
    - Maintain RLS on all tables
    - Add policies for participant relationships
*/

-- First drop dependent policies
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;

-- Create participants junction table
CREATE TABLE conversation_participants (
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (conversation_id, profile_id)
);

-- Enable RLS on participants table
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for participants
CREATE POLICY "Users can view their conversation participants"
  ON conversation_participants FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Users can manage their conversation participants"
  ON conversation_participants FOR ALL
  USING (profile_id = auth.uid());

-- Now we can safely modify the conversations table
ALTER TABLE conversations 
ADD COLUMN title text,
ADD COLUMN last_message_at timestamptz DEFAULT now();

-- Migrate existing participants data
INSERT INTO conversation_participants (conversation_id, profile_id)
SELECT c.id, unnest(c.participants)
FROM conversations c;

-- After data migration, drop the participants column
ALTER TABLE conversations DROP COLUMN participants;

-- Update messages table foreign key
ALTER TABLE messages
DROP CONSTRAINT IF EXISTS messages_sender_id_fkey,
ADD CONSTRAINT messages_sender_id_fkey
  FOREIGN KEY (sender_id)
  REFERENCES profiles(id)
  ON DELETE CASCADE;

-- Add new conversation policies using the junction table
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = conversations.id
      AND profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = id
      AND profile_id = auth.uid()
    )
  );

-- Add new message policies using the junction table
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = messages.conversation_id
      AND profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = conversation_id
      AND profile_id = auth.uid()
    )
    AND auth.uid() = sender_id
  );

-- Function to update last message timestamp
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for last message update
DROP TRIGGER IF EXISTS update_conversation_last_message ON messages;
CREATE TRIGGER update_conversation_last_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();