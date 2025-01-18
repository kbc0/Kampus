/*
  # Create waitlist table
  
  1. New Tables
    - `waitlist`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `university` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policy for inserting entries
*/

-- Create waitlist table
CREATE TABLE waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  university text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting entries
CREATE POLICY "Anyone can join waitlist"
  ON waitlist FOR INSERT
  WITH CHECK (true);

-- Create policy for viewing entries (admin only)
CREATE POLICY "Only authenticated users can view waitlist"
  ON waitlist FOR SELECT
  TO authenticated
  USING (true);