-- Create function to send warning notification
CREATE OR REPLACE FUNCTION create_warning_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for warned user
  INSERT INTO notifications (
    user_id,
    type,
    data,
    read
  ) VALUES (
    NEW.user_id,
    'warning',
    jsonb_build_object(
      'warning_id', NEW.id,
      'message', NEW.message,
      'warned_by', (SELECT name FROM profiles WHERE id = NEW.warned_by),
      'created_at', NEW.created_at
    ),
    false
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for warning notifications
CREATE TRIGGER on_user_warning
  AFTER INSERT ON user_warnings
  FOR EACH ROW
  EXECUTE FUNCTION create_warning_notification();

-- Update notifications table to handle warning notifications
ALTER TABLE notifications
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications
ADD CONSTRAINT notifications_type_check
CHECK (type IN ('message', 'reply', 'friend_request', 'friend_request_accepted', 'warning'));