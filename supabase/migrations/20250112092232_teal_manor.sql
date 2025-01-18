-- Drop existing indexes that depend on the function
DROP INDEX IF EXISTS idx_profiles_name_normalized;
DROP INDEX IF EXISTS idx_profiles_university_normalized;
DROP INDEX IF EXISTS idx_forum_topics_title_normalized;
DROP INDEX IF EXISTS idx_forum_topics_content_normalized;

-- Then drop the existing functions
DROP FUNCTION IF EXISTS search_forum(text) CASCADE;
DROP FUNCTION IF EXISTS normalize_turkish(text) CASCADE;

-- Enable trigram extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create function to normalize Turkish characters
CREATE OR REPLACE FUNCTION normalize_turkish(input text)
RETURNS text AS $$
BEGIN
  RETURN translate(
    lower(input),
    'çğıiöşüâîûêİĞÜŞÖÇ',
    'cgiiosua^u^e^igusoc'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create search function
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
    NULL as author_name,
    similarity(normalize_turkish(p.name), normalize_turkish(search_query)) as sim_score
  FROM profiles p
  WHERE 
    normalize_turkish(p.name) ILIKE '%' || normalize_turkish(search_query) || '%'
    OR normalize_turkish(p.university) ILIKE '%' || normalize_turkish(search_query) || '%'
    OR similarity(normalize_turkish(p.name), normalize_turkish(search_query)) > 0.3
    OR similarity(normalize_turkish(p.university), normalize_turkish(search_query)) > 0.3

  UNION ALL

  -- Search topics
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
    greatest(
      similarity(normalize_turkish(t.title), normalize_turkish(search_query)),
      similarity(normalize_turkish(t.content), normalize_turkish(search_query))
    ) as sim_score
  FROM forum_topics t
  JOIN profiles p ON p.id = t.author_id
  LEFT JOIN forum_categories c ON c.id = t.category_id
  WHERE (
    normalize_turkish(t.title) ILIKE '%' || normalize_turkish(search_query) || '%'
    OR normalize_turkish(t.content) ILIKE '%' || normalize_turkish(search_query) || '%'
    OR normalize_turkish(p.name) ILIKE '%' || normalize_turkish(search_query) || '%'
    OR similarity(normalize_turkish(t.title), normalize_turkish(search_query)) > 0.3
    OR similarity(normalize_turkish(t.content), normalize_turkish(search_query)) > 0.3
    OR similarity(normalize_turkish(p.name), normalize_turkish(search_query)) > 0.3
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

-- Create indexes for better search performance
CREATE INDEX idx_profiles_name_normalized 
ON profiles USING gin(normalize_turkish(name) gin_trgm_ops);

CREATE INDEX idx_profiles_university_normalized 
ON profiles USING gin(normalize_turkish(university) gin_trgm_ops);

CREATE INDEX idx_forum_topics_title_normalized 
ON forum_topics USING gin(normalize_turkish(title) gin_trgm_ops);

CREATE INDEX idx_forum_topics_content_normalized 
ON forum_topics USING gin(normalize_turkish(content) gin_trgm_ops);

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION normalize_turkish(text) TO authenticated;
GRANT EXECUTE ON FUNCTION search_forum(text) TO authenticated;