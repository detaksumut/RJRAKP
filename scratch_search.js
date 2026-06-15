import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

const supabaseUrl = 'https://abmjieqcumlskannfkdl.supabase.co';
const supabaseKey = 'sb_publishable_Zvx-3Ezgb1jnAZsDGXyUOg_96PqXzRN';
const supabase = createClient(supabaseUrl, supabaseKey, {
  global: { fetch: fetch },
  realtime: { transport: WebSocket }
});

async function search() {
  console.log('Searching users...');
  const { data: users, error: err1 } = await supabase
    .from('users')
    .select('*')
    .ilike('full_name', '%Muhibbuddin%');
  
  if (err1) console.error('Users Error:', err1);
  else console.log('Users Found:', users);

  console.log('Searching board members...');
  const { data: board, error: err2 } = await supabase
    .from('board_members')
    .select('*')
    .ilike('name', '%Muhibbuddin%');

  if (err2) console.error('Board Error:', err2);
  else console.log('Board Found:', board);
}

search();
