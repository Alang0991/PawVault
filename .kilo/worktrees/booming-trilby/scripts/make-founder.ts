import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function readEnv(name: string): string | null {
  const v = process.env[name]
  return v && v.trim().length > 0 ? v.trim() : null
}

async function main() {
  const email = (readEnv('FOUNDER_EMAIL') ?? '').toLowerCase()
  const username = (readEnv('FOUNDER_USERNAME') ?? 'bluey-barks').toLowerCase()
  const displayName = readEnv('FOUNDER_DISPLAY_NAME') ?? 'Bluey Barks'
  const password = readEnv('FOUNDER_BOOTSTRAP_PASSWORD')
  const bio = readEnv('FOUNDER_BIO') ?? 'Founder of PawVault. Here to build, support, and protect the community.'
  const website = readEnv('FOUNDER_WEBSITE') ?? null

  if (!email) {
    console.error('FOUNDER_EMAIL is required.')
    process.exit(1)
  }
  if (!password) {
    console.error('FOUNDER_BOOTSTRAP_PASSWORD is required.')
    console.error('Provide a strong one-time password via env. It will be hashed and never stored in plaintext.')
    process.exit(1)
  }
  if (password.length < 12) {
    console.error('FOUNDER_BOOTSTRAP_PASSWORD must be at least 12 characters.')
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const existing = await prisma.user.findUnique({ where: { email } })

  if (existing) {
    if (existing.role === 'FOUNDER') {
      console.log('Founder account already exists. Updating password hash and profile (no plaintext stored).')
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          role: 'FOUNDER',
          status: 'ACTIVE',
          passwordHash,
          displayName,
          username,
          isVerified: true,
          bio,
          website,
        },
      })
      console.log('Founder updated:', email)
    } else {
      console.error('A user with this email already exists but is not the Founder.')
      console.error('Refusing to overwrite. Resolve the conflict manually or use a different FOUNDER_EMAIL.')
      process.exit(2)
    }
  } else {
    const founder = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          email,
          username,
          passwordHash,
          displayName,
          role: 'FOUNDER',
          status: 'ACTIVE',
          isVerified: true,
          bio,
          website,
        },
      })
      await tx.profile.create({ data: { userId: u.id } })
      await tx.userPreference.create({ data: { userId: u.id } })
      return u
    })
    console.log('Founder account created:', founder.email)
    console.log('Founder ID:', founder.id)
  }

  console.log('\nIMPORTANT:')
  console.log('- The bootstrap password was used once to set the password hash.')
  console.log('- Change the password immediately after first login.')
  console.log('- Rotate FOUNDER_BOOTSTRAP_PASSWORD in your secret manager.')
  console.log('- Do NOT commit secrets, .env files, or any plaintext password.')
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
