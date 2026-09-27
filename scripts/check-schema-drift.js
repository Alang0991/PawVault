/**
 * Read-only schema drift check.
 *
 * Compares prisma/schema.prisma against the live database and reports which
 * declared objects are missing. Run this after importing SQL into Supabase, or
 * before a deploy, to confirm the database matches the schema.
 *
 * Safe to run at any time: it only issues SELECTs, it never writes and never
 * runs a migration.
 *
 *   node scripts/check-schema-drift.js
 */

const { PrismaClient } = require("@prisma/client")
const fs = require("fs")
const path = require("path")

/**
 * Prisma reads .env itself, but this script is also run directly by node in
 * environments where the auto-loading has already been bypassed. Only fills in
 * values that are not already set, so real environment variables always win.
 */
function loadEnvFile(file) {
  if (!fs.existsSync(file)) return
  for (const raw of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith("#")) continue
    const eq = line.indexOf("=")
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = value
  }
}

/**
 * Prisma's default table name is the model name verbatim, not snake_case.
 * Only an explicit @@map overrides it.
 */
function parseModels(schema) {
  const models = []
  const re = /^model\s+(\w+)\s*\{([\s\S]*?)^\}/gm
  let m
  while ((m = re.exec(schema)) !== null) {
    const mapMatch = m[2].match(/@@map\("([^"]+)"\)/)
    models.push({ model: m[1], table: mapMatch ? mapMatch[1] : m[1] })
  }
  return models
}

async function main() {
  loadEnvFile(path.join(__dirname, "..", ".env"))
  loadEnvFile(path.join(__dirname, "..", ".env.local"))

  const prisma = new PrismaClient()

  const tables = await prisma.$queryRawUnsafe(
    `SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`
  )
  const present = new Set(tables.map((t) => t.table_name))

  const schema = fs.readFileSync(path.join(__dirname, "..", "prisma", "schema.prisma"), "utf8")
  const models = parseModels(schema)

  const missing = models.filter((m) => !present.has(m.table))

  console.log("models in prisma/schema.prisma : " + models.length)
  console.log("tables in database public schema: " + present.size)

  if (missing.length === 0) {
    console.log("\nOK - every model in schema.prisma exists in the database.")
  } else {
    console.log("\nMISSING TABLES (import SQL to create these):")
    for (const m of missing) console.log("  " + m.model + " -> " + m.table)
  }

  await prisma.$disconnect()
  process.exit(missing.length === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error("ERROR:", e.message)
  process.exit(1)
})
