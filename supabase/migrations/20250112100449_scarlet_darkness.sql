-- Drop existing function
DROP FUNCTION IF EXISTS get_profile_details(uuid);

-- Create improved profile details function with proper column types
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
    p.created_at,
    p.updated_at
  FROM profiles p
  LEFT JOIN profile_stats s ON s.profile_id = p.id
  WHERE p.id = profile_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_profile_details(uuid) TO authenticated;