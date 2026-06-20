import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const email = 'temp_admin_test@rjrakp.com';
const password = 'adminPassword123!';

async function run() {
  try {
    console.log('Step 1: Signing up new user...');
    const signUpUrl = `${supabaseUrl}/auth/v1/signup`;
    const signUpRes = await fetch(signUpUrl, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    let token = '';
    let userId = '';

    if (signUpRes.ok) {
      const data = await signUpRes.json();
      token = data.access_token;
      userId = data.user.id;
      console.log('Signup successful! User ID:', userId);
    } else {
      const errText = await signUpRes.text();
      console.log('Signup failed or user already exists, trying signin instead. Details:', errText);

      console.log('Step 1.5: Signing in...');
      const signInUrl = `${supabaseUrl}/auth/v1/token?grant_type=password`;
      const signInRes = await fetch(signInUrl, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!signInRes.ok) {
        console.error('Signin failed:', await signInRes.text());
        return;
      }

      const data = await signInRes.json();
      token = data.access_token;
      userId = data.user.id;
      console.log('Signin successful! User ID:', userId);
    }

    console.log('Step 2: Upserting user role to admin...');
    const upsertUrl = `${supabaseUrl}/rest/v1/users`;
    const upsertRes = await fetch(upsertUrl, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        id: userId,
        full_name: 'Temp Admin',
        email: email,
        role: 'admin',
        status: 'APPROVED'
      })
    });

    if (!upsertRes.ok) {
      console.error('Upsert admin role failed:', await upsertRes.text());
      return;
    }
    console.log('Successfully upserted user role as admin!');

    // Fetch articles to verify and get IDs
    console.log('Step 3: Fetching articles...');
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
    console.log('Found articles in database:', articles.length);

    // Update Reformasi Penegakan Hukum article
    const art1 = articles.find(a => a.title.toLowerCase().includes('reformasi penegakan hukum'));
    if (art1) {
      console.log(`Updating "${art1.title}" to 15% similarity score...`);
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
        console.log('Successfully updated article 1:', await patchRes.json());
      } else {
        console.error('Failed to update article 1:', await patchRes.text());
      }
    }

    // Update Konflik Antara Hak Pesangon article
    const art2 = articles.find(a => a.title.toLowerCase().includes('konflik antara hak pesangon'));
    if (art2) {
      console.log(`Updating "${art2.title}" to 25% similarity score...`);
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
        console.log('Successfully updated article 2:', await patchRes.json());
      } else {
        console.error('Failed to update article 2:', await patchRes.text());
      }
    }

  } catch (err) {
    console.error('Error running script:', err);
  }
}

run();
