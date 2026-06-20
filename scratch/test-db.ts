import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});

async function test() {
  const { data, error } = await supabase.from('users').select('*').limit(1);
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Keys:", data ? Object.keys(data[0] || {}) : "No data");
  }
}
test();
