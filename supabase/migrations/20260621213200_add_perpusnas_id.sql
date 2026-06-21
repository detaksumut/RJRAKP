-- Add Perpusnas ID/Query to board_members table
ALTER TABLE board_members
ADD COLUMN IF NOT EXISTS perpusnas_id VARCHAR(255);
