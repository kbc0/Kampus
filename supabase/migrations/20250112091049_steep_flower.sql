-- Drop existing search function
DROP FUNCTION IF EXISTS search_forum(text);

-- Create improved search function with fixed column references
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
  SELECT
    sr.search_type as result_type,
    sr.result_id as id,
    sr.result_title as title,
    sr.result_name as name,
    sr.result_university as university,
    sr.result_avatar_url as avatar_url,
    sr.result_created_at as created_at,
    sr.result_content as content,
    sr.result_author_name as author_name
  FROM (
    -- Search profiles with similarity
    SELECT 
      'profile'::text as search_type,
      p.id as result_id,
      NULL as result_title,
      p.name as result_name,
      p.university as result_university,
      p.avatar_url as result_avatar_url,
      p.created_at as result_created_at,
      NULL as result_content,
      NULL as result_author_name,
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
      t.id as result_id,
      t.title as result_title,
      NULL::text as result_name,
      NULL::text as result_university,
      NULL::text as result_avatar_url,
      t.created_at as result_created_at,
      t.content as result_content,
      p.name as result_author_name,
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
  ) sr
  WHERE sim_score > 0
  ORDER BY sim_score DESC, result_created_at DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION search_forum(text) TO authenticated;