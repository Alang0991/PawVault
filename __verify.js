const { Client } = require("pg");
const fs = require("fs");
const path = require("path");
let env = {};
fs.readFileSync(path.join(process.cwd(), ".env"), "utf8").split(/\r?\n/).forEach((line) => {
  const m = line.match(/^([^=#]+)=(?:"([^"]*)"|'([^']*)'|([^#\r\n]*))/);
  if (m) env[m[1].trim()] = m[2] ?? m[3] ?? m[4] ?? "";
});
const url = env.DIRECT_URL || env.DATABASE_URL;
const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

(async () => {
  await c.connect();
  const q = (sql) => c.query(sql);
  const cols = async (tbl) => (await q(`SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema='public' AND table_name='${tbl}' ORDER BY ordinal_position`)).rows.map(r => r.column_name);
  const exists = async (tbl) => (await q(`SELECT to_regclass('public.${tbl}') AS r`)).rows[0].r !== null;
  const idx = async (tbl) => (await q(`SELECT indexname, indexdef FROM pg_indexes WHERE schemaname='public' AND tablename='${tbl}' ORDER BY indexname`)).rows;

  const out = [];
  const show = (lbl, v) => out.push(`${lbl}: ${JSON.stringify(v)}`);

  const suspects = ["StripeTransfer","Refund","Payout","CreatorAllocation","Order","Payment","Announcement","SiteSetting","ModerationNote","ProductVersion","User","Product","ProductFile","ProductMedia","Category","Tag"];
  show("=== TABLE EXISTENCE ===", "see below");
  for (const t of suspects) out.push(`  ${t}: exists=${await exists(t)}`);

  out.push("\n=== COLUMNS ===");
  for (const t of suspects) {
    out.push(`  ${t} (${(await cols(t)).length}): ${(await cols(t)).join(", ")}`);
  }

  out.push("\n=== ProductVersion indexes ===");
  (await idx("ProductVersion")).forEach(r => out.push(`  ${r.indexname}: ${r.indexdef}`));
  out.push("\n=== Refund indexes ===");
  (await idx("Refund")).forEach(r => out.push(`  ${r.indexname}: ${r.indexdef}`));
  out.push("\n=== Payout indexes ===");
  (await idx("Payout")).forEach(r => out.push(`  ${r.indexname}: ${r.indexdef}`));
  out.push("\n=== User indexes ===");
  (await idx("User")).forEach(r => out.push(`  ${r.indexname}: ${r.indexdef}`));
  out.push("\n=== Order indexes ===");
  (await idx("Order")).forEach(r => out.push(`  ${r.indexname}: ${r.indexdef}`));

  fs.writeFileSync("__verify_out.txt", out.join("\n") + "\n");
  console.log("WROTE __verify_out.txt (len " + out.length + ")");
  await c.end();
})().catch((e) => { console.error("ERR:", e.message); process.exit(99); });
