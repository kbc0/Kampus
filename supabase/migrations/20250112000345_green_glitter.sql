-- Drop existing message policies
DROP POLICY IF EXISTS "Members can view messages" ON group_messages;
DROP POLICY IF EXISTS "Members can send messages" ON group_messages;

-- Create new policies with proper checks
CREATE POLICY "Members can view messages"
  ON group_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = group_messages.group_id
      AND profile_id = auth.uid()
      AND left_at IS NULL
    )
  );

CREATE POLICY "Members can send messages"
  ON group_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = group_messages.group_id
      AND profile_id = auth.uid()
      AND left_at IS NULL
    )
  );

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_group_messages_group_id 
ON group_messages(group_id);

CREATE INDEX IF NOT EXISTS idx_group_members_active 
ON group_members(group_id, profile_id) 
WHERE left_at IS NULL;