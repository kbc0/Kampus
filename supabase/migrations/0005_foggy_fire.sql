/*
  # Add messaging system
  
  1. New Tables
    - `conversations`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `participants` (uuid array)
    
    - `messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, references conversations)
      - `sender_id` (uuid, references profiles)
      - `content` (text)
      - `created_at` (timestamp)
      - `read` (boolean)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for conversation access
    - Add policies for message access
*/

-- Create conversations table
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  participants uuid[] NOT NULL,
  CONSTRAINT participants_length CHECK (array_length(participants, 1) = 2)
);

-- Create messages table
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  read boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies for conversations
CREATE POLICY "Users can view their conversations"
  ON conversations
  FOR SELECT
  USING (auth.uid() = ANY(participants));

CREATE POLICY "Users can create conversations"
  ON conversations
  FOR INSERT
  WITH CHECK (auth.uid() = ANY(participants));

-- Policies for messages
CREATE POLICY "Users can view messages in their conversations"
  ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = messages.conversation_id
      AND auth.uid() = ANY(participants)
    )
  );

CREATE POLICY "Users can insert messages in their conversations"
  ON messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
      AND auth.uid() = ANY(participants)
    )
    AND auth.uid() = sender_id
  );

-- Function to update conversation timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation timestamp on new message
CREATE TRIGGER update_conversation_timestamp
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();