-- Tambahkan ID eksternal ke tabel users
ALTER TABLE users ADD COLUMN IF NOT EXISTS orcid_id VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS scopus_id VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS wos_id VARCHAR(100);

-- Tambahkan ID eksternal ke reviewer_profiles
ALTER TABLE reviewer_profiles ADD COLUMN IF NOT EXISTS scopus_id VARCHAR(100);
ALTER TABLE reviewer_profiles ADD COLUMN IF NOT EXISTS wos_id VARCHAR(100);

-- Tambahkan ID eksternal ke editor_profiles
ALTER TABLE editor_profiles ADD COLUMN IF NOT EXISTS scopus_id VARCHAR(100);
ALTER TABLE editor_profiles ADD COLUMN IF NOT EXISTS wos_id VARCHAR(100);

-- Tambahkan ID eksternal ke article_authors
ALTER TABLE article_authors ADD COLUMN IF NOT EXISTS scopus_id VARCHAR(100);
ALTER TABLE article_authors ADD COLUMN IF NOT EXISTS wos_id VARCHAR(100);
