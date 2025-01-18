-- Update notifications table to ensure read status is properly tracked
CREATE OR REPLACE FUNCTION mark_notifications_as_read(notification_ids uuid[])
RETURNS void AS $$
BEGIN
  UPDATE notifications
  SET 
    read = true,
    updated_at = now()
  WHERE id = ANY(notification_ids)
  AND user_id = auth.uid()
  AND NOT read;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE notifications ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_notification_timestamp ON notifications;
CREATE TRIGGER set_notification_timestamp
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_timestamp();

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_updated 
ON notifications(user_id, read, updated_at DESC);