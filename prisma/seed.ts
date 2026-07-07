import { prisma } from "../src/lib/prisma"
import { hashPassword } from "../src/lib/helpers"

async function main() {
  console.log('Seeding database...')

  const admin = await prisma.user.upsert({
    where: { email: 'admin@pawvault.com' },
    update: {},
    create: {
      email: 'admin@pawvault.com',
      username: 'admin',
      displayName: 'Admin User',
      passwordHash: await hashPassword('admin123'),
      role: 'ADMIN',
      isVerified: true,
    },
  })

  console.log('Created admin user:', admin.email)

  const creator = await prisma.user.upsert({
    where: { email: 'creator@pawvault.com' },
    update: {},
    create: {
      email: 'creator@pawvault.com',
      username: 'creator',
      displayName: 'Test Creator',
      passwordHash: await hashPassword('creator123'),
      role: 'VERIFIED_CREATOR',
      isVerified: true,
    },
  })

  console.log('Created creator user:', creator.email)

  const store = await prisma.store.upsert({
    where: { slug: 'test-store' },
    update: {},
    create: {
      userId: creator.id,
      name: 'Test Store',
      slug: 'test-store',
      description: 'A test creator store',
    },
  })

  console.log('Created store:', store.name)

  const category = await prisma.category.upsert({
    where: { slug: '3d-models' },
    update: {},
    create: {
      name: '3D Models',
      slug: '3d-models',
      description: '3D models and assets',
    },
  })

  console.log('Created category:', category.name)

  const product = await prisma.product.upsert({
    where: { slug: 'amazing-3d-model' },
    update: {},
    create: {
      creatorId: creator.id,
      storeId: store.id,
      categoryId: category.id,
      title: 'Amazing 3D Model',
      slug: 'amazing-3d-model',
      description: 'A high-quality 3D model for your projects',
      price: 29.99,
      isPublished: true,
      isFeatured: true,
    },
  })

  console.log('Created product:', product.title)

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
