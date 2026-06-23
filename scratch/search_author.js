import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const rawUrl = process.env.VITE_SUPABASE_URL || '';
const envSupabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const baseUrlMatch = rawUrl.match(/https:\/\/[a-zA-Z0-9-]+\.supabase\.co/);
const supabaseUrl = baseUrlMatch ? baseUrlMatch[0] : (rawUrl.startsWith('http') ? rawUrl : 'https://abcdefghijklmnopqr.supabase.co');
const supabaseAnonKey = (envSupabaseAnonKey ? envSupabaseAnonKey.trim() : '') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

import ws from 'ws';
globalThis.WebSocket = ws;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Searching article_authors for 'Muhibbuddin'...");
  const { data: authors, error: err1 } = await supabase
    .from('article_authors')
    .select('*, articles(*)')
    .ilike('full_name', '%Muhibbuddin%');

  if (err1) {
    console.error("Error searching article_authors:", err1);
    return;
  }

  console.log(`Found ${authors.length} authors:`);
  for (const author of authors) {
    console.log(`\nAuthor ID: ${author.id}`);
    console.log(`Full Name: ${author.full_name}`);
    console.log(`ORCID ID: ${author.orcid_id}`);
    console.log(`SINTA ID: ${author.sinta_id}`);
    console.log(`Scopus ID: ${author.scopus_id}`);
    console.log(`Article Title: ${author.articles?.title}`);
    console.log(`Article ID: ${author.articles?.id}`);
    console.log(`Similarity Notes (raw):`, author.articles?.similarity_notes);
  }
}

run();
