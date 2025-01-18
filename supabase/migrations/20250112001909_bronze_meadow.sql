-- First drop the existing function
DROP FUNCTION IF EXISTS get_category_announcements(uuid);

-- Add category_id to forum_announcements if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'forum_announcements' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE forum_announcements
    ADD COLUMN category_id uuid REFERENCES forum_categories(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_forum_announcements_category 
ON forum_announcements(category_id, is_active)
WHERE is_active = true;

-- Create function to get category announcements
CREATE OR REPLACE FUNCTION get_category_announcements(category_id_param uuid)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  author_id uuid,
  author_name text,
  is_active boolean,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz,
  category_id uuid,
  category_name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.title,
    a.content,
    a.author_id,
    p.name as author_name,
    a.is_active,
    a.starts_at,
    a.ends_at,
    a.created_at,
    a.category_id,
    c.name as category_name
  FROM forum_announcements a
  JOIN profiles p ON p.id = a.author_id
  LEFT JOIN forum_categories c ON c.id = a.category_id
  WHERE (
    -- Show announcements that are either:
    -- 1. Global (no category)
    -- 2. Specific to the current category
    -- 3. Show all if no category is selected
    a.category_id IS NULL 
    OR a.category_id = category_id_param 
    OR category_id_param IS NULL
  )
  AND a.is_active = true
  AND (a.starts_at IS NULL OR a.starts_at <= now())
  AND (a.ends_at IS NULL OR a.ends_at > now())
  ORDER BY a.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_category_announcements(uuid) TO authenticated;