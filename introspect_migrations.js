const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed.startsWith('#') || !trimmed) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx);
  const val = trimmed.slice(eqIdx + 1).replace(/^["']|["']$/g, '');
  env[key] = val;
}

const directUrl = env.DIRECT_URL;

(async()=> {
  const client = new Client({
    connectionString: directUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('=== Connected to production DB ===\n');

    // Check _prisma_migrations columns
    const migCols = await client.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '_prisma_migrations' ORDER BY ordinal_position"
    );
    console.log('=== _prisma_migrations columns ===');
    migCols.rows.forEach(r => console.log('  ' + r.column_name + ' | ' + r.data_type));

    // Get all migration data
    const migRes = await client.query('SELECT * FROM _prisma_migrations ORDER BY started_at ASC');
    console.log('\n=== APPLIED MIGRATIONS (' + migRes.rows.length + ' total) ===');
    migRes.rows.forEach(r => console.log(JSON.stringify(r)));

    await client.end();
    console.log('\n=== DONE ===');
  } catch (e) {
    console.error('FATAL Error:', e.message);
    if (client) await client.end();
    process.exit(1);
  }
})();
