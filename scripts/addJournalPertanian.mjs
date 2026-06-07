import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
globalThis.WebSocket = ws;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const email = 'detaksumut@gmail.com';
  const password = 'Mikr@210669Mpi';
  
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
  if (authError) {
    console.error('Login error:', authError);
    return;
  }
  console.log('Logged in as:', authData.user.id);

  const slug = 'ilmu-pertanian-dan-agribisnis';
  const name = 'Jurnal Ilmu Pertanian dan Agribisnis';
  const description = 'Fokus pada kajian ilmu pertanian modern, ketahanan pangan, teknologi hasil pertanian, dan manajemen agribisnis.';

  // 1. Insert Journal
  const { data: journal, error } = await supabase
    .from('journals')
    .insert({
      name,
      description,
      slug
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting journal:', error);
    return;
  }
  console.log('Journal inserted:', journal.id);

  // 2. Insert Scopes
  const scopes = [
    'Agroteknologi dan Agronomi',
    'Ekonomi Pertanian dan Agribisnis',
    'Ketahanan dan Teknologi Pangan',
    'Pertanian Presisi (Smart Agriculture)',
    'Penyuluhan dan Pemberdayaan Petani',
    'Teknologi Hasil Pertanian'
  ];

  for (const scope of scopes) {
    const { error: scopeError } = await supabase
      .from('journal_scopes')
      .insert({
        journal_id: journal.id,
        name: scope
      });
    if (scopeError) {
      console.error('Error inserting scope:', scopeError);
    }
  }
  console.log('Scopes inserted successfully');
}

main();
