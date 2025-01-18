-- Drop existing functions first
DROP FUNCTION IF EXISTS get_profile_details(uuid);
DROP FUNCTION IF EXISTS get_level_progress(uuid);

-- Create or replace the get_profile_details function
CREATE OR REPLACE FUNCTION get_profile_details(profile_id_param uuid)
RETURNS TABLE (
  id uuid,
  name text,
  university text,
  bio text,
  avatar_url text,
  cover_image_url text,
  major text,
  minor text,
  subjects jsonb,
  social_links jsonb,
  achievements jsonb,
  skills jsonb,
  interests jsonb,
  custom_sections jsonb,
  theme_preferences jsonb,
  stats jsonb,
  xp integer,
  level integer,
  level_title text,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.university,
    p.bio,
    p.avatar_url,
    p.cover_image_url,
    p.major,
    p.minor,
    p.subjects,
    p.social_links,
    p.achievements,
    p.skills,
    p.interests,
    p.custom_sections,
    p.theme_preferences,
    jsonb_build_object(
      'topicsCount', COALESCE(s.topics_count, 0),
      'repliesCount', COALESCE(s.replies_count, 0),
      'likesGivenCount', COALESCE(s.likes_given_count, 0),
      'likesReceivedCount', COALESCE(s.likes_received_count, 0),
      'friendsCount', COALESCE(s.friends_count, 0)
    ) as stats,
    COALESCE(p.xp, 0) as xp,
    COALESCE(p.level, 1) as level,
    COALESCE(p.level_title, 'Freshman') as level_title,
    p.created_at,
    p.updated_at
  FROM profiles p
  LEFT JOIN profile_stats s ON s.profile_id = p.id
  WHERE p.id = profile_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace the get_level_progress function with fixed level title reference
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
  profile_xp integer;
  profile_level integer;
  profile_level_title text;
BEGIN
  -- Get user's current XP, level and title
  SELECT 
    COALESCE(xp, 0),
    COALESCE(level, 1),
    COALESCE(level_title, 'Freshman')
  INTO 
    profile_xp,
    profile_level,
    profile_level_title
  FROM profiles 
  WHERE id = profile_id_param;

  -- Return level progress info
  RETURN QUERY
  SELECT
    profile_level as current_level,
    profile_xp as current_xp,
    (profile_level * xp_per_level) as next_level_xp,
    ((profile_xp % xp_per_level)::float / xp_per_level::float * 100)::integer as progress_percentage,
    profile_level_title as level_title;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_profile_details(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_level_progress(uuid) TO authenticated;