-- Drop existing message policies
DROP POLICY IF EXISTS "Users can insert messages if they are friends" ON messages;

-- Create new policy for inserting messages
CREATE POLICY "Users can insert messages in conversations"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
      AND cp.profile_id = auth.uid()
    )
    AND auth.uid() = sender_id
  );

-- Update notifications policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

CREATE POLICY "Users can manage their notifications"
  ON notifications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to delete notifications
CREATE OR REPLACE FUNCTION delete_notifications(notification_ids uuid[])
RETURNS void AS $$
BEGIN
  DELETE FROM notifications
  WHERE id = ANY(notification_ids)
  AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete all notifications
CREATE OR REPLACE FUNCTION delete_all_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications
  WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;