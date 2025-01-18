/*
  # Fix RLS policies for profile creation

  1. Changes
    - Add policy to allow profile creation during signup
    - Add policy to allow profile updates by the owner
    - Add policy to allow reading all profiles for authenticated users

  2. Security
    - Ensures only authenticated users can read profiles
    - Ensures users can only update their own profiles
    - Allows profile creation during signup
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for users based on email"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);