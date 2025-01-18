-- Drop existing view if it exists
DROP VIEW IF EXISTS profile_stats;

-- Create materialized view for profile stats
CREATE MATERIALIZED VIEW profile_stats AS
WITH topic_stats AS (
  SELECT 
    author_id as profile_id,
    COUNT(*) as topics_count
  FROM forum_topics
  GROUP BY author_id
),
reply_stats AS (
  SELECT 
    author_id as profile_id,
    COUNT(*) as replies_count
  FROM forum_replies
  GROUP BY author_id
),
likes_given AS (
  SELECT 
    user_id as profile_id,
    COUNT(*) as likes_given_count
  FROM forum_likes
  GROUP BY user_id
),
likes_received AS (
  SELECT 
    t.author_id as profile_id,
    COUNT(*) as topic_likes_count
  FROM forum_likes l
  JOIN forum_topics t ON t.id = l.topic_id
  GROUP BY t.author_id
  UNION ALL
  SELECT 
    r.author_id as profile_id,
    COUNT(*) as reply_likes_count
  FROM forum_likes l
  JOIN forum_replies r ON r.id = l.reply_id
  GROUP BY r.author_id
),
friend_counts AS (
  SELECT 
    p.id as profile_id,
    COUNT(DISTINCT CASE 
      WHEN f.status = 'accepted' THEN 
        CASE WHEN f.sender_id = p.id THEN f.receiver_id
             WHEN f.receiver_id = p.id THEN f.sender_id
        END
    END) as friends_count
  FROM profiles p
  LEFT JOIN friendships f ON 
    (f.sender_id = p.id OR f.receiver_id = p.id)
  GROUP BY p.id
)
SELECT 
  p.id as profile_id,
  COALESCE(t.topics_count, 0) as topics_count,
  COALESCE(r.replies_count, 0) as replies_count,
  COALESCE(lg.likes_given_count, 0) as likes_given_count,
  COALESCE(SUM(lr.topic_likes_count), 0) as likes_received_count,
  COALESCE(f.friends_count, 0) as friends_count
FROM profiles p
LEFT JOIN topic_stats t ON t.profile_id = p.id
LEFT JOIN reply_stats r ON r.profile_id = p.id
LEFT JOIN likes_given lg ON lg.profile_id = p.id
LEFT JOIN likes_received lr ON lr.profile_id = p.id
LEFT JOIN friend_counts f ON f.profile_id = p.id
GROUP BY 
  p.id, 
  t.topics_count, 
  r.replies_count, 
  lg.likes_given_count,
  f.friends_count;

-- Create index for better performance
CREATE UNIQUE INDEX idx_profile_stats_profile_id ON profile_stats(profile_id);

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_profile_stats()
RETURNS trigger AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY profile_stats;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to refresh stats
CREATE TRIGGER refresh_profile_stats_topics
  AFTER INSERT OR UPDATE OR DELETE ON forum_topics
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_profile_stats();

CREATE TRIGGER refresh_profile_stats_replies
  AFTER INSERT OR UPDATE OR DELETE ON forum_replies
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_profile_stats();

CREATE TRIGGER refresh_profile_stats_likes
  AFTER INSERT OR UPDATE OR DELETE ON forum_likes
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_profile_stats();

CREATE TRIGGER refresh_profile_stats_friendships
  AFTER INSERT OR UPDATE OR DELETE ON friendships
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_profile_stats();

-- Initial refresh
REFRESH MATERIALIZED VIEW profile_stats;