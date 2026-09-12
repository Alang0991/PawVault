const { Client } = require("pg");
const fs = require("fs");

let env = {};
fs.readFileSync(".env", "utf8").split(/\r?\n/).forEach((line) => {
  const m = line.match(/^([^=#]+)=(?:"([^"]*)"|'([^']*)'|([^#\r\n]*))/);
  if (m) env[m[1].trim()] = m[2] ?? m[3] ?? m[4] ?? "";
});
const url = env.DIRECT_URL || env.DATABASE_URL;
if (!url) { console.error("NO DATABASE URL"); process.exit(1); }

const sql = fs.readFileSync("prisma/migrations/20260908200000_reconcile_missing_schema_columns/migration.sql", "utf8");

(async () => {
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false }, query_timeout: 30000 });
  await c.connect();
  const full = "BEGIN;\n" + sql + "\nROLLBACK;";
  try {
    const res = await c.query(full);
    console.log("PRE-FLIGHT: SUCCESS — migration applied inside a rolled-back transaction (NO persistent changes).");
    console.log("statements executed, rowCount:", res.rowCount);
  } catch (e) {
    console.error("PRE-FLIGHT: FAILED");
    console.error(e.message);
    try { await c.query("ROLLBACK"); console.log("(rolled back)"); } catch (e2) { console.error("rollback also failed:", e2.message); }
    await c.end();
    process.exit(1);
  }
  await c.end();
  console.log("Pre-flight validation complete. Database is unchanged.");
})().catch((e) => { console.error("CONN ERR:", e.message); process.exit(99); });
