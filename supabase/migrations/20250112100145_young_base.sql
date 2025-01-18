-- Add level system tables
CREATE TABLE user_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level integer NOT NULL,
  xp_required integer NOT NULL,
  title text NOT NULL,
  badge_url text,
  created_at timestamptz DEFAULT now()
);

-- Add XP tracking to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS xp integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS level integer DEFAULT 1;

-- Create function to calculate level from XP
CREATE OR REPLACE FUNCTION calculate_level(xp_amount integer)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT level
    FROM user_levels
    WHERE xp_required <= xp_amount
    ORDER BY xp_required DESC
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to award XP
CREATE OR REPLACE FUNCTION award_xp(
  profile_id_param uuid,
  xp_amount integer
)
RETURNS void AS $$
DECLARE
  new_xp integer;
  new_level integer;
  current_level integer;
BEGIN
  -- Get current XP and level
  SELECT xp, level INTO new_xp, current_level
  FROM profiles
  WHERE id = profile_id_param;

  -- Add XP
  new_xp := COALESCE(new_xp, 0) + xp_amount;
  
  -- Calculate new level
  new_level := calculate_level(new_xp);

  -- Update profile
  UPDATE profiles
  SET 
    xp = new_xp,
    level = new_level,
    updated_at = now()
  WHERE id = profile_id_param;

  -- If leveled up, create notification
  IF new_level > current_level THEN
    INSERT INTO notifications (
      user_id,
      type,
      data
    ) VALUES (
      profile_id_param,
      'level_up',
      jsonb_build_object(
        'old_level', current_level,
        'new_level', new_level,
        'title', (SELECT title FROM user_levels WHERE level = new_level)
      )
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get level progress
CREATE OR REPLACE FUNCTION get_level_progress(profile_id_param uuid)
RETURNS TABLE (
  current_level integer,
  current_xp integer,
  next_level_xp integer,
  progress_percentage integer,
  level_title text
) AS $$
BEGIN
  RETURN QUERY
  WITH user_info AS (
    SELECT p.xp, p.level
    FROM profiles p
    WHERE p.id = profile_id_param
  ),
  next_level AS (
    SELECT xp_required
    FROM user_levels
    WHERE level = (
      SELECT level + 1
      FROM user_info
    )
  ),
  current_level AS (
    SELECT xp_required, title
    FROM user_levels
    WHERE level = (
      SELECT level
      FROM user_info
    )
  )
  SELECT
    ui.level as current_level,
    ui.xp as current_xp,
    nl.xp_required as next_level_xp,
    CASE
      WHEN nl.xp_required IS NULL THEN 100
      ELSE (
        ((ui.xp - cl.xp_required)::float / 
        (nl.xp_required - cl.xp_required)::float * 100)::integer
      )
    END as progress_percentage,
    cl.title as level_title
  FROM user_info ui
  JOIN current_level cl ON true
  LEFT JOIN next_level nl ON true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default levels
INSERT INTO user_levels (level, xp_required, title) VALUES
  (1, 0, 'Freshman'),
  (2, 100, 'Sophomore'),
  (3, 300, 'Junior'),
  (4, 600, 'Senior'),
  (5, 1000, 'Graduate'),
  (6, 1500, 'Master'),
  (7, 2100, 'PhD Candidate'),
  (8, 2800, 'Doctor'),
  (9, 3600, 'Professor'),
  (10, 4500, 'Dean');

-- Create triggers for XP awards
CREATE OR REPLACE FUNCTION award_activity_xp()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'forum_topics' THEN
    -- Award XP for creating a topic
    PERFORM award_xp(NEW.author_id, 10);
  ELSIF TG_TABLE_NAME = 'forum_replies' THEN
    -- Award XP for replying
    PERFORM award_xp(NEW.author_id, 5);
  ELSIF TG_TABLE_NAME = 'forum_likes' THEN
    -- Award XP for receiving a like
    IF NEW.topic_id IS NOT NULL THEN
      SELECT author_id INTO NEW.author_id
      FROM forum_topics
      WHERE id = NEW.topic_id;
    ELSE
      SELECT author_id INTO NEW.author_id
      FROM forum_replies
      WHERE id = NEW.reply_id;
    END IF;
    PERFORM award_xp(NEW.author_id, 2);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER award_topic_xp
  AFTER INSERT ON forum_topics
  FOR EACH ROW
  EXECUTE FUNCTION award_activity_xp();

CREATE TRIGGER award_reply_xp
  AFTER INSERT ON forum_replies
  FOR EACH ROW
  EXECUTE FUNCTION award_activity_xp();

CREATE TRIGGER award_like_xp
  AFTER INSERT ON forum_likes
  FOR EACH ROW
  EXECUTE FUNCTION award_activity_xp();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION calculate_level(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_level_progress(uuid) TO authenticated;