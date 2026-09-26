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

    const result = await client.query(`UPDATE "Product" SET "status" = 'PUBLISHED' WHERE "isPublished" = true AND "status" = 'DRAFT'`)
    console.log(`Updated ${result.rowCount} products to PUBLISHED`)

    const result2 = await client.query(`UPDATE "Store" SET "visibility" = 'PUBLISHED' WHERE "visibility" = 'PUBLISHED'`)
    console.log(`Store visibility already set`)

    console.log('Backfill completed successfully')
  } catch (error) {
    console.error('Backfill failed:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

run()
