import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

async function setHighSimilarity() {
  try {
    const getUrl = `${supabaseUrl}/rest/v1/articles?status=eq.published&limit=2`;
    const getRes = await fetch(getUrl, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    
    if (!getRes.ok) {
      console.error('Fetch error:', await getRes.text());
      return;
    }
    
    const articles = await getRes.json();
    if (articles.length < 2) {
      console.log('Need at least 2 published articles to update the second one.');
      return;
    }
    
    const targetArticle = articles[1];
    console.log(`Setting similarity_score to 25 for article: "${targetArticle.title}"`);
    
    const patchUrl = `${supabaseUrl}/rest/v1/articles?id=eq.${targetArticle.id}`;
    const patchRes = await fetch(patchUrl, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ similarity_score: 25 })
    });
    
    if (patchRes.ok) {
      console.log('Success! similarity_score updated.');
    } else {
      console.error('Patch error:', await patchRes.text());
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

setHighSimilarity();
