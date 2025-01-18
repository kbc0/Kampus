-- Drop existing materialized view and triggers
DROP TRIGGER IF EXISTS refresh_profile_stats_topics ON forum_topics;
DROP TRIGGER IF EXISTS refresh_profile_stats_replies ON forum_replies;
DROP TRIGGER IF EXISTS refresh_profile_stats_likes ON forum_likes;
DROP TRIGGER IF EXISTS refresh_profile_stats_friendships ON friendships;
DROP FUNCTION IF EXISTS refresh_profile_stats();
DROP MATERIALIZED VIEW IF EXISTS profile_stats;

-- Create regular view instead of materialized view for real-time stats
CREATE OR REPLACE VIEW profile_stats AS
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
    author_id as profile_id,
    COUNT(*) as likes_count
  FROM (
    SELECT t.author_id, l.id
    FROM forum_likes l
    JOIN forum_topics t ON t.id = l.topic_id
    UNION ALL
    SELECT r.author_id, l.id
    FROM forum_likes l
    JOIN forum_replies r ON r.id = l.reply_id
  ) likes
  GROUP BY author_id
),
friend_counts AS (
  SELECT 
    profile_id,
    COUNT(*) as friends_count
  FROM (
    SELECT sender_id as profile_id FROM friendships WHERE status = 'accepted'
    UNION ALL
    SELECT receiver_id as profile_id FROM friendships WHERE status = 'accepted'
  ) f
  GROUP BY profile_id
)
SELECT 
  p.id as profile_id,
  COALESCE(t.topics_count, 0) as topics_count,
  COALESCE(r.replies_count, 0) as replies_count,
  COALESCE(lg.likes_given_count, 0) as likes_given_count,
  COALESCE(lr.likes_count, 0) as likes_received_count,
  COALESCE(f.friends_count, 0) as friends_count
FROM profiles p
LEFT JOIN topic_stats t ON t.profile_id = p.id
LEFT JOIN reply_stats r ON r.profile_id = p.id
LEFT JOIN likes_given lg ON lg.profile_id = p.id
LEFT JOIN likes_received lr ON lr.profile_id = p.id
LEFT JOIN friend_counts f ON f.profile_id = p.id;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_topics_author_id ON forum_topics(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_author_id ON forum_replies(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_likes_user_id ON forum_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status) WHERE status = 'accepted';