-- Add function to create category with proper slug generation
CREATE OR REPLACE FUNCTION create_category(
  name_param text,
  description_param text,
  is_private_param boolean
)
RETURNS uuid AS $$
DECLARE
  new_category_id uuid;
  slug_base text;
  slug_attempt text;
  counter integer := 0;
BEGIN
  -- Create base slug
  slug_base := lower(regexp_replace(name_param, '[^a-zA-Z0-9]+', '-', 'g'));
  slug_attempt := slug_base;
  
  -- Handle slug collisions
  WHILE EXISTS (
    SELECT 1 FROM forum_categories WHERE slug = slug_attempt
  ) LOOP
    counter := counter + 1;
    slug_attempt := slug_base || '-' || counter;
  END LOOP;

  -- Insert new category
  INSERT INTO forum_categories (
    name,
    description,
    slug,
    is_private,
    "position"
  ) VALUES (
    name_param,
    description_param,
    slug_attempt,
    is_private_param,
    (SELECT COALESCE(MAX("position"), -1) + 1 FROM forum_categories)
  ) RETURNING id INTO new_category_id;

  RETURN new_category_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to get category list with stats
CREATE OR REPLACE FUNCTION get_categories_with_stats()
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  slug text,
  is_private boolean,
  "position" integer,
  total_topics bigint,
  total_replies bigint,
  last_post_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.description,
    c.slug,
    c.is_private,
    c."position",
    COUNT(DISTINCT t.id)::bigint as total_topics,
    COUNT(DISTINCT r.id)::bigint as total_replies,
    MAX(GREATEST(t.created_at, COALESCE(r.created_at, '1970-01-01'::timestamptz))) as last_post_at
  FROM forum_categories c
  LEFT JOIN forum_topics t ON t.category_id = c.id
  LEFT JOIN forum_replies r ON r.topic_id = t.id
  GROUP BY c.id, c.name, c.description, c.slug, c.is_private, c."position"
  ORDER BY c."position";
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;