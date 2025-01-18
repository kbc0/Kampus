-- Update friendships policies to make them publicly viewable
DROP POLICY IF EXISTS "Users can view their friendships" ON friendships;

CREATE POLICY "Anyone can view friendships"
  ON friendships FOR SELECT
  USING (
    -- Only show accepted friendships to everyone
    status = 'accepted'
    -- For pending/rejected friendships, only show to participants
    OR (
      status IN ('pending', 'rejected') 
      AND auth.uid() IN (sender_id, receiver_id)
    )
  );

-- Create function to get public friend count
CREATE OR REPLACE FUNCTION get_public_friend_count(user_id_param uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM friendships
    WHERE status = 'accepted'
    AND (sender_id = user_id_param OR receiver_id = user_id_param)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get public friends list
CREATE OR REPLACE FUNCTION get_public_friends(user_id_param uuid)
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
  AND f.status = 'accepted'
  ORDER BY p.name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;