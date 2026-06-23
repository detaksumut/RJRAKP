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

    if (!signInRes.ok) {
      console.error('Signin failed:', await signInRes.text());
      return;
    }

    const authData = await signInRes.json();
    const token = authData.access_token;
    console.log('Login successful!');

    // 1. Manually update Robby Shahary
    console.log('Linking Robby Shahary...');
    const res1 = await fetch(`${supabaseUrl}/rest/v1/board_members?id=eq.5765c3ca-c4ba-4346-999e-6f100ca7c6cb`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id: '6236d78b-8caa-4a4a-84e0-166f046614c6' })
    });
    console.log('Robby link status:', res1.status);

    // 2. Manually update Bakhrul Khair Amal
    console.log('Linking Bakhrul Khair Amal...');
    const res2 = await fetch(`${supabaseUrl}/rest/v1/board_members?id=eq.227a4dbb-df61-4c06-92c7-49229641d86f`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id: 'a462ded5-1864-4f79-8c76-3be393b2f59c' })
    });
    console.log('Bakhrul link status:', res2.status);

    // 3. Update reviewer profiles
    console.log('Updating reviewer profiles...');
    
    // We want user Robby Shahary (6236d78b-8caa-4a4a-84e0-166f046614c6) to be ON_BOARD since they are "Reviewer On Board"
    // We want user Bakhrul (a462ded5-1864-4f79-8c76-3be393b2f59c) to be ON_BOARD since they are "Editor in Chief" (and registered as reviewer role as well)
    
    const rpRes = await fetch(`${supabaseUrl}/rest/v1/reviewer_profiles`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${token}`
      }
    });
    const reviewerProfiles = await rpRes.json();

    for (const rp of reviewerProfiles) {
      if (rp.user_id === '6236d78b-8caa-4a4a-84e0-166f046614c6' || rp.user_id === 'a462ded5-1864-4f79-8c76-3be393b2f59c') {
        console.log(`Updating reviewer profile ID ${rp.id} class to ON_BOARD...`);
        const updateRpRes = await fetch(`${supabaseUrl}/rest/v1/reviewer_profiles?id=eq.${rp.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reviewer_class: 'ON_BOARD' })
        });
        console.log(`Updated ID ${rp.id}:`, updateRpRes.status);
      }
    }

    console.log('Manual sync completed successfully!');
  } catch (err) {
    console.error(err);
  }
}

run();
