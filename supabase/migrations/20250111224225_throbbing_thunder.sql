-- Drop and recreate the create_category function with proper position handling
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
  next_position integer;
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

  -- Get next position
  SELECT COALESCE(MAX("position"), -1) + 1 INTO next_position
  FROM forum_categories;

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
    next_position
  ) RETURNING id INTO new_category_id;

  -- Log the action
  PERFORM log_moderation_action(
    'create_category',
    'category',
    new_category_id,
    jsonb_build_object(
      'name', name_param,
      'is_private', is_private_param
    )
  );

  RETURN new_category_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Improve the get_categories_with_stats function
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
  WITH category_stats AS (
    SELECT 
      c.id as cat_id,
      COUNT(DISTINCT t.id)::bigint as topics,
      COUNT(DISTINCT r.id)::bigint as replies,
      MAX(GREATEST(t.created_at, COALESCE(r.created_at, '1970-01-01'::timestamptz))) as last_post
    FROM forum_categories c
    LEFT JOIN forum_topics t ON t.category_id = c.id
    LEFT JOIN forum_replies r ON r.topic_id = t.id
    GROUP BY c.id
  )
  SELECT 
    c.id,
    c.name,
    c.description,
    c.slug,
    c.is_private,
    c."position",
    COALESCE(cs.topics, 0) as total_topics,
    COALESCE(cs.replies, 0) as total_replies,
    cs.last_post as last_post_at
  FROM forum_categories c
  LEFT JOIN category_stats cs ON cs.cat_id = c.id
  ORDER BY c."position";
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to update category
CREATE OR REPLACE FUNCTION update_category(
  category_id_param uuid,
  name_param text,
  description_param text,
  is_private_param boolean
)
RETURNS void AS $$
BEGIN
  -- Update category
  UPDATE forum_categories
  SET
    name = name_param,
    description = description_param,
    is_private = is_private_param,
    updated_at = now()
  WHERE id = category_id_param;

  -- Log the action
  PERFORM log_moderation_action(
    'update_category',
    'category',
    category_id_param,
    jsonb_build_object(
      'name', name_param,
      'is_private', is_private_param
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION create_category(text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION get_categories_with_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION update_category(uuid, text, text, boolean) TO authenticated;