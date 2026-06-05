import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Variables Supabase not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});

async function run() {
  console.log('Fetching articles to delete...');
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching:', error);
    return;
  }

  // Keep the first two (most recent)
  const toKeep = data.slice(0, 2);
  const toDelete = data.slice(2);

  console.log('Keeping:');
  toKeep.forEach(a => console.log(`- ${a.title}`));

  console.log('\nDeleting the rest (' + toDelete.length + ' articles)...');

  for (const article of toDelete) {
    console.log(`Deleting: ${article.title}`);
    
    // Attempt to delete from articles
    const { error: delError } = await supabase
      .from('articles')
      .delete()
      .eq('id', article.id);
      
    if (delError) {
      console.error(`Error deleting ${article.id}:`, delError.message);
      console.log('Attempting to unpublish instead...');
      await supabase.from('articles').update({ status: 'withdrawn' }).eq('id', article.id);
      await supabase.from('publications').delete().eq('article_id', article.id);
    } else {
      console.log('Deleted successfully.');
    }
  }
  
  console.log('Cleanup finished.');
}

run();
