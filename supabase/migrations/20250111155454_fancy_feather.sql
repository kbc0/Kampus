-- Drop existing policies
DROP POLICY IF EXISTS "Users can view topics in accessible categories" ON forum_topics;
DROP POLICY IF EXISTS "Authenticated users can create topics in accessible categories" ON forum_topics;

-- Create more permissive policies for topics
CREATE POLICY "Anyone can view topics"
  ON forum_topics FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create topics"
  ON forum_topics FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create default General category
INSERT INTO forum_categories (name, description, slug, position, is_private)
VALUES (
  'General Discussion',
  'General discussion about academic topics',
  'general',
  0,
  false
);

-- Update forum_topics to allow null category_id temporarily
ALTER TABLE forum_topics 
ALTER COLUMN category_id DROP NOT NULL;

-- Update existing topics to use the General category
UPDATE forum_topics
SET category_id = (
  SELECT id FROM forum_categories 
  WHERE slug = 'general' 
  LIMIT 1
)
WHERE category_id IS NULL;