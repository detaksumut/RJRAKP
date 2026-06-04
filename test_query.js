import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing environment variables!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id, 
      title, 
      abstract, 
      keywords, 
      manuscript_file, 
      slug, 
      created_at, 
      status,
      article_authors (full_name, affiliation, email, is_corresponding, author_order),
      journals (id, name, p_issn, e_issn, publisher, slug),
      publications (id, doi, pdf_url, volume_number, issue_number, publication_date)
    `)
    .limit(1);

  if (error) {
    console.error("Supabase Error:", error);
  } else {
    console.log("Success. Data length:", data.length);
  }
}

testQuery();
