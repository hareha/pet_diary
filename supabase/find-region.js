const { Client } = require('pg');

// 두 가지 연결 방식 모두 시도
const configs = [
  {
    name: 'Direct (db.xxx.supabase.co:5432)',
    host: 'db.hksyvimmgmdrhtrhwxnn.supabase.co',
    port: 5432,
    user: 'postgres',
  },
  {
    name: 'Pooler Session (pooler:5432)',
    host: 'aws-0-ap-northeast-2.pooler.supabase.com',
    port: 5432,
    user: 'postgres.hksyvimmgmdrhtrhwxnn',
  },
  {
    name: 'Pooler Transaction (pooler:6543)',
    host: 'aws-0-ap-northeast-2.pooler.supabase.com',
    port: 6543,
    user: 'postgres.hksyvimmgmdrhtrhwxnn',
  },
];

async function tryConnect(cfg) {
  console.log(`\n🔌 Trying: ${cfg.name}`);
  const client = new Client({
    host: cfg.host,
    port: cfg.port,
    database: 'postgres',
    user: cfg.user,
    password: 'kyvikos31986!',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  });

  try {
    await client.connect();
    console.log('✅ CONNECTED!');
    const res = await client.query('SELECT current_database() as db, current_user as usr');
    console.log('DB info:', res.rows[0]);
    await client.end();
    return cfg;
  } catch (e) {
    console.log(`❌ Failed: ${e.message}`);
    try { await client.end(); } catch {}
    return null;
  }
}

async function main() {
  for (const cfg of configs) {
    const result = await tryConnect(cfg);
    if (result) {
      console.log(`\n🎯 Working config: ${result.name}`);
      return;
    }
  }
  console.log('\n❌ All connections failed.');
}

main();
