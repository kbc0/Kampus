-- Add lifted_at column to user_bans table
ALTER TABLE user_bans 
ADD COLUMN IF NOT EXISTS lifted_at timestamptz;

-- Create index for better performance when checking active bans
CREATE INDEX IF NOT EXISTS idx_user_bans_active 
ON user_bans(user_id, lifted_at) 
WHERE lifted_at IS NULL;

-- Update existing bans where expires_at is in the past
UPDATE user_bans
SET lifted_at = now()
WHERE expires_at < now()
AND lifted_at IS NULL;