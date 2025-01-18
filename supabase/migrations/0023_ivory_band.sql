/*
  # Add friendship helper functions and notifications
  
  1. Functions Added:
    - are_friends: Check if two users are friends
    - get_friendship_status: Get current friendship status between users
    - get_user_friends: Get list of user's friends
    - create_friend_request_notification: Handle friendship notifications
    
  2. Changes:
    - Update conversation creation to require friendship
    - Add notification triggers for friend requests
*/

-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_friendship_change ON friendships;

-- Function to check if users are friends
CREATE OR REPLACE FUNCTION are_friends(user1_id uuid, user2_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM friendships
    WHERE status = 'accepted'
    AND (
      (sender_id = user1_id AND receiver_id = user2_id)
      OR
      (sender_id = user2_id AND receiver_id = user1_id)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get friendship status
CREATE OR REPLACE FUNCTION get_friendship_status(user1_id uuid, user2_id uuid)
RETURNS TABLE (
  friendship_id uuid,
  status text,
  sender_id uuid,
  receiver_id uuid
) AS $$
BEGIN
  RETURN QUERY
  SELECT f.id, f.status, f.sender_id, f.receiver_id
  FROM friendships f
  WHERE (f.sender_id = user1_id AND f.receiver_id = user2_id)
     OR (f.sender_id = user2_id AND f.receiver_id = user1_id)
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's friends
CREATE OR REPLACE FUNCTION get_user_friends(user_id_param uuid)
RETURNS TABLE (
  friend_id uuid,
  name text,
  university text,
  avatar_url text,
  friendship_id uuid
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN f.sender_id = user_id_param THEN p.id
      ELSE f.sender_id
    END as friend_id,
    p.name,
    p.university,
    p.avatar_url,
    f.id as friendship_id
  FROM friendships f
  JOIN profiles p ON (
    CASE 
      WHEN f.sender_id = user_id_param THEN f.receiver_id = p.id
      ELSE f.sender_id = p.id
    END
  )
  WHERE (f.sender_id = user_id_param OR f.receiver_id = user_id_param)
  AND f.status = 'accepted';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification for friend requests
CREATE OR REPLACE FUNCTION create_friend_request_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'pending' THEN
    INSERT INTO notifications (user_id, type, data)
    VALUES (
      NEW.receiver_id,
      'friend_request',
      jsonb_build_object(
        'friendship_id', NEW.id,
        'sender_id', NEW.sender_id,
        'sender_name', (SELECT name FROM profiles WHERE id = NEW.sender_id),
        'message', NEW.message
      )
    );
  ELSIF NEW.status = 'accepted' THEN
    INSERT INTO notifications (user_id, type, data)
    VALUES (
      NEW.sender_id,
      'friend_request_accepted',
      jsonb_build_object(
        'friendship_id', NEW.id,
        'receiver_id', NEW.receiver_id,
        'receiver_name', (SELECT name FROM profiles WHERE id = NEW.receiver_id)
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for friend request notifications
CREATE TRIGGER on_friendship_change
  AFTER INSERT OR UPDATE ON friendships
  FOR EACH ROW
  EXECUTE FUNCTION create_friend_request_notification();

-- Update conversation creation to require friendship
CREATE OR REPLACE FUNCTION create_conversation_with_participants(user1_id uuid, user2_id uuid)
RETURNS uuid AS $$
DECLARE
  new_conversation_id uuid;
BEGIN
  -- Check if users are friends
  IF NOT are_friends(user1_id, user2_id) THEN
    RAISE EXCEPTION 'Users must be friends to start a conversation';
  END IF;

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