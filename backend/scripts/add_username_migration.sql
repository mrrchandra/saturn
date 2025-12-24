-- Migration: Add username field to Users table
-- Date: 2025-12-25

-- Add username column (nullable initially for existing users)
ALTER TABLE Users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON Users(username);
