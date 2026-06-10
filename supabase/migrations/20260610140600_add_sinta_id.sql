-- Tambahkan sinta_id ke tabel users
ALTER TABLE users ADD COLUMN IF NOT EXISTS sinta_id VARCHAR(100);

-- Tambahkan sinta_id ke reviewer_profiles
ALTER TABLE reviewer_profiles ADD COLUMN IF NOT EXISTS sinta_id VARCHAR(100);

-- Tambahkan sinta_id ke editor_profiles
ALTER TABLE editor_profiles ADD COLUMN IF NOT EXISTS sinta_id VARCHAR(100);

-- Tambahkan sinta_id ke article_authors
ALTER TABLE article_authors ADD COLUMN IF NOT EXISTS sinta_id VARCHAR(100);
