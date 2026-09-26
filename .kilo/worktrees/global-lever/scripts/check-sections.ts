import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const sections = await prisma.homepageSection.findMany({
    where: { enabled: true },
    orderBy: { displayOrder: "asc" },
    select: { id: true, type: true, displayOrder: true, enabled: true, config: true },
  })
  console.log("=== Active Sections ===")
  sections.forEach(s => {
    console.log(`ID: ${s.id}, Type: ${s.type}, Order: ${s.displayOrder}, Config: ${JSON.stringify(s.config)}`)
  })
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
