-- Update notifications table to add index for read status
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read)
WHERE NOT read;

-- Function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_as_read(notification_ids uuid[])
RETURNS void AS $$
BEGIN
  UPDATE notifications
  SET read = true
  WHERE id = ANY(notification_ids)
  AND user_id = auth.uid()
  AND NOT read;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_as_read()
RETURNS void AS $$
BEGIN
  UPDATE notifications
  SET read = true
  WHERE user_id = auth.uid()
  AND NOT read;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;