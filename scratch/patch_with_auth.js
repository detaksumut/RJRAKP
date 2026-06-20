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
    console.log('Logging in via Supabase Auth REST API...');
    const loginUrl = `${supabaseUrl}/auth/v1/token?grant_type=password`;
    const loginRes = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'redaksi@rjrakp.com',
        password: 'admin123'
      })
    });

    if (!loginRes.ok) {
      console.error('Login failed:', await loginRes.text());
      return;
    }

    const authData = await loginRes.json();
    const token = authData.access_token;
    console.log('Login successful! Access token retrieved.');

    // Fetch articles
    const fetchUrl = `${supabaseUrl}/rest/v1/articles?select=id,title`;
    const fetchRes = await fetch(fetchUrl, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${token}`
      }
    });

    if (!fetchRes.ok) {
      console.error('Fetch articles failed:', await fetchRes.text());
      return;
    }

    const articles = await fetchRes.json();
    console.log('Found articles:', articles.length);

    // Update first article
    const art1 = articles.find(a => a.title.toLowerCase().includes('reformasi penegakan hukum'));
    if (art1) {
      console.log(`Updating "${art1.title}" to 15%`);
      const patchUrl = `${supabaseUrl}/rest/v1/articles?id=eq.${art1.id}`;
      const patchRes = await fetch(patchUrl, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ similarity_score: 15 })
      });
      if (patchRes.ok) {
        console.log('Successfully updated art1:', await patchRes.json());
      } else {
        console.error('Failed to update art1:', await patchRes.text());
      }
    }

    // Update second article
    const art2 = articles.find(a => a.title.toLowerCase().includes('konflik antara hak pesangon'));
    if (art2) {
      console.log(`Updating "${art2.title}" to 25%`);
      const patchUrl = `${supabaseUrl}/rest/v1/articles?id=eq.${art2.id}`;
      const patchRes = await fetch(patchUrl, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ similarity_score: 25 })
      });
      if (patchRes.ok) {
        console.log('Successfully updated art2:', await patchRes.json());
      } else {
        console.error('Failed to update art2:', await patchRes.text());
      }
    }

  } catch (err) {
    console.error('Error running script:', err);
  }
}

run();
