-- Add new profile customization fields
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS cover_image_url text,
ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS achievements jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS skills jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS interests jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS custom_sections jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS theme_preferences jsonb DEFAULT '{
  "primaryColor": "violet",
  "layout": "default",
  "showStats": true
}'::jsonb;

-- Add activity stats view
CREATE OR REPLACE VIEW profile_stats AS
SELECT 
  p.id as profile_id,
  (
    SELECT COUNT(*)
    FROM forum_topics t
    WHERE t.author_id = p.id
  ) as topics_count,
  (
    SELECT COUNT(*)
    FROM forum_replies r
    WHERE r.author_id = p.id
  ) as replies_count,
  (
    SELECT COUNT(*)
    FROM forum_likes l
    WHERE l.user_id = p.id
  ) as likes_given_count,
  (
    SELECT COUNT(*)
    FROM forum_likes l
    JOIN forum_topics t ON t.id = l.topic_id
    WHERE t.author_id = p.id
  ) + (
    SELECT COUNT(*)
    FROM forum_likes l
    JOIN forum_replies r ON r.id = l.reply_id
    WHERE r.author_id = p.id
  ) as likes_received_count,
  (
    SELECT COUNT(*)
    FROM friendships f
    WHERE (f.sender_id = p.id OR f.receiver_id = p.id)
    AND f.status = 'accepted'
  ) as friends_count
FROM profiles p;

-- Add function to update profile customization
CREATE OR REPLACE FUNCTION update_profile_customization(
  cover_image_url_param text DEFAULT NULL,
  social_links_param jsonb DEFAULT NULL,
  achievements_param jsonb DEFAULT NULL,
  skills_param jsonb DEFAULT NULL,
  interests_param jsonb DEFAULT NULL,
  custom_sections_param jsonb DEFAULT NULL,
  theme_preferences_param jsonb DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET
    cover_image_url = COALESCE(cover_image_url_param, cover_image_url),
    social_links = COALESCE(social_links_param, social_links),
    achievements = COALESCE(achievements_param, achievements),
    skills = COALESCE(skills_param, skills),
    interests = COALESCE(interests_param, interests),
    custom_sections = COALESCE(custom_sections_param, custom_sections),
    theme_preferences = COALESCE(theme_preferences_param, theme_preferences),
    updated_at = now()
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to get profile details with stats
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
  topics_count bigint,
  replies_count bigint,
  likes_given_count bigint,
  likes_received_count bigint,
  friends_count bigint,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.*,
    s.topics_count,
    s.replies_count,
    s.likes_given_count,
    s.likes_received_count,
    s.friends_count
  FROM profiles p
  LEFT JOIN profile_stats s ON s.profile_id = p.id
  WHERE p.id = profile_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION update_profile_customization(text, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION get_profile_details(uuid) TO authenticated;