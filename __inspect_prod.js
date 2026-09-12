// READ-ONLY production schema introspection.
// Only issues SELECT statements against pg_catalog / information_schema / _prisma_migrations.
// NO modifications, NO db push, NO data writes.
const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

// Load .env manually (no dotenv dependency required)
const envPath = path.join(process.cwd(), ".env");
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8").split(/\r?\n/).forEach((line) => {
    const m = line.match(/^([^=#]+)=(?:"([^"]*)"|'([^']*)'|([^#\r\n]*))/);
    if (m) env[m[1].trim()] = m[2] ?? m[3] ?? m[4] ?? "";
  });
}

const url = env.DIRECT_URL || env.DATABASE_URL;
if (!url) {
  console.error("NO DATABASE URL FOUND in .env");
  process.exit(1);
}

function qs(sql, params = []) {
  return client.query(sql, params);
}

const out = [];
const w = (s) => out.push(s);

let client;
(async () => {
  try {
    client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false }, query_timeout: 15000, connectionTimeoutMillis: 15000 });
    await client.connect();
    w("## PRODUCTION DATABASE CONNECTED (read-only introspection)");

    // ---- Migration history ----
    w("\n=== _prisma_migrations (applied migration history) ===");
    const mhCols = await qs(`SELECT column_name FROM information_schema.columns WHERE table_name='_prisma_migrations' ORDER BY ordinal_position`);
    w("_prisma_migrations columns: " + mhCols.rows.map((c) => c.column_name).join(", "));
    const mh = await qs(`SELECT * FROM _prisma_migrations ORDER BY started_at`);
    w("count: " + mh.rows.length);
    mh.rows.forEach((r) => {
      const parts = [];
      for (const k of Object.keys(r)) {
        const v = r[k];
        if (v === null || v === undefined) parts.push(`${k}=null`);
        else parts.push(`${k}=${typeof v === "string" && v.length > 80 ? v.slice(0, 80) + "..." : v}`);
      }
      w("  - " + parts.join(" | "));
    });

    // ---- All user tables (exclude prisma internal) ----
    w("\n=== ALL TABLES ===");
    const tabs = await qs(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    w("total tables: " + tabs.rows.length);

    // ---- Enums ----
    w("\n=== ENUM TYPES ===");
    const enums = await qs(`
      SELECT t.typname AS enum_name, e.enumlabel AS enum_value, e.enumsortorder AS sort_order
      FROM pg_enum e
      JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typcategory = 'E'
      ORDER BY t.typname, e.enumsortorder
    `);
    const byEnum = {};
    enums.rows.forEach((r) => (byEnum[r.enum_name] = byEnum[r.enum_name] || []).push(r.enum_value));
    Object.keys(byEnum).forEach((k) => w(`  ${k}: [${byEnum[k].join(", ")}]`));

    // ---- Columns for every table ----
    w("\n=== COLUMNS PER TABLE ===");
    const cols = await qs(`
      SELECT table_name, column_name, data_type, udt_name, is_nullable, column_default, is_identity, character_maximum_length, numeric_precision, numeric_scale
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name NOT IN ('_prisma_migrations')
      ORDER BY table_name, ordinal_position
    `);

    const tableColumns = {};
    cols.rows.forEach((r) => {
      const t = r.table_name;
      if (!tableColumns[t]) tableColumns[t] = [];
      tableColumns[t].push(r);
    });

    tabs.rows.forEach(({ table_name }) => {
      const arr = tableColumns[table_name] || [];
      w(`\n--- TABLE: ${table_name} (${arr.length} columns) ---`);
      if (arr.length === 0) w("  ** NO COLUMNS **");
      arr.forEach((c) => {
        w(`  ${c.column_name} | ${c.data_type}${c.udt_name ? "(" + c.udt_name + ")" : ""}${c.character_maximum_length ? " len=" + c.character_maximum_length : ""} | nullable=${c.is_nullable} | default=${c.column_default}${c.is_identity === "YES" ? " [IDENTITY]" : ""}`);
      });
    });

    // ---- Indexes per table ----
    w("\n=== INDEXES PER TABLE ===");
    const idx = await qs(`
      SELECT
        ic.tablename,
        ic.indexname,
        ic.indexdef,
        ix.indisunique,
        ix.indisprimary
      FROM pg_indexes ic
      JOIN pg_class c ON c.relname = ic.indexname
      JOIN pg_index ix ON ix.indexrelid = c.oid
      WHERE ic.schemaname = 'public'
      ORDER BY ic.tablename, ic.indexname
    `);
    const idxBy = {};
    idx.rows.forEach((r) => {
      if (!idxBy[r.tablename]) idxBy[r.tablename] = [];
      idxBy[r.tablename].push(r);
    });
    tabs.rows.forEach(({ table_name }) => {
      const arr = idxBy[table_name] || [];
      if (arr.length) {
        w(`\n--- INDEXES: ${table_name} ---`);
        arr.forEach((i) => w(`  ${i.indexname} | unique=${i.indisunique} | pk=${i.indisprimary} | def: ${i.indexdef}`));
      }
    });

    // ---- Foreign keys ----
    w("\n=== FOREIGN KEYS (constraints) ===");
    const fks = await qs(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        tc.constraint_name,
        rc.update_rule,
        rc.delete_rule
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
      JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name AND tc.table_schema = rc.constraint_schema
      JOIN information_schema.constraint_column_usage ccu ON rc.unique_constraint_name = ccu.constraint_name AND rc.unique_constraint_schema = ccu.table_schema
      WHERE tc.table_schema = 'public' AND tc.constraint_type = 'FOREIGN KEY'
      ORDER BY tc.table_name, tc.constraint_name
    `);
    w("total FK constraints: " + fks.rows.length);
    const fkByTable = {};
    fks.rows.forEach((r) => {
      if (!fkByTable[r.table_name]) fkByTable[r.table_name] = [];
      fkByTable[r.table_name].push(r);
    });
    Object.keys(fkByTable).forEach((t) => {
      w(`\n  ${t}:`);
      fkByTable[t].forEach((f) => w(`    ${f.constraint_name}: ${t}.${f.column_name} -> ${f.foreign_table_name}.${f.foreign_column_name} (onDelete=${f.delete_rule}, onUpdate=${f.update_rule})`));
    });

    // ---- Unique constraints (non-PK) ----
    w("\n=== UNIQUE CONSTRAINTS ===");
    const uqs = await qs(`
      SELECT tc.table_name, tc.constraint_name, kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
      WHERE tc.table_schema = 'public' AND tc.constraint_type = 'UNIQUE'
      ORDER BY tc.table_name, tc.constraint_name
    `);
    w("total unique constraints: " + uqs.rows.length);

    // ---- Specific checks for the known problem areas ----
    w("\n=== TARGETED CHECKS ===");
    const pvExists = await qs(`SELECT to_regclass('public.ProductVersion') AS exists`);
    w("ProductVersion table exists: " + (pvExists.rows[0].exists ? "YES" : "NO"));
    if (pvExists.rows[0].exists) {
      const pvCols = await qs(`SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name='ProductVersion' ORDER BY ordinal_position`);
      w("ProductVersion columns:");
      pvCols.rows.forEach((c) => w(`  ${c.column_name} | ${c.data_type} | nullable=${c.is_nullable} | default=${c.column_default}`));
    }

    const spExists = await qs(`SELECT to_regclass('public.StaffPick') AS exists`);
    w("StaffPick table exists: " + (spExists.rows[0].exists ? "YES" : "NO"));
    if (spExists.rows[0].exists) {
      const spCols = await qs(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='StaffPick' ORDER BY ordinal_position`);
      w("StaffPick columns:");
      spCols.rows.forEach((c) => w(`  ${c.column_name} | ${c.data_type}`));
    }

    const productCols = await qs(`SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name='Product' ORDER BY ordinal_position`);
    w("\nProduct columns:");
    productCols.rows.forEach((c) => w(`  ${c.column_name} | ${c.data_type} | nullable=${c.is_nullable} | default=${c.column_default}`));

    const userCols = await qs(`SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name='User' ORDER BY ordinal_position`);
    w("\nUser columns:");
    userCols.rows.forEach((c) => w(`  ${c.column_name} | ${c.data_type} | nullable=${c.is_nullable} | default=${c.column_default}`));

    const storeCols = await qs(`SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name='Store' ORDER BY ordinal_position`);
    w("\nStore columns:");
    storeCols.rows.forEach((c) => w(`  ${c.column_name} | ${c.data_type} | nullable=${c.is_nullable} | default=${c.column_default}`));

    // Product counts by status
    const prodByStatus = await qs(`SELECT status, COUNT(*) FROM "Product" GROUP BY status`);
    w("\nProduct status distribution:");
    prodByStatus.rows.forEach((r) => w(`  ${r.status}: ${r.count}`));

    const prodPub = await qs(`SELECT "isPublished", COUNT(*) FROM "Product" GROUP BY "isPublished"`);
    w("Product isPublished distribution:");
    prodPub.rows.forEach((r) => w(`  ${r.ispublished}: ${r.count}`));

    // Creator stats
    const creatorStats = await qs(`SELECT "creatorStatus", status, COUNT(*) FROM "User" GROUP BY "creatorStatus", status ORDER BY "creatorStatus"`);
    w("\nUser creatorStatus/status distribution:");
    creatorStats.rows.forEach((r) => w(`  creatorStatus=${r.creatorstatus} | status=${r.status} | count=${r.count}`));

    const storeVis = await qs(`SELECT visibility, COUNT(*) FROM "Store" GROUP BY visibility`);
    w("\nStore visibility distribution:");
    storeVis.rows.forEach((r) => w(`  ${r.visibility}: ${r.count}`));

    const totalProducts = await qs(`SELECT COUNT(*) AS c FROM "Product"`);
    const totalCreators = await qs(`SELECT COUNT(*) AS c FROM "User" WHERE "creatorStatus" = 'APPROVED' AND status='ACTIVE'`);
    const internalUsers = await qs(`SELECT COUNT(*) AS c FROM "User" WHERE "isInternal" = true`);
    w(`\nTotals: products=${totalProducts.rows[0].c}, approvedCreators=${totalCreators.rows[0].c}, internalUsers=${internalUsers.rows[0].c}`);

    w("\n## INTROSPECTION COMPLETE");
    process.stdout.write(out.join("\n"));
    await client.end();
  } catch (e) {
    console.error("SCRIPT ERROR:", e.message);
    console.error(e.stack);
    out.push("## INTROSPECTION ERROR: " + e.message);
    process.stdout.write(out.join("\n"));
    if (client) try { await client.end(); } catch (_) {}
    process.exit(2);
  }
})();
