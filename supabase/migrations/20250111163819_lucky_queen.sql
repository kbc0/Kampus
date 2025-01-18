-- First drop dependent policies
DROP POLICY IF EXISTS "Only admins can manage roles" ON forum_roles;
DROP POLICY IF EXISTS "Anyone can view public categories" ON forum_categories;
DROP POLICY IF EXISTS "Only admins can manage categories" ON forum_categories;
DROP POLICY IF EXISTS "Only admins can manage moderators" ON forum_moderators;
DROP POLICY IF EXISTS "Only admins can manage announcements" ON forum_announcements;
DROP POLICY IF EXISTS "Admins and moderators can view audit log" ON forum_audit_log;

-- Now we can safely drop and recreate the functions
DROP FUNCTION IF EXISTS is_admin(uuid);
DROP FUNCTION IF EXISTS is_moderator(uuid, uuid);
DROP FUNCTION IF EXISTS has_permission(uuid, forum_role);

-- Recreate functions with proper parameter names for RPC
CREATE OR REPLACE FUNCTION is_admin(user_id_param uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN forum_roles fr ON fr.id = ur.role_id
    WHERE ur.user_id = user_id_param
    AND fr.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add is_moderator function with proper parameter names
CREATE OR REPLACE FUNCTION is_moderator(user_id_param uuid, category_id_param uuid DEFAULT NULL)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN forum_roles fr ON fr.id = ur.role_id
    LEFT JOIN forum_moderators fm ON fm.user_id = ur.user_id
    WHERE ur.user_id = user_id_param
    AND (
      fr.role IN ('admin', 'moderator')
      AND (
        category_id_param IS NULL 
        OR fm.category_id = category_id_param
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add has_permission function with proper parameter names
CREATE OR REPLACE FUNCTION has_permission(user_id_param uuid, required_role_param forum_role)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN forum_roles fr ON fr.id = ur.role_id
    WHERE ur.user_id = user_id_param
    AND CASE 
      WHEN required_role_param = 'admin' THEN fr.role = 'admin'
      WHEN required_role_param = 'moderator' THEN fr.role IN ('admin', 'moderator')
      ELSE true -- 'user' role or any authenticated user
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_moderator(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION has_permission(uuid, forum_role) TO authenticated;

-- Recreate the policies that were dropped
CREATE POLICY "Only admins can manage roles"
  ON forum_roles FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view public categories"
  ON forum_categories FOR SELECT
  USING (NOT is_private OR is_admin(auth.uid()) OR is_moderator(auth.uid(), id));

CREATE POLICY "Only admins can manage categories"
  ON forum_categories FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can manage moderators"
  ON forum_moderators FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can manage announcements"
  ON forum_announcements FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins and moderators can view audit log"
  ON forum_audit_log FOR SELECT
  USING (is_admin(auth.uid()) OR is_moderator(auth.uid()));