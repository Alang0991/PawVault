import { prisma } from "../src/lib/prisma"

async function main() {
  const ownerEmail = process.env.OWNER_EMAIL

  if (!ownerEmail) {
    console.error("ERROR: OWNER_EMAIL environment variable is required.")
    console.log("Usage:")
    console.log('  Windows PowerShell: $env:OWNER_EMAIL="myemail@example.com"; npm run make-owner')
    console.log('  macOS/Linux: OWNER_EMAIL="myemail@example.com" npm run make-owner')
    process.exit(1)
  }

  const user = await prisma.user.findUnique({
    where: { email: ownerEmail },
  })

  if (!user) {
    console.error(`ERROR: No user found with email: ${ownerEmail}`)
    process.exit(1)
  }

  if (user.role === "OWNER") {
    console.log(`User ${ownerEmail} is already OWNER.`)
    process.exit(0)
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: "OWNER" },
  })

  console.log(`SUCCESS: User ${ownerEmail} (${user.username}) has been promoted to OWNER.`)
}

main()
  .catch((error) => {
    console.error("Script failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
