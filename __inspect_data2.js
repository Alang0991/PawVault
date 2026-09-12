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
  const show = async (label, sql) => {
    try {
      const { rows } = await q(sql);
      console.log(`\n=== ${label} (${rows.length}) ===`);
      rows.forEach((r) => console.log(JSON.stringify(r)));
    } catch (e) {
      console.log(`\n=== ${label} === ERROR: ${e.message}`);
    }
  };

  // lowercase aliases to avoid node-pg case folding issues
  await show("USERS", `SELECT id, email, username, role, "creatorStatus" as cs, status as us, "isInternal" as ii, "isVerified" as iv, "salesCount" as sc, "followersCount" as fc FROM "User" ORDER BY id`);
  await show("PRODUCTS", `SELECT id, slug, title, "isPublished" as pub, status, "creatorId" as cid, "storeId" as sid, "categoryId" as cat, price, "salePrice" as sp FROM "Product" ORDER BY id`);
  await show("PRODUCTVERSION", `SELECT id, "productId" as pid, version, "createdAt" as created FROM "ProductVersion" ORDER BY id`);
  await show("STORES", `SELECT id, slug, name, visibility, "userId" as uid FROM "Store" ORDER BY id`);
  await show("CATEGORIES", `SELECT id, slug, name, "displayOrder" as "order", "isActive" as active FROM "Category" ORDER BY "displayOrder"`);
  await show("TAGS", `SELECT id, slug, name, "tagType" as type, "isActive" as active FROM "Tag" ORDER BY id`);
  await show("STAFFPICK", `SELECT id, "productId" as pid, "pickedBy" as pb, "isActive" as active FROM "StaffPick" ORDER BY id`);
  await show("ANNOUNCEMENTS", `SELECT id, title, "isPublished" as pub, "publishedAt" as "pubAt" FROM "Announcement"`);
  await show("PLATFORM CONFIG", `SELECT * FROM "PlatformConfig"`);

  await c.end();
})().catch((e) => { console.error("ERR:", e.message); process.exit(99); });
