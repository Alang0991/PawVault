const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const env = {};
fs.readFileSync(path.join(process.cwd(), ".env"), "utf8").split(/\r?\n/).forEach((line) => {
  const m = line.match(/^([^=#]+)=(?:"([^"]*)"|'([^']*)'|([^#\r\n]*))/);
  if (m) env[m[1].trim()] = m[2] ?? m[3] ?? m[4] ?? "";
});
const url = env.DIRECT_URL || env.DATABASE_URL;
const OUT = process.argv[2] || path.join(process.cwd(), "__data_out.txt");
const buf = [];
const log = (...a) => buf.push(a.join(" "));

(async () => {
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const q = (sql, p) => c.query(sql, p);
  const run = async (label, sql, p) => {
    try {
      const { rows } = await q(sql, p);
      log(`\n=== ${label} (${rows.length}) ===`);
      rows.forEach((r) => log(JSON.stringify(r)));
    } catch (e) {
      log(`\n=== ${label} === ERROR: ${e.message}`);
    }
  };

  await run("USERS", `SELECT id, username, role, "creatorStatus" AS cs, status AS us, "isInternal" AS ii, "isVerified" AS iv, "email", "createdAt" AS created FROM "User" ORDER BY id`);
  await run("PRODUCTS", `SELECT id, slug, title, "isPublished" AS pub, status, "creatorId" AS cid, "storeId" AS sid, "categoryId" AS cat, "contentRating" AS cr, price, "salePrice" AS sp, "seoTitle" AS seo_t, "seoDescription" AS seo_d, "createdAt" AS created FROM "Product" ORDER BY id`);
  await run("PRODUCTVERSION (existing cols)", `SELECT id, "productId" AS pid, version, changelog, "releaseNotes" AS rn, "createdAt" AS created FROM "ProductVersion"`);
  await run("STORES", `SELECT id, slug, name, visibility, "userId" AS uid FROM "Store" ORDER BY id`);
  await run("STAFFPICK", `SELECT id, "productId" AS pid, "pickedBy" AS pb, "isActive" AS active FROM "StaffPick"`);
  await run("ANNOUNCEMENT", `SELECT id, title, "isPublished" AS pub, "publishedAt" AS pubat FROM "Announcement"`);
  await run("USERPREFERENCE", `SELECT id, "userId" AS uid, "showAdultContent" AS sac, "blurNsfwPreviews" AS bnsp, "updatedAt" AS upd FROM "UserPreference"`);
  await run("PRODUCTMEDIA", `SELECT id, "productId" AS pid, type, url, "isThumbnail" AS thumb, "createdAt" AS created FROM "ProductMedia"`);
  await run("PRODUCTFILE", `SELECT id, "productId" AS pid, filename, url, size, platform, version, folder FROM "ProductFile"`);
  await run("CATEGORIES", `SELECT id, slug, name, "displayOrder" AS ord, "isActive" AS active, "parentId" AS parent FROM "Category" ORDER BY "displayOrder"`);
  await run("PRODUCTVERSION FK check", `SELECT conname, contype FROM pg_constraint WHERE conrelid::regclass::text='ProductVersion'`);
  await run("applied migrations (final)", `SELECT "migration_name" AS name, "finished_at" AS fin, "rolled_back_at" AS rb, "applied_steps_count" AS steps FROM _prisma_migrations ORDER BY "started_at"`);

  await c.end();
  fs.writeFileSync(OUT, buf.join("\n") + "\n");
  console.log("WROTE " + OUT);
})().catch((e) => { console.error("ERR:", e.message); process.exit(99); });
