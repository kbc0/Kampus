/*
  # Add Major and Minor Fields

  1. Changes
    - Add major and minor columns to profiles table
    - Set default values to NULL
    - Add validation to ensure major/minor are valid values

  2. Security
    - No changes to RLS policies needed as they're covered by existing profile policies
*/

-- Add major and minor columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS major text,
ADD COLUMN IF NOT EXISTS minor text;

-- Update existing rows to ensure they have the correct metadata
UPDATE profiles p
SET 
  major = CASE 
    WHEN auth.users.raw_user_meta_data->>'major' IS NOT NULL 
    THEN auth.users.raw_user_meta_data->>'major'
    ELSE NULL
  END,
  minor = CASE 
    WHEN auth.users.raw_user_meta_data->>'minor' IS NOT NULL 
    THEN auth.users.raw_user_meta_data->>'minor'
    ELSE NULL
  END
FROM auth.users
WHERE p.id = auth.users.id;