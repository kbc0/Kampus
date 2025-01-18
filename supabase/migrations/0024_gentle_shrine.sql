/*
  # Update Friendships RLS Policies

  1. Changes
    - Drop existing RLS policies for friendships table
    - Create new, more permissive policies that properly handle friend requests
    - Add policy for deleting friendships
  
  2. Security
    - Users can only view their own friendships
    - Users can send friend requests if no active request exists
    - Users can update friend requests they received
    - Users can delete friendships they're part of
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their friendships" ON friendships;
DROP POLICY IF EXISTS "Users can send friend requests" ON friendships;
DROP POLICY IF EXISTS "Users can update their received friend requests" ON friendships;
DROP POLICY IF EXISTS "Users can delete their friendships" ON friendships;

-- Create new policies
CREATE POLICY "Users can view their friendships"
  ON friendships FOR SELECT
  USING (auth.uid() IN (sender_id, receiver_id));

CREATE POLICY "Users can send friend requests"
  ON friendships FOR INSERT
  WITH CHECK (
    -- Must be authenticated
    auth.uid() IS NOT NULL
    -- Can only send requests as themselves
    AND auth.uid() = sender_id
    -- Cannot send request to themselves
    AND sender_id != receiver_id
    -- Cannot send request if active request exists
    AND NOT EXISTS (
      SELECT 1 FROM friendships f
      WHERE (
        (f.sender_id = sender_id AND f.receiver_id = receiver_id)
        OR 
        (f.sender_id = receiver_id AND f.receiver_id = sender_id)
      )
      AND f.status IN ('pending', 'accepted')
    )
  );

CREATE POLICY "Users can update received requests"
  ON friendships FOR UPDATE
  USING (
    -- Must be the request receiver
    auth.uid() = receiver_id
  );

CREATE POLICY "Users can delete their friendships"
  ON friendships FOR DELETE
  USING (auth.uid() IN (sender_id, receiver_id));