import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const rawUrl = process.env.VITE_SUPABASE_URL || '';
const envSupabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const baseUrlMatch = rawUrl.match(/https:\/\/[a-zA-Z0-9-]+\.supabase\.co/);
const supabaseUrl = baseUrlMatch ? baseUrlMatch[0] : (rawUrl.startsWith('http') ? rawUrl : 'https://abcdefghijklmnopqr.supabase.co');
const supabaseAnonKey = (envSupabaseAnonKey ? envSupabaseAnonKey.trim() : '') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3BxciIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjE2MDcxOTYwLCJleHAiOjE5MzE2NDc5NjB9.placeholder_key';

import ws from 'ws';
globalThis.WebSocket = ws;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const tables = [
    'users',
    'reviewer_profiles',
    'editor_profiles',
    'journals',
    'journal_scopes',
    'journal_volumes',
    'journal_issues',
    'articles',
    'article_authors',
    'review_assignments',
    'reviews',
    'editorial_decisions',
    'article_revisions',
    'publications',
    'acceptance_letters',
    'publication_certificates',
    'documents',
    'notifications',
    'activity_logs'
  ];

  console.log('=== Memulai Pengecekan Database Supabase ===');
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`❌ Tabel [${table}]: Error - ${error.message}`);
    } else {
      console.log(`✅ Tabel [${table}]: Berhasil diakses - ${count} baris data`);
    }
  }

  // Ambil data admin
  console.log('\n--- Detail User Admin ---');
  const { data: admins, error: adminErr } = await supabase
    .from('users')
    .select('id, full_name, email, role, status')
    .eq('role', 'admin');

  if (adminErr) {
    console.error('Error fetching admin:', adminErr.message);
  } else {
    console.log('User Admin terdaftar:', admins);
  }

  // Ambil data journal sampel
  console.log('\n--- Sampel Data Jurnal ---');
  const { data: journalSample, error: journalErr } = await supabase
    .from('journals')
    .select('*')
    .limit(1);
  if (journalErr) {
    console.error('Error fetching journal sample:', journalErr.message);
  } else {
    console.log('Sampel Jurnal:', journalSample);
  }
}

check();
