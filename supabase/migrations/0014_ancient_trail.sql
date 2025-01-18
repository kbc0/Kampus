/*
  # Forum System Setup

  1. New Tables
    - `forum_topics`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `author_id` (uuid, references profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `subject` (text)
      - `likes_count` (integer)
      - `replies_count` (integer)
      - `views_count` (integer)

    - `forum_replies`
      - `id` (uuid, primary key)
      - `topic_id` (uuid, references forum_topics)
      - `content` (text)
      - `author_id` (uuid, references profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `likes_count` (integer)

    - `forum_likes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `topic_id` (uuid, references forum_topics, nullable)
      - `reply_id` (uuid, references forum_replies, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for CRUD operations
*/

-- Create forum_topics table
CREATE TABLE forum_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  subject text NOT NULL,
  likes_count integer DEFAULT 0,
  replies_count integer DEFAULT 0,
  views_count integer DEFAULT 0
);

-- Create forum_replies table
CREATE TABLE forum_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid REFERENCES forum_topics(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  likes_count integer DEFAULT 0
);

-- Create forum_likes table
CREATE TABLE forum_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  topic_id uuid REFERENCES forum_topics(id) ON DELETE CASCADE,
  reply_id uuid REFERENCES forum_replies(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT one_target_only CHECK (
    (topic_id IS NOT NULL AND reply_id IS NULL) OR
    (topic_id IS NULL AND reply_id IS NOT NULL)
  ),
  UNIQUE(user_id, topic_id),
  UNIQUE(user_id, reply_id)
);

-- Enable RLS
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_likes ENABLE ROW LEVEL SECURITY;

-- Policies for forum_topics
CREATE POLICY "Anyone can view topics"
  ON forum_topics FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create topics"
  ON forum_topics FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authors can update their topics"
  ON forum_topics FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their topics"
  ON forum_topics FOR DELETE
  USING (auth.uid() = author_id);

-- Policies for forum_replies
CREATE POLICY "Anyone can view replies"
  ON forum_replies FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create replies"
  ON forum_replies FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authors can update their replies"
  ON forum_replies FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their replies"
  ON forum_replies FOR DELETE
  USING (auth.uid() = author_id);

-- Policies for forum_likes
CREATE POLICY "Anyone can view likes"
  ON forum_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage their likes"
  ON forum_likes FOR ALL
  USING (auth.uid() = user_id);

-- Functions for managing counts
CREATE OR REPLACE FUNCTION update_topic_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_topics
    SET replies_count = replies_count + 1
    WHERE id = NEW.topic_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_topics
    SET replies_count = replies_count - 1
    WHERE id = OLD.topic_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_like_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.topic_id IS NOT NULL THEN
      UPDATE forum_topics
      SET likes_count = likes_count + 1
      WHERE id = NEW.topic_id;
    ELSE
      UPDATE forum_replies
      SET likes_count = likes_count + 1
      WHERE id = NEW.reply_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.topic_id IS NOT NULL THEN
      UPDATE forum_topics
      SET likes_count = likes_count - 1
      WHERE id = OLD.topic_id;
    ELSE
      UPDATE forum_replies
      SET likes_count = likes_count - 1
      WHERE id = OLD.reply_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER update_topic_reply_count
  AFTER INSERT OR DELETE ON forum_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_topic_counts();

CREATE TRIGGER update_like_count
  AFTER INSERT OR DELETE ON forum_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_like_counts();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_topic_views(topic_id_param uuid)
RETURNS void AS $$
BEGIN
  UPDATE forum_topics
  SET views_count = views_count + 1
  WHERE id = topic_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;