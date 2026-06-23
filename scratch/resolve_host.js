import pg from 'pg';
const { Client } = pg;

async function testDirect() {
  console.log('Testing direct database host connection...');
  const client = new Client({
    user: 'postgres',
    host: '2406:da1c:4c7:f800:6591:e92d:6526:387b',
    database: 'postgres',
    password: 'Mikr@210669Mpi',
    port: 5432,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });

  try {
    await client.connect();
    console.log('SUCCESS connected to direct database host!');
    await client.end();
  } catch (err) {
    console.log('FAILED direct database host connection -', err.message);
  }
}

testDirect();




