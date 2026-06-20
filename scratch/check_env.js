import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('Environment variables present:');
for (const key of Object.keys(process.env)) {
  if (key.toUpperCase().includes('SUPABASE') || key.toUpperCase().includes('SECRET') || key.toUpperCase().includes('KEY')) {
    console.log(`- ${key}: ${process.env[key] ? 'PRESENT (length ' + process.env[key].length + ')' : 'EMPTY'}`);
  }
}
