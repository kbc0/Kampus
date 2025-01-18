-- Fix is_admin function parameter name
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN forum_roles fr ON fr.id = ur.role_id
    WHERE ur.user_id = user_id
    AND fr.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add is_moderator function with consistent parameter naming
CREATE OR REPLACE FUNCTION is_moderator(user_id uuid, category_id uuid DEFAULT NULL)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN forum_roles fr ON fr.id = ur.role_id
    LEFT JOIN forum_moderators fm ON fm.user_id = ur.user_id
    WHERE ur.user_id = user_id
    AND (
      fr.role IN ('admin', 'moderator')
      AND (
        category_id IS NULL 
        OR fm.category_id = category_id
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add has_permission function with consistent parameter naming
CREATE OR REPLACE FUNCTION has_permission(user_id uuid, required_role forum_role)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN forum_roles fr ON fr.id = ur.role_id
    WHERE ur.user_id = user_id
    AND CASE 
      WHEN required_role = 'admin' THEN fr.role = 'admin'
      WHEN required_role = 'moderator' THEN fr.role IN ('admin', 'moderator')
      ELSE true -- 'user' role or any authenticated user
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;