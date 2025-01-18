-- Update function to warn users to allow moderators
CREATE OR REPLACE FUNCTION warn_user(
  user_id_param uuid,
  warning_message text
)
RETURNS void AS $$
BEGIN
  -- Check if caller is admin or moderator
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN forum_roles fr ON fr.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND fr.role IN ('admin', 'moderator')
  ) THEN
    RAISE EXCEPTION 'Only admins and moderators can warn users';
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

-- Update function to ban users to allow moderators
CREATE OR REPLACE FUNCTION ban_user(
  user_id_param uuid,
  reason_param text DEFAULT NULL,
  duration_days int DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  expires timestamptz;
BEGIN
  -- Check if caller is admin or moderator
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN forum_roles fr ON fr.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND fr.role IN ('admin', 'moderator')
  ) THEN
    RAISE EXCEPTION 'Only admins and moderators can ban users';
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

-- Update policies for forum topics to allow moderator management
DROP POLICY IF EXISTS "Authors and moderators can update topics" ON forum_topics;
DROP POLICY IF EXISTS "Authors and moderators can delete topics" ON forum_topics;

CREATE POLICY "Authors and moderators can update topics"
  ON forum_topics FOR UPDATE
  USING (
    auth.uid() = author_id
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN forum_roles fr ON fr.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND fr.role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Authors and moderators can delete topics"
  ON forum_topics FOR DELETE
  USING (
    auth.uid() = author_id
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN forum_roles fr ON fr.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND fr.role IN ('admin', 'moderator')
    )
  );

-- Update policies for user bans to allow moderator access
DROP POLICY IF EXISTS "Admins can manage bans" ON user_bans;
CREATE POLICY "Admins and moderators can manage bans"
  ON user_bans FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN forum_roles fr ON fr.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND fr.role IN ('admin', 'moderator')
    )
  );

-- Update policies for user warnings to allow moderator access
DROP POLICY IF EXISTS "Admins can manage warnings" ON user_warnings;
CREATE POLICY "Admins and moderators can manage warnings"
  ON user_warnings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN forum_roles fr ON fr.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND fr.role IN ('admin', 'moderator')
    )
  );