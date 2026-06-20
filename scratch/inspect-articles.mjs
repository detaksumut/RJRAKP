import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';
globalThis.WebSocket = ws;

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('articles').select('*').limit(1);
  if (error) {
    console.error('Error fetching articles:', error);
  } else if (data && data.length > 0) {
    console.log('Columns in articles table:', Object.keys(data[0]));
  } else {
    console.log('Articles table is empty. Fetching table details using RPC or schema query...');
  }
}

run();
