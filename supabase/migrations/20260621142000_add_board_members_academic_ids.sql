-- Add academic profile ID columns to board_members table
ALTER TABLE board_members
ADD COLUMN sinta_id VARCHAR(100),
ADD COLUMN google_scholar_id VARCHAR(100),
ADD COLUMN orcid_id VARCHAR(100),
ADD COLUMN scopus_id VARCHAR(100),
ADD COLUMN wos_id VARCHAR(100);
