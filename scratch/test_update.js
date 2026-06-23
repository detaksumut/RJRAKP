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
    console.log('Logging in as admin...');
    const signInUrl = `${supabaseUrl}/auth/v1/token?grant_type=password`;
    const signInRes = await fetch(signInUrl, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const authData = await signInRes.json();
    const token = authData.access_token;
    console.log('Login successful!');

    // Fetch reviewer profiles
    const rpRes1 = await fetch(`${supabaseUrl}/rest/v1/reviewer_profiles?id=eq.9044602a-82ac-4809-bb05-f93dadb8fd4c`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${token}`
      }
    });
    const profileBefore = await rpRes1.json();
    console.log('Profile before update:', profileBefore);

    // Try updating is_backup_active to true
    console.log('Updating is_backup_active to true...');
    const updateRes = await fetch(`${supabaseUrl}/rest/v1/reviewer_profiles?id=eq.9044602a-82ac-4809-bb05-f93dadb8fd4c`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ is_backup_active: true })
    });
    console.log('Update HTTP Status:', updateRes.status);
    console.log('Update response body:', await updateRes.text());

    // Fetch again to verify
    const rpRes2 = await fetch(`${supabaseUrl}/rest/v1/reviewer_profiles?id=eq.9044602a-82ac-4809-bb05-f93dadb8fd4c`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${token}`
      }
    });
    const profileAfter = await rpRes2.json();
    console.log('Profile after update:', profileAfter);

  } catch (err) {
    console.error(err);
  }
}

run();
