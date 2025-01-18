-- Drop existing search function
DROP FUNCTION IF EXISTS search_forum(text);

-- Create improved search function with fixed syntax
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
  SELECT * FROM (
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
      similarity(p.name, search_query) as name_sim,
      similarity(p.university, search_query) as univ_sim,
      0 as title_sim,
      0 as content_sim
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
      0 as name_sim,
      0 as univ_sim,
      similarity(t.title, search_query) as title_sim,
      similarity(t.content, search_query) as content_sim
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
  ) combined_results
  ORDER BY 
    GREATEST(
      name_sim + univ_sim,
      title_sim + content_sim
    ) DESC,
    created_at DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION search_forum(text) TO authenticated;