-- Run this SQL in your Supabase SQL Editor
-- Table: asia_index (ASIA Index Database)

CREATE TABLE IF NOT EXISTS public.asia_index (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  authors TEXT,
  abstract TEXT,
  keywords TEXT,
  journal_name TEXT,
  issn TEXT,
  year INTEGER,
  doi TEXT,
  source_url TEXT,
  pdf_url TEXT,
  origin TEXT DEFAULT 'web', -- 'internal' (from RJRAKP) or 'web' (discovered via search)
  
  -- Verification flags
  zenodo_verified BOOLEAN DEFAULT FALSE,
  orcid_verified BOOLEAN DEFAULT FALSE,
  scopus_verified BOOLEAN DEFAULT FALSE,
  crossref_verified BOOLEAN DEFAULT FALSE,
  has_abstract BOOLEAN DEFAULT FALSE,
  has_issn BOOLEAN DEFAULT FALSE,

  -- Rating
  asia_score INTEGER DEFAULT 0,
  asia_rating INTEGER DEFAULT 1, -- 1-5 stars

  indexed_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.asia_index ENABLE ROW LEVEL SECURITY;

-- Allow public read access (it's a public index)
CREATE POLICY "Public can read asia_index" ON public.asia_index
  FOR SELECT USING (true);

-- Only authenticated users (admins) can insert/update
CREATE POLICY "Authenticated can manage asia_index" ON public.asia_index
  FOR ALL USING (auth.role() = 'authenticated');

-- Index for fast search
CREATE INDEX IF NOT EXISTS asia_index_title_idx ON public.asia_index USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS asia_index_authors_idx ON public.asia_index USING gin(to_tsvector('english', coalesce(authors, '')));
CREATE INDEX IF NOT EXISTS asia_index_doi_idx ON public.asia_index(doi);
