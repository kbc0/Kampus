-- Drop existing search function
DROP FUNCTION IF EXISTS search_forum(text);

-- Create improved search function with correct column count
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
WITH search_results AS (
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
    NULL as author_name,
    similarity(p.name, search_query) as sim_score
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
    p.name as author_name,
    GREATEST(
      similarity(t.title, search_query),
      similarity(t.content, search_query)
    ) as sim_score
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
)
SELECT
  type,
  id,
  title,
  name,
  university,
  avatar_url,
  created_at,
  content,
  author_name
FROM search_results
ORDER BY sim_score DESC, created_at DESC
LIMIT 20;
$$ LANGUAGE sql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION search_forum(text) TO authenticated;