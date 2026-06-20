import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';
globalThis.WebSocket = ws;

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: users, error: usersError } = await supabase.from('users').select('*').eq('role', 'author');
  if (usersError) {
    console.error('Error fetching authors:', usersError);
    return;
  }
  console.log('--- Author Users ---');
  for (const user of users) {
    console.log(`ID: ${user.id}, Name: ${user.full_name}, Email: ${user.email}, Status: ${user.status}`);
  }

  const { data: publications, error: pubsError } = await supabase.from('publications').select(`
    id,
    articles (
      title,
      submitter_id
    )
  `);
  if (pubsError) {
    console.error('Error fetching publications:', pubsError);
  } else {
    console.log('--- Publications ---');
    console.log(publications);
  }
}

run();
