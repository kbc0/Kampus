-- Create enum for role types if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'forum_role') THEN
    CREATE TYPE forum_role AS ENUM ('admin', 'moderator', 'user');
  END IF;
END $$;

-- Create forum_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS forum_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role forum_role NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create unique index on role column
CREATE UNIQUE INDEX IF NOT EXISTS forum_roles_role_key ON forum_roles(role);

-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role_id uuid REFERENCES forum_roles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view roles" ON user_roles;
DROP POLICY IF EXISTS "Only admins can manage user roles" ON user_roles;

-- Create more permissive policies for user_roles
CREATE POLICY "Anyone can view user roles"
  ON user_roles FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage user roles"
  ON user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN forum_roles fr ON fr.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND fr.role = 'admin'
    )
  );

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id_param uuid)
RETURNS forum_role AS $$
DECLARE
  user_role forum_role;
BEGIN
  SELECT fr.role INTO user_role
  FROM user_roles ur
  JOIN forum_roles fr ON fr.id = ur.role_id
  WHERE ur.user_id = user_id_param
  LIMIT 1;

  RETURN COALESCE(user_role, 'user'::forum_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default roles
DO $$ 
BEGIN
  -- Insert admin role
  INSERT INTO forum_roles (role, description)
  VALUES ('admin', 'Full system access and control')
  ON CONFLICT (role) DO NOTHING;

  -- Insert moderator role
  INSERT INTO forum_roles (role, description)
  VALUES ('moderator', 'Moderation capabilities in assigned sections')
  ON CONFLICT (role) DO NOTHING;

  -- Insert user role
  INSERT INTO forum_roles (role, description)
  VALUES ('user', 'Basic forum access and participation')
  ON CONFLICT (role) DO NOTHING;
END $$;

-- Assign admin role to the specified user
DO $$ 
DECLARE
  admin_role_id uuid;
BEGIN
  -- Get admin role id
  SELECT id INTO admin_role_id
  FROM forum_roles
  WHERE role = 'admin';

  -- Assign admin role to user if not already assigned
  INSERT INTO user_roles (user_id, role_id)
  VALUES ('a61081bc-bc65-4331-8aee-2daaa246d476', admin_role_id)
  ON CONFLICT (user_id, role_id) DO NOTHING;
END $$;