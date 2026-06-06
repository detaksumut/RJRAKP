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

  // Get Journal ID
  const { data: journal, error: journalError } = await supabase
    .from('journals')
    .select('id')
    .eq('slug', 'ilmu-pertanian-dan-agribisnis')
    .single();

  if (journalError || !journal) {
    console.error('Journal not found:', journalError);
    return;
  }

  const scopes = [
    'Sistem Pertanian Terpadu',
    'Pengelolaan Sumber Daya Alam',
    'Kehutanan Sosial dan Agroforestri'
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
    } else {
      console.log('Inserted scope:', scope);
    }
  }
  console.log('Finished inserting additional agriculture scopes');
}

main();
