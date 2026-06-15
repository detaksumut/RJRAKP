import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

const supabaseUrl = 'https://abmjieqcumlskannfkdl.supabase.co';
const supabaseKey = 'sb_publishable_Zvx-3Ezgb1jnAZsDGXyUOg_96PqXzRN';
const supabase = createClient(supabaseUrl, supabaseKey, {
  global: { fetch: fetch },
  realtime: { transport: WebSocket }
});

const rates = [
  {"role_key": "reviewer_no_id", "role_name": "Reviewer (Non-ID)", "amount": 100000},
  {"role_key": "reviewer_with_id", "role_name": "Reviewer (Sinta/Orcid/Scholar ID)", "amount": 250000},
  {"role_key": "editor", "role_name": "Editor", "amount": 200000},
  {"role_key": "editor_in_chief", "role_name": "Editor in Chief", "amount": 300000},
  {"role_key": "administrator", "role_name": "Administrator", "amount": 100000},
  {"role_key": "cover_editor", "role_name": "Editor Cover", "amount": 50000},
  {"role_key": "layout_editor", "role_name": "Editor Layout", "amount": 50000},
  {"role_key": "finance_operator", "role_name": "Finance / Operator Publish", "amount": 100000},
  {"role_key": "sdm", "role_name": "SDM", "amount": 200000},
  {"role_key": "direktur", "role_name": "Direktur", "amount": 200000}
];

async function insertRates() {
  console.log('Inserting data...');
  const { data, error } = await supabase.from('honorarium_rates').upsert(rates, { onConflict: 'role_key' }).select();
  if (error) {
    console.error('ERROR:', error);
  } else {
    console.log('SUCCESS:', data);
  }
}

insertRates();
