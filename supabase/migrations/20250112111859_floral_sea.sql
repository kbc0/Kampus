-- Enable storage if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create storage bucket for cover images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for cover images
CREATE POLICY "Cover images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'covers');

CREATE POLICY "Users can upload their own cover image"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'covers' AND
  auth.uid() = owner
);

CREATE POLICY "Users can update their own cover image"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'covers' AND
  auth.uid() = owner
);

CREATE POLICY "Users can delete their own cover image"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'covers' AND
  auth.uid() = owner
);