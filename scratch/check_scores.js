import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

async function checkScores() {
  try {
    const url = `${supabaseUrl}/rest/v1/articles?select=id,title,similarity_score`;
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
    console.log('Articles similarity scores:', data.map(d => ({ title: d.title.slice(0, 40), similarity_score: d.similarity_score })));
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

checkScores();
