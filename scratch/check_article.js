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
  const articleId = '0f029f0a-7cdb-49b2-b3af-1c3251e91b2f';
  console.log(`Checking article ${articleId}...`);

  // Fetch article
  const { data: article, error: err1 } = await supabase
    .from('articles')
    .select('*')
    .eq('id', articleId)
    .single();

  if (err1) {
    console.error("Error fetching article:", err1);
  } else {
    console.log("Article similarity_notes:", article.similarity_notes);
    console.log("Article similarity_score:", article.similarity_score);
    console.log("Article similarity_status:", article.similarity_status);
  }

  // Fetch authors
  const { data: authors, error: err2 } = await supabase
    .from('article_authors')
    .select('*')
    .eq('article_id', articleId);

  if (err2) {
    console.error("Error fetching authors:", err2);
  } else {
    console.log("Authors:", authors);
  }
}

run();
