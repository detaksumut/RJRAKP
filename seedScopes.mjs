import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';
globalThis.WebSocket = ws;

dotenv.config();

const rawUrl = process.env.VITE_SUPABASE_URL || '';
const envSupabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const baseUrlMatch = rawUrl.match(/https:\/\/[a-zA-Z0-9-]+\.supabase\.co/);
const supabaseUrl = baseUrlMatch ? baseUrlMatch[0] : (rawUrl.startsWith('http') ? rawUrl : 'https://abcdefghijklmnopqr.supabase.co');
const supabaseAnonKey = (envSupabaseAnonKey ? envSupabaseAnonKey.trim() : '') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3BxciIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjE2MDcxOTYwLCJleHAiOjE5MzE2NDc5NjB9.placeholder_key';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const journalScopesData = {
  'audit-kebijakan-publik': [
    'Audit Kebijakan Publik',
    'Evaluasi Kebijakan',
    'Tata Kelola Pemerintahan',
    'Pengawasan Publik',
    'Reformasi Birokrasi',
    'Administrasi Publik',
    'Akuntabilitas Publik'
  ],
  'hukum-dan-keadilan': [
    'Hukum Perdata',
    'Hukum Pidana',
    'Hukum Tata Negara',
    'Hukum Administrasi Negara',
    'Hukum Bisnis',
    'Hukum Internasional',
    'Sistem Peradilan',
    'Keadilan Sosial'
  ],
  'pendidikan-dan-pembelajaran': [
    'Pendidikan Dasar',
    'Pendidikan Menengah',
    'Pendidikan Tinggi',
    'Kurikulum',
    'Teknologi Pendidikan',
    'Manajemen Pendidikan',
    'Evaluasi Pembelajaran',
    'Inovasi Pembelajaran'
  ],
  'teknik-dan-teknologi': [
    'Teknik Sipil',
    'Teknik Mesin',
    'Teknik Elektro',
    'Teknik Industri',
    'Teknologi Informasi',
    'Sistem Informasi',
    'Kecerdasan Buatan',
    'Rekayasa Perangkat Lunak'
  ],
  'agama-dan-peradaban-islam': [
    'Studi Islam',
    'Akidah dan Akhlak',
    'Tafsir Al-Qur\'an',
    'Hadis',
    'Tasawuf',
    'Peradaban Islam',
    'Pemikiran Islam',
    'Pendidikan Islam'
  ]
};

async function seed() {
  console.log('Logging in as admin to bypass RLS...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'detaksumut@gmail.com',
    password: 'Mikr@210669Mpi'
  });

  if (authError) {
    console.error('Failed to log in:', authError.message);
    return;
  }

  console.log('Fetching journals...');
  const { data: journals, error: journalErr } = await supabase.from('journals').select('id, slug');
  if (journalErr || !journals) {
    console.error('Error fetching journals:', journalErr);
    return;
  }

  // Clear existing scopes first
  console.log('Clearing old scopes...');
  await supabase.from('journal_scopes').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log('Inserting journal scopes...');
  for (const journal of journals) {
    const scopesList = journalScopesData[journal.slug];
    if (scopesList) {
      console.log(`Adding ${scopesList.length} scopes for ${journal.slug}...`);
      for (const scopeName of scopesList) {
        const { error } = await supabase.from('journal_scopes').insert({
          journal_id: journal.id,
          name: scopeName,
          description: `Bidang kajian ${scopeName}`
        });
        if (error) {
          console.error(`Failed to insert scope ${scopeName}:`, error.message);
        }
      }
    }
  }
  console.log('Seeding scopes completed!');
}

seed();
