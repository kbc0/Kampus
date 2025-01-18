-- Add indexes and constraints for forum categories
ALTER TABLE forum_categories
ADD CONSTRAINT unique_category_slug UNIQUE (slug),
ADD CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');

-- Add position management functions
CREATE OR REPLACE FUNCTION update_category_positions()
RETURNS TRIGGER AS $$
BEGIN
  -- Update positions when a category is deleted
  IF TG_OP = 'DELETE' THEN
    UPDATE forum_categories
    SET position = position - 1
    WHERE position > OLD.position;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for position management
CREATE TRIGGER manage_category_positions
  AFTER DELETE ON forum_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_category_positions();

-- Add function to reorder categories
CREATE OR REPLACE FUNCTION reorder_categories(category_orders jsonb)
RETURNS void AS $$
BEGIN
  -- Update positions based on provided order
  FOR i IN 0..jsonb_array_length(category_orders) - 1 LOOP
    UPDATE forum_categories
    SET position = i
    WHERE id = (category_orders->i->>'id')::uuid;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies for category management
DROP POLICY IF EXISTS "Anyone can view public categories" ON forum_categories;
DROP POLICY IF EXISTS "Only admins can manage categories" ON forum_categories;

CREATE POLICY "Anyone can view categories"
  ON forum_categories FOR SELECT
  USING (
    NOT is_private 
    OR (
      is_private AND EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN forum_roles fr ON fr.id = ur.role_id
        WHERE ur.user_id = auth.uid()
        AND fr.role IN ('admin', 'moderator')
      )
    )
  );

CREATE POLICY "Admins can manage categories"
  ON forum_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN forum_roles fr ON fr.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND fr.role = 'admin'
    )
  );

-- Add function to get category stats
CREATE OR REPLACE FUNCTION get_category_stats(category_id_param uuid)
RETURNS TABLE (
  total_topics bigint,
  total_replies bigint,
  last_post_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT t.id)::bigint as total_topics,
    COUNT(DISTINCT r.id)::bigint as total_replies,
    MAX(GREATEST(t.created_at, COALESCE(r.created_at, '1970-01-01'::timestamptz))) as last_post_at
  FROM forum_categories c
  LEFT JOIN forum_topics t ON t.category_id = c.id
  LEFT JOIN forum_replies r ON r.topic_id = t.id
  WHERE c.id = category_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit logging for category changes
CREATE OR REPLACE FUNCTION log_category_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_moderation_action(
      'create_category',
      'category',
      NEW.id,
      jsonb_build_object(
        'name', NEW.name,
        'is_private', NEW.is_private
      )
    );
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.name != OLD.name OR NEW.is_private != OLD.is_private THEN
      PERFORM log_moderation_action(
        'update_category',
        'category',
        NEW.id,
        jsonb_build_object(
          'old_name', OLD.name,
          'new_name', NEW.name,
          'old_private', OLD.is_private,
          'new_private', NEW.is_private
        )
      );
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_moderation_action(
      'delete_category',
      'category',
      OLD.id,
      jsonb_build_object(
        'name', OLD.name
      )
    );
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for category audit logging
CREATE TRIGGER log_category_changes
  AFTER INSERT OR UPDATE OR DELETE ON forum_categories
  FOR EACH ROW
  EXECUTE FUNCTION log_category_change();