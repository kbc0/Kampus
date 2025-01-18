/*
  # Add Friendship System
  
  1. New Tables
    - `friendships` table for managing friend relationships
      - `id` (uuid, primary key)
      - `sender_id` (uuid, references profiles)
      - `receiver_id` (uuid, references profiles) 
      - `status` (text: pending/accepted/rejected)
      - `message` (text, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on friendships table
    - Add policies for viewing and managing friendships
    - Update message policies to only allow friends to message each other

  3. Notifications
    - Add triggers for friend request notifications
*/

-- Create friendships table
CREATE TABLE friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(sender_id, receiver_id)
);

-- Enable RLS
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their friendships"
  ON friendships FOR SELECT
  USING (auth.uid() IN (sender_id, receiver_id));

CREATE POLICY "Users can send friend requests"
  ON friendships FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received friend requests"
  ON friendships FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Create notification for friend requests
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

-- Update messages policy to only allow friends to message each other
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;
CREATE POLICY "Users can insert messages if they are friends"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN conversation_participants cp1 ON cp1.conversation_id = c.id
      JOIN conversation_participants cp2 ON cp2.conversation_id = c.id
      JOIN friendships f ON 
        (f.sender_id = cp1.profile_id AND f.receiver_id = cp2.profile_id) OR
        (f.sender_id = cp2.profile_id AND f.receiver_id = cp1.profile_id)
      WHERE c.id = messages.conversation_id
      AND cp1.profile_id = auth.uid()
      AND f.status = 'accepted'
    )
    AND auth.uid() = sender_id
  );

-- Create indexes for better performance
CREATE INDEX idx_friendships_sender_id ON friendships(sender_id);
CREATE INDEX idx_friendships_receiver_id ON friendships(receiver_id);
CREATE INDEX idx_friendships_status ON friendships(status);