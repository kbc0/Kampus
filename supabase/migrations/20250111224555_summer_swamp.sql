-- Add function to get forum topics with category info
CREATE OR REPLACE FUNCTION get_forum_topics(
  category_id_param uuid DEFAULT NULL,
  subject_param text DEFAULT NULL,
  sort_by text DEFAULT 'latest'
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  created_at timestamptz,
  updated_at timestamptz,
  author_id uuid,
  category_id uuid,
  subject text,
  likes_count integer,
  replies_count integer,
  views_count integer,
  is_pinned boolean,
  is_locked boolean,
  author_name text,
  author_university text,
  author_avatar_url text,
  category_name text,
  category_is_private boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.*,
    p.name as author_name,
    p.university as author_university,
    p.avatar_url as author_avatar_url,
    c.name as category_name,
    c.is_private as category_is_private
  FROM forum_topics t
  JOIN profiles p ON p.id = t.author_id
  JOIN forum_categories c ON c.id = t.category_id
  WHERE 
    (category_id_param IS NULL OR t.category_id = category_id_param)
    AND (subject_param IS NULL OR t.subject = subject_param)
    AND (
      NOT c.is_private 
      OR EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN forum_roles fr ON fr.id = ur.role_id
        WHERE ur.user_id = auth.uid()
        AND fr.role IN ('admin', 'moderator')
      )
    )
  ORDER BY
    CASE 
      WHEN sort_by = 'trending' THEN t.likes_count
      ELSE t.created_at
    END DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_forum_topics(uuid, text, text) TO authenticated;