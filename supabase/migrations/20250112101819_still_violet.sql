-- Drop existing function
DROP FUNCTION IF EXISTS get_level_progress(uuid);

-- Create or replace the get_level_progress function with fixed column references
CREATE OR REPLACE FUNCTION get_level_progress(profile_id_param uuid)
RETURNS TABLE (
  current_level integer,
  current_xp integer,
  next_level_xp integer,
  progress_percentage integer,
  level_title text
) AS $$
DECLARE
  xp_per_level constant integer := 100;
  user_xp integer;
  user_level integer;
  user_title text;
BEGIN
  -- Get user's current XP, level and title with explicit column references
  SELECT 
    p.xp,
    p.level,
    p."level_title"
  INTO 
    user_xp,
    user_level,
    user_title
  FROM profiles p
  WHERE p.id = profile_id_param;

  -- Return level progress info
  RETURN QUERY
  SELECT
    COALESCE(user_level, 1) as current_level,
    COALESCE(user_xp, 0) as current_xp,
    (COALESCE(user_level, 1) * xp_per_level) as next_level_xp,
    CASE
      WHEN user_xp IS NULL OR user_level IS NULL THEN 0
      ELSE ((user_xp % xp_per_level)::float / xp_per_level::float * 100)::integer
    END as progress_percentage,
    COALESCE(user_title, 'Freshman') as level_title;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_level_progress(uuid) TO authenticated;