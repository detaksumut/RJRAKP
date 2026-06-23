import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

async function run() {
  const client = new Client({
    user: 'postgres.abmjieqcumlskannfkdl',
    host: 'aws-0-ap-southeast-2.pooler.supabase.com',
    database: 'postgres',
    password: 'Mikr@210669Mpi',
    port: 5432,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting to database via pooler with separate config...');
    await client.connect();
    console.log('Connected successfully. Running ALTER TABLE...');
    
    await client.query(`
      ALTER TABLE board_members
      ADD COLUMN IF NOT EXISTS sinta_id VARCHAR(100),
      ADD COLUMN IF NOT EXISTS google_scholar_id VARCHAR(100),
      ADD COLUMN IF NOT EXISTS orcid_id VARCHAR(100),
      ADD COLUMN IF NOT EXISTS scopus_id VARCHAR(100),
      ADD COLUMN IF NOT EXISTS wos_id VARCHAR(100);
    `);
    
    console.log('ALTER TABLE run successfully!');
  } catch (err) {
    console.error('Database query failed:', err.message);
  } finally {
    await client.end();
  }
}

run();
