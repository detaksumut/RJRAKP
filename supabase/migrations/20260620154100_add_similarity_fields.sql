-- Tambahkan kolom-kolom baru ke tabel articles
ALTER TABLE articles ADD COLUMN IF NOT EXISTS similarity_score INTEGER;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS largest_match INTEGER;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS similarity_status VARCHAR(50);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS similarity_report_url TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS similarity_notes TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS similarity_checked_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS similarity_checked_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS peer_review_status VARCHAR(50) DEFAULT 'PENDING';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_open_access BOOLEAN DEFAULT TRUE;


-- Buat tabel article_similarity_sources
CREATE TABLE IF NOT EXISTS article_similarity_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    source_name TEXT NOT NULL,
    source_percent INTEGER NOT NULL,
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) untuk tabel article_similarity_sources
ALTER TABLE article_similarity_sources ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses: Semua orang bisa membaca data sumber
CREATE POLICY "Allow public read access to article_similarity_sources" 
    ON article_similarity_sources
    FOR SELECT 
    USING (true);

-- Kebijakan Akses: Pengguna terotentikasi (admin/editor) bisa melakukan CRUD data sumber
CREATE POLICY "Allow authenticated users to manage article_similarity_sources" 
    ON article_similarity_sources
    FOR ALL 
    USING (auth.role() = 'authenticated');
