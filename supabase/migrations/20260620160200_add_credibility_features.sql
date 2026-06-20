-- Tambahkan kolom AI Disclosure ke tabel articles
ALTER TABLE articles ADD COLUMN IF NOT EXISTS ai_disclosure_type VARCHAR(100) DEFAULT 'none';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS ai_disclosure_statement TEXT;

-- Buat tabel article_versions untuk version history naskah
CREATE TABLE IF NOT EXISTS article_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    abstract TEXT NOT NULL,
    abstract_en TEXT,
    manuscript_file TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS untuk tabel article_versions
ALTER TABLE article_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to article_versions" 
    ON article_versions FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage article_versions" 
    ON article_versions FOR ALL USING (auth.role() = 'authenticated');

-- Buat tabel article_editorial_history untuk log audit editorial
CREATE TABLE IF NOT EXISTS article_editorial_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    actor_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS untuk tabel article_editorial_history
ALTER TABLE article_editorial_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to article_editorial_history" 
    ON article_editorial_history FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage article_editorial_history" 
    ON article_editorial_history FOR ALL USING (auth.role() = 'authenticated');
