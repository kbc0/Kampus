/*
  # Fix Friendships RLS Policies

  1. Changes
    - Drop and recreate RLS policies with proper permissions
    - Fix policy conditions to avoid referencing NEW/OLD
    - Add explicit TO authenticated clauses
  
  2. Security
    - Users can only view their own friendships
    - Users can send friend requests if no active request exists
    - Users can update friend requests they received
    - Users can delete friendships they're part of
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their friendships" ON friendships;
DROP POLICY IF EXISTS "Users can send friend requests" ON friendships;
DROP POLICY IF EXISTS "Users can update received requests" ON friendships;
DROP POLICY IF EXISTS "Users can delete their friendships" ON friendships;

-- Create new policies
CREATE POLICY "Users can view their friendships"
  ON friendships FOR SELECT TO authenticated
  USING (auth.uid() IN (sender_id, receiver_id));

CREATE POLICY "Users can send friend requests"
  ON friendships FOR INSERT TO authenticated
  WITH CHECK (
    -- Must be the sender
    auth.uid() = sender_id
    -- Cannot send request to self
    AND sender_id != receiver_id
    -- Cannot send request if active request exists
    AND NOT EXISTS (
      SELECT 1 FROM friendships f
      WHERE (
        (f.sender_id = friendships.sender_id AND f.receiver_id = friendships.receiver_id)
        OR 
        (f.sender_id = friendships.receiver_id AND f.receiver_id = friendships.sender_id)
      )
      AND f.status IN ('pending', 'accepted')
    )
  );

CREATE POLICY "Users can update received requests"
  ON friendships FOR UPDATE TO authenticated
  USING (auth.uid() = receiver_id);

CREATE POLICY "Users can delete their friendships"
  ON friendships FOR DELETE TO authenticated
  USING (auth.uid() IN (sender_id, receiver_id));