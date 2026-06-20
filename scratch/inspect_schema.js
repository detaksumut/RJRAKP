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
    const res = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseAnonKey
      }
    });

    if (!res.ok) {
      console.error('Fetch failed:', await res.text());
      return;
    }

    const schema = await res.json();
    
    // Look at articles table properties
    const articlesDef = schema.definitions?.articles;
    if (articlesDef) {
      console.log('--- articles columns ---');
      console.log(Object.keys(articlesDef.properties));
    }

    const decisionsDef = schema.definitions?.editorial_decisions;
    if (decisionsDef) {
      console.log('--- editorial_decisions columns ---');
      console.log(Object.keys(decisionsDef.properties));
    }

    const reviewsDef = schema.definitions?.reviews;
    if (reviewsDef) {
      console.log('--- reviews columns ---');
      console.log(Object.keys(reviewsDef.properties));
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
