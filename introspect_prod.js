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

    // 1. Applied migrations with correct columns
    const migRes = await client.query(
      'SELECT id, migration_name, started_at, finished_at, logs, rolled_back_at, applied_steps_count FROM _prisma_migrations ORDER BY started_at ASC'
    );
    console.log('=== APPLIED MIGRATIONS (' + migRes.rows.length + ' rows) ===');
    migRes.rows.forEach(r => {
      const success = r.finished_at && r.rolled_back_at === null && r.applied_steps_count > 0;
      const status = success ? 'SUCCESS' : (r.applied_steps_count === 0 && !r.finished_at ? 'FAILED' : 'RESOLVED_NOOP');
      console.log(JSON.stringify({
        name: r.migration_name,
        started: r.started_at,
        finished: r.finished_at,
        status: status,
        steps: r.applied_steps_count,
        rolled_back: !!r.rolled_back_at
      }));
    });

    // 2. All public tables
    const tblRes = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name"
    );
    const tableList = tblRes.rows.map(r => r.table_name);
    console.log('\n=== ALL PRODUCTION TABLES (' + tableList.length + ') ===');
    tableList.forEach(t => console.log('  ' + t));

    // 3. Enums
    const enumRes = await client.query(
      "SELECT t.typname, e.enumlabel FROM pg_type t JOIN pg_enum e ON e.enumtypid = t.oid WHERE t.typtype = 'e' ORDER BY t.typname, e.enumsortorder"
    );
    const enumMap = {};
    enumRes.rows.forEach(r => {
      if (!enumMap[r.typname]) enumMap[r.typname] = [];
      enumMap[r.typname].push(r.enumlabel);
    });
    console.log('\n=== DATABASE ENUMS ===');
    if (Object.keys(enumMap).length === 0) console.log('  (none found)');
    Object.keys(enumMap).forEach(k => console.log('  ' + k + ': [' + enumMap[k].join(', ') + ']'));

    // 4. For every table, dump columns
    console.log('\n=== TABLE COLUMNS ===');
    for (const tbl of tableList) {
      const colRes = await client.query(
        "SELECT column_name, data_type, is_nullable, column_default, character_maximum_length FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position",
        [tbl]
      );
      console.log('\n  TABLE: ' + tbl + ' (' + colRes.rows.length + ' columns)');
      colRes.rows.forEach(c => {
        console.log('    ' + c.column_name + ' | ' + c.data_type + ' | nullable=' + c.is_nullable + ' | default=' + (c.column_default || '') + ' | maxlen=' + (c.character_maximum_length || ''));
      });
    }

    // 5. Indexes
    console.log('\n=== INDEXES ===');
    const idxRes = await client.query(
      "SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname = 'public' AND tablename != '_prisma_migrations' ORDER BY tablename, indexname"
    );
    let currentTable = '';
    idxRes.rows.forEach(r => {
      if (r.tablename !== currentTable) { currentTable = r.tablename; console.log('\n  TABLE: ' + currentTable); }
      console.log('    ' + r.indexname + ': ' + r.indexdef);
    });

    // 6. Foreign keys
    console.log('\n=== FOREIGN KEYS ===');
    const fkRes = await client.query(
      "SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table, ccu.column_name AS foreign_column, con.conname " +
      "FROM pg_constraint con " +
      "JOIN pg_class rel ON con.conrelid = rel.oid " +
      "JOIN information_schema.table_constraints tc ON con.conname = tc.constraint_name AND tc.table_schema = 'public' " +
      "JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema " +
      "JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema " +
      "WHERE con.contype = 'f' ORDER BY tc.table_name, kcu.ordinal_position"
    );
    fkRes.rows.forEach(r => {
      console.log('  ' + r.table_name + '.' + r.column_name + ' -> ' + r.foreign_table + '.' + r.foreign_column + ' (' + r.conname + ')');
    });

    // 7. Data counts in key tables
    console.log('\n=== DATA COUNTS ===');
    const countTables = ['Product', 'User', 'Store', 'ProductVersion', 'StaffPick', 'Announcement', 'Order', 'OrderGroup', 'Review', 'Category', 'Tag', 'Follower', 'SiteSetting', 'ModerationNote', 'UserPreference', 'ProductMedia', 'ProductFile', 'OrderGroup'];
    for (const t of countTables) {
      try {
        const r = await client.query('SELECT COUNT(*) FROM "' + t + '"');
        console.log('  ' + t + ': ' + r.rows[0].count);
      } catch(e) { console.log('  ' + t + ': COUNT FAILED - ' + e.message); }
    }

    // 8. Product data sample
    console.log('\n=== Product SAMPLE ===');
    try {
      const ps = await client.query('SELECT slug, "isPublished", status, "contentRating", "creatorId", "seoTitle", "seoDescription" FROM "Product" ORDER BY "createdAt" DESC LIMIT 20');
      ps.rows.forEach(r => console.log('  ' + JSON.stringify(r)));
    } catch(e) { console.log('  Product query failed: ' + e.message); }

    // 9. User data sample
    console.log('\n=== User SAMPLE ===');
    try {
      const us = await client.query('SELECT username, role, status, "creatorStatus", "isInternal", "isFeatured", "createdAt" FROM "User" ORDER BY "createdAt" DESC LIMIT 30');
      us.rows.forEach(r => console.log('  ' + JSON.stringify(r)));
    } catch(e) { console.log('  User query failed: ' + e.message); }

    // 10. ProductVersion sample
    console.log('\n=== ProductVersion SAMPLE ===');
    try {
      const pvs = await client.query('SELECT id, "productId", version, "isCurrent", "isPrerelease", "createdAt" FROM "ProductVersion" ORDER BY "createdAt" DESC LIMIT 10');
      pvs.rows.forEach(r => console.log('  ' + JSON.stringify(r)));
    } catch(e) { console.log('  ProductVersion query failed: ' + e.message); }

    await client.end();
    console.log('\n=== INTROSPECTION COMPLETE ===');
  } catch (e) {
    console.error('FATAL Error:', e.message);
    if (client) await client.end();
    process.exit(1);
  }
})();
