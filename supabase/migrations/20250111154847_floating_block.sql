/*
  # Forum Access Control System

  1. New Tables
    - forum_roles (role definitions)
    - user_roles (user-role assignments)
    - forum_categories (forum organization)
    - forum_moderators (section-specific moderator assignments)
    - forum_announcements (system-wide announcements)
    
  2. Security
    - RLS policies for each role
    - Function-based access control
    - Audit logging
*/

-- Create enum for role types
CREATE TYPE forum_role AS ENUM ('admin', 'moderator', 'user');

-- Create roles table
CREATE TABLE forum_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role forum_role NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user roles table
CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role_id uuid REFERENCES forum_roles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- Create forum categories table
CREATE TABLE forum_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  slug text UNIQUE NOT NULL,
  parent_id uuid REFERENCES forum_categories(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  is_private boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create forum moderators table
CREATE TABLE forum_moderators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  category_id uuid REFERENCES forum_categories(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category_id)
);

-- Create forum announcements table
CREATE TABLE forum_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  starts_at timestamptz DEFAULT now(),
  ends_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add role-related columns to existing tables
ALTER TABLE forum_topics
ADD COLUMN is_pinned boolean DEFAULT false,
ADD COLUMN is_locked boolean DEFAULT false,
ADD COLUMN category_id uuid REFERENCES forum_categories(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE forum_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_announcements ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN forum_roles fr ON fr.id = ur.role_id
    WHERE ur.user_id = $1 AND fr.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is moderator
CREATE OR REPLACE FUNCTION is_moderator(user_id uuid, category_id uuid DEFAULT NULL)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN forum_roles fr ON fr.id = ur.role_id
    LEFT JOIN forum_moderators fm ON fm.user_id = ur.user_id
    WHERE ur.user_id = $1 
    AND (
      fr.role = 'moderator'
      AND (
        category_id IS NULL 
        OR fm.category_id = category_id
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has permission
CREATE OR REPLACE FUNCTION has_permission(user_id uuid, required_role forum_role)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN forum_roles fr ON fr.id = ur.role_id
    WHERE ur.user_id = $1
    AND CASE 
      WHEN required_role = 'admin' THEN fr.role = 'admin'
      WHEN required_role = 'moderator' THEN fr.role IN ('admin', 'moderator')
      ELSE true -- 'user' role or any authenticated user
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for forum_roles
CREATE POLICY "Anyone can view roles"
  ON forum_roles FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage roles"
  ON forum_roles FOR ALL
  USING (is_admin(auth.uid()));

-- Policies for user_roles
CREATE POLICY "Users can view roles"
  ON user_roles FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage user roles"
  ON user_roles FOR ALL
  USING (is_admin(auth.uid()));

-- Policies for forum_categories
CREATE POLICY "Anyone can view public categories"
  ON forum_categories FOR SELECT
  USING (NOT is_private OR is_admin(auth.uid()) OR is_moderator(auth.uid(), id));

CREATE POLICY "Only admins can manage categories"
  ON forum_categories FOR ALL
  USING (is_admin(auth.uid()));

-- Policies for forum_moderators
CREATE POLICY "Anyone can view moderators"
  ON forum_moderators FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage moderators"
  ON forum_moderators FOR ALL
  USING (is_admin(auth.uid()));

-- Policies for forum_announcements
CREATE POLICY "Anyone can view active announcements"
  ON forum_announcements FOR SELECT
  USING (
    is_active 
    AND (starts_at IS NULL OR starts_at <= now()) 
    AND (ends_at IS NULL OR ends_at > now())
  );

CREATE POLICY "Only admins can manage announcements"
  ON forum_announcements FOR ALL
  USING (is_admin(auth.uid()));

-- Update forum_topics policies
DROP POLICY IF EXISTS "Anyone can view topics" ON forum_topics;
DROP POLICY IF EXISTS "Authenticated users can create topics" ON forum_topics;
DROP POLICY IF EXISTS "Authors can update their topics" ON forum_topics;
DROP POLICY IF EXISTS "Authors can delete their topics" ON forum_topics;

CREATE POLICY "Users can view topics in accessible categories"
  ON forum_topics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM forum_categories fc
      WHERE fc.id = forum_topics.category_id
      AND (
        NOT fc.is_private 
        OR is_admin(auth.uid())
        OR is_moderator(auth.uid(), fc.id)
      )
    )
  );

CREATE POLICY "Authenticated users can create topics in accessible categories"
  ON forum_topics FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM forum_categories fc
      WHERE fc.id = category_id
      AND (
        NOT fc.is_private 
        OR is_admin(auth.uid())
        OR is_moderator(auth.uid(), fc.id)
      )
    )
  );

CREATE POLICY "Authors and moderators can update topics"
  ON forum_topics FOR UPDATE
  USING (
    auth.uid() = author_id
    OR is_admin(auth.uid())
    OR is_moderator(auth.uid(), category_id)
  );

CREATE POLICY "Authors and moderators can delete topics"
  ON forum_topics FOR DELETE
  USING (
    auth.uid() = author_id
    OR is_admin(auth.uid())
    OR is_moderator(auth.uid(), category_id)
  );

-- Insert default roles
INSERT INTO forum_roles (role, description) VALUES
  ('admin', 'Full system access and control'),
  ('moderator', 'Moderation capabilities in assigned sections'),
  ('user', 'Basic forum access and participation');

-- Create audit log for moderation actions
CREATE TABLE forum_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL,
  action_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action_on uuid, -- ID of affected resource
  resource_type text NOT NULL,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE forum_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins and moderators can view audit log
CREATE POLICY "Admins and moderators can view audit log"
  ON forum_audit_log FOR SELECT
  USING (
    is_admin(auth.uid())
    OR is_moderator(auth.uid())
  );

-- Function to log moderation actions
CREATE OR REPLACE FUNCTION log_moderation_action(
  action_type text,
  resource_type text,
  resource_id uuid,
  details jsonb DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO forum_audit_log (
    action_type,
    action_by,
    action_on,
    resource_type,
    details
  ) VALUES (
    action_type,
    auth.uid(),
    resource_id,
    resource_type,
    details
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;