import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export async function invalidateCreatorCache(userId: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true, store: { select: { slug: true } } },
    })

    if (!user) return

    const username = user.username
    const storeSlug = user.store?.slug

    revalidatePath("/creators")
    revalidatePath(`/creators/${username}`)
    revalidatePath("/")
    revalidatePath("/creators", "layout")

    if (storeSlug) {
      revalidatePath(`/store/${storeSlug}`)
      revalidatePath(`/store/${storeSlug}/posts`)
    }

    revalidatePath(`/store/${username}`)
  } catch (error) {
    console.error("Failed to invalidate creator cache:", error)
  }
}

export async function invalidateCreatorStoreCache(userId: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true, store: { select: { slug: true } } },
    })

    if (!user) return

    const username = user.username
    const storeSlug = user.store?.slug

    if (storeSlug) {
      revalidatePath(`/store/${storeSlug}`)
      revalidatePath(`/store/${storeSlug}/posts`)
    }

    revalidatePath(`/store/${username}`)
    revalidatePath(`/creators/${username}`)
  } catch (error) {
    console.error("Failed to invalidate creator store cache:", error)
  }
}

export async function invalidateCreatorApprovalCache(userId: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    })

    if (!user) return

    revalidatePath("/creators")
    revalidatePath(`/creators/${user.username}`)
  } catch (error) {
    console.error("Failed to invalidate creator approval cache:", error)
  }
}

export async function invalidateProductCache(productId: string): Promise<void> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { slug: true, creator: { select: { username: true } } },
    })

    if (!product) return

    revalidatePath(`/product/${product.slug}`)
    revalidatePath(`/creators/${product.creator.username}`)
  } catch (error) {
    console.error("Failed to invalidate product cache:", error)
  }
}
