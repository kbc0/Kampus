/*
  # Create friendships system with proper UUID handling
  
  1. New Tables
    - `friendships` table for managing friend connections
      - `id` (uuid, primary key)
      - `sender_id` (uuid, references profiles)
      - `receiver_id` (uuid, references profiles) 
      - `status` (text, enum: pending/accepted/rejected)
      - `message` (text, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on friendships table
    - Add policies for viewing and managing friendships
    - Add indexes for better performance
    - Handle duplicate friendships using created_at timestamp
*/

-- Create friendships table if it doesn't exist
CREATE TABLE IF NOT EXISTS friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT different_users CHECK (sender_id != receiver_id)
);

-- Enable RLS
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Clean up duplicate friendships before creating unique index
DO $$
BEGIN
  -- Delete duplicates keeping only the oldest record
  DELETE FROM friendships f1
  WHERE EXISTS (
    SELECT 1
    FROM friendships f2
    WHERE LEAST(f2.sender_id, f2.receiver_id) = LEAST(f1.sender_id, f1.receiver_id)
    AND GREATEST(f2.sender_id, f2.receiver_id) = GREATEST(f1.sender_id, f1.receiver_id)
    AND f2.status IN ('pending', 'accepted')
    AND f1.status IN ('pending', 'accepted')
    AND f2.created_at < f1.created_at
  );
END $$;

-- Drop existing policies to ensure clean state
DROP POLICY IF EXISTS "Users can view their friendships" ON friendships;
DROP POLICY IF EXISTS "Users can send friend requests" ON friendships;
DROP POLICY IF EXISTS "Users can update their received friend requests" ON friendships;
DROP POLICY IF EXISTS "Users can delete their friendships" ON friendships;

-- Create policies
CREATE POLICY "Users can view their friendships"
  ON friendships FOR SELECT
  USING (auth.uid() IN (sender_id, receiver_id));

CREATE POLICY "Users can send friend requests"
  ON friendships FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    NOT EXISTS (
      SELECT 1 FROM friendships f
      WHERE (f.sender_id = auth.uid() AND f.receiver_id = receiver_id)
         OR (f.sender_id = receiver_id AND f.receiver_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their received friend requests"
  ON friendships FOR UPDATE TO authenticated
  USING (auth.uid() = receiver_id);

CREATE POLICY "Users can delete their friendships"
  ON friendships FOR DELETE TO authenticated
  USING (auth.uid() IN (sender_id, receiver_id));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_friendships_sender_id ON friendships(sender_id);
CREATE INDEX IF NOT EXISTS idx_friendships_receiver_id ON friendships(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);
CREATE INDEX IF NOT EXISTS idx_friendships_created_at ON friendships(created_at DESC);

-- Create unique index to prevent duplicate friendships
DROP INDEX IF EXISTS idx_unique_active_friendship;
CREATE UNIQUE INDEX idx_unique_active_friendship 
ON friendships (
  LEAST(sender_id, receiver_id),
  GREATEST(sender_id, receiver_id)
)
WHERE status IN ('pending', 'accepted');