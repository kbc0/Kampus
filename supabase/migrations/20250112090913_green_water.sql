-- Drop existing search function
DROP FUNCTION IF EXISTS search_forum(text);

-- Create improved search function with fixed column names
CREATE OR REPLACE FUNCTION search_forum(search_query text)
RETURNS TABLE (
  result_type text,
  id uuid,
  title text,
  name text,
  university text,
  avatar_url text,
  created_at timestamptz,
  content text,
  author_name text
) AS $$
DECLARE
  normalized_query text;
BEGIN
  -- Normalize the search query
  normalized_query := normalize_turkish(search_query);

  RETURN QUERY
  WITH search_results AS (
    -- Search profiles with similarity
    SELECT 
      'profile'::text as search_type,
      p.id,
      NULL as title,
      p.name,
      p.university,
      p.avatar_url,
      p.created_at,
      NULL as content,
      NULL as author_name,
      greatest(
        similarity(normalize_turkish(p.name), normalized_query),
        similarity(normalize_turkish(p.university), normalized_query)
      ) as sim_score
    FROM profiles p
    WHERE 
      normalize_turkish(p.name) ILIKE '%' || normalized_query || '%'
      OR normalize_turkish(p.university) ILIKE '%' || normalized_query || '%'
      OR similarity(normalize_turkish(p.name), normalized_query) > 0.2
      OR similarity(normalize_turkish(p.university), normalized_query) > 0.2

    UNION ALL

    -- Search topics with similarity
    SELECT 
      'topic'::text as search_type,
      t.id,
      t.title,
      NULL::text as name,
      NULL::text as university,
      NULL::text as avatar_url,
      t.created_at,
      t.content,
      p.name as author_name,
      greatest(
        similarity(normalize_turkish(t.title), normalized_query),
        similarity(normalize_turkish(t.content), normalized_query),
        similarity(normalize_turkish(p.name), normalized_query)
      ) as sim_score
    FROM forum_topics t
    JOIN profiles p ON p.id = t.author_id
    LEFT JOIN forum_categories c ON c.id = t.category_id
    WHERE 
      normalize_turkish(t.title) ILIKE '%' || normalized_query || '%'
      OR normalize_turkish(t.content) ILIKE '%' || normalized_query || '%'
      OR normalize_turkish(p.name) ILIKE '%' || normalized_query || '%'
      OR similarity(normalize_turkish(t.title), normalized_query) > 0.2
      OR similarity(normalize_turkish(t.content), normalized_query) > 0.2
      OR similarity(normalize_turkish(p.name), normalized_query) > 0.2
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
    search_type as result_type,
    id,
    title,
    name,
    university,
    avatar_url,
    created_at,
    content,
    author_name
  FROM search_results
  WHERE sim_score > 0
  ORDER BY sim_score DESC, created_at DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION search_forum(text) TO authenticated;