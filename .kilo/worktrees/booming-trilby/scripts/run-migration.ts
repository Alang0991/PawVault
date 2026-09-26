// @ts-ignore
import pg from 'pg'
import { readFileSync } from 'fs'
import { join } from 'path'

function getEnvValue(key: string): string | undefined {
  try {
    const content = readFileSync(join(process.cwd(), '.env'), 'utf-8')
    const match = content.match(new RegExp(`^${key}=["']?([^"'\n]+)`, 'm'))
    return match ? match[1] : undefined
  } catch {
    return undefined
  }
}

const { Client } = pg

const DATABASE_URL = getEnvValue('DATABASE_URL') || getEnvValue('DIRECT_URL')

if (!DATABASE_URL) {
  console.error('DATABASE_URL or DIRECT_URL is required')
  process.exit(1)
}

const client = new Client({ connectionString: DATABASE_URL })

async function run() {
  try {
    await client.connect()
    console.log('Connected to database')

    await client.query('BEGIN')

    await client.query(`CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'HIDDEN', 'ARCHIVED', 'REJECTED', 'SUSPENDED')`)
    console.log('Created ProductStatus enum')

    await client.query(`CREATE TYPE "StoreVisibility" AS ENUM ('PUBLISHED', 'HIDDEN', 'SUSPENDED', 'ARCHIVED')`)
    console.log('Created StoreVisibility enum')

    await client.query(`CREATE TYPE "CreatorStatus" AS ENUM ('NONE', 'APPLICATION_DRAFT', 'APPLICATION_SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED', 'BANNED', 'WITHDRAWN')`)
    console.log('Created CreatorStatus enum')

    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "creatorStatus" "CreatorStatus" NOT NULL DEFAULT 'NONE'`)
    console.log('Added creatorStatus to User')

    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "creatorTermsAcceptedAt" TIMESTAMP`)
    console.log('Added creatorTermsAcceptedAt to User')

    await client.query(`ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT'`)
    console.log('Added status to Product')

    await client.query(`ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "visibility" "StoreVisibility" NOT NULL DEFAULT 'PUBLISHED'`)
    console.log('Added visibility to Store')

    await client.query(`CREATE TABLE IF NOT EXISTS "ProductVersion" ("id" TEXT NOT NULL, "productId" TEXT NOT NULL, "version" TEXT NOT NULL, "changelog" TEXT, "releaseNotes" TEXT, "files" JSONB, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "ProductVersion_pkey" PRIMARY KEY ("id"))`)
    console.log('Created ProductVersion table')

    await client.query(`CREATE INDEX IF NOT EXISTS "ProductVersion_productId_idx" ON "ProductVersion"("productId")`)
    await client.query(`CREATE INDEX IF NOT EXISTS "ProductVersion_productId_version_idx" ON "ProductVersion"("productId", "version")`)
    console.log('Created ProductVersion indexes')

    await client.query(`CREATE TABLE IF NOT EXISTS "CreatorTerms" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "version" TEXT NOT NULL, "acceptedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "ipAddress" TEXT, CONSTRAINT "CreatorTerms_pkey" PRIMARY KEY ("id"))`)
    console.log('Created CreatorTerms table')

    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "CreatorTerms_userId_key" ON "CreatorTerms"("userId")`)
    await client.query(`CREATE INDEX IF NOT EXISTS "CreatorTerms_userId_idx" ON "CreatorTerms"("userId")`)
    console.log('Created CreatorTerms indexes')

    await client.query(`CREATE TABLE IF NOT EXISTS "Appeal" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "type" TEXT NOT NULL, "reason" TEXT NOT NULL, "evidence" TEXT, "status" TEXT NOT NULL DEFAULT 'PENDING', "reviewedById" TEXT, "reviewedAt" TIMESTAMP, "resolution" TEXT, "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Appeal_pkey" PRIMARY KEY ("id"))`)
    console.log('Created Appeal table')

    await client.query(`CREATE INDEX IF NOT EXISTS "Appeal_userId_idx" ON "Appeal"("userId")`)
    await client.query(`CREATE INDEX IF NOT EXISTS "Appeal_status_idx" ON "Appeal"("status")`)
    console.log('Created Appeal indexes')

    await client.query(`CREATE INDEX IF NOT EXISTS "Store_visibility_idx" ON "Store"("visibility")`)
    console.log('Created Store visibility index')

    await client.query(`CREATE INDEX IF NOT EXISTS "Product_status_idx" ON "Product"("status")`)
    console.log('Created Product status index')

    await client.query('COMMIT')
    console.log('Migration completed successfully')
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

run()
