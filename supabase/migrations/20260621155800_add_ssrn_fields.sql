-- Add SSRN Author ID and SSRN Abstract ID to board_members table
ALTER TABLE board_members
ADD COLUMN IF NOT EXISTS ssrn_author_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS ssrn_abstract_id VARCHAR(100);
