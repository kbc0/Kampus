-- Drop existing triggers first
DROP TRIGGER IF EXISTS award_topic_xp ON forum_topics;
DROP TRIGGER IF EXISTS award_reply_xp ON forum_replies;
DROP TRIGGER IF EXISTS award_like_xp ON forum_likes;
DROP FUNCTION IF EXISTS award_activity_xp();

-- Create improved XP award function
CREATE OR REPLACE FUNCTION award_activity_xp()
RETURNS TRIGGER AS $$
DECLARE
  xp_amount integer;
  current_xp integer;
  new_xp integer;
  new_level integer;
  target_user_id uuid;
BEGIN
  -- Set XP amount based on activity type
  IF TG_TABLE_NAME = 'forum_topics' THEN
    xp_amount := 10; -- 10 XP for creating a topic
    target_user_id := NEW.author_id;
  ELSIF TG_TABLE_NAME = 'forum_replies' THEN
    xp_amount := 5;  -- 5 XP for posting a reply
    target_user_id := NEW.author_id;
  ELSIF TG_TABLE_NAME = 'forum_likes' THEN
    xp_amount := 2;  -- 2 XP for receiving a like
    -- For likes, we need to get the author of the liked content
    IF NEW.topic_id IS NOT NULL THEN
      SELECT author_id INTO target_user_id
      FROM forum_topics
      WHERE id = NEW.topic_id;
    ELSE
      SELECT author_id INTO target_user_id
      FROM forum_replies
      WHERE id = NEW.reply_id;
    END IF;
  END IF;

  -- Get current XP
  SELECT xp INTO current_xp
  FROM profiles
  WHERE id = target_user_id;

  -- Calculate new XP
  new_xp := COALESCE(current_xp, 0) + xp_amount;
  
  -- Calculate new level (1 level per 100 XP)
  new_level := (new_xp / 100) + 1;

  -- Update profile
  UPDATE profiles
  SET 
    xp = new_xp,
    level = new_level,
    level_title = CASE 
      WHEN new_level = 1 THEN 'Freshman'
      WHEN new_level = 2 THEN 'Sophomore'
      WHEN new_level = 3 THEN 'Junior'
      WHEN new_level = 4 THEN 'Senior'
      WHEN new_level = 5 THEN 'Graduate'
      WHEN new_level = 6 THEN 'Master'
      WHEN new_level = 7 THEN 'PhD Candidate'
      WHEN new_level = 8 THEN 'Doctor'
      WHEN new_level = 9 THEN 'Professor'
      WHEN new_level >= 10 THEN 'Dean'
      ELSE 'Freshman'
    END
  WHERE id = target_user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate triggers
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

-- Recalculate XP and levels for all users
DO $$ 
DECLARE
  profile_record RECORD;
  topic_count integer;
  reply_count integer;
  likes_received integer;
  total_xp integer;
  new_level integer;
BEGIN
  FOR profile_record IN SELECT id FROM profiles LOOP
    -- Count topics (10 XP each)
    SELECT COUNT(*) INTO topic_count
    FROM forum_topics
    WHERE author_id = profile_record.id;

    -- Count replies (5 XP each)
    SELECT COUNT(*) INTO reply_count
    FROM forum_replies
    WHERE author_id = profile_record.id;

    -- Count likes received (2 XP each)
    SELECT COUNT(*) INTO likes_received
    FROM (
      SELECT l.id
      FROM forum_likes l
      JOIN forum_topics t ON t.id = l.topic_id AND t.author_id = profile_record.id
      UNION ALL
      SELECT l.id
      FROM forum_likes l
      JOIN forum_replies r ON r.id = l.reply_id AND r.author_id = profile_record.id
    ) likes;

    -- Calculate total XP
    total_xp := (topic_count * 10) + (reply_count * 5) + (likes_received * 2);
    
    -- Calculate level
    new_level := (total_xp / 100) + 1;

    -- Update profile
    UPDATE profiles
    SET 
      xp = total_xp,
      level = new_level,
      level_title = CASE 
        WHEN new_level = 1 THEN 'Freshman'
        WHEN new_level = 2 THEN 'Sophomore'
        WHEN new_level = 3 THEN 'Junior'
        WHEN new_level = 4 THEN 'Senior'
        WHEN new_level = 5 THEN 'Graduate'
        WHEN new_level = 6 THEN 'Master'
        WHEN new_level = 7 THEN 'PhD Candidate'
        WHEN new_level = 8 THEN 'Doctor'
        WHEN new_level = 9 THEN 'Professor'
        WHEN new_level >= 10 THEN 'Dean'
        ELSE 'Freshman'
      END
    WHERE id = profile_record.id;
  END LOOP;
END $$;