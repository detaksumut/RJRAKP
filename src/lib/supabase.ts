import { createClient } from '@supabase/supabase-js';

const envSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const envSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("=== Verifikasi Environment Variables ===");
console.log("- VITE_SUPABASE_URL terdeteksi:", !!envSupabaseUrl, envSupabaseUrl ? `(${envSupabaseUrl})` : "");
console.log("- VITE_SUPABASE_ANON_KEY terdeteksi:", !!envSupabaseAnonKey);
console.log("========================================");

const rawUrl = envSupabaseUrl ? envSupabaseUrl.trim() : '';
const baseUrlMatch = rawUrl.match(/https:\/\/[a-zA-Z0-9-]+\.supabase\.co/);
const supabaseUrl = baseUrlMatch ? baseUrlMatch[0] : (rawUrl.startsWith('http') ? rawUrl : 'https://abcdefghijklmnopqr.supabase.co');
const supabaseAnonKey = (envSupabaseAnonKey ? envSupabaseAnonKey.trim() : '') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3BxciIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjE2MDcxOTYwLCJleHAiOjE5MzE2NDc5NjB9.placeholder_key';




if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  console.warn("VITE_SUPABASE_URL tidak valid atau tidak ditemukan. Pastikan Anda telah mengatur VITE_SUPABASE_URL di Secrets Panel.");
}
if (!supabaseAnonKey) {
  console.warn("VITE_SUPABASE_ANON_KEY tidak ditemukan. Pastikan Anda telah mengatur VITE_SUPABASE_ANON_KEY di Secrets Panel.");
}


export const supabase = createClient(supabaseUrl, supabaseAnonKey);
