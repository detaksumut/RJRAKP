import pg from 'pg';
const { Client } = pg;

async function checkRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  console.log(`Checking host: ${host}`);
  const client = new Client({
    user: 'postgres.abmjieqcumlskannfkdl',
    host: host,
    database: 'postgres',
    password: 'Mikr@210669Mpi',
    port: 6543,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 3000
  });

  try {
    await client.connect();
    console.log(`Region ${region} CONNECTED SUCCESSFULLY!`);
    await client.end();
  } catch (err) {
    console.log(`Region ${region} result: ${err.message}`);
  }
}

checkRegion('ap-southeast-3');
