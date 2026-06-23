import pg from 'pg';
const { Client } = pg;

const regions = [
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-south-1',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'eu-central-1',
  'ca-central-1',
  'sa-east-1'
];

async function checkRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
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
    return true;
  } catch (err) {
    if (err.message.includes('password authentication failed') || err.message.includes('authentication failed')) {
      console.log(`Region ${region} resolved tenant, but password failed: ${err.message}`);
      await client.end();
      return true;
    } else {
      // console.log(`Region ${region} failed: ${err.message}`);
    }
  }
  return false;
}

async function find() {
  console.log('Searching for correct Supabase region pooler...');
  for (const r of regions) {
    const success = await checkRegion(r);
    if (success) {
      console.log('Found correct region:', r);
      break;
    }
  }
  console.log('Search finished.');
}

find();
