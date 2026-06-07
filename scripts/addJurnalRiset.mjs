import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';
globalThis.WebSocket = ws;

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function addJurnal() {
  console.log('Logging in as admin...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'detaksumut@gmail.com',
    password: 'Mikr@210669Mpi'
  });

  if (authError) {
    console.error('Login failed:', authError.message);
    return;
  }

  const slug = 'jurnal-riset-multidisiplin-dan-inovasi';
  console.log('Inserting new journal:', slug);
  
  const { data: journal, error: journalError } = await supabase.from('journals').insert({
    name: 'Jurnal Riset Multidisiplin dan Inovasi',
    slug: slug,
    description: 'Jurnal Riset Multidisiplin dan Inovasi adalah wadah publikasi ilmiah yang berfokus pada hasil-hasil penelitian lintas disiplin ilmu yang memiliki kebaruan (novelty) dan dampak langsung bagi perkembangan sains, teknologi, dan masyarakat di era modern.'
  }).select('id').single();

  if (journalError) {
    console.error('Failed to insert journal:', journalError);
    return;
  }

  console.log('Journal created with ID:', journal.id);

  const trendingScopes = [
    'Artificial Intelligence & Machine Learning',
    'Green Technology & Energi Terbarukan',
    'Digital Economy & E-Commerce',
    'Kesehatan Masyarakat & Digital Health',
    'Keamanan Siber (Cyber Security)',
    'Internet of Things (IoT) & Smart Cities',
    'Sustainable Development Goals (SDGs)',
    'Mitigasi Perubahan Iklim'
  ];

  for (const scope of trendingScopes) {
    await supabase.from('journal_scopes').insert({
      journal_id: journal.id,
      name: scope,
      description: `Kajian mendalam mengenai ${scope}`
    });
    console.log('Inserted scope:', scope);
  }

  console.log('Done!');
}

addJurnal();
