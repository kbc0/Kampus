-- First drop existing functions that depend on the table structure
DROP FUNCTION IF EXISTS get_categories_with_stats();
DROP FUNCTION IF EXISTS create_category(text, text, boolean);
DROP FUNCTION IF EXISTS update_category(uuid, text, text, boolean);

-- Add parent_id column if it doesn't exist
ALTER TABLE forum_categories
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES forum_categories(id) ON DELETE CASCADE;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_forum_categories_parent_id ON forum_categories(parent_id);

-- Create improved get_categories_with_stats function with hierarchy support
CREATE OR REPLACE FUNCTION get_categories_with_stats()
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  slug text,
  is_private boolean,
  parent_id uuid,
  "position" integer,
  total_topics bigint,
  total_replies bigint,
  last_post_at timestamptz,
  depth integer
) AS $$
WITH RECURSIVE category_tree AS (
  -- Base case: top-level categories
  SELECT 
    c.id,
    c.name,
    c.description,
    c.slug,
    c.is_private,
    c.parent_id,
    c."position",
    0 as depth
  FROM forum_categories c
  WHERE c.parent_id IS NULL
  
  UNION ALL
  
  -- Recursive case: subcategories
  SELECT 
    c.id,
    c.name,
    c.description,
    c.slug,
    c.is_private,
    c.parent_id,
    c."position",
    ct.depth + 1
  FROM forum_categories c
  INNER JOIN category_tree ct ON c.parent_id = ct.id
),
category_stats AS (
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
  ct.id,
  ct.name,
  ct.description,
  ct.slug,
  ct.is_private,
  ct.parent_id,
  ct."position",
  COALESCE(cs.topics, 0) as total_topics,
  COALESCE(cs.replies, 0) as total_replies,
  cs.last_post as last_post_at,
  ct.depth
FROM category_tree ct
LEFT JOIN category_stats cs ON cs.cat_id = ct.id
ORDER BY ct.depth, ct."position";
$$ LANGUAGE sql SECURITY DEFINER;

-- Create improved create_category function with parent_id support
CREATE OR REPLACE FUNCTION create_category(
  name_param text,
  description_param text,
  is_private_param boolean,
  parent_id_param uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  new_category_id uuid;
  slug_base text;
  slug_attempt text;
  counter integer := 0;
  next_position integer;
BEGIN
  -- Validate parent_id if provided
  IF parent_id_param IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM forum_categories WHERE id = parent_id_param) THEN
      RAISE EXCEPTION 'Parent category does not exist';
    END IF;
  END IF;

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

  -- Get next position within the same parent
  SELECT COALESCE(MAX("position"), -1) + 1 INTO next_position
  FROM forum_categories
  WHERE COALESCE(parent_id, uuid_nil()) = COALESCE(parent_id_param, uuid_nil());

  -- Insert new category
  INSERT INTO forum_categories (
    name,
    description,
    slug,
    is_private,
    parent_id,
    "position"
  ) VALUES (
    name_param,
    description_param,
    slug_attempt,
    is_private_param,
    parent_id_param,
    next_position
  ) RETURNING id INTO new_category_id;

  -- Log the action
  PERFORM log_moderation_action(
    'create_category',
    'category',
    new_category_id,
    jsonb_build_object(
      'name', name_param,
      'is_private', is_private_param,
      'parent_id', parent_id_param
    )
  );

  RETURN new_category_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add some initial subcategories for universities
DO $$
DECLARE
  bilkent_id uuid;
  lessons_id uuid;
BEGIN
  -- Create Bilkent category if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM forum_categories WHERE name = 'Bilkent University') THEN
    SELECT create_category('Bilkent University', 'Discussions for Bilkent University students', false)
    INTO bilkent_id;

    -- Create subcategories
    SELECT create_category('Lessons', 'Course discussions and study groups', false, bilkent_id)
    INTO lessons_id;

    -- Create department subcategories under Lessons
    PERFORM create_category('Computer Science', 'CS course discussions', false, lessons_id);
    PERFORM create_category('Engineering', 'Engineering course discussions', false, lessons_id);
    PERFORM create_category('Business', 'Business course discussions', false, lessons_id);
  END IF;
END $$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_categories_with_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION create_category(text, text, boolean, uuid) TO authenticated;