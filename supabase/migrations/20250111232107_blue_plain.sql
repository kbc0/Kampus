-- Create group chats table
CREATE TABLE group_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  creator_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create group members table
CREATE TABLE group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES group_chats(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  left_at timestamptz,
  -- Create a partial unique index instead of a constraint
  UNIQUE(group_id, profile_id)
);

-- Create index to enforce uniqueness only for active members
CREATE UNIQUE INDEX idx_active_group_members 
ON group_members(group_id, profile_id) 
WHERE left_at IS NULL;

-- Create group messages table
CREATE TABLE group_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES group_chats(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create group message read status table
CREATE TABLE group_message_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES group_messages(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  read_at timestamptz DEFAULT now(),
  UNIQUE(message_id, profile_id)
);

-- Enable RLS
ALTER TABLE group_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_message_reads ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view groups they are members of"
  ON group_chats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = id
      AND profile_id = auth.uid()
      AND left_at IS NULL
    )
  );

CREATE POLICY "Users can create groups"
  ON group_chats FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Group members can view members"
  ON group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_id
      AND gm.profile_id = auth.uid()
      AND gm.left_at IS NULL
    )
  );

CREATE POLICY "Users can join groups"
  ON group_members FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can leave groups"
  ON group_members FOR UPDATE
  USING (profile_id = auth.uid());

CREATE POLICY "Group members can view messages"
  ON group_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = group_messages.group_id
      AND profile_id = auth.uid()
      AND left_at IS NULL
    )
  );

CREATE POLICY "Group members can send messages"
  ON group_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = group_messages.group_id
      AND profile_id = auth.uid()
      AND left_at IS NULL
    )
    AND auth.uid() = sender_id
  );

CREATE POLICY "Users can manage their read status"
  ON group_message_reads FOR ALL
  USING (profile_id = auth.uid());

-- Create function to create a group chat
CREATE OR REPLACE FUNCTION create_group_chat(
  name_param text,
  description_param text,
  initial_members uuid[]
)
RETURNS uuid AS $$
DECLARE
  new_group_id uuid;
BEGIN
  -- Create group
  INSERT INTO group_chats (name, description, creator_id)
  VALUES (name_param, description_param, auth.uid())
  RETURNING id INTO new_group_id;

  -- Add creator and initial members
  INSERT INTO group_members (group_id, profile_id)
  SELECT new_group_id, unnest(array_append(initial_members, auth.uid()));

  RETURN new_group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to add member to group
CREATE OR REPLACE FUNCTION add_group_member(
  group_id_param uuid,
  profile_id_param uuid
)
RETURNS void AS $$
BEGIN
  -- Verify caller is group member
  IF NOT EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = group_id_param
    AND profile_id = auth.uid()
    AND left_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Not authorized to add members to this group';
  END IF;

  -- Add new member
  INSERT INTO group_members (group_id, profile_id)
  VALUES (group_id_param, profile_id_param)
  ON CONFLICT (group_id, profile_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to remove member from group
CREATE OR REPLACE FUNCTION remove_group_member(
  group_id_param uuid,
  profile_id_param uuid
)
RETURNS void AS $$
BEGIN
  -- Verify caller is group member
  IF NOT EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = group_id_param
    AND profile_id = auth.uid()
    AND left_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Not authorized to remove members from this group';
  END IF;

  -- Remove member
  UPDATE group_members
  SET left_at = now()
  WHERE group_id = group_id_param
  AND profile_id = profile_id_param
  AND left_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to leave group
CREATE OR REPLACE FUNCTION leave_group(group_id_param uuid)
RETURNS void AS $$
BEGIN
  UPDATE group_members
  SET left_at = now()
  WHERE group_id = group_id_param
  AND profile_id = auth.uid()
  AND left_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get group details
CREATE OR REPLACE FUNCTION get_group_details(group_id_param uuid)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  creator_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  member_count bigint,
  members jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id,
    g.name,
    g.description,
    g.creator_id,
    g.created_at,
    g.updated_at,
    COUNT(DISTINCT gm.profile_id)::bigint as member_count,
    jsonb_agg(
      jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'avatar_url', p.avatar_url,
        'joined_at', gm.joined_at
      )
    ) as members
  FROM group_chats g
  JOIN group_members gm ON gm.group_id = g.id AND gm.left_at IS NULL
  JOIN profiles p ON p.id = gm.profile_id
  WHERE g.id = group_id_param
  AND EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = g.id
    AND profile_id = auth.uid()
    AND left_at IS NULL
  )
  GROUP BY g.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get group messages
CREATE OR REPLACE FUNCTION get_group_messages(
  group_id_param uuid,
  limit_param integer DEFAULT 50,
  before_timestamp timestamptz DEFAULT now()
)
RETURNS TABLE (
  id uuid,
  content text,
  created_at timestamptz,
  sender_id uuid,
  sender_name text,
  sender_avatar_url text,
  read_by jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.content,
    m.created_at,
    m.sender_id,
    p.name as sender_name,
    p.avatar_url as sender_avatar_url,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'profile_id', pr.profile_id,
          'read_at', pr.read_at
        )
      ) FILTER (WHERE pr.id IS NOT NULL),
      '[]'::jsonb
    ) as read_by
  FROM group_messages m
  JOIN profiles p ON p.id = m.sender_id
  LEFT JOIN group_message_reads pr ON pr.message_id = m.id
  WHERE m.group_id = group_id_param
  AND m.created_at < before_timestamp
  AND EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = m.group_id
    AND profile_id = auth.uid()
    AND left_at IS NULL
  )
  GROUP BY m.id, m.content, m.created_at, m.sender_id, p.name, p.avatar_url
  ORDER BY m.created_at DESC
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark messages as read
CREATE OR REPLACE FUNCTION mark_group_messages_read(group_id_param uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO group_message_reads (message_id, profile_id)
  SELECT m.id, auth.uid()
  FROM group_messages m
  WHERE m.group_id = group_id_param
  AND NOT EXISTS (
    SELECT 1 FROM group_message_reads
    WHERE message_id = m.id
    AND profile_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_group_chat(text, text, uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION add_group_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION remove_group_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION leave_group(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_group_details(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_group_messages(uuid, integer, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_group_messages_read(uuid) TO authenticated;