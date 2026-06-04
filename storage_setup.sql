-- ==========================================
-- SETUP BUCKET DAN POLICIES DI SUPABASE SQL EDITOR
-- ==========================================

-- 1. Buat bucket baru bernama 'manuscripts' jika belum ada
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'manuscripts', 
  'manuscripts', 
  true, 
  10485760, -- Limit 10MB
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Kebijakan (Policies) agar dokumen dapat dibaca secara publik oleh Reviewer / Pembaca
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT USING (bucket_id = 'manuscripts');

-- 3. Kebijakan (Policies) agar User terautentikasi (Author) dapat mengunggah (upload) dokumen
DROP POLICY IF EXISTS "Auth Upload Access" ON storage.objects;
CREATE POLICY "Auth Upload Access" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'manuscripts' AND auth.role() = 'authenticated'
);

-- 4. Kebijakan (Policies) agar User dapat memperbarui (update) dokumen sendiri
DROP POLICY IF EXISTS "Auth Update Access" ON storage.objects;
CREATE POLICY "Auth Update Access" ON storage.objects FOR UPDATE USING (
  bucket_id = 'manuscripts' AND auth.role() = 'authenticated'
);

-- 5. Kebijakan (Policies) agar User dapat menghapus (delete) dokumen sendiri
DROP POLICY IF EXISTS "Auth Delete Access" ON storage.objects;
CREATE POLICY "Auth Delete Access" ON storage.objects FOR DELETE USING (
  bucket_id = 'manuscripts' AND auth.role() = 'authenticated'
);
