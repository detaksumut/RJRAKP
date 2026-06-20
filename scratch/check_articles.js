import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

async function checkSchema() {
  try {
    const url = `${supabaseUrl}/rest/v1/articles?limit=1`;
    const res = await fetch(url, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    if (!res.ok) {
      console.error('HTTP Error:', res.status, await res.text());
      return;
    }
    const data = await res.json();
    console.log('Columns in articles table:', data.length > 0 ? Object.keys(data[0]) : 'No data');
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

checkSchema();
