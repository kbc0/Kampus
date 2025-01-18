-- Create user ban table
CREATE TABLE IF NOT EXISTS user_bans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  banned_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reason text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user warnings table
CREATE TABLE IF NOT EXISTS user_warnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  warned_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_warnings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage bans"
  ON user_bans FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN forum_roles fr ON fr.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND fr.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage warnings"
  ON user_warnings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN forum_roles fr ON fr.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND fr.role = 'admin'
    )
  );

-- Function to ban a user
CREATE OR REPLACE FUNCTION ban_user(
  user_id_param uuid,
  reason_param text DEFAULT NULL,
  duration_days int DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  expires timestamptz;
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN forum_roles fr ON fr.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND fr.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can ban users';
  END IF;

  -- Calculate expiration if duration provided
  IF duration_days IS NOT NULL THEN
    expires := now() + (duration_days || ' days')::interval;
  END IF;

  -- Insert ban record
  INSERT INTO user_bans (
    user_id,
    banned_by,
    reason,
    expires_at
  ) VALUES (
    user_id_param,
    auth.uid(),
    reason_param,
    expires
  );

  -- Log moderation action
  PERFORM log_moderation_action(
    'ban_user',
    'user',
    user_id_param,
    jsonb_build_object(
      'reason', reason_param,
      'expires_at', expires
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to warn a user
CREATE OR REPLACE FUNCTION warn_user(
  user_id_param uuid,
  warning_message text
)
RETURNS void AS $$
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN forum_roles fr ON fr.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND fr.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can warn users';
  END IF;

  -- Insert warning
  INSERT INTO user_warnings (
    user_id,
    warned_by,
    message
  ) VALUES (
    user_id_param,
    auth.uid(),
    warning_message
  );

  -- Log moderation action
  PERFORM log_moderation_action(
    'warn_user',
    'user',
    user_id_param,
    jsonb_build_object('message', warning_message)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is banned
CREATE OR REPLACE FUNCTION is_user_banned(user_id_param uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_bans
    WHERE user_id = user_id_param
    AND (expires_at IS NULL OR expires_at > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user warnings
CREATE OR REPLACE FUNCTION get_user_warnings(user_id_param uuid)
RETURNS TABLE (
  id uuid,
  message text,
  warned_by_name text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.id,
    w.message,
    p.name as warned_by_name,
    w.created_at
  FROM user_warnings w
  LEFT JOIN profiles p ON p.id = w.warned_by
  WHERE w.user_id = user_id_param
  ORDER BY w.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;