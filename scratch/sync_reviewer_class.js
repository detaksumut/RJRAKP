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

    // 1. Fetch board members
    console.log('Fetching board members...');
    const bmRes = await fetch(`${supabaseUrl}/rest/v1/board_members`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${token}`
      }
    });
    if (!bmRes.ok) {
      console.error('Failed to fetch board members:', await bmRes.text());
      return;
    }
    const boardMembers = await bmRes.json();
    console.log(`Fetched ${boardMembers.length} board members.`);

    // 2. Fetch users
    console.log('Fetching users...');
    const usersRes = await fetch(`${supabaseUrl}/rest/v1/users`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${token}`
      }
    });
    if (!usersRes.ok) {
      console.error('Failed to fetch users:', await usersRes.text());
      return;
    }
    const users = await usersRes.json();
    console.log(`Fetched ${users.length} users.`);

    // 3. Match and update board members' user_id
    console.log('Matching board members to registered users...');
    for (const bm of boardMembers) {
      if (bm.user_id) {
        console.log(`Board member "${bm.name}" already linked to user ID ${bm.user_id}`);
        continue;
      }

      // Try matching by name (case-insensitive substring match)
      const matchedUser = users.find(u => {
        const uName = (u.full_name || '').toLowerCase().trim();
        const bmName = (bm.name || '').toLowerCase().trim();
        return uName.includes(bmName) || bmName.includes(uName);
      });

      if (matchedUser) {
        console.log(`Matching board member "${bm.name}" with user "${matchedUser.full_name}" (ID: ${matchedUser.id})`);
        
        // Update user_id in board_members
        const updateBmRes = await fetch(`${supabaseUrl}/rest/v1/board_members?id=eq.${bm.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ user_id: matchedUser.id })
        });

        if (updateBmRes.ok) {
          console.log(`Successfully linked board member "${bm.name}" to user ID ${matchedUser.id}`);
          bm.user_id = matchedUser.id; // update local object
        } else {
          console.error(`Failed to link board member "${bm.name}":`, await updateBmRes.text());
        }
      } else {
        console.log(`No matching user found for board member "${bm.name}"`);
      }
    }

    // 4. Update reviewer_profiles set reviewer_class = 'ON_BOARD'
    // Fetch reviewer profiles
    console.log('Fetching reviewer profiles...');
    const rpRes = await fetch(`${supabaseUrl}/rest/v1/reviewer_profiles`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${token}`
      }
    });
    if (!rpRes.ok) {
      console.error('Failed to fetch reviewer profiles:', await rpRes.text());
      return;
    }
    const reviewerProfiles = await rpRes.json();
    console.log(`Fetched ${reviewerProfiles.length} reviewer profiles.`);

    console.log('Updating reviewer classes...');
    for (const rp of reviewerProfiles) {
      // Find if this reviewer user_id is in board_members with role containing 'reviewer'
      const matchedBm = boardMembers.find(bm => bm.user_id === rp.user_id);
      
      let expectedClass = 'EXTERNAL';
      if (matchedBm) {
        const role = (matchedBm.role || '').toLowerCase();
        if (role.includes('reviewer') || role.includes('board') || role.includes('editor') || role.includes('director') || role.includes('arsiparis')) {
          // If they are on the board, they are ON_BOARD
          expectedClass = 'ON_BOARD';
        }
      }

      if (rp.reviewer_class !== expectedClass) {
        console.log(`Updating reviewer profile ID ${rp.id} (user: ${rp.user_id}) reviewer_class from "${rp.reviewer_class}" to "${expectedClass}"`);
        const updateRpRes = await fetch(`${supabaseUrl}/rest/v1/reviewer_profiles?id=eq.${rp.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reviewer_class: expectedClass })
        });

        if (updateRpRes.ok) {
          console.log(`Successfully updated reviewer profile ID ${rp.id} class to "${expectedClass}"`);
        } else {
          console.error(`Failed to update reviewer profile ID ${rp.id}:`, await updateRpRes.text());
        }
      } else {
        console.log(`Reviewer profile ID ${rp.id} (user: ${rp.user_id}) already has correct class "${rp.reviewer_class}"`);
      }
    }

    console.log('Sync finished successfully!');

  } catch (err) {
    console.error('Error during execution:', err);
  }
}

run();
