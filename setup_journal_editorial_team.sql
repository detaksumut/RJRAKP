-- ==========================================
-- SETUP TABEL TIM EDITORIAL JURNAL
-- ==========================================

-- 1. Buat tabel journal_editorial_team
CREATE TABLE IF NOT EXISTS public.journal_editorial_team (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  journal_id uuid REFERENCES public.journals(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL,
  affiliation text,
  image_url text,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.journal_editorial_team ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan (Policies) agar publik bisa melihat data tim editorial
DROP POLICY IF EXISTS "Public can view journal editorial team" ON public.journal_editorial_team;
CREATE POLICY "Public can view journal editorial team" 
ON public.journal_editorial_team 
FOR SELECT 
USING (true);

-- 4. Kebijakan (Policies) agar admin (authenticated user) bisa mengatur data tim editorial
DROP POLICY IF EXISTS "Admin can manage journal editorial team" ON public.journal_editorial_team;
CREATE POLICY "Admin can manage journal editorial team" 
ON public.journal_editorial_team 
FOR ALL 
USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');
