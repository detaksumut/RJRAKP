-- Tambahkan google_scholar_id ke tabel users
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_scholar_id VARCHAR(100);
