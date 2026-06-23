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

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: fetch },
  realtime: { transport: ws }
});

const rates = [
  { role_key: 'royalty_referrer_lembaga', role_name: 'Royalti Referal (Lembaga)', amount: 150000 },
  { role_key: 'royalty_referrer_personal', role_name: 'Royalti Referal (Personal)', amount: 100000 }
];

async function insertRates() {
  console.log('Inserting referral royalty rates...');
  const { data, error } = await supabase
    .from('honorarium_rates')
    .upsert(rates, { onConflict: 'role_key' })
    .select();
  
  if (error) {
    console.error('ERROR:', error);
  } else {
    console.log('SUCCESS:', data);
  }
}

insertRates();
