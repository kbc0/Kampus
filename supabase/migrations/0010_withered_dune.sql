-- Add helper functions for conversation management

-- Function to get conversation between two users
CREATE OR REPLACE FUNCTION get_conversation_between_users(user1_id uuid, user2_id uuid)
RETURNS uuid AS $$
  SELECT c.id
  FROM conversations c
  JOIN conversation_participants cp1 ON cp1.conversation_id = c.id
  JOIN conversation_participants cp2 ON cp2.conversation_id = c.id
  WHERE cp1.profile_id = user1_id
  AND cp2.profile_id = user2_id
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to create conversation with participants in a transaction
CREATE OR REPLACE FUNCTION create_conversation_with_participants(user1_id uuid, user2_id uuid)
RETURNS uuid AS $$
DECLARE
  new_conversation_id uuid;
BEGIN
  -- Create new conversation
  INSERT INTO conversations DEFAULT VALUES
  RETURNING id INTO new_conversation_id;

  -- Add participants
  INSERT INTO conversation_participants (conversation_id, profile_id)
  VALUES
    (new_conversation_id, user1_id),
    (new_conversation_id, user2_id);

  RETURN new_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;