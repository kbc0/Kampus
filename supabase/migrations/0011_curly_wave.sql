-- Add function to get conversation participants with profiles
CREATE OR REPLACE FUNCTION get_conversation_participants(conversation_id_param uuid)
RETURNS TABLE (
  profile_id uuid,
  name text,
  university text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as profile_id,
    p.name,
    p.university
  FROM conversation_participants cp
  JOIN profiles p ON p.id = cp.profile_id
  WHERE cp.conversation_id = conversation_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update conversation query function to handle no results
CREATE OR REPLACE FUNCTION get_conversation_between_users(user1_id uuid, user2_id uuid)
RETURNS uuid AS $$
DECLARE
  conv_id uuid;
BEGIN
  SELECT c.id INTO conv_id
  FROM conversations c
  JOIN conversation_participants cp1 ON cp1.conversation_id = c.id
  JOIN conversation_participants cp2 ON cp2.conversation_id = c.id
  WHERE (cp1.profile_id = user1_id AND cp2.profile_id = user2_id)
     OR (cp1.profile_id = user2_id AND cp2.profile_id = user1_id)
  LIMIT 1;
  
  RETURN conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;