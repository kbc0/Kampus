-- Create function for forum-wide search
CREATE OR REPLACE FUNCTION search_forum(search_query text)
RETURNS TABLE (
  type text,
  id uuid,
  title text,
  name text,
  university text,
  avatar_url text,
  created_at timestamptz,
  content text,
  author_name text
) AS $$
BEGIN
  RETURN QUERY
  -- Search profiles
  SELECT 
    'profile'::text as type,
    p.id,
    NULL as title,
    p.name,
    p.university,
    p.avatar_url,
    p.created_at,
    NULL as content,
    NULL as author_name
  FROM profiles p
  WHERE 
    p.name ILIKE '%' || search_query || '%'
    OR p.university ILIKE '%' || search_query || '%'

  UNION ALL

  -- Search topics
  SELECT 
    'topic'::text as type,
    t.id,
    t.title,
    NULL as name,
    NULL as university,
    NULL as avatar_url,
    t.created_at,
    t.content,
    p.name as author_name
  FROM forum_topics t
  JOIN profiles p ON p.id = t.author_id
  LEFT JOIN forum_categories c ON c.id = t.category_id
  WHERE 
    (
      t.title ILIKE '%' || search_query || '%'
      OR t.content ILIKE '%' || search_query || '%'
      OR p.name ILIKE '%' || search_query || '%'
    )
    AND (
      NOT c.is_private 
      OR EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN forum_roles fr ON fr.id = ur.role_id
        WHERE ur.user_id = auth.uid()
        AND fr.role IN ('admin', 'moderator')
      )
    )

  ORDER BY created_at DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for better search performance
CREATE INDEX IF NOT EXISTS idx_forum_topics_search 
ON forum_topics USING gin(
  to_tsvector('english', title || ' ' || content)
);

CREATE INDEX IF NOT EXISTS idx_profiles_search 
ON profiles USING gin(
  to_tsvector('english', name || ' ' || COALESCE(university, ''))
);

-- Grant execute permission
GRANT EXECUTE ON FUNCTION search_forum(text) TO authenticated;