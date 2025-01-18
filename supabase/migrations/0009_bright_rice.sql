/*
  # Fix conversation policies

  1. Changes
    - Update conversation creation policy
    - Add policy for managing conversation participants
    - Ensure proper access control for conversations

  2. Security
    - Maintain RLS for all operations
    - Allow users to create conversations and add participants
*/

-- Update conversation creation policy
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Update conversation participants policy
DROP POLICY IF EXISTS "Users can insert conversation participants" ON conversation_participants;
CREATE POLICY "Users can insert conversation participants"
  ON conversation_participants FOR INSERT
  WITH CHECK (
    -- Allow users to add themselves or others to conversations they're part of
    (profile_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id
      AND cp.profile_id = auth.uid()
    )
  );