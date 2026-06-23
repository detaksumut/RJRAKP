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

async function clearIssns() {
  console.log('Logging in as admin...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'detaksumut@gmail.com',
    password: 'Mikr@210669Mpi'
  });

  if (authError) {
    console.error('Failed to log in as admin:', authError.message);
    return;
  }
  console.log('Logged in successfully. Clearing ISSNs...');

  const { data, error } = await supabase
    .from('journals')
    .update({ p_issn: null, e_issn: null })
    .neq('id', '00000000-0000-0000-0000-000000000000'); // update all by matching non-empty condition

  if (error) {
    console.error('Error clearing ISSNs:', error);
  } else {
    console.log('Successfully cleared ISSNs from database.');
  }
}

clearIssns();
