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
    console.log('Logging in...');
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
    console.log('Logged in.');

    // Profile ID for Dr. Bakhrul Khair Amal
    const profileId = '34492100-cf5f-40ca-b201-84d281c5e638';
    
    // Check initial
    const rpRes1 = await fetch(`${supabaseUrl}/rest/v1/reviewer_profiles?id=eq.${profileId}`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Initial profile state:', await rpRes1.json());

    // Update to true
    console.log('Toggling to true...');
    const updateRes = await fetch(`${supabaseUrl}/rest/v1/reviewer_profiles?id=eq.${profileId}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ is_backup_active: true })
    });
    console.log('Update Status:', updateRes.status);

    // Fetch users (like fetchUsers function in the app)
    const usersRes = await fetch(`${supabaseUrl}/rest/v1/users?role=eq.reviewer&select=*,reviewer_profiles(*)`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${token}`
      }
    });
    const usersData = await usersRes.json();
    console.log('Full usersData from select:', JSON.stringify(usersData, null, 2));

  } catch (err) {
    console.error(err);
  }
}

run();
