/*
  # Add created_at to profiles table
  
  1. Changes
    - Add created_at column to profiles table
    - Set default value to now()
    - Backfill existing rows with auth.users created_at
*/

-- Add created_at column with default value
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Update existing profiles with auth user created_at
UPDATE profiles p
SET created_at = au.created_at
FROM auth.users au
WHERE p.id = au.id;