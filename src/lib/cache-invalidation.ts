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

export async function invalidateContentCache(): Promise<void> {
  revalidatePath("/")
  revalidatePath("/browse")
  revalidatePath("/search")
  revalidatePath("/categories")
  revalidatePath("/creators")
  revalidatePath("/recommendations")
}

export async function invalidateAfterModerationAction(productId: string): Promise<void> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { slug: true, creator: { select: { username: true, isInternal: true } } },
    })

    if (!product) return

    revalidatePath(`/product/${product.slug}`)
    revalidatePath("/")
    revalidatePath("/browse")
    revalidatePath("/search")
    revalidatePath("/recommendations")

    if (!product.creator.isInternal) {
      revalidatePath(`/creators/${product.creator.username}`)
    }
  } catch (error) {
    console.error("Failed to invalidate after moderation action:", error)
  }
}

export async function invalidateAfterContentChange(productId: string): Promise<void> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { slug: true, creator: { select: { username: true } } },
    })

    if (!product) return

    revalidatePath(`/product/${product.slug}`)
    revalidatePath(`/creators/${product.creator.username}`)
    revalidatePath("/browse")
    revalidatePath("/search")
  } catch (error) {
    console.error("Failed to invalidate after content change:", error)
  }
}

export async function invalidateOnPermissionChange(userId: string): Promise<void> {
  revalidatePath("/")
  revalidatePath("/browse")
  revalidatePath("/creators")
  revalidatePath("/categories")
  revalidatePath("/search")
}

export async function invalidateOnTesterVisibilityChange(): Promise<void> {
  revalidatePath("/")
  revalidatePath("/browse")
  revalidatePath("/creators")
  revalidatePath("/search")
  revalidatePath("/categories")
  revalidatePath("/recommendations")
}

export async function invalidateAfterStaffPickChange(): Promise<void> {
  revalidatePath("/")
}
