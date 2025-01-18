/*
  # Add subjects column to profiles table

  1. Changes
    - Add JSONB `subjects` column to profiles table to store user subject preferences
      - Structure: { canHelp: string[], needsHelp: string[] }
    - Add default empty object for subjects column
    - Update existing rows with default subjects structure

  2. Security
    - Maintain existing RLS policies
*/

-- Add subjects column with default empty JSONB object
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subjects JSONB DEFAULT '{"canHelp": [], "needsHelp": []}';

-- Update existing rows to ensure they have the correct structure
UPDATE profiles 
SET subjects = '{"canHelp": [], "needsHelp": []}'
WHERE subjects IS NULL;

-- Add check constraint to ensure subjects follows the expected structure
ALTER TABLE profiles
ADD CONSTRAINT subjects_structure_check 
CHECK (
  (subjects->>'canHelp') IS NOT NULL 
  AND (subjects->>'needsHelp') IS NOT NULL 
  AND jsonb_typeof(subjects->'canHelp') = 'array'
  AND jsonb_typeof(subjects->'needsHelp') = 'array'
);