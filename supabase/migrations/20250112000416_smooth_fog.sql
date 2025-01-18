-- Drop existing message policies
DROP POLICY IF EXISTS "Members can view messages" ON group_messages;
DROP POLICY IF EXISTS "Members can send messages" ON group_messages;
DROP POLICY IF EXISTS "Members can view messages" ON group_messages;
DROP POLICY IF EXISTS "Members can send messages" ON group_messages;

-- Create new simplified policies
CREATE POLICY "Members can view messages"
  ON group_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_messages.group_id
      AND gm.profile_id = auth.uid()
      AND gm.left_at IS NULL
    )
  );

CREATE POLICY "Members can send messages"
  ON group_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_messages.group_id
      AND gm.profile_id = auth.uid()
      AND gm.left_at IS NULL
    )
  );

-- Add function to verify group membership
CREATE OR REPLACE FUNCTION is_group_member(group_id_param uuid, user_id_param uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = group_id_param
    AND profile_id = user_id_param
    AND left_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update group messages table to add trigger for membership verification
CREATE OR REPLACE FUNCTION verify_group_membership()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT is_group_member(NEW.group_id, auth.uid()) THEN
    RAISE EXCEPTION 'User is not a member of this group';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to verify membership before insert
DROP TRIGGER IF EXISTS verify_group_membership_trigger ON group_messages;
CREATE TRIGGER verify_group_membership_trigger
  BEFORE INSERT ON group_messages
  FOR EACH ROW
  EXECUTE FUNCTION verify_group_membership();

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_group_member(uuid, uuid) TO authenticated;