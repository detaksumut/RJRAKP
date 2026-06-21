-- Add ResearchGate ID to board_members table
ALTER TABLE board_members
ADD COLUMN IF NOT EXISTS researchgate_id VARCHAR(150);
