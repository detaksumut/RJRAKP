import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

async function run() {
  try {
    const url = `${supabaseUrl}/rest/v1/users?select=id,email,full_name,role,status`;
    const res = await fetch(url, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });

    if (!res.ok) {
      console.error('Fetch users failed:', await res.text());
      return;
    }

    const data = await res.json();
    console.log('Users in database:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
