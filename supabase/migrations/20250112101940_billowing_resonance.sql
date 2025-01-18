-- Drop existing function
DROP FUNCTION IF EXISTS get_profile_details(uuid);

-- Create improved profile details function
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
  -- Get profile details with proper metadata handling
  RETURN QUERY
  WITH user_stats AS (
    SELECT 
      profile_id,
      COUNT(DISTINCT t.id) as topics_count,
      COUNT(DISTINCT r.id) as replies_count,
      COUNT(DISTINCT CASE WHEN l.user_id = profile_id THEN l.id END) as likes_given,
      COUNT(DISTINCT CASE 
        WHEN t.author_id = profile_id AND l.topic_id IS NOT NULL THEN l.id
        WHEN r.author_id = profile_id AND l.reply_id IS NOT NULL THEN l.id
      END) as likes_received,
      COUNT(DISTINCT CASE 
        WHEN f.status = 'accepted' THEN 
          CASE WHEN f.sender_id = profile_id THEN f.receiver_id
               WHEN f.receiver_id = profile_id THEN f.sender_id
          END
      END) as friends_count
    FROM profiles p
    LEFT JOIN forum_topics t ON t.author_id = p.id
    LEFT JOIN forum_replies r ON r.author_id = p.id
    LEFT JOIN forum_likes l ON 
      (l.user_id = p.id) OR 
      (t.author_id = p.id AND l.topic_id = t.id) OR 
      (r.author_id = p.id AND l.reply_id = r.id)
    LEFT JOIN friendships f ON 
      (f.sender_id = p.id OR f.receiver_id = p.id)
    WHERE p.id = profile_id_param
    GROUP BY profile_id
  )
  SELECT
    p.id,
    p.name,
    p.university,
    p.bio,
    p.avatar_url,
    p.cover_image_url,
    p.major,
    p.minor,
    COALESCE(p.subjects, '{"canHelp": [], "needsHelp": []}'::jsonb) as subjects,
    COALESCE(p.social_links, '{}'::jsonb) as social_links,
    COALESCE(p.achievements, '[]'::jsonb) as achievements,
    COALESCE(p.skills, '[]'::jsonb) as skills,
    COALESCE(p.interests, '[]'::jsonb) as interests,
    COALESCE(p.custom_sections, '[]'::jsonb) as custom_sections,
    COALESCE(p.theme_preferences, '{"primaryColor": "violet", "layout": "default", "showStats": true}'::jsonb) as theme_preferences,
    jsonb_build_object(
      'topicsCount', COALESCE(s.topics_count, 0),
      'repliesCount', COALESCE(s.replies_count, 0),
      'likesGivenCount', COALESCE(s.likes_given, 0),
      'likesReceivedCount', COALESCE(s.likes_received, 0),
      'friendsCount', COALESCE(s.friends_count, 0)
    ) as stats,
    COALESCE(p.xp, 0) as xp,
    COALESCE(p.level, 1) as level,
    COALESCE(p."level_title", 'Freshman') as level_title,
    p.created_at,
    p.updated_at
  FROM profiles p
  LEFT JOIN user_stats s ON s.profile_id = p.id
  WHERE p.id = profile_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure all profiles have proper metadata
UPDATE profiles
SET
  subjects = COALESCE(subjects, '{"canHelp": [], "needsHelp": []}'::jsonb),
  social_links = COALESCE(social_links, '{}'::jsonb),
  achievements = COALESCE(achievements, '[]'::jsonb),
  skills = COALESCE(skills, '[]'::jsonb),
  interests = COALESCE(interests, '[]'::jsonb),
  custom_sections = COALESCE(custom_sections, '[]'::jsonb),
  theme_preferences = COALESCE(theme_preferences, '{"primaryColor": "violet", "layout": "default", "showStats": true}'::jsonb),
  xp = COALESCE(xp, 0),
  level = COALESCE(level, 1),
  "level_title" = COALESCE("level_title", 'Freshman')
WHERE subjects IS NULL 
   OR social_links IS NULL 
   OR achievements IS NULL
   OR skills IS NULL
   OR interests IS NULL
   OR custom_sections IS NULL
   OR theme_preferences IS NULL
   OR xp IS NULL
   OR level IS NULL
   OR "level_title" IS NULL;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_profile_details(uuid) TO authenticated;