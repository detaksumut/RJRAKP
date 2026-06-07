import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const rawUrl = process.env.VITE_SUPABASE_URL || '';
const envSupabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const baseUrlMatch = rawUrl.match(/https:\/\/[a-zA-Z0-9-]+\.supabase\.co/);
const supabaseUrl = baseUrlMatch ? baseUrlMatch[0] : (rawUrl.startsWith('http') ? rawUrl : 'https://abcdefghijklmnopqr.supabase.co');
const supabaseAnonKey = (envSupabaseAnonKey ? envSupabaseAnonKey.trim() : '') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3BxciIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjE2MDcxOTYwLCJleHAiOjE5MzE2NDc5NjB9.placeholder_key';

if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  console.error("Missing/invalid SUPABASE URL");
  process.exit(1);
}

import ws from 'ws';
globalThis.WebSocket = ws;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdmin() {
  const email = 'detaksumut@gmail.com';
  const password = 'Mikr@210669Mpi';

  console.log('Registering user...');
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
        console.log('User already registered. Authenticating to verify...');
        const { data: signData, error: signError } = await supabase.auth.signInWithPassword({ email, password });
        if (signError) {
            console.error('Sign in error:', signError.message);
            return;
        }
        
        console.log('Updating role to admin...');
        const { error: updateError } = await supabase.from('users').update({ role: 'admin', status: 'APPROVED' }).eq('id', signData.user.id);
        if (updateError) {
            console.error('Update error:', updateError.message);
            return;
        }
        console.log('Admin user updated successfully!');
        return;
    }
    console.error("Auth Error:", authError.message);
    return;
  }

  if (!authData.user) {
    console.error("No user created.");
    return;
  }

  console.log('Inserting into users table with admin role...');
  const { error: userError } = await supabase.from('users').insert({
    id: authData.user.id,
    full_name: 'Admin Detak Sumut',
    email: email,
    role: 'admin',
    status: 'APPROVED',
  });

  if (userError) {
    console.error('Insert error, trying update:', userError.message);
    const { error: updateError } = await supabase.from('users').update({ role: 'admin', status: 'APPROVED' }).eq('id', authData.user.id);
    if(updateError) {
        console.error('Update failed too:', updateError);
    } else {
        console.log('Successfully updated to admin!');
    }
    return;
  }

  console.log('Success! Admin user created.');
}

createAdmin();
