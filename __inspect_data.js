const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const env = {};
fs.readFileSync(path.join(process.cwd(), ".env"), "utf8").split(/\r?\n/).forEach((line) => {
  const m = line.match(/^([^=#]+)=(?:"([^"]*)"|'([^']*)'|([^#\r\n]*))/);
  if (m) env[m[1].trim()] = m[2] ?? m[3] ?? m[4] ?? "";
});
const url = env.DIRECT_URL || env.DATABASE_URL;
if (!url) { console.error("NO DATABASE URL"); process.exit(1); }

const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

(async () => {
  await c.connect();
  const q = async (sql) => (await c.query(sql)).rows;
  const run = async (label, sql) => {
    try {
      const rows = await q(sql);
      console.log(`\n=== ${label} (${rows.length} rows) ===`);
      rows.forEach((r) => console.log(JSON.stringify(r)));
    } catch (e) {
      console.log(`\n=== ${label} === ERROR: ${e.message}`);
    }
  };

  await run("PRODUCTS", `SELECT id, slug, "isPublished", status, "creatorId", title FROM "Product" ORDER BY id`);
  await run("PRODUCTVERSION all cols (existing only)", `SELECT id, "productId", version, changelog, "releaseNotes", "createdAt" FROM "ProductVersion"`);
  await run("PRODUCTVERSION column list", `SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name='ProductVersion' ORDER BY ordinal_position`);
  await run("PRODUCTVERSION FK constraints", `SELECT conname, conrelid::regclass AS tbl, confrelid::regclass AS ref, contype FROM pg_constraint WHERE conrelid::regclass::text='ProductVersion'`);
  await run("USERS", `SELECT id, username, role, "creatorStatus", status, "isInternal", "isVerified", "storeId" FROM "User" ORDER BY id`);
  await run("STORES", `SELECT id, slug, visibility, "userId", name FROM "Store" ORDER BY id`);
  await run("applied migration names", `SELECT "migration_name", "finished_at", "rolled_back_at", "applied_steps_count" FROM _prisma_migrations WHERE "finished_at" IS NOT NULL AND "rolled_back_at" IS NULL ORDER BY "started_at"`);

  await c.end();
})().catch((e) => { console.error("CONN ERR:", e.message); process.exit(99); });
