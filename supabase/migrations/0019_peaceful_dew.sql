/*
  # Add Notifications System

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `type` (text) - message, reply, like, etc
      - `data` (jsonb) - flexible data structure for different notification types
      - `read` (boolean)
      - `created_at` (timestamp)
      
  2. Security
    - Enable RLS
    - Add policies for user access
*/

-- Create notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  data jsonb NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Create index for better performance
CREATE INDEX notifications_user_id_created_at_idx ON notifications(user_id, created_at DESC);

-- Function to create notification for new messages
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the other participant's ID
  WITH other_participant AS (
    SELECT profile_id
    FROM conversation_participants
    WHERE conversation_id = NEW.conversation_id
    AND profile_id != NEW.sender_id
    LIMIT 1
  )
  INSERT INTO notifications (user_id, type, data)
  SELECT 
    profile_id,
    'message',
    jsonb_build_object(
      'message_id', NEW.id,
      'conversation_id', NEW.conversation_id,
      'sender_id', NEW.sender_id,
      'content', substring(NEW.content, 1, 100),
      'sender_name', (SELECT name FROM profiles WHERE id = NEW.sender_id)
    )
  FROM other_participant;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new message notifications
CREATE TRIGGER on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION create_message_notification();

-- Function to create notification for new replies
CREATE OR REPLACE FUNCTION create_reply_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify the topic author
  INSERT INTO notifications (user_id, type, data)
  SELECT 
    t.author_id,
    'reply',
    jsonb_build_object(
      'reply_id', NEW.id,
      'topic_id', NEW.topic_id,
      'author_id', NEW.author_id,
      'content', substring(NEW.content, 1, 100),
      'author_name', (SELECT name FROM profiles WHERE id = NEW.author_id),
      'topic_title', t.title
    )
  FROM forum_topics t
  WHERE t.id = NEW.topic_id
  AND t.author_id != NEW.author_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new reply notifications
CREATE TRIGGER on_new_reply
  AFTER INSERT ON forum_replies
  FOR EACH ROW
  EXECUTE FUNCTION create_reply_notification();