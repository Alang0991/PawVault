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
    update: { isInternal: true },
    create: {
      email: 'creator@pawvault.com',
      username: 'creator',
      displayName: 'Test Creator',
      passwordHash: await hashPassword('creator123'),
      role: 'VERIFIED_CREATOR',
      isVerified: true,
      creatorStatus: 'APPROVED',
      isInternal: true,
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

  const categories = [
    { name: 'Avatars', slug: 'avatars', description: 'Avatar assets for VR platforms', displayOrder: 1 },
    { name: 'Clothing & Accessories', slug: 'clothing-accessories', description: 'Clothing, accessories, and avatar wearables', displayOrder: 2 },
    { name: '3D Assets', slug: '3d-assets', description: '3D models, props, and environment assets', displayOrder: 3 },
    { name: 'Worlds', slug: 'worlds', description: 'VR world assets and prefabs', displayOrder: 4 },
    { name: 'Materials & Textures', slug: 'materials-textures', description: 'PBR materials, textures, and shaders', displayOrder: 5 },
    { name: 'Particles & VFX', slug: 'particles-vfx', description: 'Particle systems and visual effects', displayOrder: 6 },
    { name: 'Scripts & Tools', slug: 'scripts-tools', description: 'Unity tools, editor extensions, and utilities', displayOrder: 7 },
    { name: 'Animation & Expressions', slug: 'animation-expressions', description: 'Animations, emotes, and facial expressions', displayOrder: 8 },
    { name: 'Creator Resources', slug: 'creator-resources', description: 'Templates, source files, and tutorials', displayOrder: 9 },
    { name: 'Services', slug: 'services', description: 'Commissions and custom services', displayOrder: 10 },
    { name: 'Free', slug: 'free', description: 'Free products and assets', displayOrder: 11 },
  ]

  const subcategories = [
    { name: 'VRChat Avatars', slug: 'vrchat-avatars', parentSlug: 'avatars', displayOrder: 1 },
    { name: 'Furry Avatars', slug: 'furry-avatars', parentSlug: 'avatars', displayOrder: 2 },
    { name: 'Kemonomimi', slug: 'kemonomimi', parentSlug: 'avatars', displayOrder: 3 },
    { name: 'Human / Humanoid', slug: 'human-humanoid', parentSlug: 'avatars', displayOrder: 4 },
    { name: 'Robot / Android', slug: 'robot-android', parentSlug: 'avatars', displayOrder: 5 },
    { name: 'Creature', slug: 'creature', parentSlug: 'avatars', displayOrder: 6 },
    { name: 'Cute / Chibi', slug: 'cute-chibi', parentSlug: 'avatars', displayOrder: 7 },
    { name: 'Mature / Adult', slug: 'mature-adult', parentSlug: 'avatars', displayOrder: 8 },
    { name: 'Performance Optimized', slug: 'performance-optimized', parentSlug: 'avatars', displayOrder: 9 },
    { name: 'Quest Compatible', slug: 'quest-compatible', parentSlug: 'avatars', displayOrder: 10 },
    { name: '3D Models', slug: '3d-models', parentSlug: '3d-assets', displayOrder: 1 },
    { name: 'Weapons', slug: 'weapons', parentSlug: '3d-assets', displayOrder: 2 },
    { name: 'Props', slug: 'props', parentSlug: '3d-assets', displayOrder: 3 },
    { name: 'Furniture', slug: 'furniture', parentSlug: '3d-assets', displayOrder: 4 },
    { name: 'VRChat Worlds', slug: 'vrchat-worlds', parentSlug: 'worlds', displayOrder: 1 },
    { name: 'World Prefabs', slug: 'world-prefabs', parentSlug: 'worlds', displayOrder: 2 },
    { name: 'Udon / UdonSharp', slug: 'udon-udonsharp', parentSlug: 'worlds', displayOrder: 3 },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, displayOrder: cat.displayOrder, isActive: true },
      create: cat,
    })
  }

  for (const sub of subcategories) {
    const parent = await prisma.category.findUnique({ where: { slug: sub.parentSlug } })
    if (parent) {
      await prisma.category.upsert({
        where: { slug: sub.slug },
        update: { name: sub.name, parentId: parent.id, displayOrder: sub.displayOrder, isActive: true },
        create: { name: sub.name, slug: sub.slug, parentId: parent.id, displayOrder: sub.displayOrder, isActive: true },
      })
    }
  }

  console.log('Created categories and subcategories')

  const tags = [
    { name: 'VRChat', slug: 'vrchat', tagType: 'platform' },
    { name: 'Quest', slug: 'quest', tagType: 'platform' },
    { name: 'PCVR', slug: 'pcvr', tagType: 'platform' },
    { name: 'Unity', slug: 'unity', tagType: 'software' },
    { name: 'Blender', slug: 'blender', tagType: 'software' },
    { name: 'Poiyomi', slug: 'poiyomi', tagType: 'compatibility' },
    { name: 'VRCFT', slug: 'vrcft', tagType: 'compatibility' },
    { name: 'PhysBones', slug: 'physbones', tagType: 'compatibility' },
    { name: 'Modular Avatar', slug: 'modular-avatar', tagType: 'compatibility' },
    { name: 'Udon', slug: 'udon', tagType: 'compatibility' },
    { name: 'UdonSharp', slug: 'udonsharp', tagType: 'compatibility' },
    { name: 'Anime', slug: 'anime', tagType: 'style' },
    { name: 'Toon', slug: 'toon', tagType: 'style' },
    { name: 'Realistic', slug: 'realistic', tagType: 'style' },
    { name: 'Cute', slug: 'cute', tagType: 'style' },
    { name: 'Fantasy', slug: 'fantasy', tagType: 'style' },
    { name: 'Sci-Fi', slug: 'sci-fi', tagType: 'style' },
    { name: 'FBX', slug: 'fbx', tagType: 'format' },
    { name: 'VRM', slug: 'vrm', tagType: 'format' },
    { name: 'Unity Package', slug: 'unity-package', tagType: 'format' },
    { name: 'ZIP', slug: 'zip', tagType: 'format' },
    { name: 'Performance', slug: 'performance', tagType: 'feature' },
    { name: 'Optimized', slug: 'optimized', tagType: 'feature' },
    { name: 'SFW', slug: 'sfw', tagType: 'content' },
    { name: 'NSFW', slug: 'nsfw', tagType: 'content' },
  ]

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: { name: tag.name, tagType: tag.tagType, isActive: true },
      create: tag,
    })
  }

  console.log('Created tags')

  const category = await prisma.category.findUnique({ where: { slug: '3d-assets' } })
  const subcategory = await prisma.category.findFirst({ where: { slug: '3d-models' } })

  const product = await prisma.product.upsert({
    where: { slug: 'amazing-3d-model' },
    update: {
      categoryId: category?.id,
    },
    create: {
      creatorId: creator.id,
      storeId: store.id,
      categoryId: category?.id,
      title: 'Amazing 3D Model',
      slug: 'amazing-3d-model',
      description: 'A high-quality 3D model for your projects',
      price: 29.99,
      isPublished: true,
      isFeatured: true,
    },
  })

  console.log('Created/updated product:', product.title)

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
