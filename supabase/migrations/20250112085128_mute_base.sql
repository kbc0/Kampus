-- Drop existing search function
DROP FUNCTION IF EXISTS search_forum(text);

-- Create improved search function with fixed column references
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
  -- Search profiles with similarity
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
    similarity(p.name, search_query) > 0.3
    OR similarity(p.university, search_query) > 0.3
    OR p.name % search_query
    OR p.university % search_query

  UNION ALL

  -- Search topics with similarity
  SELECT 
    'topic'::text as type,
    t.id,
    t.title,
    NULL::text as name,
    NULL::text as university,
    NULL::text as avatar_url,
    t.created_at,
    t.content,
    p.name as author_name
  FROM forum_topics t
  JOIN profiles p ON p.id = t.author_id
  LEFT JOIN forum_categories c ON c.id = t.category_id
  WHERE 
    (
      similarity(t.title, search_query) > 0.3
      OR similarity(t.content, search_query) > 0.3
      OR similarity(p.name, search_query) > 0.3
      OR t.title % search_query
      OR t.content % search_query
      OR p.name % search_query
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

  ORDER BY 
    GREATEST(
      CASE 
        WHEN type = 'profile' THEN similarity(p.name, search_query)
        ELSE similarity(t.title, search_query)
      END,
      CASE 
        WHEN type = 'topic' THEN similarity(t.content, search_query)
        ELSE 0
      END
    ) DESC,
    created_at DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;