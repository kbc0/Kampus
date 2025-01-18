/*
  # Add avatar URL support
  
  1. Changes
    - Add avatar_url column to profiles table
    - Update existing profiles with avatar_url from user metadata
  
  2. Security
    - No changes to RLS policies needed as they're inherited
*/

-- Add avatar_url column
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url text;

-- Update existing profiles with avatar_url from user metadata
UPDATE profiles p
SET avatar_url = (au.raw_user_meta_data->>'avatar_url')::text
FROM auth.users au
WHERE p.id = au.id
AND au.raw_user_meta_data->>'avatar_url' IS NOT NULL;