/*
  # Update conversation system policies and triggers

  1. Changes
    - Drop and recreate policies for better security
    - Add new policy for conversation participant management
    - Update trigger for last message timestamp

  2. Security
    - Enhanced RLS policies for conversations and messages
    - Added specific policy for participant management
*/

-- First drop dependent policies
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can view their conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can insert conversation participants" ON conversation_participants;

-- Add RLS policies for participants
CREATE POLICY "Users can view their conversation participants"
  ON conversation_participants FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Users can insert conversation participants"
  ON conversation_participants FOR INSERT
  WITH CHECK (
    profile_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id
      AND cp.profile_id = auth.uid()
    )
  );

-- Add new conversation policies using the junction table
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = id
      AND profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (true);

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